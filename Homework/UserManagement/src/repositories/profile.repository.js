const userModel = require("../models/user.model");
const { convertToObjectIdMongodb } = require("../utils/util");

class ProfileRepository {
  static async findProfileByUserId(userId) {
    return await userModel.findById({
      _id: convertToObjectIdMongodb(userId),
    });
  }

  static async updateProfileByUserId(userId, data) {
    return await userModel.findByIdAndUpdate(
      {
        _id: convertToObjectIdMongodb(userId),
      },
      data,
      {
        new: true,
        runValidators: true,
      }
    );
  }
}

module.exports = ProfileRepository;
