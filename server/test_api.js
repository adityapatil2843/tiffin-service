const mongoose = require('mongoose');
const MealLog = require('./src/models/MealLog');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const logs = await MealLog.find().limit(5).lean();
  console.log("LOGS:", JSON.stringify(logs, null, 2));
  
  const summary = await MealLog.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  console.log("SUMMARY:", summary);
  process.exit(0);
}
test();
