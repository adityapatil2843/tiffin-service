const express = require('express');
const mealLogController = require('../controllers/mealLog.controller');
const mealLogValidation = require('../validations/mealLog.validation');
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// ── Public (any authenticated user) ──────────────────────────────────────────
router.use(protect);

// Get all available mess plans
router.get('/plans', mealLogController.getMessPlans);

// ── User routes ───────────────────────────────────────────────────────────────
router.use(authorize('user', 'owner')); // Both roles can access /my

// User: get own meal logs
router.get('/my', mealLogController.getMyMealLogs);

//. new api integrated 

router.get('/meal-summary', mealLogController.getMealSummary);

// User: submit correction request
router.post(
  '/:logId/correction', 
  authorize('user'),
  validate(mealLogValidation.submitCorrection),
  mealLogController.submitCorrectionRequest
);

module.exports = router;
