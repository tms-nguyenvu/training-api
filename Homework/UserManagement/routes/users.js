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
 * @route PATCH /change-password
 * @description Allows an authenticated user to change their password.
 * @access Private (User must be logged in)
 *
 * @param {express.Request} req - Express request object containing:
 *   - `oldPassword` in the request body (required).
 *   - `newPassword` in the request body (required, must be at least 6 characters long).
 *   - `req.user.id` from the `authMiddleware` (authenticated user).
 * @param {express.Response} res - Express response object used to send back the HTTP response.
 * @returns {Promise<void>} Sends a response indicating whether the password change was successful or not.
 */
router.patch("/me/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old password and new password are required." });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters." });
  }

  try {
    // Retrieve user from the token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate old password (SHOULD COMPARE HASHED PASSWORD)
    if (user.password !== oldPassword) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }

    // Update to new password (SHOULD BE HASHED BEFORE SAVING)
    user.password = newPassword; // Hash with bcrypt before saving
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;
