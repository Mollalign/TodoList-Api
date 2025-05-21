const { body } = require('express-validator');

// Common password regex
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


//Sign In
const signinValidator = [
  body('emailOrUserName')
    .notEmpty().withMessage('Username or Email is required')
    .custom(value => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value);
      if (!isEmail && !isUsername) {
        throw new Error('Invalid email or username');
      }
      return true;
    }),
  body('password')
    .isString()
    .isLength({ min: 8, max: 20 })
    .matches(strongPasswordRegex)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// ========== Sign Up ==========
const signupValidator = [
  body('email')
    .isEmail().withMessage('Invalid email')
    .isLength({ min: 5, max: 50 }),
  body('userName')
    .isAlphanumeric().withMessage('Username must be alphanumeric')
    .isLength({ min: 3, max: 20 }),
  body('password')
    .matches(strongPasswordRegex)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// ========== Accept Code ==========
const acceptCodeValidator = [
  body('email')
    .isEmail().withMessage('Invalid email')
    .isLength({ min: 5, max: 50 }),
  body('providedCode')
    .isNumeric().withMessage('Code must be a number')
];

// ========== Email + Password ==========
const emailAndPasswordValidator = [
  body('email')
    .isEmail().withMessage('Invalid email')
    .isLength({ min: 5, max: 50 }),
  body('password')
    .matches(strongPasswordRegex)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// ========== Change Password ==========
const changePasswordValidator = [
  body('emailOrUserName')
    .notEmpty().withMessage('Username or Email is required')
    .custom(value => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value);
      if (!isEmail && !isUsername) {
        throw new Error('Invalid email or username');
      }
      return true;
    }),
  body('oldPassword')
    .matches(strongPasswordRegex)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('newPassword')
    .matches(strongPasswordRegex)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// ========== Forgot Password ==========
const forgotPasswordValidator = [
  body('emailOrUserName')
    .notEmpty().withMessage('Username or Email is required')
    .custom(value => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value);
      if (!isEmail && !isUsername) {
        throw new Error('Invalid email or username');
      }
      return true;
    })
];

// ========== Verify Forgot Password ==========
const verifyFPValidator = [
  body('emailOrUserName')
    .notEmpty().withMessage('Username or Email is required')
    .custom(value => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value);
      if (!isEmail && !isUsername) {
        throw new Error('Invalid email or username');
      }
      return true;
    }),
  body('providedCode')
    .isNumeric().withMessage('Code must be a number'),
  body('newPassword')
    .matches(strongPasswordRegex)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// ========== Todo ==========
const todoValidator = [
  body('title')
    .isLength({ min: 3, max: 50 }).withMessage('Title must be between 3 and 50 characters'),
  body('description')
    .isLength({ min: 5, max: 200 }).withMessage('Description must be between 5 and 200 characters'),
  body('priortyLevel')
    .isInt({ min: 0, max: 10 }).withMessage('Priority must be a number between 0 and 10')
];

//Update Todo
const updateTodoValidator = [
  ...todoValidator,
  body('completed')
    .isBoolean().withMessage('Completed must be true or false')
];

module.exports = {
  signinValidator,
  signupValidator,
  acceptCodeValidator,
  emailAndPasswordValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  verifyFPValidator,
  todoValidator,
  updateTodoValidator
};
