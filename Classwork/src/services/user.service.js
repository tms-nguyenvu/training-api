"use strict";
const User = require('../../models/user.model');
const { convertToObjectIdMongodb } = require('../utils');

class UserService {

    static findUserById(userId) {
        return User.findById({
            _id: convertToObjectIdMongodb(userId),
        });
    }
}

module.exports = UserService;