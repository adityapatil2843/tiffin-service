const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const cloudinaryService = require('../services/cloudinary.service');

// @desc    Create a new menu item
// @route   POST /api/menu/items
// @access  Private (Owner)
exports.createMenuItem = asyncHandler(async (req, res, next) => {
  const owner = req.user;
  
  let imageUrl = null;
  let imagePublicId = null;

  if (req.file) {
    const folder = `tfns_uploads/menu/${owner.serviceId}`;
    const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, folder);
    imageUrl = uploadResult.secure_url;
    imagePublicId = uploadResult.public_id;
  }

  const menuItem = await MenuItem.create({
    ...req.body,
    serviceId: owner.serviceId,
    image: imageUrl,
    imagePublicId: imagePublicId
  });

  res.status(201).json(new ApiResponse(201, { menuItem }, 'Menu item created successfully'));
});

// @desc    Get all menu items for the service
// @route   GET /api/menu/items
// @access  Private (Owner)
exports.getMenuItems = asyncHandler(async (req, res, next) => {
  if (!req.user.serviceId) {
    return res.status(200).json(new ApiResponse(200, { items: [] }, 'No service associated with this account'));
  }
  const items = await MenuItem.find({ serviceId: req.user.serviceId });
  res.status(200).json(new ApiResponse(200, { items }, 'Menu items retrieved successfully'));
});

// @desc    Update a menu item
// @route   PUT /api/menu/items/:itemId
// @access  Private (Owner)
exports.updateMenuItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const owner = req.user;

  let menuItem = await MenuItem.findOne({ _id: itemId, serviceId: owner.serviceId });
  if (!menuItem) {
    return next(new ApiError(404, 'Menu item not found'));
  }

  const updates = { ...req.body };

  if (req.file) {
    const folder = `tfns_uploads/menu/${owner.serviceId}`;
    let uploadResult;
    
    if (menuItem.imagePublicId) {
      uploadResult = await cloudinaryService.replaceImage(menuItem.imagePublicId, req.file.buffer, folder);
    } else {
      uploadResult = await cloudinaryService.uploadImage(req.file.buffer, folder);
    }
    
    updates.image = uploadResult.secure_url;
    updates.imagePublicId = uploadResult.public_id;
  }

  menuItem = await MenuItem.findByIdAndUpdate(itemId, updates, { new: true, runValidators: true });

  res.status(200).json(new ApiResponse(200, { menuItem }, 'Menu item updated successfully'));
});

// @desc    Delete a menu item
// @route   DELETE /api/menu/items/:itemId
// @access  Private (Owner)
exports.deleteMenuItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const owner = req.user;

  const menuItem = await MenuItem.findOne({ _id: itemId, serviceId: owner.serviceId });
  if (!menuItem) {
    return next(new ApiError(404, 'Menu item not found'));
  }

  if (menuItem.imagePublicId) {
    await cloudinaryService.deleteImage(menuItem.imagePublicId);
  }

  await MenuItem.deleteOne({ _id: itemId });

  res.status(200).json(new ApiResponse(200, null, 'Menu item deleted successfully'));
});

// @desc    Create a daily menu
// @route   POST /api/menu
// @access  Private (Owner)
exports.createMenu = asyncHandler(async (req, res, next) => {
  const { date, mealType, items, specialNote, isTodaysSpecial } = req.body;
  const owner = req.user;

  // Check if menu already exists for this date and meal type
  const existingMenu = await Menu.findOne({
    serviceId: owner.serviceId,
    date: new Date(date),
    mealType,
  });

  if (existingMenu) {
    return next(new ApiError(400, `Menu for ${mealType} on this date already exists`));
  }

  const menu = await Menu.create({
    serviceId: owner.serviceId,
    date,
    mealType,
    items,
    specialNote,
    isTodaysSpecial,
    createdBy: owner._id,
  });

  const populatedMenu = await menu.populate('items');

  res.status(201).json(new ApiResponse(201, { menu: populatedMenu }, 'Menu created successfully'));
});

// @desc    Get a single menu by ID
// @route   GET /api/menu/:menuId
// @access  Private
exports.getMenuById = asyncHandler(async (req, res, next) => {
  const menu = await Menu.findOne({
    _id: req.params.menuId,
    serviceId: req.user.serviceId
  }).populate('items');

  if (!menu) {
    return next(new ApiError(404, 'Menu not found'));
  }

  res.status(200).json(new ApiResponse(200, { menu }, 'Menu retrieved successfully'));
});

// @desc    Update a menu (publish or change details)
// @route   PUT /api/menu/:menuId
// @access  Private (Owner)
exports.updateMenu = asyncHandler(async (req, res, next) => {
  const menu = await Menu.findOneAndUpdate(
    { _id: req.params.menuId, serviceId: req.user.serviceId },
    { ...req.body },
    { returnDocument: 'after', runValidators: true }
  ).populate('items');

  if (!menu) {
    return next(new ApiError(404, 'Menu not found'));
  }

  res.status(200).json(new ApiResponse(200, { menu }, 'Menu updated successfully'));
});

// @desc    Publish a menu
// @route   PUT /api/menu/:menuId/publish
// @access  Private (Owner)
exports.publishMenu = asyncHandler(async (req, res, next) => {
  const menu = await Menu.findOneAndUpdate(
    { _id: req.params.menuId, serviceId: req.user.serviceId },
    { status: 'published' },
    { returnDocument: 'after' }
  ).populate('items');

  if (!menu) {
    return next(new ApiError(404, 'Menu not found'));
  }

  res.status(200).json(new ApiResponse(200, { menu }, 'Menu published successfully'));
});

// @desc    Clone a menu to a different date
// @route   POST /api/menu/:menuId/clone
// @access  Private (Owner)
exports.cloneMenu = asyncHandler(async (req, res, next) => {
  const { date, mealType } = req.body;
  const originalMenu = await Menu.findOne({ _id: req.params.menuId, serviceId: req.user.serviceId });

  if (!originalMenu) {
    return next(new ApiError(404, 'Original menu not found'));
  }

  // Check if target menu already exists
  const targetDate = new Date(date);
  targetDate.setHours(0,0,0,0);

  const existing = await Menu.findOne({
    serviceId: req.user.serviceId,
    date: targetDate,
    mealType: mealType || originalMenu.mealType
  });

  if (existing) {
    return next(new ApiError(400, 'A menu already exists for the target date and meal type'));
  }

  const newMenu = await Menu.create({
    serviceId: req.user.serviceId,
    date: targetDate,
    mealType: mealType || originalMenu.mealType,
    items: originalMenu.items,
    specialNote: originalMenu.specialNote,
    isTodaysSpecial: false, // Reset special flag for cloned menu
    status: 'draft', // Always clone as draft
    createdBy: req.user._id
  });

  const populatedMenu = await newMenu.populate('items');
  res.status(201).json(new ApiResponse(201, { menu: populatedMenu }, 'Menu cloned successfully as draft'));
});

// @desc    Delete a menu
// @route   DELETE /api/menu/:menuId
// @access  Private (Owner)
exports.deleteMenu = asyncHandler(async (req, res, next) => {
  const menu = await Menu.findOne({
    _id: req.params.menuId,
    serviceId: req.user.serviceId
  });

  if (!menu) {
    return next(new ApiError(404, 'Menu not found'));
  }

  if (menu.bannerImagePublicId) {
    await cloudinaryService.deleteImage(menu.bannerImagePublicId);
  }

  await Menu.deleteOne({ _id: menu._id });

  res.status(200).json(new ApiResponse(200, null, 'Menu deleted successfully'));
});

// @desc    Get today's menu
// @route   GET /api/menu/today
// @access  Private (User & Owner)
exports.getTodaysMenu = asyncHandler(async (req, res, next) => {
  const serviceId = req.user.serviceId;
  if (!serviceId) {
    return res.status(200).json(new ApiResponse(200, { menus: [] }, 'No service associated'));
  }
  const isOwner = req.user.role === 'owner';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filter = {
    serviceId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  };

  // Only show published menus to users
  if (!isOwner) {
    filter.status = 'published';
  }

  const menus = await Menu.find(filter).populate('items');

  res.status(200).json(new ApiResponse(200, { menus }, "Today's menus retrieved successfully"));
});

// @desc    Get weekly menu (starting from today)
// @route   GET /api/menu/week
// @access  Private (User & Owner)
exports.getWeeklyMenu = asyncHandler(async (req, res, next) => {
  const serviceId = req.user.serviceId;
  if (!serviceId) {
    return res.status(200).json(new ApiResponse(200, { menus: [] }, 'No service associated'));
  }
  const isOwner = req.user.role === 'owner';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const filter = {
    serviceId,
    date: { $gte: today, $lt: nextWeek },
  };

  if (!isOwner) {
    filter.status = 'published';
  }

  const menus = await Menu.find(filter).populate('items').sort({ date: 1 });

  res.status(200).json(new ApiResponse(200, { menus }, "Weekly menu retrieved successfully"));
});
