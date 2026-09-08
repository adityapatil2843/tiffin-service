const express = require('express');
const tiffinController = require('../controllers/tiffin.controller');
const validate = require('../middlewares/validate.middleware');
const tiffinValidation = require('../validations/tiffin.validation');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const userTiffinController = require('../controllers/userTiffin.controller');

const router = express.Router();

router.use(protect);

// User routes
router.post('/request', authorize('user'), validate(tiffinValidation.createRequest), tiffinController.createRequest);
router.get('/my', authorize('user'), tiffinController.getMyRequests);

// New User Tiffin Features
router.get('/summary', authorize('user'), userTiffinController.getUserTiffinSummary);
router.get('/billing-impact', authorize('user'), userTiffinController.getBillingImpact);
router.post('/extra', authorize('user'), userTiffinController.requestExtraTiffin);
router.post('/cancel-day', authorize('user'), userTiffinController.cancelTiffinDay);

module.exports = router;
