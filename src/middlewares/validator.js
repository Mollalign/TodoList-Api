const { body } = require('express-validator');

exports.validateRegister = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').exists().withMessage('Password is required')
];

exports.validateForgotPassword = [
  body('email').isEmail().withMessage('Enter a valid email')
];

exports.validateResetPassword = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

