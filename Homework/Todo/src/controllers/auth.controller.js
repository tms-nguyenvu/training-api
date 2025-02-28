const AuthService = require("../services/auth.service");
const { CREATED, SuccessResponse } = require("../utils/success.response");

class AuthController {
  register = async (req, res, next) => {
    new CREATED({
      message: "Register successfully",
      metadata: await AuthService.register(req.body),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      message: "Login successfully",
      metadata: await AuthService.login(req.body),
    }).send(res);
  };
}

module.exports = new AuthController();
