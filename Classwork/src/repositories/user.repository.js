const { convertToObjectIdMongodb } = require('../utils');

userModel = require('../models/user.model');

class UserRepository {
    static findUserById(userId) {
        return userModel.findById({
            _id: convertToObjectIdMongodb(userId),
        });
    }

    static findUserIdsByUserName(authorName) {
        return userModel.find({
                name: { $regex: authorName, $options: "i" }
        }).select("_id");
    }
}

module.exports = UserRepository;