const express = require('express');
const router = express.Router();
const OrderMessage = require('../models/OrderMessage');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// @route   GET /api/messages/user/me
// @desc    Get current user's messages
// @access  Private
router.get('/user/me', authenticateUser, async (req, res) => {
  try {
    const messages = await OrderMessage.find({ userId: req.dbUser._id })
      .populate('orderId', 'orderNumber')
      .sort('-createdAt');

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/messages
// @desc    Get all messages
// @access  Private/Admin
router.get('/', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;

    const messages = await OrderMessage.find(query)
      .populate('userId', 'displayName email')
      .populate('orderId', 'orderNumber')
      .sort('-createdAt');

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/messages
// @desc    Create new message
// @access  Private
router.post('/', authenticateUser, async (req, res) => {
  try {
    const message = await OrderMessage.create({
      ...req.body,
      userId: req.dbUser._id,
      firebaseUid: req.user.uid,
      userName: req.dbUser.displayName,
      userEmail: req.user.email,
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/messages/:id/respond
// @desc    Respond to message
// @access  Private/Admin
router.post('/:id/respond', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { response } = req.body;

    const message = await OrderMessage.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse: {
          comment: response,
          respondedBy: req.user.uid,
          respondedAt: new Date(),
        },
        status: 'resolved',
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
