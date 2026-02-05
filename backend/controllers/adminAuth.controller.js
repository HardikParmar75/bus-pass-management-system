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

module.exports = loginAdmin;
