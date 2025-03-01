const AuthService = require("../services/auth.service");
const { CREATED, SuccessResponse } = require("../utils/success.response");

class AuthController {
  register = async (req, res, next) => {
    new CREATED({
      message: "Register successfully",
      metadata: await AuthService.register(req.body),
    }).send(res);
  };

  verifyEmail = async (req, res, next) => {
    new SuccessResponse({
      message: "Email verification successful",
      metadata: await AuthService.verifyEmail(req.params.token),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      message: "Login successfully",
      metadata: await AuthService.login(req.body),
    }).send(res);
  };

  requestPasswordReset = async (req, res, next) => {
    new SuccessResponse({
      message: "Password reset request sent successfully",
      metadata: await AuthService.requestPasswordReset(req.body.email),
    }).send(res);
  };

  resetPassword = async (req, res, next) => {
    new SuccessResponse({
      message: "Password reset successful",
      metadata: await AuthService.resetPassword(
        req.params.token,
        req.body.newPassword
      ),
    }).send(res);
  };
}

module.exports = new AuthController();
