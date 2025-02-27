"use strict";

const express = require("express");
const todoController = require("../../controllers/todo.controller");
const asyncHandler = require("../../middlewares/async.handler");
const router = express.Router();

router.post("/", asyncHandler(todoController.createTodo));

router.get("/", asyncHandler(todoController.getAllTodos));

router.get("/:id", asyncHandler(todoController.getTodoById));

router.put("/:id", asyncHandler(todoController.updateTodo));

router.delete("/:id", asyncHandler(todoController.deleteTodo));

module.exports = router;
