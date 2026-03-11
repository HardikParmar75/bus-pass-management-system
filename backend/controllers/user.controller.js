const user = require("../models/user.model.js");
const generateToken = require("../utils/generateToken.js");

// Validation regex patterns
const NAME_REGEX = /^[a-zA-Z\s]{2,50}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const createUser = async (req, res) => {
    try {
        const { name, email, phone, dateOfBirth, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password" });
        }

        // Validate name (letters and spaces only, 2-50 chars)
        if (!NAME_REGEX.test(name)) {
            return res.status(400).json({ message: "Name must be 2-50 characters and contain only letters and spaces" });
        }

        // Validate email format
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        // Validate phone (Indian 10-digit starting with 6-9)
        if (phone && !PHONE_REGEX.test(phone)) {
            return res.status(400).json({ message: "Phone must be a valid 10-digit Indian mobile number" });
        }

        // Validate password strength
        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&#)" });
        }

        // Validate date of birth
        if (dateOfBirth) {
            if (!DOB_REGEX.test(dateOfBirth)) {
                return res.status(400).json({ message: "Date of birth must be in YYYY-MM-DD format" });
            }
            const dob = new Date(dateOfBirth);
            const now = new Date();
            const age = Math.floor((now - dob) / (365.25 * 24 * 60 * 60 * 1000));
            if (isNaN(dob.getTime()) || dob >= now) {
                return res.status(400).json({ message: "Please provide a valid date of birth" });
            }
            if (age < 5 || age > 120) {
                return res.status(400).json({ message: "Age must be between 5 and 120 years" });
            }
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
            dateOfBirth,
            password
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            success: true,
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            phone: savedUser.phone,
            dateOfBirth: savedUser.dateOfBirth,
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

        // Validate if id is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

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
        const { name, email, phone, dateOfBirth, isActive } = req.body;

        // Validate if id is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

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
        if (dateOfBirth) userData.dateOfBirth = dateOfBirth;
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
                dateOfBirth: updatedUser.dateOfBirth,
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

        // Validate if id is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

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

        // Validate if id is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

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