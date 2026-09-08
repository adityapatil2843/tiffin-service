const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
      required: true,
    },
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

    amount: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'other'],
      default: 'cash',
    },
    paymentDate: { type: Date, default: Date.now },
    reference: { type: String, trim: true }, // UPI txn ID, cheque no, etc.

    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // owner
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

paymentSchema.index({ billId: 1 });
paymentSchema.index({ userId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
