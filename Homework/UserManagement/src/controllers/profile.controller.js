const ProfileService = require("../services/profile.service");
const { SuccessResponse } = require("../utils/success.response");

class ProfileController {
  getProfile = async (req, res, next) => {
    new SuccessResponse({
      message: "Get profile successfully",
      metadata: await ProfileService.getProfile(req?.user?.userId),
    }).send(res);
  };

  updateProfile = async (req, res, next) => {
    new SuccessResponse({
      message: "Update profile successfully",
      metadata: await ProfileService.updateProfile(req?.user?.userId, req.body),
    }).send(res);
  };
}

module.exports = new ProfileController();
