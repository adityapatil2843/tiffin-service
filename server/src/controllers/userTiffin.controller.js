const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const tiffinSummaryService = require('../services/tiffinSummary.service');
const TiffinRequest = require('../models/TiffinRequest');
const MealLog = require('../models/MealLog');

// @desc    Get user's personal tiffin summary
// @route   GET /api/tiffin/summary
// @access  Private (User)
exports.getUserTiffinSummary = asyncHandler(async (req, res, next) => {
  const { from, to } = req.query;
  const user = req.user;

  // Default to current month if dates not provided
  let fromDate = from ? new Date(from) : new Date();
  let toDate = to ? new Date(to) : new Date();
  
  if (!from && !to) {
    fromDate.setDate(1); // First day of current month
    toDate.setMonth(toDate.getMonth() + 1, 0); // Last day of current month
  }

  const data = await tiffinSummaryService.getUserTiffinHistory(
    user._id,
    user.serviceId,
    fromDate,
    toDate
  );

  res.status(200).json(new ApiResponse(200, data, 'Your tiffin summary retrieved'));
});

// @desc    Get billing impact of user's meals in range
// @route   GET /api/tiffin/billing-impact
// @access  Private (User)
exports.getBillingImpact = asyncHandler(async (req, res, next) => {
  const { from, to } = req.query;
  const user = req.user;

  let fromDate = from ? new Date(from) : new Date();
  let toDate = to ? new Date(to) : new Date();
  
  if (!from && !to) {
    fromDate.setDate(1); 
    toDate.setMonth(toDate.getMonth() + 1, 0);
  }

  const data = await tiffinSummaryService.getUserTiffinHistory(
    user._id,
    user.serviceId,
    fromDate,
    toDate
  );

  const impact = {
    totalMeals: data.summary.totalMeals,
    baseCharges: data.summary.totalCharges,
    deductions: 0,
    outstanding: data.summary.totalCharges, // Simplified view for the user
  };

  res.status(200).json(new ApiResponse(200, { impact }, 'Billing impact retrieved'));
});

// @desc    Request an extra tiffin
// @route   POST /api/tiffin/extra
// @access  Private (User)
exports.requestExtraTiffin = asyncHandler(async (req, res, next) => {
  const { date, mealType, quantity = 1, notes } = req.body;
  const user = req.user;

  // Uses existing TiffinRequest mechanism, but designated as 'extra'
  const request = await TiffinRequest.create({
    userId: user._id,
    serviceId: user.serviceId,
    type: 'extra',
    date: new Date(date),
    mealType,
    quantity,
    reason: notes,
    status: 'pending',
  });

  res.status(201).json(new ApiResponse(201, { request }, 'Extra tiffin requested successfully'));
});

// @desc    Cancel tiffin for a specific day/meal
// @route   POST /api/tiffin/cancel-day
// @access  Private (User)
exports.cancelTiffinDay = asyncHandler(async (req, res, next) => {
  const { date, mealType, notes } = req.body;
  const user = req.user;
  const targetDate = new Date(date);

  // 1. Create a TiffinRequest for cancellation
  const request = await TiffinRequest.create({
    userId: user._id,
    serviceId: user.serviceId,
    type: 'cancellation',
    date: targetDate,
    mealType,
    reason: notes,
    status: 'pending', // Requires owner approval
  });

  // 2. We can also optionally flag the MealLog, but owner review of TiffinRequest is the standard flow here.
  
  res.status(201).json(new ApiResponse(201, { request }, 'Cancellation requested successfully. Awaiting owner approval.'));
});
