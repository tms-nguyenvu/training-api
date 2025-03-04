"use strict";
const router = require("express").Router();
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

/**
 * Get a paginated list of users (Admin only).
 * @route GET /
 * @access Private (Admin)
 * @param {number} req.query.page - The page number.
 * @param {number} req.query.limit - The number of users per page.
 */
router.get(
  "/users",
  authMiddleware,
  adminMiddleware(["admin"]),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const users = await User.find()
        .select("-password -token")
        .skip(skip)
        .limit(limit);
      const totalUsers = await User.countDocuments();

      res.json({
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        users,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

module.exports = router;
