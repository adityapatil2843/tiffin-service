const mongoose = require('mongoose');

/**
 * SubscriptionCancellation — Tracks the full lifecycle of a user's
 * cancellation request from submission to owner review.
 *
 * Flow:
 *   1. User submits → status: 'pending'
 *   2. Owner approves → status: 'approved', billing stops from effectiveDate
 *   3. Owner rejects  → status: 'rejected', billing continues
 *
 * On approval: All MealLogs from effectiveDate onward are updated to 'cancelled'.
 * User's subscriptionStatus on User model is set to 'expired'.
 */
const subscriptionCancellationSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TiffinService',
      required: true,
      index: true,
    },

    // ── Request Details ───────────────────────────────────────────────────────
    requestedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedAt:   { type: Date, default: Date.now },
    reason:        { type: String, trim: true },

    // Desired date from which the user wants to stop (user-specified)
    requestedEffectiveDate: { type: Date, required: true },

    // ── Review ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt:  { type: Date },
    reviewNote:  { type: String, trim: true },

    // Final effective date (may differ from requested — owner sets this on approval)
    effectiveDate: { type: Date },

    // ── Billing Impact ────────────────────────────────────────────────────────
    isRefundApplicable: { type: Boolean, default: false },
    refundAmount:       { type: Number, default: 0 },
    refundNote:         { type: String, trim: true },

    // Track which meal logs were cancelled as a result
    cancelledLogCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for owner queue (pending requests for their service)
subscriptionCancellationSchema.index({ serviceId: 1, status: 1 });
// One pending cancellation per user at a time
subscriptionCancellationSchema.index(
  { userId: 1, status: 1 },
  {
    partialFilterExpression: { status: 'pending' },
    name: 'unique_pending_cancellation_per_user',
  }
);

module.exports = mongoose.model('SubscriptionCancellation', subscriptionCancellationSchema);
