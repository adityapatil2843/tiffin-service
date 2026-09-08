const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');


const errorHandler = require('./src/middlewares/error.middleware');
const ApiError = require('./src/utils/ApiError');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Sanitize data (removed express-mongo-sanitize due to Express 5 incompatibility)
// app.use(mongoSanitize());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 45 * 60 * 1000, // 15 mins
  max: 500, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again in 15 minutes',
});
app.use('/api', limiter);

// Basic route
app.get('/', (req, res) => {
  res.send('TFNS API is running...');
});

const authRoutes = require('./src/routes/auth.routes');
const superAdminRoutes = require('./src/routes/superAdmin.routes');
const ownerRoutes = require('./src/routes/owner.routes');
const menuRoutes = require('./src/routes/menu.routes');
const tiffinRoutes = require('./src/routes/tiffin.routes');
const deliveryRoutes = require('./src/routes/delivery.routes');
const billRoutes = require('./src/routes/bill.routes');
const mealLogRoutes = require('./src/routes/mealLog.routes');
const cancellationRoutes = require('./src/routes/cancellation.routes');

// Routes will be mounted here
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tiffin', tiffinRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/bill', billRoutes);
app.use('/api/meal-logs', mealLogRoutes);
app.use('/api/cancellation', cancellationRoutes);

// Handle unknown routes
app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
