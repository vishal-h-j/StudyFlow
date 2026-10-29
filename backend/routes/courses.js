const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const { authenticateToken, requireRoles } = require("../middleware/auth");

const router = express.Router();

function validateCourse(body) {
  if (body.title !== undefined && (typeof body.title !== "string" || !body.title.trim())) return "Course title is required.";
  for (const field of ["description", "icon", "instructor", "category"]) {
    if (body[field] !== undefined && typeof body[field] !== "string") return `${field} must be text.`;
  }
  return null;
}

router.get("/", async (req, res, next) => {
  try { res.json(await Course.find().sort({ createdAt: 1 })); }
  catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid course ID." });
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found." });
    res.json(course);
  } catch (error) { next(error); }
});

router.post("/", authenticateToken, requireRoles("faculty", "admin"), async (req, res, next) => {
  try {
    const invalid = validateCourse(req.body);
    if (invalid) return res.status(400).json({ message: invalid });
    const course = await Course.create(req.body);
    res.status(201).json({ message: "Course created.", course });
  } catch (error) { next(error); }
});

router.put("/:id", authenticateToken, requireRoles("faculty", "admin"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid course ID." });
    const invalid = validateCourse(req.body);
    if (invalid) return res.status(400).json({ message: invalid });
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: "Course not found." });
    res.json({ message: "Course updated.", course });
  } catch (error) { next(error); }
});

router.delete("/:id", authenticateToken, requireRoles("faculty", "admin"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid course ID." });
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found." });
    res.json({ message: "Course deleted." });
  } catch (error) { next(error); }
});

module.exports = router;