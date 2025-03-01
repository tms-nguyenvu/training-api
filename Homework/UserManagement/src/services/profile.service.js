const ProfileRepository = require("../repositories/profile.repository");
const { BadRequestError } = require("../utils/error.response");
const { getInfoData } = require("../utils/util");
const { updateProfileValidate } = require("../validations/profile.validate");

class ProfileService {
  static async getProfile(userId) {
    if (!userId) throw new BadRequestError("User ID is required.");

    const profile = await ProfileRepository.findProfileByUserId(userId);

    if (!profile) throw new BadRequestError("User not found.");

    return {
      profile: getInfoData({
        fields: ["_id", "username", "email", "role", "isVerified"],
        object: profile,
      }),
    };
  }

  static async updateProfile(userId, payload) {
    if (!userId) throw new BadRequestError("User ID is required.");

    const { error, value } = updateProfileValidate(payload, {
      abortEarly: false,
    });
    if (error) throw new BadRequestError(error[0].message);

    const updatedProfile = await ProfileRepository.updateProfileByUserId(
      userId,
      value
    );

    if (!updatedProfile) throw new BadRequestError("Failed to update profile.");

    return {
      profile: getInfoData({
        fields: ["_id", "username", "email", "role", "isVerified"],
        object: updatedProfile,
      }),
    };
  }
}

module.exports = ProfileService;
