const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { sequelize, connectDB } = require('./config/database');
const { responseError } = require('./utils/response');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const villageRoutes = require('./routes/villageRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Connect to database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/villages`, villageRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);


// 404 handler
app.use('*', (req, res) => {
  responseError(res, 404, `Route ${req.originalUrl} not found`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return responseError(res, 400, 'Validation error', err.errors);
  }
  
  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    return responseError(res, 400, 'Duplicate entry', { 
      field: err.errors[0]?.path,
      message: 'Data already exists'
    });
  }
  
  responseError(res, 500, 'Internal server error', 
    process.env.NODE_ENV === 'development' ? err.message : undefined);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Graceful shutdown
  // server.close(() => process.exit(1));
});