"use strict";
const router = require("express").Router();
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { authMiddleware } = require("../middlewares/auth");

// Regex format email
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

/**
 * Validates user input.
 * @param {Object} input - User input data.
 * @param {string} input.name - The user's name.
 * @param {string} input.email - The user's email.
 * @param {string} input.password - The user's password.
 * @returns {Object} errors - Object containing validation errors.
 */
const validateUserInput = ({ name, email, password }) => {
  let errors = {};

  if (!name) errors.name = "Name is required.";
  if (!email) errors.email = "Email is required.";
  else if (!emailRegex.test(email)) errors.email = "Invalid email format.";

  if (!password) errors.password = "Password is required.";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters.";

  return errors;
};

/**
 * Sends an email using the Nodemailer library.
 *
 * @param {Object} options - Email options.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.text - Plain text version of the email content.
 * @param {string} options.html - HTML version of the email content.
 * @returns {Promise<void>} A promise that resolves when the email is sent successfully.
 * @throws {Error} Throws an error if email sending fails.
 */
const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

/**
 * @route POST /register
 * @description Registers a new user and sends a verification email.
 * @access Public
 *
 * @param {express.Request} req - Express request object containing user data (name, email, password) in the request body.
 * @param {express.Response} res - Express response object used to send back the HTTP response.
 * @returns {Promise<void>} Sends a response with a success message or an error message.
 */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate user input
  const errors = validateUserInput({ name, email, password });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({ errors: { email: "Email is already in use." } });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create a new user (password should be hashed before saving)
    const user = new User({
      name,
      email: email.toLowerCase(),
      password, // TODO: Hash the password before saving
      verificationToken,
    });

    await user.save();

    // Send email verification
    const verifyUrl = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      text: `Click the link to verify your email: ${verifyUrl}`,
    });

    res
      .status(201)
      .json({ message: "User registered. Please verify your email." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

/**
 * @route GET /verify-email
 * @description Verifies a user's email using a token.
 * @access Public
 *
 * @param {express.Request} req - Express request object containing the verification token in the query parameters.
 * @param {express.Response} res - Express response object used to send back the HTTP response.
 * @returns {Promise<void>} Sends a response indicating whether the email verification was successful or not.
 */
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Invalid verification token." });
  }

  try {
    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Mark user as verified and remove the token
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

/**
 * @route POST /login
 * @description Logs in a user by validating their email and password.
 * @access Public
 *
 * @param {express.Request} req - Express request object containing `email` and `password` in the request body.
 * @param {express.Response} res - Express response object used to send back the HTTP response.
 * @returns {Promise<void>} Sends a response indicating whether the login was successful or not.
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate valid user input
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email." });
    }

    // Randomly generate a JWT token
    const token = crypto.randomBytes(32).toString("hex");

    user.token = token;
    await user.save();

    res.json({
      message: "Login successful!",
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

/**
 * @route DELETE /logout
 * @description Logs out the authenticated user by removing their authentication token.
 * @access Private (Requires authentication via `authMiddleware`)
 *
 * @param {express.Request} req - Express request object, containing `user` with the authenticated user's token.
 * @param {express.Response} res - Express response object used to send back the HTTP response.
 * @returns {Promise<void>} Sends a response indicating whether the logout was successful or not.
 */
router.put("/logout", authMiddleware, async (req, res) => {
  const token = req.user.token;

  try {
    // Find user by token
    const user = await User.findOne({ token });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or already logged out." });
    }

    // Remove token from the database
    user.token = null;
    await user.save();

    res.json({ message: "Logout successful!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

/**
 * @route POST /password-reset-requests
 * @description Sends a password reset email to the user if the email exists in the database.
 * @access Public
 *
 * @param {express.Request} req - Express request object, containing `email` in the request body.
 * @param {express.Response} res - Express response object used to send back the HTTP response.
 * @returns {Promise<void>} Sends a response indicating whether the password reset email was sent successfully or not.
 */
router.post("/password-reset/request", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store token in the database with a 1-hour expiration time
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    const resetLink = `http://localhost:3000/api/auth/password-reset?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text: `Hello, please click the following link to reset your password: ${resetLink}`,
    });

    res.json({
      message: "Password reset email sent. Please check your inbox.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

/**
 * @route GET /reset-password
 * @description Displays the password reset page with a form to enter a new password.
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {void} Sends an HTML form for the user to reset their password.
 */
router.get("/password-reset", (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send("Invalid token.");
  }

  res.send(`
    <h2>Đặt lại mật khẩu</h2>
    <form method="POST" action="/api/auth/password-reset?token=${token}">
      <label for="newPassword">Mật khẩu mới:</label>
      <input type="password" id="newPassword" name="newPassword" required>
      <button type="submit">Cập nhật mật khẩu</button>
    </form>
  `);
});

/**
 * @route PATCH /password-resets
 * @description Resets the user's password using a valid reset token.
 * @access Public
 *
 * @param {express.Request} req - Express request object containing:
 *   - `token` in the query parameters (required).
 *   - `newPassword` in the request body (required, must be at least 6 characters long).
 * @param {express.Response} res - Express response object used to send back the HTTP response.
 * @returns {Promise<void>} Sends a response indicating whether the password reset was successful or not.
 */
router.post("/password-reset", async (req, res) => {
  const { newPassword } = req.body;
  const { token } = req.query;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required." });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    // Update the password
    user.password = newPassword; // Use bcrypt to hash before saving
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;
