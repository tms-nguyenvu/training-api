"use strict";

const sendEmail = require("../libs/init.nodemailer");
const {
  generateTokens,
  generateVerificationToken,
  generateResetToken,
} = require("../middlewares/auth.middleware");
const AuthRepository = require("../repositories/auth.repository");
const {
  BadRequestError,
  ConflictRequestError,
  InternalServerError,
  UnauthorizedError,
} = require("../utils/error.response");
const { getInfoData } = require("../utils/util");
const {
  registerValidate,
  loginValidate,
} = require("../validations/auth.validate");

class AuthService {
  /**
   * Registers a new user.
   * @param {*} payload
   * @returns
   */

  static async register(payload) {
    const { email, username, password } = payload;

    const { error, value } = registerValidate(payload, { abortEarly: true });

    if (error) throw new BadRequestError(error[0].message);

    const existingUser = await AuthRepository.findUserByEmailOrUsername(
      email,
      username
    );

    if (existingUser)
      throw new ConflictRequestError("Email or username already exists.");

    const passwordHash = await AuthRepository.hashPassword(password);

    const verificationToken = await generateVerificationToken({ email });

    const newUser = await AuthRepository.createUser({
      ...value,
      password: passwordHash,
      verificationToken,
    });

    if (!newUser) throw new InternalServerError("Failed to create user.");

    const verificationLink = `http://localhost:3052/v1/auth/verify/${verificationToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      text: `Hello ${username}, please click the following link to verify your email: ${verificationLink}`,
    });

    return {
      user: getInfoData({
        fields: ["_id", "username", "email", "role", "isVerified"],
        object: newUser,
      }),
    };
  }

  /**
   * Verifies a user's email.
   * @param {*} token
   * @returns
   */

  static async verifyEmail(verificationToken) {
    const user = await AuthRepository.findUserByVerificationToken(
      verificationToken
    );
    if (!user)
      throw new BadRequestError("Invalid or expired verification token.");

    if (user.isVerified)
      throw new ConflictRequestError("Email is already verified.");

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
  }

  /**
   * Logs a user in.
   * @param {*} payload
   * @returns
   */
  static async login(payload) {
    const { email, password } = payload;

    const { error, value } = loginValidate(payload, { abortEarly: false });
    if (error) throw new BadRequestError(error[0].message);

    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new UnauthorizedError("User not exits.");

    const isMatch = await AuthRepository.comparePassword(
      password,
      user.password
    );
    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials.");
    }

    const userInfo = getInfoData({
      fields: ["_id", "username", "email", "role", "isVerified"],
      object: user,
    });

    const tokens = await generateTokens({
      userId: user._id,
      role: user.role,
    });

    return {
      user: userInfo,
      tokens,
    };
  }

  /**
   * Requests a password reset for a user.
   * @param {string} email
   */

  static async requestPasswordReset(email) {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new BadRequestError("User not found.");

    const resetToken = await generateResetToken({ userId: user._id });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    const resetLink = `http://localhost:3052/v1/auth/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text: `Hello, please click the following link to reset your password: ${resetLink}`,
    });
  }

  /**
   * Resets a user's password based on the reset token.
   * @param {string} resetToken
   * @param {string} newPassword
   */
  static async resetPassword(resetToken, newPassword) {
    const user = await AuthRepository.findUserByResetToken(resetToken);
    console.log(user);
    if (!user)
      throw new BadRequestError("Invalid or expired password reset token.");

    if (user.resetPasswordExpires < new Date())
      throw new BadRequestError("Password reset token has expired.");

    const passwordHash = await AuthRepository.hashPassword(newPassword);
    user.password = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }
}

module.exports = AuthService;
