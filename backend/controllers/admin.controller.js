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

const getAllAdmins = async (req, res) => {
  try {
    const admins = await admin.find().select('-password');
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admins", error: error.message });
  }
};

const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = await admin.findById(id).select('-password');

    if (!adminUser) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      data: adminUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admin", error: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const adminUser = await admin.findById(id);

    if (!adminUser) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update fields
    if (name) adminUser.name = name;
    if (email) {
      const emailExists = await admin.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      adminUser.email = email;
    }
    if (role) adminUser.role = role;
    if (isActive !== undefined) adminUser.isActive = isActive;

    const updatedAdmin = await adminUser.save();

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: {
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error updating admin", error: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const adminUser = await admin.findByIdAndDelete(id);

    if (!adminUser) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting admin", error: error.message });
  }
};

const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const adminUser = await admin.findById(id);

    if (!adminUser) {
      return res.status(404).json({ message: "Admin not found" });
    }

    adminUser.isActive = !adminUser.isActive;
    await adminUser.save();

    res.status(200).json({
      success: true,
      message: `Admin account ${adminUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: adminUser._id,
        name: adminUser.name,
        isActive: adminUser.isActive
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error toggling admin status", error: error.message });
  }
};

module.exports = { createAdmin, getAllAdmins, getAdminById, updateAdmin, deleteAdmin, toggleAdminStatus };