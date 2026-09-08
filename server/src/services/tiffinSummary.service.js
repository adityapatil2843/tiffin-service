const mongoose = require('mongoose');
const MealLog = require('../models/MealLog');
const User = require('../models/User');

const getBaseMatch = (serviceId, fromDate, toDate) => {
  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0);
  
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  return {
    serviceId: new mongoose.Types.ObjectId(serviceId),
    date: { $gte: from, $lte: to },
  };
};

/**
 * Get date-wise summary of tiffin operations
 */
const getDateWiseSummary = async (serviceId, fromDate, toDate) => {
  const match = getBaseMatch(serviceId, fromDate, toDate);

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalOrders: { $sum: 1 },
        lunchCount: {
          $sum: { $cond: [{ $eq: ['$mealType', 'lunch'] }, 1, 0] }
        },
        dinnerCount: {
          $sum: { $cond: [{ $eq: ['$mealType', 'dinner'] }, 1, 0] }
        },
        delivered: {
          $sum: { $cond: [{ $in: ['$status', ['taken', 'accepted', 'delivered']] }, 1, 0] }
        },
        cancelled: {
          $sum: { $cond: [{ $in: ['$status', ['cancelled', 'rejected', 'missed']] }, 1, 0] }
        },
        revenue: {
          $sum: {
            $cond: [
              { $in: ['$status', ['pending', 'taken', 'accepted', 'delivered', 'correction_requested']] },
              '$pricePerTiffin',
              0
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ];

  return await MealLog.aggregate(pipeline);
};

/**
 * Get user-wise summary of tiffin operations
 */
const getUserWiseSummary = async (serviceId, fromDate, toDate) => {
  const match = getBaseMatch(serviceId, fromDate, toDate);

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$userId',
        totalMeals: { $sum: 1 },
        delivered: {
          $sum: { $cond: [{ $in: ['$status', ['taken', 'accepted', 'delivered']] }, 1, 0] }
        },
        cancelled: {
          $sum: { $cond: [{ $in: ['$status', ['cancelled', 'rejected', 'missed']] }, 1, 0] }
        },
        chargeAmount: {
          $sum: {
            $cond: [
              { $in: ['$status', ['pending', 'taken', 'accepted', 'delivered', 'correction_requested']] },
              '$pricePerTiffin',
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        name: '$user.name',
        userSystemId: '$user.userId',
        phone: '$user.phone',
        totalMeals: 1,
        delivered: 1,
        cancelled: 1,
        chargeAmount: 1
      }
    },
    { $sort: { name: 1 } }
  ];

  return await MealLog.aggregate(pipeline);
};

/**
 * Get meal-wise (Lunch vs Dinner) summary
 */
const getMealWiseSummary = async (serviceId, fromDate, toDate) => {
  const match = getBaseMatch(serviceId, fromDate, toDate);

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$mealType',
        total: { $sum: 1 },
        delivered: {
          $sum: { $cond: [{ $in: ['$status', ['taken', 'accepted', 'delivered']] }, 1, 0] }
        },
        cancelled: {
          $sum: { $cond: [{ $in: ['$status', ['cancelled', 'rejected', 'missed']] }, 1, 0] }
        },
        revenue: {
          $sum: {
            $cond: [
              { $in: ['$status', ['pending', 'taken', 'accepted', 'delivered', 'correction_requested']] },
              '$pricePerTiffin',
              0
            ]
          }
        }
      }
    }
  ];

  const results = await MealLog.aggregate(pipeline);
  
  // Format as an object for easier frontend consumption
  const formatted = { lunch: {}, dinner: {} };
  results.forEach(res => {
    formatted[res._id] = res;
  });
  
  return formatted;
};

/**
 * Get detailed history for a specific user
 */
const getUserTiffinHistory = async (userId, serviceId, fromDate, toDate) => {
  const match = getBaseMatch(serviceId, fromDate, toDate);
  match.userId = new mongoose.Types.ObjectId(userId);

  const logs = await MealLog.find(match)
    .populate('menuId', 'name isTodaysSpecial')
    .sort({ date: 1, mealType: 1 });

  let totalCharges = 0;
  let delivered = 0;
  let cancelled = 0;

  logs.forEach(log => {
    if (['pending', 'taken', 'accepted', 'delivered', 'correction_requested'].includes(log.status)) {
      totalCharges += (log.pricePerTiffin || 0);
    }
    if (['taken', 'accepted', 'delivered'].includes(log.status)) delivered++;
    if (['cancelled', 'rejected', 'missed'].includes(log.status)) cancelled++;
  });

  return {
    logs,
    summary: {
      totalCharges,
      delivered,
      cancelled,
      totalMeals: logs.length
    }
  };
};

/**
 * Get overall revenue report
 */
const getRevenueReport = async (serviceId, fromDate, toDate) => {
  const dateWise = await getDateWiseSummary(serviceId, fromDate, toDate);
  const userWise = await getUserWiseSummary(serviceId, fromDate, toDate);
  
  const totalRevenue = dateWise.reduce((sum, day) => sum + day.revenue, 0);
  const totalDelivered = dateWise.reduce((sum, day) => sum + day.delivered, 0);
  
  // In a full implementation, you'd calculate "outstanding" by checking Bills & Payments
  // Here we just provide the base charges.
  
  return {
    totalRevenue,
    totalDelivered,
    dateWise,
    userWise
  };
};

module.exports = {
  getDateWiseSummary,
  getUserWiseSummary,
  getMealWiseSummary,
  getUserTiffinHistory,
  getRevenueReport
};
