"use strict";

const TodoRepository = require("../repositories/todo.repository");
const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} = require("../utils/error.response");
const { todoValidate } = require("../validations/todo.validate");

class TodoService {
  // Create a new Todo
  static async createTodo(payload) {
    // Validate the payload using manual todoValidate
    const { error, value } = todoValidate(payload);
    if (error) {
      // Throw the first error message
      throw new BadRequestError(error[0].message);
    }

    // Create Todo using validated value (you can also use payload directly if desired)
    const newTodo = await TodoRepository.create(value);
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
    const { error, value } = todoValidate(payload);
    if (error) {
      throw new BadRequestError(error[0].message);
    }
    const updatedTodo = await TodoRepository.update(todoId, value);
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
