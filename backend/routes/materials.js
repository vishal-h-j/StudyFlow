
const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const multer = require("multer");
const {
  S3Client,
  PutObjectCommand
} = require("@aws-sdk/client-s3");
const {
  getSignedUrl
} = require("@aws-sdk/s3-request-presigner");
const Material = require("../models/Material");
const {
  authenticateToken,
  requireRoles
} = require("../middleware/auth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf");

    cb(isPdf ? null : new Error("Only PDF files are allowed."), isPdf);
  }
});

function getBucket() {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB is not connected.");
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "studyMaterials"
  });
}

function validateMaterial(body) {
  if (
    body.title !== undefined &&
    (typeof body.title !== "string" || !body.title.trim())
  ) {
    return "Material title is required.";
  }

  for (const field of ["description", "type", "course", "url"]) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return `${field} must be text.`;
    }
  }

  if (body.url && !/^https?:\/\//i.test(body.url) && !body.url.startsWith("/api/materials/file/")) {
    return "Resource URL must be a valid HTTP(S) URL or a StudyFlow PDF URL.";
  }

  return null;
}

router.get("/", async (req, res, next) => {
  try {
    res.json(await Material.find().sort({ createdAt: 1 }));
  } catch (error) {
    next(error);
  }
});

router.get("/file/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid PDF file ID." });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = getBucket();
    const files = await bucket.find({ _id: fileId }).toArray();

    if (!files.length) {
      return res.status(404).json({ message: "PDF not found in GridFS." });
    }

    res.set("Content-Type", files[0].contentType || "application/pdf");
    res.set("Content-Disposition", "inline");

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("error", next);
    downloadStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid material ID." });
    }

    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Study material not found." });
    }

    res.json(material);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/upload",
  authenticateToken,
  requireRoles("faculty", "admin"),
  upload.single("file"),
  async (req, res, next) => {
    let uploadedFileId;

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Select a PDF file to upload." });
      }

      const { title, description = "", course } = req.body;

      if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof course !== "string" ||
        !course.trim()
      ) {
        return res.status(400).json({
          message: "Material title and course are required."
        });
      }

      if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
        return res.status(400).json({ message: "The selected file is not a valid PDF." });
      }

      const bucket = getBucket();
      const fileId = new mongoose.Types.ObjectId();
      uploadedFileId = fileId;

      await new Promise((resolve, reject) => {
        const stream = bucket.openUploadStreamWithId(
          fileId,
          req.file.originalname,
          {
            contentType: "application/pdf",
            metadata: { course: course.trim() }
          }
        );

        stream.on("error", reject);
        stream.on("finish", resolve);
        stream.end(req.file.buffer);
      });

      const material = await Material.create({
        title: title.trim(),
        description,
        type: "PDF",
        course: course.trim(),
        url: `/api/materials/file/${fileId}`,
        gridFsFileId: fileId,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        contentType: "application/pdf",
        createdBy: req.user.userId
      });

      res.status(201).json({
        message: "PDF uploaded successfully.",
        material
      });
    } catch (error) {
      if (uploadedFileId) {
        try {
          await getBucket().delete(uploadedFileId);
        } catch (_) {}
      }

      next(error);
    }
  }
);

router.post(
  "/upload-url",
  authenticateToken,
  requireRoles("faculty", "admin"),
  async (req, res, next) => {
    try {
      const { fileName, contentType } = req.body;

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
      ];

      if (!process.env.AWS_S3_BUCKET) {
        return res.status(503).json({
          message: "S3 uploads are not configured. Check backend/.env."
        });
      }

      if (
        typeof fileName !== "string" ||
        !fileName.trim() ||
        !allowedTypes.includes(contentType)
      ) {
        return res.status(400).json({
          message: "Provide a file name and supported content type."
        });
      }

      const safeName = fileName.trim()
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(-120);

      const key = `study-materials/${crypto.randomUUID()}-${safeName}`;
      const region = process.env.AWS_REGION || "ap-south-1";
      const s3 = new S3Client({ region });

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: contentType
      });

      const uploadUrl = await getSignedUrl(s3, command, {
        expiresIn: 300
      });

      const baseUrl = process.env.S3_PUBLIC_BASE_URL ||
        `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com`;

      res.json({
        uploadUrl,
        key,
        fileUrl: `${baseUrl}/${key}`,
        expiresInSeconds: 300
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  authenticateToken,
  requireRoles("faculty", "admin"),
  async (req, res, next) => {
    try {
      const invalid = validateMaterial(req.body);
      if (invalid) return res.status(400).json({ message: invalid });

      const material = await Material.create({
        ...req.body,
        createdBy: req.user.userId
      });

      res.status(201).json({
        message: "Study material created.",
        material
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  authenticateToken,
  requireRoles("faculty", "admin"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid material ID." });
      }

      const invalid = validateMaterial(req.body);
      if (invalid) return res.status(400).json({ message: invalid });

      const material = await Material.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!material) {
        return res.status(404).json({ message: "Study material not found." });
      }

      res.json({ message: "Study material updated.", material });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  requireRoles("faculty", "admin"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid material ID." });
      }

      const material = await Material.findByIdAndDelete(req.params.id);

      if (!material) {
        return res.status(404).json({ message: "Study material not found." });
      }

      if (material.gridFsFileId) {
        try {
          await getBucket().delete(material.gridFsFileId);
        } catch (error) {
          console.error("Could not delete GridFS file:", error.message);
        }
      }

      res.json({ message: "Study material deleted." });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
