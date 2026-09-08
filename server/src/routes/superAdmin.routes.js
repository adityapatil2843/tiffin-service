const express = require('express');
const superAdminController = require('../controllers/superAdmin.controller');
const validate = require('../middlewares/validate.middleware');
const superAdminValidation = require('../validations/superAdmin.validation');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// All routes require authentication and superAdmin role
router.use(protect, authorize('superAdmin'));

router
  .route('/owners')
  .post(validate(superAdminValidation.createOwner), superAdminController.createOwner)
  .get(superAdminController.getOwners);

router
  .route('/owners/:ownerId')
  .put(validate(superAdminValidation.updateOwner), superAdminController.updateOwner);

module.exports = router;
