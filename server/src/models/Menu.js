const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
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

    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],

    // Lifecycle
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },

    // "Today's Special" highlight
    specialNote: { type: String, trim: true },
    isTodaysSpecial: { type: Boolean, default: false },
    bannerImage: { type: String }, // Optional banner for special menus
    bannerImagePublicId: { type: String },

    // Aggregated rating
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Compound unique index: one menu per service per date per mealType
menuSchema.index({ serviceId: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('Menu', menuSchema);
