const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    userId: {
      type: String,
      unique: true,
      sparse: true, // null for superAdmin / owner (they have readable IDs)
    },
    name:     { type: String, required: true, trim: true },
    email:    { type: String, lowercase: true, trim: true, sparse: true },
    phone:    { type: String, trim: true },
    password: { type: String, required: true, select: false },

    // ── Extended Contact ──────────────────────────────────────────────────────
    alternatePhone: { type: String, trim: true },
    emergencyContact: {
      name:     { type: String, trim: true },
      phone:    { type: String, trim: true },
      relation: { type: String, trim: true }, // e.g. "Father", "Brother"
    },

    // ── Role & Status ─────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ['superAdmin', 'owner', 'user'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },

    // ── Tiffin Service Linkage (owners & users) ────────────────────────────────
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'TiffinService' },

    // ── Owner-specific ────────────────────────────────────────────────────────
    prefix: { type: String, uppercase: true, trim: true }, // e.g., "AP"

    // ── User-specific — Diet & Plan ───────────────────────────────────────────
    dietType: {
      type: String,
      enum: ['veg', 'non-veg'],
      default: 'veg',
    },

    // Legacy planType (kept for backward compatibility)
    planType: {
      type: String,
      enum: ['monthly', 'weekly', 'trial'],
      default: 'monthly',
    },

    // New plan system — references messPlans.js config
    planId: {
      type: String,
      enum: ['plan_1', 'plan_2'],
    },
    planName: { type: String, trim: true },        // Snapshot: e.g. "Basic Plan"
    pricePerTiffin: { type: Number, default: 0 },  // Snapshot at subscription time

    // ── Subscription Dates & Slot ─────────────────────────────────────────────
    planStartDate: { type: Date },   // Legacy — kept for backward compat
    messStartDate: { type: Date },   // Explicit mess subscription start
    messStartSlot: {
      type: String,
      enum: ['morning', 'night'],    // morning = starts with lunch; night = starts with dinner
      default: 'morning',
    },
    planEndDate: { type: Date },

    subscriptionStatus: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'expired'],
      default: 'active',
    },
    subscriptionType: {
      type: String,
      enum: ['monthly'],
      default: 'monthly',
    },

    // ── Accommodation ─────────────────────────────────────────────────────────
    roomNumber:  { type: String, trim: true },
    hostelName:  { type: String, trim: true },

    // ── Delivery Address ──────────────────────────────────────────────────────
    deliveryAddress: {
      line1:   { type: String, trim: true },
      line2:   { type: String, trim: true },
      city:    { type: String, trim: true },
      pincode: { type: String, trim: true },
    },

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'other'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'due'],
      default: 'pending',
    },

    // ── Pause History ─────────────────────────────────────────────────────────
    pauseDates: [
      {
        from:   { type: Date, required: true },
        to:     { type: Date },           // null = currently paused
        reason: { type: String, trim: true },
      },
    ],

    // ── Misc ──────────────────────────────────────────────────────────────────
    notes:                { type: String, trim: true }, // Owner notes/instructions
    cancellationAccepted: { type: Boolean, default: false },

    // ── Profile ───────────────────────────────────────────────────────────────
    profileImage: { type: String }, // Cloudinary URL

    // ── Meta ──────────────────────────────────────────────────────────────────
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// ── Hooks ─────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ── Virtual: Is Currently Paused ─────────────────────────────────────────────
userSchema.virtual('isCurrentlyPaused').get(function () {
  if (!this.pauseDates?.length) return false;
  const now = new Date();
  return this.pauseDates.some(
    (p) => p.from <= now && (p.to == null || p.to >= now)
  );
});

module.exports = mongoose.model('User', userSchema);
