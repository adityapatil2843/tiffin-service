const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');
const env = require('../config/env');

const signToken = (id) => {
  return jwt.sign({ id }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json(new ApiResponse(statusCode, { user, token }, message));
};

// @desc    Login user (all roles)
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { userId, email, password } = req.body;

  // Find user by userId OR email
  let user;
  if (userId) {
    user = await User.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } }).select('+password');
  } else if (email) {
    user = await User.findOne({ email }).select('+password');
  }

  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError(401, 'Incorrect credentials'));
  }

  if (user.status !== 'active') {
    return next(new ApiError(403, 'Your account has been deactivated or suspended'));
  }

  // Update last login
  user.lastLoginAt = Date.now();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, 'Login successful');
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json(new ApiResponse(200, { user }, 'User details retrieved'));
});
