"use strict";

const userModel = require("../models/user.model");

class AuthRepository {
  static async findUserByEmailOrUsername(email, username) {
    return userModel.findOne({
      $or: [{ email }, { username }],
    });
  }

  static async createUser(payload) {
    return userModel.create(payload);
  }

  static async findUserByEmail(email) {
    return userModel.findOne({ email });
  }
}

module.exports = AuthRepository;
