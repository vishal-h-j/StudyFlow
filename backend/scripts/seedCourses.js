
require("dotenv").config();

const mongoose = require("mongoose");
const Course = require("../models/Course");

const courses = [
  {
    title: "Virtualization & Docker",
    description: "Learn virtualization, virtual machines, Docker images, containers, and deployment.",
    icon: "🐳",
    category: "Cloud & Infrastructure",
    instructor: "StudyFlow Faculty"
  },
  {
    title: "MongoDB & Mongoose",
    description: "Learn MongoDB databases, collections, CRUD operations, schemas, and Mongoose models.",
    icon: "🍃",
    category: "Database Management",
    instructor: "StudyFlow Faculty"
  }
];

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from backend/.env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  for (const course of courses) {
    const result = await Course.updateOne(
      { title: course.title },
      { $setOnInsert: course },
      { upsert: true }
    );

    console.log(
      result.upsertedCount
        ? `Added: ${course.title}`
        : `Already exists: ${course.title}`
    );
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Course seeding failed:", error.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
