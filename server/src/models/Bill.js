const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
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

    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },

    // Delivery counts
    totalScheduledDays: { type: Number, default: 0 },
    deliveredDays: { type: Number, default: 0 },
    cancelledDays: { type: Number, default: 0 },
    missedDays: { type: Number, default: 0 },
    extraTiffins: { type: Number, default: 0 },

    // Financials
    baseAmount: { type: Number, default: 0 },    // before deductions/additions
    deductions: { type: Number, default: 0 },     // from cancellations
    additions: { type: Number, default: 0 },      // from extra tiffins
    totalAmount: { type: Number, default: 0 },    // final bill

    paidAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid'],
      default: 'pending',
    },

    // Generated PDF invoice URL (Cloudinary)
    invoiceUrl: { type: String },

    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// One bill per user per month per year per service
billSchema.index({ userId: 1, serviceId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Bill', billSchema);
