const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const billingService = require('../services/billing.service');

// @desc    Generate a monthly bill for a user
// @route   POST /api/bill/generate
// @access  Private (Owner)
exports.generateUserBill = asyncHandler(async (req, res, next) => {
  const { userId, month, year } = req.body;
  const owner = req.user;

  // Cast to integers so the Date object in the service doesn't behave unpredictably
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  const bill = await billingService.generateMonthlyBill(
    userId, 
    owner.serviceId, 
    monthNum, 
    yearNum, 
    owner._id
  );

  res.status(201).json(new ApiResponse(201, { bill }, 'Bill generated successfully'));
});

// @desc    Get all bills for a specific service (Owner view)
// @route   GET /api/bill/service
// @access  Private (Owner)
exports.getServiceBills = asyncHandler(async (req, res, next) => {
  const { month, year, from, to } = req.query;
  const filter = { serviceId: req.user.serviceId };
  
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);
  if (from && to) {
    const fDate = new Date(from);
    fDate.setUTCHours(0, 0, 0, 0);
    const tDate = new Date(to);
    tDate.setUTCHours(23, 59, 59, 999);
    filter.createdAt = { $gte: fDate, $lte: tDate };
  }

  const bills = await Bill.find(filter)
    .populate('userId', 'name userId phone')
    .sort({ year: -1, month: -1 });

  res.status(200).json(new ApiResponse(200, { bills }, 'Bills retrieved successfully'));
});

// @desc    Get current user's bills
// @route   GET /api/bill/my
// @access  Private (User)
exports.getMyBills = asyncHandler(async (req, res, next) => {
  const bills = await Bill.find({ userId: req.user._id })
    .sort({ year: -1, month: -1 });

  res.status(200).json(new ApiResponse(200, { bills }, 'Your bills retrieved successfully'));
});

// @desc    Record a payment against a bill
// @route   POST /api/bill/:billId/payment
// @access  Private (Owner)
exports.recordPayment = asyncHandler(async (req, res, next) => {
  const { billId } = req.params;
  const { amount, paymentMode, reference, notes } = req.body;
  const owner = req.user;

  const bill = await Bill.findOne({ _id: billId, serviceId: owner.serviceId });

  if (!bill) {
    return next(new ApiError(404, 'Bill not found'));
  }

  if (bill.status === 'paid') {
    return next(new ApiError(400, 'Bill is already fully paid'));
  }

  const payment = await Payment.create({
    billId,
    userId: bill.userId,
    serviceId: owner.serviceId,
    amount,
    paymentMode,
    reference,
    notes,
    recordedBy: owner._id,
  });

  // Update Bill Paid Amount & Status
  bill.paidAmount += amount;
  if (bill.paidAmount >= bill.totalAmount) {
    bill.status = 'paid';
  } else {
    bill.status = 'partially_paid';
  }

  await bill.save();

  res.status(201).json(new ApiResponse(201, { payment, bill }, 'Payment recorded successfully'));
});