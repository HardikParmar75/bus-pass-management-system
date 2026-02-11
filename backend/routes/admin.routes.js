const express = require('express');
const router = express.Router();
const { createAdmin, getAllAdmins, getAdminById, updateAdmin, deleteAdmin, toggleAdminStatus } = require('../controllers/admin.controller.js');
const { loginAdmin, changeAdminPassword } = require('../controllers/adminAuth.controller.js');
const { getAllPasses, approvePass, rejectPass, verifyPass } = require('../controllers/busPass.controller.js');
const { protect, protectAdmin, adminOnly, superAdminOnly } = require('../middleware/auth.js');

// ==================== Authentication Routes ====================
// Public routes (no authentication required)
router.post('/register', createAdmin);
router.post('/login', loginAdmin);

// ==================== Admin Profile Routes ====================
// Get current admin profile
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

// Change password (protected)
router.put('/change-password', protect, changeAdminPassword);

// ==================== Bus Pass Management Routes ====================
// (MUST be before /:id to avoid wildcard conflict)
// Get all bus passes (with optional ?status=pending filter)
router.get('/bus-passes', protectAdmin, getAllPasses);

// Approve a pending bus pass
router.patch('/bus-passes/:id/approve', protectAdmin, approvePass);

// Reject a pending bus pass
router.patch('/bus-passes/:id/reject', protectAdmin, rejectPass);

// Verify a bus pass by QR token or 16-char code
router.post('/bus-passes/verify', protectAdmin, verifyPass);

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
