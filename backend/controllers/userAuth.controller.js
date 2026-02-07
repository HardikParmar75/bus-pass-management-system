const user = require('../models/user.model');
const generateToken = require('../utils/generateToken.js');
const { sendPasswordResetEmail } = require('../utils/sendEmail');

// Store reset codes in memory (use Redis in production)
const resetCodes = new Map();

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

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    // Find user by email
    const userData = await user.findOne({ email });

    if (!userData) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Generate reset code (random 6 character alphanumeric)
    const resetCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Store reset code with email and expiration (15 minutes)
    resetCodes.set(resetCode, {
      email,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    // Attempt to send email with reset code using nodemailer helper
    try {
      await sendPasswordResetEmail(email, userData.name, resetCode);
    } catch (sendErr) {
      // If sending fails, log error and fall back to console output for development
      console.error('Error sending password reset email:', sendErr.message || sendErr);
      console.log(`Password reset code for ${email}: ${resetCode}`);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    // Validate input
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, reset code, and new password' });
    }

    // Find reset code
    const codeData = resetCodes.get(resetCode);

    if (!codeData) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Verify email matches
    if (codeData.email !== email) {
      return res.status(400).json({ message: 'Email does not match reset code' });
    }

    // Check if code is expired
    if (Date.now() > codeData.expiresAt) {
      resetCodes.delete(resetCode);
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    // Find user
    const userData = await user.findOne({ email });

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    userData.password = newPassword;
    await userData.save();

    // Delete used reset code
    resetCodes.delete(resetCode);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { loginUser, changeUserPassword, requestPasswordReset, resetPassword };