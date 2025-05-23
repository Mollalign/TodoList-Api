const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// POST /tasks — Create a new task
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, dueDate } = req.body;

  try {
    const task = new Task({ title, dueDate, user: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// GET /tasks — Get all tasks for the logged-in user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    console.error('Error in getTasks:', err); // Add this
    res.status(500).send('Server Error');
  }
};


// PUT /tasks/:id — Update a task
exports.updateTask = async (req, res) => {
  const { title, dueDate, completed } = req.body;
  try {
    let task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id)
      return res.status(404).json({ msg: 'Task not found' });

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { title, dueDate, completed } },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};


// DELETE /tasks/:id — Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};



