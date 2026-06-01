const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { sequelize, connectDB } = require('./config/database');
const { responseError } = require('./utils/response');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const villageRoutes = require('./routes/villageRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// =======================
// MIDDLEWARE
// =======================
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : true,
  credentials: true
}));

app.use(
  morgan(
    process.env.NODE_ENV === 'production'
      ? 'combined'
      : 'dev'
  )
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Static Files
app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'public/uploads')
  )
);

// =======================
// HEALTH CHECK
// =======================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// =======================
// API ROUTES
// =======================
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/villages`, villageRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);

// =======================
// 404 HANDLER
// =======================
app.use((req, res) => {
  responseError(
    res,
    404,
    `Route ${req.originalUrl} not found`
  );
});

// =======================
// GLOBAL ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);

  if (err.name === 'SequelizeValidationError') {
    return responseError(
      res,
      400,
      'Validation error',
      err.errors
    );
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return responseError(
      res,
      400,
      'Duplicate entry',
      {
        field: err.errors[0]?.path,
        message: 'Data already exists'
      }
    );
  }

  return responseError(
    res,
    500,
    'Internal server error',
    process.env.NODE_ENV === 'development'
      ? err.message
      : undefined
  );
});

// =======================
// START SERVER
// =======================
(async () => {
  try {
    console.log('🔄 Connecting database...');

    await connectDB();

    if (sequelize) {
      await sequelize.authenticate();
      console.log('✅ Database connected');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API Prefix: ${API_PREFIX}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    console.error('❌ Failed to start application');
    console.error(error);
    process.exit(1);
  }
})();

// =======================
// PROCESS ERROR HANDLER
// =======================
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received');
  process.exit(0);
});