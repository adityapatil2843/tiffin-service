const mongoose = require('mongoose');
const MealLog = require('../models/MealLog');
const mealLogService = require('./mealLog.service');

/**
 * Get daily orders (meal logs) for a specific date and meal type.
 * Automatically generates logs for active subscriptions if not already generated.
 */
const getDailyOrders = async (serviceId, date, mealType) => {
  // First, ensure logs are generated for today (auto-generates if missing)
  await mealLogService.generateDailyLogsForService(serviceId, date);

  // Fetch all logs for the given date & mealType
  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);
  const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

  const query = {
    serviceId,
    date: { $gte: targetDate, $lt: nextDate },
  };

  if (mealType) {
    query.mealType = mealType;
  }

  const logs = await MealLog.find(query)
    .populate('userId', 'name email phone userId')
    .sort({ status: 1 }); // Pending first, then alphabetical

  return logs;
};

/**
 * Update the status of a single meal log (Order).
 * Recalculates billing virtuals automatically because of schema setup.
 */
const updateOrderStatus = async (logId, serviceId, newStatus, updatedBy, notes = '') => {
  const log = await MealLog.findOne({ _id: logId, serviceId });
  if (!log) {
    throw new Error('Order not found or access denied');
  }

  log.status = newStatus;
  log.updatedBy = updatedBy;
  if (notes) {
    log.notes = notes;
  }

  await log.save();
  return log;
};

/**
 * Bulk update order statuses.
 */
const bulkUpdateOrderStatus = async (logIds, serviceId, newStatus, updatedBy) => {
  if (!logIds || logIds.length === 0) return { modifiedCount: 0 };

  const result = await MealLog.updateMany(
    { _id: { $in: logIds }, serviceId },
    {
      $set: {
        status: newStatus,
        updatedBy,
      },
    }
  );

  return result;
};

/**
 * Get summary of operations for a specific date.
 */
const getDailySummary = async (serviceId, date, mealType) => {
  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);
  const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

  const matchObj = {
    serviceId: new mongoose.Types.ObjectId(serviceId),
    date: { $gte: targetDate, $lt: nextDate },
  };

  if (mealType) {
    matchObj.mealType = mealType;
  }

  const pipeline = [
    {
      $match: matchObj,
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [
              { $in: ['$status', ['pending', 'taken', 'accepted', 'delivered', 'correction_requested']] },
              '$pricePerTiffin',
              0,
            ],
          },
        },
      },
    },
  ];

  const stats = await MealLog.aggregate(pipeline);

  const summary = {
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
    on_hold: 0,
    revenue: 0,
  };

  stats.forEach((stat) => {
    summary.total += stat.count;
    summary.revenue += stat.totalRevenue;
    
    if (stat._id === 'pending') summary.pending += stat.count;
    else if (stat._id === 'delivered' || stat._id === 'taken' || stat._id === 'accepted') summary.delivered += stat.count;
    else if (stat._id === 'cancelled' || stat._id === 'rejected' || stat._id === 'missed') summary.cancelled += stat.count;
    else if (stat._id === 'on_hold') summary.on_hold += stat.count;
  });

  return summary;
};

/**
 * Get an aggregated summary over a date range.
 */
const getDateRangeSummary = async (serviceId, fromDate, toDate) => {
  const from = new Date(fromDate);
  from.setUTCHours(0, 0, 0, 0);
  
  const to = new Date(toDate);
  to.setUTCHours(23, 59, 59, 999);

  const pipeline = [
    {
      $match: {
        serviceId: new mongoose.Types.ObjectId(serviceId),
        date: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalOrders: { $sum: 1 },
        delivered: {
          $sum: { $cond: [{ $in: ['$status', ['taken', 'accepted', 'delivered']] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $in: ['$status', ['cancelled', 'rejected', 'missed']] }, 1, 0] },
        },
        revenue: {
          $sum: {
            $cond: [
              { $in: ['$status', ['pending', 'taken', 'accepted', 'delivered', 'correction_requested']] },
              '$pricePerTiffin',
              0,
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ];

  return await MealLog.aggregate(pipeline);
};

module.exports = {
  getDailyOrders,
  updateOrderStatus,
  bulkUpdateOrderStatus,
  getDailySummary,
  getDateRangeSummary,
};
