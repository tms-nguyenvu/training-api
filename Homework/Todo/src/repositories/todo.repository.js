"use strict";

const todoModel = require("../models/toto");
const { convertToObjectIdMongodb, getSelectData } = require("../utils/util");

class TodoRepository {
  static async create(data) {
    return await todoModel.create(data);
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

    if (filter.search) {
      const searchRegex = new RegExp(filter.search, "i");
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
      delete filter.search;
    }

    return await todoModel
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .lean();
  }

  static async findById(todoId) {
    return await todoModel.findById({
      _id: convertToObjectIdMongodb(todoId),
    });
  }

  static async update(todoId, data) {
    return await todoModel.findByIdAndUpdate(
      {
        _id: convertToObjectIdMongodb(todoId),
      },
      data,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  static async delete(todoId) {
    return await todoModel.findByIdAndDelete({
      _id: convertToObjectIdMongodb(todoId),
    });
  }
}

module.exports = TodoRepository;
