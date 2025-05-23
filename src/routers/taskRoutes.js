const express = require('express');
const { body } = require('express-validator');
const auth = require('../middlewares/authMiddleware');
const todoController = require('../controllers/todoController');

const taskRouter = express.Router();

taskRouter.post(
  '/',
  auth,
  [body('title').notEmpty().withMessage('Title is required')],
  todoController.createTask
);

taskRouter.get('/', auth, todoController.getTasks);
taskRouter.put('/:id', auth, todoController.updateTask);
taskRouter.delete('/:id', auth, todoController.deleteTask);

module.exports = taskRouter;
