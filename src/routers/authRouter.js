const express = require("express");
const authRouter = express.Router();

const authController = require("../controllers/authController");
const {
  signupValidator,
  signinValidator,
  emailAndPasswordValidator,
} = require("../middlewares/validator");
const { identification } = require("../middlewares/identification");

// Public Routes (No Auth Required)
authRouter.post("/api/auth/signup", signupValidator, authController.signup);
authRouter.post("/api/auth/signin", signinValidator, authController.signin);
authRouter.post("/api/auth/forgotPassword", emailAndPasswordValidator, authController.forgotPassword);
authRouter.patch("/api/auth/verifyForgotPassword", authController.verifyForgotPasswordCode);

// Protected Routes (Require Auth)
authRouter.post("/api/auth/signout", identification, authController.signout);
authRouter.post("/api/auth/sendVerificationCode", identification, authController.sendVerificationCode);
authRouter.post("/api/auth/verifyVerificationCode", identification, authController.verifyCode);
authRouter.patch("/api/auth/changePassword", identification, authController.changePassword);

module.exports = authRouter;
