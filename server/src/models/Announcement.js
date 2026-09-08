const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TiffinService',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    
    type: {
      type: String,
      enum: ['info', 'holiday', 'price_change', 'menu_update', 'warning'],
      default: 'info',
    },

    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

announcementSchema.index({ serviceId: 1, isActive: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
