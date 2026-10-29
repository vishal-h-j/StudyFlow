
const express = require("express");
const User = require("../models/User");
const { authenticateToken, requireRoles } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/users",
  authenticateToken,
  requireRoles("admin"),
  async (req, res, next) => {
    try {
      const users = await User.find()
        .select("name email role createdAt updatedAt")
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        count: users.length,
        users
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
