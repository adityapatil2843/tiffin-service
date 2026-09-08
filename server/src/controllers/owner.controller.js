const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');
const { generateUserId } = require('../services/userId.service');
const { getPlan } = require('../config/messPlans');
const { generateLogsFromStartDate, pauseLogs } = require('../services/mealLog.service');

// ─────────────────────────────────────────────────────────────────────────────
// CREATE USER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Create a new mess user under this owner's service
 * @route   POST /api/owner/users
 * @access  Private (Owner)
 */
exports.createUser = asyncHandler(async (req, res, next) => {
  const owner = req.user;
  const {
    name, email, phone, password,
    alternatePhone, emergencyContact,
    dietType, planId, subscriptionType,
    messStartDate, messStartSlot,
    roomNumber, hostelName,
    deliveryAddress,
    paymentMethod, paymentStatus,
    notes, cancellationAccepted,
    // Legacy
    planType,
  } = req.body;

  if (!owner.serviceId) {
    return next(new ApiError(400, 'Current account is not associated with an active tiffin service'));
  }

  // ── Duplicate Phone & Email Checks ──────────────────────────────────────────
  const cleanPhone = phone ? phone.trim() : '';
  const existingUserWithPhone = await User.findOne({ phone: cleanPhone, serviceId: owner.serviceId });
  if (existingUserWithPhone) {
    return next(new ApiError(400, `A subscriber with phone "${cleanPhone}" already exists in your service (${existingUserWithPhone.name})`));
  }

  const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;
  if (cleanEmail) {
    const existingUserWithEmail = await User.findOne({ email: cleanEmail });
    if (existingUserWithEmail) {
      return next(new ApiError(400, `Email "${cleanEmail}" is already registered`));
    }
  }

  // Validate plan (default to plan_1 if not explicitly passed)
  const resolvedPlanId = planId || 'plan_1';
  const plan = getPlan(resolvedPlanId);
  if (!plan) {
    return next(new ApiError(400, `Invalid planId: ${resolvedPlanId}. Valid options: plan_1, plan_2`));
  }

  // Resolve prefix safely
  let prefix = owner.prefix;
  if (!prefix && owner.serviceId) {
    const TiffinService = require('../models/TiffinService');
    const service = await TiffinService.findById(owner.serviceId);
    if (service?.prefix) prefix = service.prefix;
  }
  prefix = (prefix || 'USR').toUpperCase();

  // Generate unique User ID (e.g. AP0001)
  const customUserId = await generateUserId(owner.serviceId, prefix);

  const resolvedStartDate = messStartDate ? new Date(messStartDate) : new Date();
  const resolvedStartSlot = messStartSlot || 'morning';

  const user = await User.create({
    userId: customUserId,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password,
    alternatePhone: alternatePhone ? alternatePhone.trim() : undefined,
    emergencyContact: emergencyContact || {},
    role: 'user',
    serviceId: owner.serviceId,
    dietType: dietType || 'veg',
    planId: resolvedPlanId,
    planName:       plan.name,
    pricePerTiffin: plan.pricePerTiffin,
    subscriptionType: subscriptionType || 'monthly',
    planType:       planType || 'monthly', // Legacy
    messStartDate:  resolvedStartDate,
    messStartSlot:  resolvedStartSlot,
    planStartDate:  resolvedStartDate, // Legacy
    roomNumber:     roomNumber ? roomNumber.trim() : undefined,
    hostelName:     hostelName ? hostelName.trim() : undefined,
    deliveryAddress,
    paymentMethod:  paymentMethod || 'cash',
    paymentStatus:  paymentStatus || 'pending',
    notes:          notes ? notes.trim() : undefined,
    cancellationAccepted: cancellationAccepted || false,
    subscriptionStatus: 'active',
    createdBy: owner._id,
  });

  // ── Auto-generate meal logs from start date ───────────────────────────────
  let logResult = { insertedCount: 0 };
  try {
    logResult = await generateLogsFromStartDate(user);
  } catch (err) {
    // Non-fatal: user is created; log generation failure is recoverable
    console.error(`[MealLog] Backfill failed for user ${user._id}: ${err.message}`);
  }

  res.status(201).json(
    new ApiResponse(201, {
      user,
      mealLogsGenerated: logResult.insertedCount,
    }, `Subscriber ${user.name} (${user.userId}) registered successfully with ${logResult.insertedCount} meal logs generated`)
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL USERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get all mess users for this owner's service
 * @route   GET /api/owner/users
 * @access  Private (Owner)
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const { status, subscriptionStatus, dietType, planId, search } = req.query;
  const owner = req.user;

  const filter = { role: 'user', serviceId: owner.serviceId };
  if (status) filter.status = status;
  if (subscriptionStatus) filter.subscriptionStatus = subscriptionStatus;
  if (dietType) filter.dietType = dietType;
  if (planId) filter.planId = planId;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { userId: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { users, count: users.length }, 'Users retrieved successfully')
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE USER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get a single user by ID
 * @route   GET /api/owner/users/:userId
 * @access  Private (Owner)
 */
exports.getUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const owner = req.user;

  const user = await User.findOne({
    _id: userId,
    role: 'user',
    serviceId: owner.serviceId,
  }).select('-password');

  if (!user) {
    return next(new ApiError(404, 'User not found or does not belong to your service'));
  }

  res.status(200).json(
    new ApiResponse(200, { user }, 'User retrieved successfully')
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE USER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Update a user's profile and subscription details
 * @route   PUT /api/owner/users/:userId
 * @access  Private (Owner)
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const owner = req.user;

  // If planId is changing, update plan snapshot fields
  if (req.body.planId) {
    const plan = getPlan(req.body.planId);
    if (!plan) {
      return next(new ApiError(400, `Invalid planId: ${req.body.planId}`));
    }
    req.body.planName = plan.name;
    req.body.pricePerTiffin = plan.pricePerTiffin;
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, role: 'user', serviceId: owner.serviceId },
    req.body,
    { returnDocument: 'after', runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ApiError(404, 'User not found or does not belong to your service'));
  }

  res.status(200).json(
    new ApiResponse(200, { user }, 'User updated successfully')
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PAUSE SUBSCRIPTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Pause a user's subscription for a date range
 * @route   POST /api/owner/users/:userId/pause
 * @access  Private (Owner)
 */
exports.pauseSubscription = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { fromDate, toDate, reason } = req.body || {};
  const owner = req.user;

  const user = await User.findOne({
    _id: userId,
    role: 'user',
    serviceId: owner.serviceId,
  });

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  if (user.subscriptionStatus !== 'active') {
    return next(new ApiError(400, `Cannot pause a ${user.subscriptionStatus} subscription`));
  }

  const from = fromDate ? new Date(fromDate) : new Date();
  const to = toDate ? new Date(toDate) : null;
  if (to && from > to) {
    return next(new ApiError(400, 'fromDate must be before toDate'));
  }

  // Add to pause history (to can be null for open-ended pause)
  user.pauseDates.push({ from, to, reason: reason || 'Paused by owner' });
  user.subscriptionStatus = 'paused';
  await user.save();

  // Mark meal logs in the date range as paused
  // If to is null, pause up to end of next month
  const pauseUntil = to || new Date(from.getFullYear(), from.getMonth() + 2, 0);
  const pausedCount = await pauseLogs(user._id, owner.serviceId, from, pauseUntil);

  const durationStr = to
    ? `from ${from.toLocaleDateString()} to ${to.toLocaleDateString()}`
    : `starting from ${from.toLocaleDateString()}`;

  res.status(200).json(
    new ApiResponse(200, {
      user,
      pausedLogsCount: pausedCount,
    }, `Subscription paused ${durationStr}`)
  );
});

/**
 * @desc    Resume a paused subscription
 * @route   POST /api/owner/users/:userId/resume
 * @access  Private (Owner)
 */
exports.resumeSubscription = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const owner = req.user;

  const user = await User.findOne({
    _id: userId,
    role: 'user',
    serviceId: owner.serviceId,
  });

  if (!user) return next(new ApiError(404, 'User not found'));
  if (user.subscriptionStatus !== 'paused') {
    return next(new ApiError(400, 'Subscription is not currently paused'));
  }

  // Close the most recent open pause period
  const openPause = user.pauseDates.find((p) => !p.to);
  if (openPause) {
    openPause.to = new Date();
  }

  user.subscriptionStatus = 'active';
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { user }, 'Subscription resumed successfully')
  );
});
