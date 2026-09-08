const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Delivery = require('../models/Delivery');

// @desc    Get today's deliveries list
// @route   GET /api/delivery/today
// @access  Private (Owner)
exports.getTodaysDeliveries = asyncHandler(async (req, res, next) => {
  const serviceId = req.user.serviceId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deliveries = await Delivery.find({
    serviceId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  })
    .populate('userId', 'name userId phone deliveryAddress')
    .sort({ mealType: 1, 'userId.userId': 1 });

  res.status(200).json(new ApiResponse(200, { deliveries }, "Today's deliveries retrieved successfully"));
});

// @desc    Update delivery status (Owner/Boy)
// @route   PUT /api/delivery/:deliveryId/status
// @access  Private (Owner)
exports.updateDeliveryStatus = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;
  const owner = req.user;

  const delivery = await Delivery.findOne({ _id: req.params.deliveryId, serviceId: owner.serviceId });

  if (!delivery) {
    return next(new ApiError(404, 'Delivery record not found'));
  }

  // Prevent modifying completed states through this endpoint
  if (['confirmed', 'cancelled'].includes(delivery.status)) {
    return next(new ApiError(400, `Cannot update status of a ${delivery.status} delivery`));
  }

  delivery.status = status;
  if (notes) delivery.notes = notes;
  
  if (status === 'delivered') {
    delivery.markedDeliveredBy = owner._id;
    delivery.markedDeliveredAt = Date.now();
  }

  await delivery.save();

  res.status(200).json(new ApiResponse(200, { delivery }, `Delivery marked as ${status}`));
});

// @desc    User confirms tiffin received
// @route   PUT /api/delivery/:deliveryId/confirm
// @access  Private (User)
exports.confirmDelivery = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const delivery = await Delivery.findOne({ _id: req.params.deliveryId, userId: user._id });

  if (!delivery) {
    return next(new ApiError(404, 'Delivery record not found'));
  }

  if (delivery.status !== 'delivered' && delivery.status !== 'out_for_delivery') {
    return next(new ApiError(400, `Cannot confirm delivery in ${delivery.status} status`));
  }

  delivery.status = 'confirmed';
  delivery.confirmedByUser = true;
  delivery.confirmedAt = Date.now();

  await delivery.save();

  res.status(200).json(new ApiResponse(200, { delivery }, 'Delivery confirmed successfully'));
});

// @desc    Get user's delivery history
// @route   GET /api/delivery/my
// @access  Private (User)
exports.getMyDeliveries = asyncHandler(async (req, res, next) => {
  const deliveries = await Delivery.find({ userId: req.user._id })
    .sort({ date: -1 })
    .limit(30);

  res.status(200).json(new ApiResponse(200, { deliveries }, 'Delivery history retrieved successfully'));
});
