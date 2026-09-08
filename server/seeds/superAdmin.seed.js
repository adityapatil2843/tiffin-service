const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Check if super admin already exists
    const adminExists = await User.findOne({ role: 'superAdmin', email: 'raghav@tfns.com' });

    if (adminExists) {
      console.log('⚠️ Super Admin already exists!');
      process.exit(0);
    }

    const superAdmin = await User.create({
      name: 'Raghav',
      email: 'raghav@tfns.com', // Added email for fallback login, though login asks for userId or email
      userId: 'admin', // Though superAdmins don't strictly need a userId, providing one for login flexibility
      password: '123456', // Will be hashed by pre-save hook
      role: 'superAdmin',
      status: 'active',
    });

    console.log(`🎉 Super Admin created successfully!`);
    console.log(`Email: ${superAdmin.email} or User ID: ${superAdmin.userId}`);
    console.log(`Password: 123456`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedSuperAdmin();
