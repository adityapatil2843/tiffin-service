const app = require('./app');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');

// Connect to database
connectDB();

const server = app.listen(env.port, () => {
  console.log(`🚀 Server running in ${env.env} mode on port ${env.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
