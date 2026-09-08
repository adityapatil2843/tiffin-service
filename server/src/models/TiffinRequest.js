const mongoose = require('mongoose');

const tiffinRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TiffinService',
      required: true,
    },

    type: {
      type: String,
      enum: ['cancellation', 'extra'],
      required: true,
    },

    date: { type: Date, required: true }, // Target delivery date
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      required: true,
    },

    reason: { type: String, trim: true },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true }, // Owner's rejection reason

    // True if the request was blocked because cutoff time had passed
    cutoffEnforced: { type: Boolean, default: false },

    // For extra tiffins — may have a different delivery address
    deliveryAddress: { type: String, trim: true },

    // Link to created extra Delivery document (on approval)
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' },
  },
  { timestamps: true }
);

tiffinRequestSchema.index({ userId: 1, date: 1, mealType: 1, type: 1 });
tiffinRequestSchema.index({ serviceId: 1, status: 1 });

module.exports = mongoose.model('TiffinRequest', tiffinRequestSchema);
