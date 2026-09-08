const express = require('express');
const cancellationController = require('../controllers/cancellation.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();
router.use(protect);

// User: submit cancellation request
router.post('/request', authorize('user'), cancellationController.submitCancellationRequest);

// User: view own cancellation requests
router.get('/my', authorize('user'), cancellationController.getMyCancellations);

module.exports = router;
