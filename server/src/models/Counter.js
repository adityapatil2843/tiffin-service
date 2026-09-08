const mongoose = require('mongoose');

// Auto-increment counter per service (used for user ID generation)
const counterSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TiffinService',
    required: true,
    unique: true,
  },
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
