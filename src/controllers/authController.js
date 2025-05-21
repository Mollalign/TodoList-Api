const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {doHash,doHashValidation}=require("../utils/hashing");
const {hmac} = require("../utils/hashing");

module.exports.signup = async (req, res) => {
  // Check validation errors from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({
      success: false,
      message: errors.array()[0].msg, 
    });
  }

  const { email, password, userName } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Hash the password
    const hashedPassword = await doHash(password, 12);

    // Save the new user
    const newUser = new User({ email, userName, password: hashedPassword });
    const result = await newUser.save();
    result.password = undefined;

    return res.status(201).json({
      success: true,
      message: 'User created',
      data: result,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


module.exports.signin = async (req, res) => {
  // Check validation errors first
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  const { userNameOrEmail, password } = req.body;

  try {
    // Find user by email or username, include password explicitly
    const existingUser = await User.findOne({
      $or: [{ email: userNameOrEmail }, { userName: userNameOrEmail }],
    }).select('+password');

    if (!existingUser) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await doHashValidation(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        _id: existingUser._id,
        email: existingUser.email,
        userName: existingUser.userName,
      },
      process.env.SECRET_KEY,
      { expiresIn: '8h' }
    );

    // Set cookie with token
    res.cookie('Authorization', 'Bearer ' + token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: process.env.ENVIROMENT === 'production',
      secure: process.env.ENVIROMENT === 'production',
    });

    return res.status(200).json({ success: true, message: 'User logged in', data: token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.signout = (req, res) => {
  if (req.user) {
    res.clearCookie("Authorization");
    return res.status(200).json({
      success: true,
      message: "User logged out",
    });
  }
  return res.status(403).json({ success: false, message: "Unauthorized" });
};

module.exports.sendVerificationCode = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    let existingUser = await User.findOne({ email })
      .select("+password +verificationCode +verificationCodeValidation");

    if (!existingUser) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await doHashValidation(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (existingUser.verified) {
      return res.status(400).json({ success: false, message: "User is already verified" });
    }

    const codeExpired = existingUser.verificationCodeValidation &&
      Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000;

    if (!codeExpired && existingUser.verificationCode) {
      return res.status(200).json({ success: true, message: "Code already sent" });
    }

    // Generate and send new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const info = await transporter.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: email,
      subject: "Verification Code",
      html: `<h1>${code}</h1>`,
    });

    if (info.accepted.includes(email)) {
      existingUser.verificationCode = hmac(code, process.env.HMAC_VERIFICATION_CODE_SECRET);
      existingUser.verificationCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: "Code sent" });
    }

    return res.status(500).json({ success: false, message: "Failed to send code" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports.verifyCode = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, providedCode } = req.body;

  try {
    const existingUser = await User.findOne({ email }).select("+verificationCode +verificationCodeValidation");

    if (!existingUser) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (existingUser.verified) {
      return res.status(400).json({ success: false, message: "User is already verified" });
    }

    if (!existingUser.verificationCode) {
      return res.status(401).json({ success: false, message: "Code not sent" });
    }

    const isExpired = Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000;
    if (isExpired) {
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;
      await existingUser.save();
      return res.status(401).json({ success: false, message: "Code expired" });
    }

    const hmacValue = hmac(providedCode.toString(), process.env.HMAC_VERIFICATION_CODE_SECRET);

    if (hmacValue === existingUser.verificationCode) {
      existingUser.verified = true;
      existingUser.verificationCodeValidation = undefined;
      existingUser.verificationCode = undefined;
      await existingUser.save();
      return res.status(200).json({ success: true, message: "User has been verified successfully" });
    }

    return res.status(400).json({ success: false, message: "Invalid verification code" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports.changePassword = async (req, res) => {
  // Check validation errors from express-validator middleware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { emailOrUserName, oldPassword, newPassword } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email: emailOrUserName }, { userName: emailOrUserName }]
    }).select("+password");

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    if (!existingUser.verfied) {
      return res.status(401).json({ success: false, message: "You must be a verified user first" });
    }

    const isMatch = await doHashValidation(oldPassword, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    existingUser.password = await doHash(newPassword, 12);
    await existingUser.save();

    res.status(200).json({ success: true, message: "Your password has been reset successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { emailOrUserName } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email: emailOrUserName }, { userName: emailOrUserName }]
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

    const info = await transporter.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Verifying user identity",
      html: `<h1>${verifyCode}</h1>`
    });

    if (info.accepted[0] === existingUser.email) {
      existingUser.forgotPasswordCode = hmac(verifyCode.toString(), process.env.HMAC_VERIFICATION_CODE_SECRET);
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();
    }

    res.status(200).json({ success: true, message: "Verification code has been sent to you" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports.verifyForgotPasswordCode = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { emailOrUserName, providedCode, newPassword } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email: emailOrUserName }, { userName: emailOrUserName }]
    }).select("+forgotPasswordCode +forgotPasswordCodeValidation");

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    if (!existingUser.forgotPasswordCode) {
      return res.status(401).json({ success: false, message: "Code not sent" });
    }

    if (Date.now() - existingUser.forgotPasswordCodeValidation > 300000) {
      existingUser.forgotPasswordCode = undefined;
      existingUser.forgotPasswordCodeValidation = undefined;
      await existingUser.save();
      return res.status(401).json({ success: false, message: "Code expired" });
    }

    const hmacValue = hmac(providedCode.toString(), process.env.HMAC_VERIFICATION_CODE_SECRET);

    if (hmacValue === existingUser.forgotPasswordCode) {
      existingUser.password = await doHash(newPassword, 12);
      existingUser.forgotPasswordCode = undefined;
      existingUser.forgotPasswordCodeValidation = undefined;
      await existingUser.save();

      return res.status(200).json({ success: true, message: "Password has been changed successfully" });
    }

    return res.status(400).json({ success: false, message: "Invalid code" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


