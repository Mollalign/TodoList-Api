const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const user = await User.create({ email, password: hashedPassword });

    // Create JWT token with { user: { id: ... } }
    const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists and get password explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Generate JWT token with { user: { id: ... } }
    const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  console.log('Received password reset request for:', email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000;

    user.forgotPasswordCode = code;
    user.forgotPasswordCodeValidation = expiry;
    await user.save();

    console.log(`Generated code: ${code} (expires: ${new Date(expiry).toLocaleString()})`);

    await sendEmail(email, 'Your Password Reset Code', `Use this code to reset your password: ${code}`);
    console.log('Reset email sent to:', email);
    res.json({ msg: 'Reset code sent to email' });
  } catch (error) {
    console.error('Reset request error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const user = await User.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeValidation');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.forgotPasswordCode !== code)
      return res.status(400).json({ msg: 'Invalid reset code' });

    if (Date.now() > user.forgotPasswordCodeValidation)
      return res.status(400).json({ msg: 'Reset code expired' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.forgotPasswordCode = undefined;
    user.forgotPasswordCodeValidation = undefined;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
