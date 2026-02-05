const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model.js');
const User = require('../models/user.model.js');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find admin first
    const admin = await Admin.findById(decoded.id).select('-password');
    if (admin && admin.isActive) {
      req.admin = admin;
      req.isAdmin = true;
      return next();
    }

    // Try to find user
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.isActive) {
      req.user = user;
      req.isAdmin = false;
      return next();
    }

    return res.status(401).json({ message: 'User/Admin not found or inactive' });
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
};

const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Admin account is inactive' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
};

const protectUser = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
};

const adminOnly = (req, res, next) => {
  if (req.admin && (req.admin.role === 'admin' || req.admin.role === 'superadmin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as superadmin' });
  }
};

module.exports = { protect, protectAdmin, protectUser, adminOnly, superAdminOnly };
