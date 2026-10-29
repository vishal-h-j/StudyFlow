const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, default: "", maxlength: 2000 },
  icon: { type: String, default: "📚", maxlength: 12 },
  instructor: { type: String, default: "StudyFlow", maxlength: 120 },
  category: { type: String, default: "General", maxlength: 80 }
}, { timestamps: true });

module.exports = mongoose.models.Course || mongoose.model("Course", courseSchema);