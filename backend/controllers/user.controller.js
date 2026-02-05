const user = require("../models/user.model.js");
const generateToken = require("../utils/generateToken.js");

const createUser = async (req, res) => {
    try {
        const { name, email, phone, age, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password" });
        }

        // Check if user already exists
        const userExists = await user.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Create new user
        const newUser = new user({
            name,
            email,
            phone,
            age,
            password
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            success: true,
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            phone: savedUser.phone,
            age: savedUser.age,
            token: generateToken(savedUser._id)
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error creating user", error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await user.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = await user.findById(id).select('-password');

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, age, isActive } = req.body;

        const userData = await user.findById(id);

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields
        if (name) userData.name = name;
        if (email) {
            const emailExists = await user.findOne({ email, _id: { $ne: id } });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
            userData.email = email;
        }
        if (phone) userData.phone = phone;
        if (age) userData.age = age;
        if (isActive !== undefined) userData.isActive = isActive;

        const updatedUser = await userData.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                age: updatedUser.age,
                isActive: updatedUser.isActive
            }
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error updating user", error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userData = await user.findByIdAndDelete(id);

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const userData = await user.findById(id);

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        userData.isActive = !userData.isActive;
        await userData.save();

        res.status(200).json({
            success: true,
            message: `User account ${userData.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                _id: userData._id,
                name: userData.name,
                isActive: userData.isActive
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error toggling user status", error: error.message });
    }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, toggleUserStatus };