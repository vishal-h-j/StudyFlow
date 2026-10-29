
const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160
  },
  description: {
    type: String,
    default: "",
    maxlength: 2000
  },
  type: {
    type: String,
    default: "PDF",
    maxlength: 30
  },
  course: {
    type: String,
    default: "General",
    maxlength: 160
  },
  url: {
    type: String,
    default: "",
    maxlength: 2048
  },
  s3Key: {
    type: String,
    default: ""
  },
  gridFsFileId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  originalFileName: {
    type: String,
    default: ""
  },
  fileSize: {
    type: Number,
    default: 0
  },
  contentType: {
    type: String,
    default: "application/pdf"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports =
  mongoose.models.Material || mongoose.model("Material", materialSchema);
