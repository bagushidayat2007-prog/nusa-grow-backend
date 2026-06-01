require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { Sequelize } = require('sequelize');

const app = express();

// Middleware
app.use(cors({ 
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true 
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, admin.html, dll)
app.use(express.static(path.join(__dirname)));

// Konfigurasi Database
// Fallback ke localhost jika variabel Railway belum terdeteksi
const sequelize = new Sequelize(
  process.env.DB_NAME || 'nusa_grow',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: { 
        require: false, // Matikan SSL strict untuk menghindari error di Railway
        rejectUnauthorized: false 
      }
    } : {},
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

// Route Health Check (Penting untuk Railway)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Nusa.Grow API is running 🚀',
    timestamp: new Date().toISOString()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ==========================================
// STRATEGI ANTI-CRASH: Jalankan Server DULU
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);

  // Setelah server jalan, baru coba connect database di background
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connected successfully');
      // Opsional: Sync database jika tabel belum ada
      // return sequelize.sync({ alter: false }); 
    })
    .then(() => {
      console.log('🗄️ Database synchronized (if needed)');
    })
    .catch(err => {
      console.error('❌ Database connection failed:', err.message);
      console.log('️ Server is running, but database is not connected.');
      console.log('💡 Tip: Cek Railway Variables apakah sudah di-Reference ke MySQL Service.');
    });
});

module.exports = { app, sequelize };