const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const authValidation = require('../validations/auth.validation');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', validate(authValidation.login), authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
