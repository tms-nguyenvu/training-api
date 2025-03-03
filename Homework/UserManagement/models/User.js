const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
    default: null,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
});

module.exports = mongoose.model("User", userSchema);
