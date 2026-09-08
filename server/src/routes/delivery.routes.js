const express = require('express');
const deliveryController = require('../controllers/delivery.controller');
const validate = require('../middlewares/validate.middleware');
const deliveryValidation = require('../validations/delivery.validation');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

// Owner routes
router.get('/today', authorize('owner'), deliveryController.getTodaysDeliveries);
router.put('/:deliveryId/status', authorize('owner'), validate(deliveryValidation.updateStatus), deliveryController.updateDeliveryStatus);

// User routes
router.put('/:deliveryId/confirm', authorize('user'), validate(deliveryValidation.confirmDelivery), deliveryController.confirmDelivery);
router.get('/my', authorize('user'), deliveryController.getMyDeliveries);

module.exports = router;
