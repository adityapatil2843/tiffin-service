const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const SubscriptionCancellation = require('../models/SubscriptionCancellation');
const User = require('../models/User');
const mealLogService = require('../services/mealLog.service');

// ─────────────────────────────────────────────────────────────────────────────
// USER — SUBMIT CANCELLATION REQUEST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    User submits a subscription cancellation request
 * @route   POST /api/cancellation/request
 * @access  Private (User)
 */
exports.submitCancellationRequest = asyncHandler(async (req, res, next) => {
  const { reason, requestedEffectiveDate } = req.body;
  const user = req.user;

  if (user.subscriptionStatus !== 'active') {
    return next(new ApiError(400, `Subscription is already ${user.subscriptionStatus}`));
  }

  // Check if a pending cancellation already exists
  const existing = await SubscriptionCancellation.findOne({
    userId: user._id,
    status: 'pending',
  });
  if (existing) {
    return next(new ApiError(400, 'You already have a pending cancellation request'));
  }

  // Effective date must be today or future
  const effectiveDate = new Date(requestedEffectiveDate);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (effectiveDate < today) {
    return next(new ApiError(400, 'Effective date cannot be in the past'));
  }

  const cancellation = await SubscriptionCancellation.create({
    userId:                 user._id,
    serviceId:              user.serviceId,
    requestedBy:            user._id,
    reason,
    requestedEffectiveDate: effectiveDate,
  });

  res.status(201).json(
    new ApiResponse(201, { cancellation }, 'Cancellation request submitted successfully. Billing will continue until your request is approved.')
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// USER — VIEW OWN CANCELLATION REQUESTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get current user's cancellation requests
 * @route   GET /api/cancellation/my
 * @access  Private (User)
 */
exports.getMyCancellations = asyncHandler(async (req, res) => {
  const cancellations = await SubscriptionCancellation.find({ userId: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { cancellations }, 'Cancellation requests retrieved')
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OWNER — VIEW PENDING CANCELLATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Owner views all pending cancellation requests for their service
 * @route   GET /api/owner/cancellations
 * @access  Private (Owner)
 */
exports.getServiceCancellations = asyncHandler(async (req, res) => {
  const { status = 'pending' } = req.query;
  const cancellations = await SubscriptionCancellation.find({
    serviceId: req.user.serviceId,
    status,
  })
    .populate('userId', 'name userId phone messStartDate planId planName')
    .sort({ createdAt: 1 });

  res.status(200).json(
    new ApiResponse(200, { cancellations, count: cancellations.length }, 'Cancellation requests retrieved')
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OWNER — REVIEW CANCELLATION REQUEST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Owner approves or rejects a cancellation request
 * @route   PUT /api/owner/cancellations/:cancellationId/review
 * @access  Private (Owner)
 *
 * On approval:
 *   1. Cancellation effectiveDate is set (owner may adjust from requested date)
 *   2. All future MealLogs from effectiveDate onward → status = 'cancelled'
 *   3. User's subscriptionStatus → 'cancelled'
 */
exports.reviewCancellationRequest = asyncHandler(async (req, res, next) => {
  const { cancellationId } = req.params;
  const { status, reviewNote, effectiveDate, refundAmount, isRefundApplicable } = req.body;
  const owner = req.user;

  const cancellation = await SubscriptionCancellation.findOne({
    _id: cancellationId,
    serviceId: owner.serviceId,
    status: 'pending',
  });

  if (!cancellation) {
    return next(new ApiError(404, 'Pending cancellation request not found'));
  }

  cancellation.status = status;
  cancellation.reviewedBy = owner._id;
  cancellation.reviewedAt = new Date();
  cancellation.reviewNote = reviewNote;

  if (status === 'approved') {
    // Owner can override the effective date; falls back to requested date
    const resolvedEffectiveDate = effectiveDate
      ? new Date(effectiveDate)
      : cancellation.requestedEffectiveDate;

    cancellation.effectiveDate = resolvedEffectiveDate;
    cancellation.isRefundApplicable = isRefundApplicable || false;
    cancellation.refundAmount = refundAmount || 0;

    // Cancel all future meal logs from effectiveDate
    const cancelledCount = await mealLogService.cancelFutureLogs(
      cancellation.userId,
      owner.serviceId,
      resolvedEffectiveDate
    );
    cancellation.cancelledLogCount = cancelledCount;

    // Update user's subscriptionStatus
    await User.findByIdAndUpdate(cancellation.userId, {
      subscriptionStatus: 'cancelled',
    });
  }

  await cancellation.save();

  res.status(200).json(
    new ApiResponse(200, { cancellation }, `Cancellation request ${status} successfully`)
  );
});
