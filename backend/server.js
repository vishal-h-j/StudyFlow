require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Course = require("./models/Course");
const Material = require("./models/Material");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const materialRoutes = require("./routes/materials");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5001;

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",").map((item) => item.trim()),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ message: "StudyFlow API is running." }));
app.get("/api/health", (req, res) => res.json({
  status: "ok",
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
}));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", (req, res) => res.status(404).json({ message: `API endpoint not found: ${req.method} ${req.originalUrl}` }));
app.use((error, req, res, next) => {
  console.error("API error:", error.message);
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ message: "Invalid JSON request body." });
  if (error.name === "ValidationError") return res.status(400).json({ message: "Please check the submitted fields.", details: error.message });
  if (error.code === 11000) return res.status(409).json({ message: "A record with that unique value already exists." });
  return res.status(500).json({ message: "An internal server error occurred." });
});

async function seedSampleData() {
  if (await Course.countDocuments() === 0) {
    await Course.insertMany([
      { title: "Cloud Computing", description: "Understand cloud service models, virtualization, storage, networking, security, and deploying applications on AWS.", icon: "☁️", category: "Cloud & Infrastructure", instructor: "StudyFlow Faculty" },
      { title: "Full Stack Web Development", description: "Build a complete web application with React, Node.js, Express, REST APIs, and MongoDB.", icon: "💻", category: "Web Development", instructor: "StudyFlow Faculty" },
      { title: "Development of Web Services", description: "Design RESTful services using HTTP methods, JSON, status codes, validation, and secure API access.", icon: "🌐", category: "Web Services", instructor: "StudyFlow Faculty" }
    ]);
    console.log("Sample courses added.");
  }
  if (await Material.countDocuments() === 0) {
    await Material.insertMany([
      { title: "Cloud Computing — Learning Guide", description: "Cloud fundamentals, IaaS/PaaS/SaaS, deployment models, AWS core services, security, and deployment checklist.", type: "Learning guide", course: "Cloud Computing", url: "https://docs.aws.amazon.com/" },
      { title: "Full Stack Development — Documentation", description: "React components and state, Express routing, MongoDB collections, environment configuration, and application flow.", type: "Documentation", course: "Full Stack Web Development", url: "https://react.dev/learn" },
      { title: "REST API — Reference Guide", description: "Review HTTP methods, request/response structure, status codes, API testing, and resource-oriented design.", type: "Reference guide", course: "Development of Web Services", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods" }
    ]);
    console.log("Sample study materials added.");
  }
}

async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing from backend/.env");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters.");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected successfully.");
  await seedSampleData();
  app.listen(PORT, () => console.log(`StudyFlow API running at http://localhost:${PORT}`));
}

start().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});