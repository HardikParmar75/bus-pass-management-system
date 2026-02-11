const express = require("express");
const router = express.Router();
const { createUser, getAllUsers, getUserById, updateUser, deleteUser, toggleUserStatus } = require("../controllers/user.controller.js");
const { loginUser, changeUserPassword, requestPasswordReset, resetPassword } = require("../controllers/userAuth.controller.js");
const { protect, protectUser } = require("../middleware/auth.js");
const busPassRoutes = require("./busPass.routes.js");

// ==================== Authentication Routes ====================
// Public routes (no authentication required)
router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

// ==================== User Profile Routes ====================
// Get current user profile (protected)
router.get("/profile", protect, (req, res) => {
    res.json({
        success: true,
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        age: req.user.age,
        isActive: req.user.isActive,
    });
});

// Change password (protected)
router.put("/change-password", protect, changeUserPassword);

// Mount bus pass routes (MUST be before /:id to avoid wildcard conflict)
router.use("/bus-pass", busPassRoutes);

// ==================== User Management Routes ====================
// Get all users (protected - for admin dashboard)
router.get("/", protect, getAllUsers);

// Get single user by ID (protected)
router.get("/:id", protect, getUserById);

// Update user details (protected)
router.put("/:id", protect, updateUser);

// Delete user (protected)
router.delete("/:id", protect, deleteUser);

// Toggle user status - activate/deactivate (protected)
router.patch("/:id/toggle-status", protect, toggleUserStatus);


module.exports = router;