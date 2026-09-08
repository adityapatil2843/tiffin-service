const mongoose = require('mongoose');

const tiffinServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "Annapurna Tiffin Service"
    prefix: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 4,
    }, // "AP"

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Contact & Location ────────────────────────────────────────────────────
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    phone: { type: String, trim: true },
    logo: { type: String }, // Cloudinary URL

    // ── Service Settings ──────────────────────────────────────────────────────
    settings: {
      cancellationCutoffTime: { type: String, default: '10:00' }, // "HH:MM" 24hr
      extraTiffinDailyLimit: { type: Number, default: 2 },

      // Per meal pricing
      breakfastPrice: { type: Number, default: 0 },
      lunchPrice: { type: Number, default: 0 },
      dinnerPrice: { type: Number, default: 0 },

      mealTypes: {
        type: [String],
        enum: ['breakfast', 'lunch', 'dinner'],
        default: ['lunch', 'dinner'],
      },

      deliveryDays: {
        type: [String],
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TiffinService', tiffinServiceSchema);
