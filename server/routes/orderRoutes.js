const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// @route   GET /api/orders/user/me
// @desc    Get current user's orders
// @access  Private
router.get('/user/me', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.dbUser._id })
      .populate('items.productId', 'name imageUrl')
      .sort('-createdAt');

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('userId', 'displayName email')
      .populate('items.productId', 'name imageUrl')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { items, shippingAddress, pricing } = req.body;

    const order = await Order.create({
      userId: req.dbUser._id,
      firebaseUid: req.user.uid,
      userEmail: req.user.email,
      items,
      shippingAddress,
      pricing,
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.patch('/:id/status', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;
    
    order.statusHistory.push({
      status,
      note: adminNotes,
      updatedBy: req.user.uid,
    });

    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.post('/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending orders can be cancelled' 
      });
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason: req.body.reason,
      requestedBy: req.user.uid,
      timestamp: new Date(),
    };

    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
