const express = require('express');
const router = express.Router();
const { createAdmin, getAllAdmins, getAdminById, updateAdmin, deleteAdmin, toggleAdminStatus } = require('../controllers/admin.controller.js');
const { loginAdmin, changeAdminPassword } = require('../controllers/adminAuth.controller.js');
const { getAllPasses, approvePass, rejectPass, verifyPass } = require('../controllers/busPass.controller.js');
const { protect, protectAdmin, adminOnly, superAdminOnly, anyAdminRole } = require('../middleware/auth.js');

// ==================== Authentication Routes ====================
// Public routes (no authentication required)
router.post('/register', createAdmin);
router.post('/login', loginAdmin);

// ==================== Admin Profile Routes ====================
// Get current admin profile (any admin role)
router.get('/profile', protect, (req, res) => {
  res.json({
    success: true,
    _id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
    role: req.admin.role,
    isActive: req.admin.isActive,
  });
});

// Change password (any admin role)
router.put('/change-password', protect, changeAdminPassword);

// ==================== Bus Pass Verification ====================
// Verify a bus pass - accessible by ALL admin roles (admin, superadmin, conductor)
router.post('/bus-passes/verify', protectAdmin, anyAdminRole, verifyPass);

// ==================== Bus Pass Management Routes ====================
// (MUST be before /:id to avoid wildcard conflict)
// These routes are restricted to admin and superadmin only (NOT conductor)
router.get('/bus-passes', protectAdmin, adminOnly, getAllPasses);
router.patch('/bus-passes/:id/approve', protectAdmin, adminOnly, approvePass);
router.patch('/bus-passes/:id/reject', protectAdmin, adminOnly, rejectPass);

// ==================== Admin Management Routes ====================
// Get all admins (superadmin only)
router.get('/', protect, superAdminOnly, getAllAdmins);

// Get single admin by ID (superadmin only)
router.get('/:id', protect, superAdminOnly, getAdminById);

// Update admin details (superadmin only)
router.put('/:id', protect, superAdminOnly, updateAdmin);

// Delete admin (superadmin only)
router.delete('/:id', protect, superAdminOnly, deleteAdmin);

// Toggle admin status - activate/deactivate (superadmin only)
router.patch('/:id/toggle-status', protect, superAdminOnly, toggleAdminStatus);

// ==================== Dashboard Routes ====================
// Example protected route - only accessible by authenticated admins
router.get('/dashboard/stats', protect, adminOnly, (req, res) => {
  res.json({ message: 'Welcome to admin dashboard', admin: req.admin.name });
});

// Example superadmin only route
router.get('/superadmin/panel', protect, superAdminOnly, (req, res) => {
  res.json({ message: 'Welcome to superadmin panel', admin: req.admin.name });
});

module.exports = router;
