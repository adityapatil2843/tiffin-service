const mongoose = require('mongoose');
const User = require('./src/models/User');
const dailyOrderService = require('./src/services/dailyOrder.service');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const owner = await User.findOne({ role: 'owner' });
  const date = new Date('2026-06-04T00:00:00.000Z');
  
  console.log("Fetching orders for", date);
  const orders = await dailyOrderService.getDailyOrders(owner.serviceId, date, 'lunch');
  console.log("Orders found:", orders.length);
  if (orders.length === 0) {
     const dbLogs = await mongoose.model('MealLog').find({ serviceId: owner.serviceId, mealType: 'lunch' });
     console.log("Total lunch logs in DB:", dbLogs.length, "Dates:", dbLogs.map(l => l.date));
  }
  
  const summary = await dailyOrderService.getDailySummary(owner.serviceId, date, 'lunch');
  console.log("Summary found:", summary);
  
  process.exit(0);
}
run();
