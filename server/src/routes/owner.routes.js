const express = require('express');
const ownerController = require('../controllers/owner.controller');
const validate = require('../middlewares/validate.middleware');
const ownerValidation = require('../validations/owner.validation');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Tiffin request management
const tiffinController = require('../controllers/tiffin.controller');
const tiffinValidation = require('../validations/tiffin.validation');

// Meal log management (owner side)
const mealLogController = require('../controllers/mealLog.controller');
const mealLogValidation = require('../validations/mealLog.validation');

// Cancellation management
const cancellationController = require('../controllers/cancellation.controller');

const router = express.Router();

// All routes require authentication and owner role
router.use(protect, authorize('owner'));

// ── User Management ───────────────────────────────────────────────────────────
router
  .route('/users')
  .post(validate(ownerValidation.createUser), ownerController.createUser)
  .get(ownerController.getUsers);

router
  .route('/users/:userId')
  .get(ownerController.getUser)
  .put(validate(ownerValidation.updateUser), ownerController.updateUser);

// Subscription management
router.post('/users/:userId/pause',  ownerController.pauseSubscription);
router.post('/users/:userId/resume', ownerController.resumeSubscription);

// User meal logs (owner view)
router.get('/users/:userId/meal-logs', mealLogController.getUserMealLogs);

// ── Tiffin Request Management ─────────────────────────────────────────────────
router.get('/requests', tiffinController.getServiceRequests);
router.put(
  '/requests/:requestId',
  validate(tiffinValidation.reviewRequest),
  tiffinController.reviewRequest
);

// ── Daily Orders Management ───────────────────────────────────────────────────
const dailyOrderController = require('../controllers/dailyOrder.controller');
const dailyOrderValidation = require('../validations/dailyOrder.validation');

router.get('/orders', dailyOrderController.getDailyOrders);
router.put(
  '/orders/:logId/status',
  validate(dailyOrderValidation.updateStatus),
  dailyOrderController.updateOrderStatus
);
router.put(
  '/orders/bulk-status',
  validate(dailyOrderValidation.bulkUpdateStatus),
  dailyOrderController.bulkUpdateOrderStatus
);
router.get('/orders/summary', dailyOrderController.getDailySummary);
router.get('/orders/summary/range', dailyOrderController.getDateRangeSummary);

// ── Tiffin Summary ────────────────────────────────────────────────────────────
const summaryController = require('../controllers/tiffinSummary.controller');
const summaryValidation = require('../validations/tiffinSummary.validation');
router.get('/summary/date-wise', validate(summaryValidation.dateRange), summaryController.getDateWiseSummary);
router.get('/summary/user-wise', validate(summaryValidation.dateRange), summaryController.getUserWiseSummary);
router.get('/summary/meal-wise', validate(summaryValidation.dateRange), summaryController.getMealWiseSummary);
router.get('/summary/user/:userId', validate(summaryValidation.userHistory), summaryController.getUserTiffinHistory);
router.get('/summary/revenue', validate(summaryValidation.dateRange), summaryController.getRevenueReport);

// ── Meal Log Management ───────────────────────────────────────────────────────
router.get('/meal-logs',             mealLogController.getServiceMealLogs);
router.get('/meal-logs/corrections', mealLogController.getPendingCorrections);
router.put(
  '/meal-logs/:logId/review-correction',
  validate(mealLogValidation.reviewCorrection),
  mealLogController.reviewCorrectionRequest
);
router.put(
  '/meal-logs/:logId/status',
  validate(mealLogValidation.updateLogStatus),
  mealLogController.updateMealLogStatus
);

// ── Cancellation Management ───────────────────────────────────────────────────
router.get('/cancellations', cancellationController.getServiceCancellations);
router.put(
  '/cancellations/:cancellationId/review',
  cancellationController.reviewCancellationRequest
);

module.exports = router;
