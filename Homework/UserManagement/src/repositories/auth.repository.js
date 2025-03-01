"use strict";
const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");

class AuthRepository {
  static async findUserByEmailOrUsername(email, username) {
    return userModel.findOne({
      $or: [{ email }, { username }],
    });
  }

  static async createUser(payload) {
    return await userModel.create(payload);
  }

  static async findUserByEmail(email) {
    return await userModel.findOne({ email });
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async findUserByVerificationToken(verificationToken) {
    return await userModel.findOne({ verificationToken });
  }

  static async findUserByResetToken(resetPasswordToken) {
    return await userModel.findOne({ resetPasswordToken });
  }
}

module.exports = AuthRepository;
