const Joi = require('joi');

// ── Shared sub-schemas ────────────────────────────────────────────────────────
const deliveryAddressSchema = (required = true) => {
  const base = {
    line1:   required ? Joi.string().trim().required().messages({ 'any.required': 'Address line 1 is required' }) : Joi.string().trim().allow(''),
    line2:   Joi.string().trim().allow(''),
    city:    required ? Joi.string().trim().required().messages({ 'any.required': 'City is required' }) : Joi.string().trim().allow(''),
    pincode: required ? Joi.string().trim().pattern(/^\d{6}$/).required()
                          .messages({ 'string.pattern.base': 'Pincode must be 6 digits', 'any.required': 'Pincode is required' })
                      : Joi.string().trim().pattern(/^\d{6}$/).allow(''),
  };
  return Joi.object(base);
};

const emergencyContactSchema = Joi.object({
  name:     Joi.string().trim().max(100).allow(''),
  phone:    Joi.string().trim().pattern(/^\d{10}$/).allow('').messages({
    'string.pattern.base': 'Emergency contact phone must be 10 digits',
  }),
  relation: Joi.string().trim().max(50).allow(''),
});

// ── Create User ───────────────────────────────────────────────────────────────
const createUser = {
  body: Joi.object().keys({
    // Basic Identity
    name:           Joi.string().trim().min(2).max(100).required()
                      .messages({ 'any.required': 'Full name is required' }),
    phone:          Joi.string().trim().pattern(/^\d{10}$/).required()
                      .messages({
                        'any.required': 'Phone number is required',
                        'string.pattern.base': 'Phone must be a valid 10-digit number',
                      }),
    alternatePhone: Joi.string().trim().pattern(/^\d{10}$/).allow('').messages({
                      'string.pattern.base': 'Alternate phone must be a valid 10-digit number',
                    }),
    email:          Joi.string().trim().email().allow(''),
    password:       Joi.string().min(6).required()
                      .messages({ 'any.required': 'Password is required (min 6 characters)' }),

    // Emergency Contact
    emergencyContact: emergencyContactSchema,

    // Diet & Plan
    dietType:       Joi.string().valid('veg', 'non-veg').default('veg'),
    planId:         Joi.string().valid('plan_1', 'plan_2').default('plan_1')
                      .messages({
                        'any.only': 'Invalid mess plan selected. Valid options: plan_1 (Basic) or plan_2 (Full Meal)',
                      }),
    subscriptionType: Joi.string().valid('monthly').default('monthly'),

    // Dates & Slot
    messStartDate:  Joi.date().default(() => new Date())
                      .messages({ 'date.base': 'Mess start date must be a valid date' }),
    messStartSlot:  Joi.string().valid('morning', 'night').default('morning'),

    // Accommodation
    roomNumber:     Joi.string().trim().max(20).allow(''),
    hostelName:     Joi.string().trim().max(100).allow(''),

    // Delivery Address
    deliveryAddress: deliveryAddressSchema(true).required()
                       .messages({ 'any.required': 'Delivery address is required' }),

    // Payment
    paymentMethod:  Joi.string().valid('cash', 'upi', 'bank_transfer', 'other').default('cash'),
    paymentStatus:  Joi.string().valid('paid', 'pending', 'due').default('pending'),

    // Misc
    notes:                  Joi.string().trim().max(500).allow(''),
    cancellationAccepted:   Joi.boolean().default(false),

    // Legacy (kept for backward compat)
    planType: Joi.string().valid('monthly', 'weekly', 'trial').default('monthly'),
  }),
};

// ── Update User ───────────────────────────────────────────────────────────────
const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message('"userId" must be a valid MongoDB ObjectId');
        }
        return value;
      })
      .required(),
  }),
  body: Joi.object().keys({
    // Basic Identity
    name:           Joi.string().trim().min(2).max(100),
    phone:          Joi.string().trim().pattern(/^\d{10}$/).messages({
                      'string.pattern.base': 'Phone must be 10 digits',
                    }),
    alternatePhone: Joi.string().trim().pattern(/^\d{10}$/).allow(''),
    email:          Joi.string().trim().email().allow(''),

    // Emergency Contact
    emergencyContact: emergencyContactSchema,

    // Status & Diet
    status:         Joi.string().valid('active', 'inactive', 'suspended'),
    dietType:       Joi.string().valid('veg', 'non-veg'),

    // Plan
    planId:         Joi.string().valid('plan_1', 'plan_2'),
    subscriptionType: Joi.string().valid('monthly'),
    subscriptionStatus: Joi.string().valid('active', 'paused', 'cancelled', 'expired'),

    // Dates & Slot
    messStartDate:  Joi.date(),
    messStartSlot:  Joi.string().valid('morning', 'night'),

    // Accommodation
    roomNumber:     Joi.string().trim().max(20).allow(''),
    hostelName:     Joi.string().trim().max(100).allow(''),

    // Delivery Address
    deliveryAddress: deliveryAddressSchema(false),

    // Payment
    paymentMethod:  Joi.string().valid('cash', 'upi', 'bank_transfer', 'other'),
    paymentStatus:  Joi.string().valid('paid', 'pending', 'due'),

    // Misc
    notes:                Joi.string().trim().max(500).allow(''),
    cancellationAccepted: Joi.boolean(),

    // Legacy
    planType: Joi.string().valid('monthly', 'weekly', 'trial'),
  }).min(1),
};

module.exports = {
  createUser,
  updateUser,
};
