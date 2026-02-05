const admin = require("../models/admin.model.js");
const generateToken = require("../utils/generateToken.js");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find admin by email
    const adminUser = await admin.findOne({ email });

    if (!adminUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if admin is active
    if (!adminUser.isActive) {
      return res.status(401).json({ message: "Admin account is inactive" });
    }

    // Check password
    const isMatch = await adminUser.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Return admin info with token
    res.status(200).json({
      success: true,
      _id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      token: generateToken(adminUser._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.admin._id;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Please provide current and new password" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const adminUser = await admin.findById(adminId);

    if (!adminUser) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await adminUser.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    adminUser.password = newPassword;
    await adminUser.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { loginAdmin, changeAdminPassword };
