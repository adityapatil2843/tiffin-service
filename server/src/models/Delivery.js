const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
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
    date: { type: Date, required: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      required: true,
    },

    status: {
      type: String,
      enum: [
        'scheduled',      // default — delivery expected
        'out_for_delivery', // owner/delivery boy dispatched it
        'delivered',      // owner marked as delivered
        'confirmed',      // user confirmed receipt
        'cancelled',      // cancelled by user (request approved)
        'missed',         // not delivered (owner logged)
      ],
      default: 'scheduled',
    },

    markedDeliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    markedDeliveredAt: { type: Date },

    confirmedByUser: { type: Boolean, default: false },
    confirmedAt: { type: Date },

    // Snapshot of user's address at the time of delivery
    deliveryAddress: { type: String },

    // Extra tiffin flag
    isExtra: { type: Boolean, default: false },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Index for fast daily queries
deliverySchema.index({ serviceId: 1, date: 1, status: 1 });
deliverySchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);
