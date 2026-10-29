
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Material = require("../models/Material");

const files = [
  {
    filename: "cloud-computing.pdf",
    course: "Cloud Computing",
    title: "Cloud Computing Notes",
    description: "Introduction to cloud platforms and services."
  },
  {
    filename: "react-fundamentals.pdf",
    course: "Full Stack Web Development",
    title: "Full Stack Development Notes",
    description: "Frontend, backend, and database fundamentals."
  },
  {
    filename: "rest-api-development.pdf",
    course: "Development of Web Services",
    title: "Web Services Notes",
    description: "REST APIs, HTTP methods, status codes, and JSON."
  },
  {
    filename: "virtualization-docker.pdf",
    course: "Virtualization & Docker",
    title: "Virtualization & Docker Notes",
    description: "Virtual machines, Docker images, containers, and deployment."
  },
  {
    filename: "mongodb-mongoose.pdf",
    course: "MongoDB & Mongoose",
    title: "MongoDB & Mongoose Notes",
    description: "MongoDB databases, CRUD operations, schemas, and Mongoose."
  }
];

async function uploadFile(bucket, filePath, filename, course) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: "application/pdf",
      metadata: { course }
    });

    const readStream = fs.createReadStream(filePath);

    readStream.on("error", reject);
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id));

    readStream.pipe(uploadStream);
  });
}

async function migrate() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your backend .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "studyMaterials"
    });

    const materialsDirectory = path.resolve(
      __dirname,
      "../../frontend/public/materials"
    );

    for (const item of files) {
      const filePath = path.join(materialsDirectory, item.filename);

      if (!fs.existsSync(filePath)) {
        console.log(`SKIPPED: ${item.filename} was not found.`);
        continue;
      }

      const buffer = fs.readFileSync(filePath);

      if (buffer.subarray(0, 5).toString() !== "%PDF-") {
        console.log(`SKIPPED: ${item.filename} is not a valid PDF.`);
        continue;
      }

      let material = await Material.findOne({ course: item.course });

      if (material?.gridFsFileId) {
        console.log(`ALREADY LINKED: ${item.course}`);
        continue;
      }

      const fileId = await uploadFile(
        bucket,
        filePath,
        item.filename,
        item.course
      );

      if (!material) {
        material = new Material();
      }

      material.title = item.title;
      material.description = item.description;
      material.type = "PDF";
      material.course = item.course;
      material.url = `/api/materials/file/${fileId}`;
      material.gridFsFileId = fileId;
      material.originalFileName = item.filename;
      material.fileSize = fs.statSync(filePath).size;
      material.contentType = "application/pdf";

      await material.save();

      console.log(`UPLOADED: ${item.filename} → ${item.course}`);
    }

    console.log("\nMigration finished.");
    console.log("Your original local PDFs have not been deleted.");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
