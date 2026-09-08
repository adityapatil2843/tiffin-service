const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');
const TiffinService = require('../models/TiffinService');
const mongoose = require('mongoose');

// @desc    Create a new owner and their tiffin service
// @route   POST /api/super-admin/owners
// @access  Private (SuperAdmin)
exports.createOwner = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, serviceName, servicePrefix, address, city } = req.body;

  // Check if owner email exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return next(new ApiError(400, 'Email is already taken'));
  }

  // Check if service prefix exists
  const existingPrefix = await TiffinService.findOne({ prefix: servicePrefix.toUpperCase() });
  if (existingPrefix) {
    return next(new ApiError(400, `Prefix ${servicePrefix} is already used by another service`));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create the Owner User
    const owner = await User.create(
      [
        {
          name,
          email,
          phone,
          password,
          role: 'owner',
          prefix: servicePrefix.toUpperCase(),
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    // 2. Create the Tiffin Service
    const service = await TiffinService.create(
      [
        {
          name: serviceName,
          prefix: servicePrefix.toUpperCase(),
          ownerId: owner[0]._id,
          address,
          city,
          phone,
        },
      ],
      { session }
    );

    // 3. Link service to owner
    owner[0].serviceId = service[0]._id;
    await owner[0].save({ session, validateBeforeSave: false });

    await session.commitTransaction();
    session.endSession();

    // Remove password from response
    owner[0].password = undefined;

    res.status(201).json(new ApiResponse(201, { owner: owner[0], service: service[0] }, 'Owner created successfully'));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new ApiError(500, error.message));
  }
});

// @desc    Get all owners
// @route   GET /api/super-admin/owners
// @access  Private (SuperAdmin)
exports.getOwners = asyncHandler(async (req, res, next) => {
  const owners = await User.find({ role: 'owner' }).populate('serviceId', 'name prefix isActive');
  res.status(200).json(new ApiResponse(200, { owners }, 'Owners retrieved successfully'));
});

// @desc    Update an owner
// @route   PUT /api/super-admin/owners/:ownerId
// @access  Private (SuperAdmin)
exports.updateOwner = asyncHandler(async (req, res, next) => {
  const { ownerId } = req.params;
  
  const owner = await User.findOneAndUpdate(
    { _id: ownerId, role: 'owner' },
    req.body,
    { returnDocument: 'after', runValidators: true }
  ).select('-password');

  if (!owner) {
    return next(new ApiError(404, 'Owner not found'));
  }

  res.status(200).json(new ApiResponse(200, { owner }, 'Owner updated successfully'));
});
