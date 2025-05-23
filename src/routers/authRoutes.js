const express = require('express');
const { register, login, requestPasswordReset, resetPassword } = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../middlewares/validator');

const authRouter = express.Router();

// Register Route
authRouter.post('/register', validateRegister, register);

// Login Route
authRouter.post('/login', validateLogin, login);

// forget-password route
authRouter.post('/forgot-password', validateForgotPassword, requestPasswordReset);

// forget-password route
authRouter.post('/reset-password', validateResetPassword, resetPassword);

module.exports = authRouter;
