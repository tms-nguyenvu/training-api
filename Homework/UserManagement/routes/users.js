"use strict";
const router = require("express").Router();
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

// Regex format email
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

/**
 * Validates user input.
 * @param {Object} input - User input data.
 * @param {string} input.name - The user's name.
 * @param {string} input.email - The user's email.
 * @returns {Object} errors - Object containing validation errors.
 */
const validateUserInput = ({ name, email }) => {
  let errors = {};

  if (!name) errors.name = "Name is required.";
  if (!email) errors.email = "Email is required.";
  else if (!emailRegex.test(email)) errors.email = "Invalid email format.";

  return errors;
};

/**
 * Get the current authenticated user's information.
 * @route GET /me
 * @access Private (Authenticated users)
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.json({
      name: req.user.name,
      email: req.user.email,
      isVerified: req.user.isVerified,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

/**
 * Update the current authenticated user's profile.
 * @route PUT /me
 * @access Private (User, Admin)
 * @param {string} req.body.name - The new name of the user.
 * @param {string} req.body.email - The new email of the user.
 */
router.put(
  "/me",
  authMiddleware,
  adminMiddleware(["user", "admin"]),
  async (req, res) => {
    const { name, email } = req.body;

    // Validate input data
    const errors = validateUserInput({ name, email });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      req.user.name = name;
      req.user.email = email.toLowerCase();
      await req.user.save();

      const {
        _id,
        name: updatedName,
        email: updatedEmail,
        role,
        isVerified,
      } = req.user.toObject();

      res.json({
        message: "Profile updated successfully!",
        user: { _id, name: updatedName, email: updatedEmail, role, isVerified },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

/**
 * Get a paginated list of users (Admin only).
 * @route GET /
 * @access Private (Admin)
 * @param {number} req.query.page - The page number.
 * @param {number} req.query.limit - The number of users per page.
 */
router.get(
  "/",
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
