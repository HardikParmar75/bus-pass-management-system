const express = require('express');
const router = express.Router();
const createAdmin = require('../controllers/admin.controller.js');
const loginAdmin = require('../controllers/adminAuth.controller.js');
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth.js');

// Public routes (no authentication required)
router.post('/register', createAdmin);
router.post('/login', loginAdmin);

// Protected routes (authentication required)
router.get('/profile', protect, (req, res) => {
  res.json({
    _id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
    role: req.admin.role,
    isActive: req.admin.isActive,
  });
});

// Example protected route - only accessible by authenticated admins
router.get('/dashboard', protect, adminOnly, (req, res) => {
  res.json({ message: 'Welcome to admin dashboard', admin: req.admin.name });
});

// Example superadmin only route
router.get('/superadmin', protect, superAdminOnly, (req, res) => {
  res.json({ message: 'Welcome to superadmin panel', admin: req.admin.name });
});

module.exports = router;
