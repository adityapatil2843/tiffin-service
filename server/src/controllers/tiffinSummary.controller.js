const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const tiffinSummaryService = require('../services/tiffinSummary.service');

// @desc    Get date-wise summary
// @route   GET /api/owner/summary/date-wise
// @access  Private (Owner)
exports.getDateWiseSummary = asyncHandler(async (req, res, next) => {
  const { from, to } = req.query;
  const owner = req.user;

  const summary = await tiffinSummaryService.getDateWiseSummary(owner.serviceId, from, to);

  res.status(200).json(new ApiResponse(200, { summary }, 'Date-wise summary retrieved'));
});

// @desc    Get user-wise summary
// @route   GET /api/owner/summary/user-wise
// @access  Private (Owner)
exports.getUserWiseSummary = asyncHandler(async (req, res, next) => {
  const { from, to } = req.query;
  const owner = req.user;

  const summary = await tiffinSummaryService.getUserWiseSummary(owner.serviceId, from, to);

  res.status(200).json(new ApiResponse(200, { summary }, 'User-wise summary retrieved'));
});

// @desc    Get meal-wise summary
// @route   GET /api/owner/summary/meal-wise
// @access  Private (Owner)
exports.getMealWiseSummary = asyncHandler(async (req, res, next) => {
  const { from, to } = req.query;
  const owner = req.user;

  const summary = await tiffinSummaryService.getMealWiseSummary(owner.serviceId, from, to);

  res.status(200).json(new ApiResponse(200, { summary }, 'Meal-wise summary retrieved'));
});

// @desc    Get detailed user tiffin history
// @route   GET /api/owner/summary/user/:userId
// @access  Private (Owner)
exports.getUserTiffinHistory = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { from, to } = req.query;
  const owner = req.user;

  const data = await tiffinSummaryService.getUserTiffinHistory(userId, owner.serviceId, from, to);

  res.status(200).json(new ApiResponse(200, data, 'User tiffin history retrieved'));
});

// @desc    Get revenue report
// @route   GET /api/owner/summary/revenue
// @access  Private (Owner)
exports.getRevenueReport = asyncHandler(async (req, res, next) => {
  const { from, to } = req.query;
  const owner = req.user;

  const report = await tiffinSummaryService.getRevenueReport(owner.serviceId, from, to);

  res.status(200).json(new ApiResponse(200, { report }, 'Revenue report retrieved'));
});
