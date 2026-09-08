const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const TiffinRequest = require('../models/TiffinRequest');
const TiffinService = require('../models/TiffinService');
const Delivery = require('../models/Delivery');

// @desc    Submit a new tiffin request (cancellation or extra)
// @route   POST /api/tiffin/request
// @access  Private (User)
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { type, date, mealType, reason, deliveryAddress } = req.body;
  const user = req.user;

  const targetDate = new Date(date);
  const today = new Date();
  
  // Check if date is in the past
  if (targetDate.setHours(0,0,0,0) < today.setHours(0,0,0,0)) {
    return next(new ApiError(400, 'Cannot make requests for past dates'));
  }

  // Fetch service settings to check cutoff time
  const service = await TiffinService.findById(user.serviceId);
  
  let cutoffEnforced = false;

  // Cutoff enforcement for same-day requests
  if (targetDate.getTime() === today.getTime()) {
    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    
    // Parse cutoff time (e.g., "10:00")
    const [cutoffHours, cutoffMinutes] = service.settings.cancellationCutoffTime.split(':').map(Number);

    if (currentHours > cutoffHours || (currentHours === cutoffHours && currentMinutes >= cutoffMinutes)) {
      if (type === 'cancellation') {
         return next(new ApiError(400, `Cancellation cutoff time (${service.settings.cancellationCutoffTime}) has passed for today`));
      } else {
         // It's an extra request, we'll mark it as cutoff enforced, Owner can still approve/reject
         cutoffEnforced = true;
      }
    }
  }

  // Prevent duplicate requests
  const existingRequest = await TiffinRequest.findOne({
    userId: user._id,
    date: targetDate,
    mealType,
    type,
    status: { $in: ['pending', 'approved'] }
  });

  if (existingRequest) {
    return next(new ApiError(400, `You already have an active ${type} request for this meal`));
  }

  const tiffinRequest = await TiffinRequest.create({
    userId: user._id,
    serviceId: user.serviceId,
    type,
    date: targetDate,
    mealType,
    reason,
    deliveryAddress: type === 'extra' ? deliveryAddress : undefined,
    cutoffEnforced
  });

  res.status(201).json(new ApiResponse(201, { tiffinRequest }, `${type} request submitted successfully`));
});

// @desc    Get user's own requests
// @route   GET /api/tiffin/my
// @access  Private (User)
exports.getMyRequests = asyncHandler(async (req, res, next) => {
  const requests = await TiffinRequest.find({ userId: req.user._id })
    .sort({ date: -1, createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { requests }, 'Requests retrieved successfully'));
});

// @desc    Get all pending requests for a service
// @route   GET /api/owner/requests
// @access  Private (Owner)
exports.getServiceRequests = asyncHandler(async (req, res, next) => {
  const requests = await TiffinRequest.find({ serviceId: req.user.serviceId, status: 'pending' })
    .populate('userId', 'name userId phone deliveryAddress')
    .sort({ date: 1, createdAt: 1 });

  res.status(200).json(new ApiResponse(200, { requests }, 'Pending requests retrieved successfully'));
});

// @desc    Review (Approve/Reject) a request
// @route   PUT /api/owner/requests/:requestId
// @access  Private (Owner)
exports.reviewRequest = asyncHandler(async (req, res, next) => {
  const { status, reviewNote } = req.body;
  const owner = req.user;

  const tiffinRequest = await TiffinRequest.findOne({ 
    _id: req.params.requestId, 
    serviceId: owner.serviceId,
    status: 'pending' 
  });

  if (!tiffinRequest) {
    return next(new ApiError(404, 'Pending request not found'));
  }

  tiffinRequest.status = status;
  tiffinRequest.reviewedBy = owner._id;
  tiffinRequest.reviewedAt = Date.now();
  tiffinRequest.reviewNote = reviewNote;

  // If approved, update/create delivery record
  if (status === 'approved') {
    if (tiffinRequest.type === 'cancellation') {
      // Find delivery and mark cancelled
      await Delivery.findOneAndUpdate(
        { userId: tiffinRequest.userId, date: tiffinRequest.date, mealType: tiffinRequest.mealType, isExtra: false },
        { status: 'cancelled' },
        { upsert: true, returnDocument: 'after' } 
      );
    } else if (tiffinRequest.type === 'extra') {
      // Create a new delivery record for the extra tiffin
      const newDelivery = await Delivery.create({
        userId: tiffinRequest.userId,
        serviceId: owner.serviceId,
        date: tiffinRequest.date,
        mealType: tiffinRequest.mealType,
        status: 'scheduled',
        isExtra: true,
        deliveryAddress: tiffinRequest.deliveryAddress || undefined,
      });
      tiffinRequest.deliveryId = newDelivery._id;
    }
  }

  await tiffinRequest.save();

  res.status(200).json(new ApiResponse(200, { tiffinRequest }, `Request ${status} successfully`));
});
