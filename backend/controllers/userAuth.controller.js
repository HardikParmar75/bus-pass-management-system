const user = require('../models/user.model');
const generateToken = require('../utils/generateToken.js');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const existingUser = await user.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await existingUser.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!existingUser.isActive) {
      return res.status(401).json({ message: 'User account is inactive' });
    }

    // Return user info with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      phone: existingUser.phone,
      age: existingUser.age,
      token: generateToken(existingUser._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide current password, new password, and confirm password' });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    // Get user from authenticated request
    const userData = await user.findById(req.user._id);

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const passwordMatch = await userData.comparePassword(currentPassword);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Ensure new password is different from current
    if (newPassword === currentPassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    // Update password
    userData.password = newPassword;
    await userData.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error changing password', error: error.message });
  }
};

module.exports = { loginUser, changeUserPassword };