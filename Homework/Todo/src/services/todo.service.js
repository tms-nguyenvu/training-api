"use strict";

const TodoRepository = require("../repositories/todo.repository");
const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} = require("../utils/error.response");
const { todoValidate } = require("../validations/todo.validate");

class TodoService {
  // Tạo Todo mới
  static async createTodo(payload) {
    const { error } = todoValidate(payload);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const newTodo = await TodoRepository.create(payload);
    if (!newTodo) {
      throw new InternalServerError("Failed to create todo");
    }

    return newTodo;
  }

  static async getAllTodos(query = {}) {
    const { limit, sort, page, ...filter } = query;
    const todos = await TodoRepository.findAll({ limit, sort, page, filter });

    if (!todos || todos.length === 0) {
      throw new NotFoundError("No todos found");
    }
    return todos;
  }

  static async getTodoById(todoId) {
    const todo = await TodoRepository.findById(todoId);
    if (!todo) {
      throw new NotFoundError("Todo not found");
    }
    return todo;
  }

  static async updateTodo(todoId, payload) {
    const { error } = todoValidate(payload);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }
    const updatedTodo = await TodoRepository.update(todoId, payload);
    if (!updatedTodo) {
      throw new NotFoundError("Todo not found");
    }
    return updatedTodo;
  }

  static async deleteTodo(todoId) {
    const deletedTodo = await TodoRepository.delete(todoId);
    if (!deletedTodo) {
      throw new NotFoundError("Todo not found");
    }
    return { message: "Todo deleted successfully" };
  }
}

module.exports = TodoService;
