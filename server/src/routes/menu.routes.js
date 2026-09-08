const express = require('express');
const menuController = require('../controllers/menu.controller');
const validate = require('../middlewares/validate.middleware');
const menuValidation = require('../validations/menu.validation');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);


// 1. Static specialized routes (must come before parameterized routes)
router.get('/today', menuController.getTodaysMenu);
router.get('/week', menuController.getWeeklyMenu);

// 2. Item management routes
router.get('/items', authorize('owner'), menuController.getMenuItems);
router.post('/items', authorize('owner'), upload.single('image'), validate(menuValidation.createMenuItem), menuController.createMenuItem);
router.put('/items/:itemId', authorize('owner'), upload.single('image'), validate(menuValidation.updateMenuItem), menuController.updateMenuItem);
router.delete('/items/:itemId', authorize('owner'), menuController.deleteMenuItem);

// 3. Generic Menu routes
router.post('/', authorize('owner'), validate(menuValidation.createMenu), menuController.createMenu);

// 4. Parameterized routes (must come last to avoid shadowing)
router.get('/:menuId', menuController.getMenuById);
router.put('/:menuId', authorize('owner'), validate(menuValidation.updateMenu), menuController.updateMenu);
router.put('/:menuId/publish', authorize('owner'), menuController.publishMenu);
router.post('/:menuId/clone', authorize('owner'), menuController.cloneMenu);
router.delete('/:menuId', authorize('owner'), menuController.deleteMenu);

module.exports = router;
