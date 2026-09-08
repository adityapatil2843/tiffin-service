const mongoose = require('mongoose');
const User = require('./src/models/User');
const MealLog = require('./src/models/MealLog');
const mealLogService = require('./src/services/mealLog.service');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const owner = await User.findOne({ role: 'owner' });
  const targetDate = new Date();
  targetDate.setUTCHours(0,0,0,0);
  
  const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

  const logs = await MealLog.find({ 
    serviceId: owner.serviceId,
    date: { $gte: targetDate, $lt: nextDate } 
  });
  console.log("Logs for targetDate (" + targetDate.toISOString() + "):", logs.length);
  if (logs.length > 0) {
    console.log(logs[0].mealType, logs[0].status);
  }
  process.exit(0);
}
run();
