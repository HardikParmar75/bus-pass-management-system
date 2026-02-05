const admin = require("../models/admin.model.js");
const generateToken = require("../utils/generateToken.js");

const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    // Check if admin already exists
    const adminExists = await admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    // Create new admin
    const newAdmin = new admin({
      name,
      email,
      password,
      role: role || "admin",
    });

    const savedAdmin = await newAdmin.save();

    res.status(201).json({
      _id: savedAdmin._id,
      name: savedAdmin.name,
      email: savedAdmin.email,
      role: savedAdmin.role,
      token: generateToken(savedAdmin._id),
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error creating admin", error: error.message });
  }
};

module.exports = createAdmin;