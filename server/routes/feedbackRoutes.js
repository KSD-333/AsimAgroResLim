const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', authenticateUser, async (req, res) => {
  try {
    const feedback = await Feedback.create({
      ...req.body,
      userId: req.dbUser._id,
      firebaseUid: req.user.uid,
      userName: req.dbUser.displayName,
      userEmail: req.user.email,
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback
// @access  Private/Admin
router.get('/', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;

    const feedback = await Feedback.find(query)
      .populate('userId', 'displayName email')
      .sort('-createdAt');

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/feedback/:id/status
// @desc    Update feedback status
// @access  Private/Admin
router.patch('/:id/status', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
