const express = require("express");
const authRouter = express.Router();

const authController = require("../controllers/authController");
const { signupValidator, signinValidator, emailAndPasswordValidator } = require("../middlewares/validator");
const {identification} = require("../middlewares/identification");

// Route with validation middleware before controller
authRouter.post("/api/auth/signup", signupValidator, authController.signup);
authRouter.post("/api/auth/signin", signinValidator, authController.signin);
authRouter.post("/signout",identification,authController.signout);

authRouter.post("/signout",identification,authController.signout)
authRouter.post("/sendVerificationCode",identification,authController.sendVerificationCode)
authRouter.post("/verifyVerificationCode",identification,authController.verifyCode)

authRouter.patch("/changePassword",identification,authController.changePassword)
authRouter.post("/forgotPassword",identification,authController.forgotPassword)
authRouter.patch("/verifyForgotPassword",identification,authController.verifyForgotPasswordCode)

module.exports = authRouter;
