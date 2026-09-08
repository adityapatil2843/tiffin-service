const Joi = require('joi');

// ── Correction Request (User submits) ─────────────────────────────────────────
const submitCorrection = {
  params: Joi.object().keys({
    logId: Joi.string()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message('"logId" must be a valid MongoDB ObjectId');
        }
        return value;
      })
      .required(),
  }),
  body: Joi.object().keys({
    reason: Joi.string().min(5).max(500).required()
      .messages({ 'any.required': 'Please provide a reason for the correction request' }),
    requestedStatus: Joi.string()
      .valid('taken', 'cancelled', 'skipped')
      .required()
      .messages({ 'any.required': 'Please specify what the correct status should be' }),
  }),
};

// ── Review Correction (Owner approves/rejects) ────────────────────────────────
const reviewCorrection = {
  params: Joi.object().keys({
    logId: Joi.string()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message('"logId" must be a valid MongoDB ObjectId');
        }
        return value;
      })
      .required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('approved', 'rejected').required(),
    reviewNote: Joi.string().max(500).allow(''),
  }),
};

// ── Update Meal Log Status (Owner manually changes status) ────────────────────
const updateLogStatus = {
  params: Joi.object().keys({
    logId: Joi.string()
      .custom((value, helpers) => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          return helpers.message('"logId" must be a valid MongoDB ObjectId');
        }
        return value;
      })
      .required(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .valid('pending', 'taken', 'cancelled', 'skipped', 'paused')
      .required(),
    notes: Joi.string().max(300).allow(''),
  }),
};

module.exports = {
  submitCorrection,
  reviewCorrection,
  updateLogStatus,
};
