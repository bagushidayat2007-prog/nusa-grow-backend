const jwt = require('jsonwebtoken');
const { Admin } = require('../config/models');
const { responseError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return responseError(res, 401, 'Unauthorized: Please login first');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin || !admin.is_active) {
      return responseError(res, 401, 'Unauthorized: Admin not found or inactive');
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return responseError(res, 401, 'Unauthorized: Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return responseError(res, 401, 'Unauthorized: Token expired');
    }
    return responseError(res, 500, 'Server error in auth middleware');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return responseError(res, 403, 'Forbidden: Insufficient permissions');
    }
    next();
  };
};

module.exports = { protect, authorize };