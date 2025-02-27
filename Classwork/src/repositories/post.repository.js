"use strict";

const { default: mongoose } = require("mongoose");
const postModel = require("../models/post.model");
const { convertToObjectIdMongodb, getSelectData } = require("../utils");
const UserRepository = require("./user.repository");

class PostRepository {
  static async create(data) {
    return await postModel.create(data);
  }

  static async findAll({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = {},
    select = [],
  }) {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { createdAt: -1 } : { updatedAt: -1 };

    if (filter.title) {
      filter.title = { $regex: filter.title, $options: "i" };
    }

    if (filter.author) {
      if (!mongoose.Types.ObjectId.isValid(filter.author)) {
        const authorName = filter.author;
        delete filter.author;
        const matchingUsers = await UserRepository.findUserIdsByUserName(
          authorName
        );
        const authorIds = matchingUsers.map((user) => user._id);
        filter.author = { $in: authorIds };
      }
    }

    return await postModel
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .lean();
  }

  static async findById(postId) {
    return await postModel
      .findById({
        _id: convertToObjectIdMongodb(postId),
      })
      .populate("author", "name email");
  }

  static async update(postId, data) {
    return await postModel.findByIdAndUpdate(
      {
        _id: convertToObjectIdMongodb(postId),
      },
      data,
      { new: true, runValidators: true }
    );
  }

  static async delete(postId) {
    return await postModel.findByIdAndDelete({
      _id: convertToObjectIdMongodb(postId),
    });
  }

  static async countPostsByUser(userId) {
    return await postModel.countDocuments({ author: userId });
  }
}

module.exports = PostRepository;
