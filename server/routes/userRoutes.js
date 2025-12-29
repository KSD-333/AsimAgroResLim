const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    res.json({ success: true, data: req.dbUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { displayName, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.dbUser._id,
      { displayName, preferences },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/shipping-address
// @desc    Update shipping address
// @access  Private
router.put('/shipping-address', authenticateUser, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.dbUser._id,
      { shippingAddress: req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', authenticateUser, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', authenticateUser, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
