require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function main() {
  const { MONGODB_URI, INITIAL_FACULTY_NAME, INITIAL_FACULTY_EMAIL, INITIAL_FACULTY_PASSWORD } = process.env;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing from backend/.env");
  if (!INITIAL_FACULTY_EMAIL || !INITIAL_FACULTY_PASSWORD || INITIAL_FACULTY_PASSWORD.length < 8) {
    throw new Error("Set INITIAL_FACULTY_EMAIL and an INITIAL_FACULTY_PASSWORD of at least 8 characters in backend/.env");
  }
  await mongoose.connect(MONGODB_URI);
  const email = INITIAL_FACULTY_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Account ${email} already exists with role "${existing.role}". No changes were made.`);
  } else {
    await User.create({
      name: (INITIAL_FACULTY_NAME || "StudyFlow Faculty").trim(),
      email,
      password: await bcrypt.hash(INITIAL_FACULTY_PASSWORD, 12),
      role: "faculty"
    });
    console.log(`Faculty account created: ${email}`);
  }
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});