const User = require('../models/User');
const TiffinService = require('../models/TiffinService');
const MealLog = require('../models/MealLog'); // Replaced Delivery with MealLog
const Bill = require('../models/Bill');
const ApiError = require('../utils/ApiError');

const generateMonthlyBill = async (userId, serviceId, month, year, generatedBy) => {
  // Ensure month and year are numbers to prevent Date parsing errors
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  const user = await User.findOne({ _id: userId, serviceId });
  if (!user) throw new ApiError(404, 'User not found in this service');

  const service = await TiffinService.findById(serviceId);
  if (!service) throw new ApiError(404, 'Service not found');
  
  // Calculate start and end date of the requested month
  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

  // Fetch all Meal Logs for this user in the given month
  const logs = await MealLog.find({
    userId,
    serviceId,
    date: { $gte: startDate, $lte: endDate }
  });

  if (logs.length === 0) {
    throw new ApiError(404, 'No meal logs found for this user in the specified month');
  }

  let totalScheduledDays = 0;
  let deliveredDays = 0;
  let cancelledDays = 0;
  let missedDays = 0;
  
  let baseAmount = 0;
  let deductions = 0;
  let totalAmount = 0;

  // Charged statuses based on your MealLog schema billing rules
  const chargedStatuses = ['pending', 'taken', 'accepted', 'delivered', 'correction_requested'];

  logs.forEach((log) => {
    totalScheduledDays++;
    
    // We can use the snapshot price directly from the log
    const price = log.pricePerTiffin || 0;
    baseAmount += price;

    if (chargedStatuses.includes(log.status)) {
      deliveredDays++;
      totalAmount += price; 
    } else {
      // If it's NOT a charged status (e.g., cancelled, skipped, paused, missed)
      deductions += price;

      if (log.status === 'cancelled') {
        cancelledDays++;
      } else if (['missed', 'skipped'].includes(log.status)) {
        missedDays++;
      }
    }
  });

  // Check for an existing bill to ensure we don't accidentally wipe out payment statuses
  const existingBill = await Bill.findOne({ userId, serviceId, month: monthNum, year: yearNum });
  const paidAmount = existingBill ? existingBill.paidAmount : 0;

  // Determine the correct status so regeneration doesn't overwrite a 'paid' bill to 'pending'
  let newStatus = 'pending';
  if (paidAmount > 0) {
    newStatus = paidAmount >= totalAmount ? 'paid' : 'partially_paid';
  }

  // Upsert the bill document
  const bill = await Bill.findOneAndUpdate(
    { userId, serviceId, month: monthNum, year: yearNum },
    {
      $set: {
        totalScheduledDays,
        deliveredDays,
        cancelledDays,
        missedDays,
        extraTiffins: 0, // Note: Removed from MealLog, setting default to avoid breaking Bill schema
        baseAmount,
        deductions,
        additions: 0, // Note: Removed from MealLog, setting default
        totalAmount,
        generatedBy,
        status: newStatus
      }
    },
    { new: true, upsert: true }
  );

  return bill;
};

module.exports = {
  generateMonthlyBill,
};