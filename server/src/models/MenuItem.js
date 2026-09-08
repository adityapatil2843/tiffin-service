const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TiffinService',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String }, // Cloudinary URL
    imagePublicId: { type: String }, // Cloudinary public_id for deletion
    images: [{
      url: { type: String },
      publicId: { type: String },
      isPrimary: { type: Boolean, default: false }
    }],
    category: {
      type: String,
      enum: ['vegetarian', 'non-vegetarian', 'vegan'],
      default: 'vegetarian',
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'all'],
      required: true,
      default: 'all'
    },
    tags: [{ type: String }], // e.g. 'Recommended', 'High Protein', 'Spicy'
    // Nutrition info (optional)
    nutrition: {
      calories: { type: Number },
      protein: { type: String },
      carbs: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
