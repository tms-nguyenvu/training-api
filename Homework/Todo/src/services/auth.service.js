"use strict";

const { generateTokens } = require("../middlewares/auth.util");
const AuthRepository = require("../repositories/auth.repository");
const {
  BadRequestError,
  ConflictRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/error.response");
const { hashPassword, getInfoData, comparePassword } = require("../utils/util");
const {
  registerValidate,
  loginValidate,
} = require("../validations/auth.validate");

class AuthService {
  /**
   *
   * @param {*} payload - Input data (email, username, password)
   * @returns
   */
  static async register(payload) {
    const { email, username, password } = payload;

    // Validate input data and abort early if any error is found.
    const { error, value } = registerValidate(payload, { abortEarly: false });

    if (error) {
      throw new BadRequestError(error[0].message);
    }

    // Check if the email or username already exists in the database.
    const existingUser = await AuthRepository.findUserByEmailOrUsername(
      email,
      username
    );
    if (existingUser)
      throw new ConflictRequestError("Email or username already exists.");

    // Hash the password before saving it to the database.
    const passwordHash = await hashPassword(password);

    // Create a new user with the hashed password.
    const newUser = await AuthRepository.createUser({
      ...value,
      password: passwordHash,
    });

    if (!newUser) throw new InternalServerError("Failed to create user.");

    // Return the new user's information.
    return {
      user: getInfoData({
        fields: ["_id", "username", "email", "role", "isVerified"],
        object: newUser,
      }),
    };
  }

  /**
   *
   * @param {*} payload - Input data (email, password)
   * @returns
   */

  static async login(payload) {
    const { email, password } = payload;
    const { error, value } = loginValidate(payload, { abortEarly: false });

    //  Validate input data and abort early if any error is found.
    if (error) {
      throw new BadRequestError(error[0].message);
    }
    //  Find the user by email.
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError("User not exists.");
    }

    //  Check if the password is correct.
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials.");
    }

    //  Return the user's information.
    const userInfo = getInfoData({
      fields: ["_id", "username", "email", "role", "isVerified"],
      object: user,
    });

    // Tạo token
    const tokens = await generateTokens({
      userId: user._id,
    });

    return {
      user: userInfo,
      tokens,
    };
  }
}

module.exports = AuthService;
