const express = require('express');
const billController = require('../controllers/bill.controller');
const validate = require('../middlewares/validate.middleware');
const billValidation = require('../validations/bill.validation');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

// User routes
router.get('/my', authorize('user'), billController.getMyBills);

// Owner routes
router.post('/generate', authorize('owner'), validate(billValidation.generateBill), billController.generateUserBill);
router.get('/service', authorize('owner'), billController.getServiceBills);
router.post('/:billId/payment', authorize('owner'), validate(billValidation.recordPayment), billController.recordPayment);

module.exports = router;
