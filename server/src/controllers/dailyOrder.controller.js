const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const dailyOrderService = require('../services/dailyOrder.service');

// @desc    Get daily orders (logs) for dashboard
// @route   GET /api/owner/orders
// @access  Private (Owner)
exports.getDailyOrders = asyncHandler(async (req, res, next) => {
  const { date, mealType } = req.query;
  const owner = req.user;

  // Default to today if no date provided
  const targetDate = date ? new Date(date) : new Date();

  const orders = await dailyOrderService.getDailyOrders(
    owner.serviceId,
    targetDate,
    mealType
  );

  res.status(200).json(
    new ApiResponse(200, { orders, total: orders.length }, 'Daily orders retrieved successfully')
  );
});

// @desc    Update a single order status
// @route   PUT /api/owner/orders/:logId/status
// @access  Private (Owner)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { logId } = req.params;
  const { status, notes } = req.body;
  const owner = req.user;

  const order = await dailyOrderService.updateOrderStatus(
    logId,
    owner.serviceId,
    status,
    owner._id,
    notes
  );

  res.status(200).json(new ApiResponse(200, { order }, 'Order status updated'));
});

// @desc    Bulk update order statuses
// @route   PUT /api/owner/orders/bulk-status
// @access  Private (Owner)
exports.bulkUpdateOrderStatus = asyncHandler(async (req, res, next) => {
  const { logIds, status } = req.body;
  const owner = req.user;

  const result = await dailyOrderService.bulkUpdateOrderStatus(
    logIds,
    owner.serviceId,
    status,
    owner._id
  );

  res.status(200).json(
    new ApiResponse(200, { modifiedCount: result.modifiedCount }, `Successfully updated ${result.modifiedCount} orders`)
  );
});

// @desc    Get daily operational summary
// @route   GET /api/owner/orders/summary
// @access  Private (Owner)
exports.getDailySummary = asyncHandler(async (req, res, next) => {
  const { date, mealType } = req.query;
  const targetDate = date ? new Date(date) : new Date();
  
  const summary = await dailyOrderService.getDailySummary(req.user.serviceId, targetDate, mealType);

  res.status(200).json(new ApiResponse(200, { summary }, 'Daily summary retrieved'));
});

// @desc    Get date range operational summary
// @route   GET /api/owner/orders/summary/range
// @access  Private (Owner)
exports.getDateRangeSummary = asyncHandler(async (req, res, next) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json(new ApiResponse(400, null, 'Both from and to dates are required'));
  }

  const summary = await dailyOrderService.getDateRangeSummary(req.user.serviceId, from, to);

  res.status(200).json(new ApiResponse(200, { summary }, 'Date range summary retrieved'));
});
