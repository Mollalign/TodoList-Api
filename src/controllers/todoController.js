const { validationResult } = require("express-validator");
const Todo = require("../models/Task");

// GET all todos
module.exports.getAllTodos = async (req, res) => {
  const { _id } = req.user;
  try {
    const todos = await Todo.find({ userId: _id }).sort({ priorityLevel: -1 });

    if (!todos || todos.length === 0) {
      return res.status(404).json({ success: false, message: "No todos found" });
    }

    res.status(200).json({ success: true, data: todos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// CREATE todo
module.exports.createTodo = async (req, res) => {
  const { _id } = req.user;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { title, description, priorityLevel } = req.body;

  try {
    const todo = await Todo.create({ title, description, priorityLevel, userId: _id });
    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// UPDATE todo
module.exports.updateTodo = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { title, description, priorityLevel, completed } = req.body;

  try {
    const result = await Todo.findOneAndUpdate(
      { userId: _id, _id: id },
      { title, description, priorityLevel, completed },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Todo not found" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE todo
module.exports.deleteTodo = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;

  try {
    const result = await Todo.findOneAndDelete({ userId: _id, _id: id });

    if (!result) {
      return res.status(404).json({ success: false, message: "Todo not found" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
