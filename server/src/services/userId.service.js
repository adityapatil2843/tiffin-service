const Counter = require('../models/Counter');

const generateUserId = async (serviceId, prefix = 'USR') => {
  const safePrefix = String(prefix || 'USR').trim().toUpperCase();

  // Find the counter for this service, create if it doesn't exist
  const counter = await Counter.findOneAndUpdate(
    { serviceId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // Pad the sequence with zeros (e.g., 1 -> 0001, 15 -> 0015)
  const paddedSeq = String(counter.seq).padStart(4, '0');
  
  // Format: PREFIX + NUMBER (e.g. AP0001)
  return `${safePrefix}${paddedSeq}`;
};

module.exports = {
  generateUserId,
};
