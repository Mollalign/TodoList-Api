const express = require("express");
const { identification } = require("../middlewares/identification");
const todoController = require("../controllers/todoController");
const { todoValidator, updateTodoValidator } = require("../middlewares/validator");

const todoRouter = express.Router();

todoRouter.get("/get-all-todo", identification, todoController.getAllTodos);

todoRouter.post("/create-todo", identification, todoValidator, todoController.createTodo);

todoRouter.patch("/update-todo/:id", identification, updateTodoValidator, todoController.updateTodo);

todoRouter.delete("/delete-todo/:id", identification, todoController.deleteTodo);

module.exports = todoRouter;
