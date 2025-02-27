"use strict";

const TodoService = require("../services/todo.service");
const { CREATED, OK } = require("../utils/success.response");

class TodoController {
  // Tạo Todo mới
  createTodo = async (req, res, next) => {
    new CREATED({
      message: "Create todo successfully",
      metadata: await TodoService.createTodo(req.body),
    }).send(res);
  };

  getAllTodos = async (req, res, next) => {
    new OK({
      message: "Get all todos successfully",
      metadata: await TodoService.getAllTodos(req.query),
    }).send(res);
  };

  getTodoById = async (req, res, next) => {
    new OK({
      message: "Get todo successfully",
      metadata: await TodoService.getTodoById(req.params.id),
    }).send(res);
  };

  updateTodo = async (req, res, next) => {
    new OK({
      message: "Update todo successfully",
      metadata: await TodoService.updateTodo(req.params.id, req.body),
    }).send(res);
  };

  deleteTodo = async (req, res, next) => {
    new OK({
      message: "Delete todo successfully",
      metadata: await TodoService.deleteTodo(req.params.id),
    }).send(res);
  };
}

module.exports = new TodoController();
