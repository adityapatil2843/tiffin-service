const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const MealLog = require('../models/MealLog');
const User = require('../models/User');
const mealLogService = require('../services/mealLog.service');

// ─────────────────────────────────────────────────────────────────────────────
// USER — VIEW OWN MEAL LOGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get current user's meal history (paginated)
 * @route   GET /api/meal-logs/my?from=&to=&page=&limit=&mealType=
 * @access  Private (User)
 */
exports.getMyMealLogs = asyncHandler(async (req, res, next) => {
  const { from, to, page = 1, limit = 60, mealType } = req.query;

  const result = await mealLogService.getUserMealHistory(req.user._id, {
    from,
    to,
    page: Number(page),
    limit: Math.min(Number(limit), 100),
    mealType,
  });

  res.status(200).json(
    new ApiResponse(200, result, 'Meal history retrieved successfully')
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// USER — SUBMIT CORRECTION REQUEST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    User submits a correction request for a meal log entry
 * @route   POST /api/meal-logs/:logId/correction
 * @access  Private (User)
 */
exports.submitCorrectionRequest = asyncHandler(async (req, res, next) => {
  const { logId } = req.params;
  const { reason, requestedStatus } = req.body;
  const user = req.user;

  const log = await MealLog.findOne({ _id: logId, userId: user._id });
  if (!log) {
    return next(new ApiError(404, 'Meal log entry not found'));
  }

  // Cannot correct a paused or already correction-pending log
  if (log.status === 'paused') {
    return next(new ApiError(400, 'Cannot request correction for a paused meal'));
  }
  if (log.status === 'correction_requested') {
    return next(new ApiError(400, 'A correction request is already pending for this meal'));
  }

  // Cannot correct logs older than 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  if (log.date < sevenDaysAgo) {
    return next(new ApiError(400, 'Correction requests can only be submitted within 7 days'));
  }

  log.correctionRequest = {
    reason,
    requestedStatus,
    requestedAt: new Date(),
    status: 'pending',
  };
  log.status = 'correction_requested';
  await log.save();

  res.status(200).json(
    new ApiResponse(200, { log }, 'Correction request submitted successfully')
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OWNER — VIEW SERVICE MEAL LOGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Owner gets meal logs for their service (filterable by user/date)
 * @route   GET /api/owner/meal-logs?userId=&from=&to=&mealType=&status=&page=&limit=
 * @access  Private (Owner)
 */
exports.getServiceMealLogs = asyncHandler(async (req, res, next) => {
  const { userId, from, to, mealType, status, page = 1, limit = 60 } = req.query;
  const serviceId = req.user.serviceId;

  const filter = { serviceId };
  if (userId) filter.userId = userId;
  if (mealType) filter.mealType = mealType;
  if (status) filter.status = status;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = mealLogService.normalizeDate(from);
    if (to)   filter.date.$lte = mealLogService.normalizeDate(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    MealLog.find(filter)
      .populate('userId', 'name userId phone')
      .sort({ date: -1, mealType: 1 })
      .skip(skip)
      .limit(Math.min(Number(limit), 100)),
    MealLog.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      logs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    }, 'Service meal logs retrieved successfully')
  );
});

/**
 * @desc    Owner gets pending correction requests for their service
 * @route   GET /api/owner/meal-logs/corrections
 * @access  Private (Owner)
 */
exports.getPendingCorrections = asyncHandler(async (req, res, next) => {
  const logs = await MealLog.find({
    serviceId: req.user.serviceId,
    'correctionRequest.status': 'pending',
  })
    .populate('userId', 'name userId phone')
    .sort({ 'correctionRequest.requestedAt': 1 });

  res.status(200).json(
    new ApiResponse(200, { logs, count: logs.length }, 'Pending corrections retrieved')
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OWNER — REVIEW CORRECTION REQUEST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Owner approves or rejects a correction request
 * @route   PUT /api/owner/meal-logs/:logId/review-correction
 * @access  Private (Owner)
 */
exports.reviewCorrectionRequest = asyncHandler(async (req, res, next) => {
  const { logId } = req.params;
  const { status, reviewNote } = req.body; // 'approved' | 'rejected'
  const owner = req.user;

  const log = await MealLog.findOne({
    _id: logId,
    serviceId: owner.serviceId,
    status: 'correction_requested',
  });

  if (!log) {
    return next(new ApiError(404, 'Pending correction request not found'));
  }

  log.correctionRequest.status = status;
  log.correctionRequest.reviewedBy = owner._id;
  log.correctionRequest.reviewedAt = new Date();
  log.correctionRequest.reviewNote = reviewNote;
  log.updatedBy = owner._id;

  if (status === 'approved') {
    // Apply the requested status correction
    log.status = log.correctionRequest.requestedStatus;
  } else {
    // Rejected — revert to previous charged state
    log.status = 'pending';
  }

  await log.save();

  res.status(200).json(
    new ApiResponse(200, { log }, `Correction request ${status} successfully`)
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OWNER — MANUALLY UPDATE MEAL LOG STATUS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Owner manually updates a meal log entry status
 * @route   PUT /api/owner/meal-logs/:logId/status
 * @access  Private (Owner)
 */
exports.updateMealLogStatus = asyncHandler(async (req, res, next) => {
  const { logId } = req.params;
  const { status, notes } = req.body;
  const owner = req.user;

  const log = await MealLog.findOne({ _id: logId, serviceId: owner.serviceId });
  if (!log) {
    return next(new ApiError(404, 'Meal log entry not found'));
  }

  log.status = status;
  log.updatedBy = owner._id;
  if (notes) log.notes = notes;

  await log.save();

  res.status(200).json(
    new ApiResponse(200, { log }, `Meal log status updated to ${status}`)
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OWNER — GET MEAL LOGS FOR SPECIFIC USER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Owner views meal history for a specific user
 * @route   GET /api/owner/users/:userId/meal-logs?from=&to=&page=&limit=
 * @access  Private (Owner)
 */
exports.getUserMealLogs = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { from, to, page = 1, limit = 60 } = req.query;
  const serviceId = req.user.serviceId;

  // Verify user belongs to this service
  const user = await User.findOne({ _id: userId, serviceId, role: 'user' }).select('-password');
  if (!user) {
    return next(new ApiError(404, 'User not found in your service'));
  }

  const result = await mealLogService.getUserMealHistory(userId, {
    from,
    to,
    page: Number(page),
    limit: Math.min(Number(limit), 100),
  });

  res.status(200).json(
    new ApiResponse(200, { user, ...result }, 'User meal logs retrieved successfully')
  );
});

exports.getMealSummary = asyncHandler(async (req, res, next) => {
  const { userId, search, from, to, page = 1, limit = 20 } = req.query;
  const serviceId = req.user.serviceId;

  // 1. Validate userId if present
  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    return next(new ApiError(400, 'Invalid user ID format'));
  }

  // 2. Validate and normalize date parameters
  let fromDate = null;
  let toDate = null;

  if (from) {
    fromDate = new Date(from);
    if (isNaN(fromDate.getTime())) {
      return next(new ApiError(400, 'Invalid "from" date format'));
    }
  }

  if (to) {
    toDate = new Date(to);
    if (isNaN(toDate.getTime())) {
      return next(new ApiError(400, 'Invalid "to" date format'));
    }
  }

  if (fromDate && toDate && fromDate > toDate) {
    return next(new ApiError(400, '"from" date must be before or equal to "to" date'));
  }

  // 3. Normalize pagination parameters
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(Number(limit) || 20, 100));

  const result = await mealLogService.getMealSummary(serviceId, {
    userId,
    search: search ? String(search).trim() : undefined,
    from: fromDate,
    to: toDate,
    page: pageNum,
    limit: limitNum
  });

  res.status(200).json(
    new ApiResponse(200, result, 'Meal summary retrieved successfully')
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OWNER — GET PLANS CONFIG (for mobile plan selection)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get all available mess plans
 * @route   GET /api/meal-logs/plans
 * @access  Private (any authenticated user)
 */
exports.getMessPlans = asyncHandler(async (req, res) => {
  const { getAllPlans } = require('../config/messPlans');
  res.status(200).json(
    new ApiResponse(200, { plans: getAllPlans() }, 'Mess plans retrieved successfully')
  );
});
