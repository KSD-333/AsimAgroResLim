const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

// @route   GET /api/orders/user/me
// @desc    Get current user's orders
// @access  Private
router.get('/user/me', authenticateUser, async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders')
      .where('firebaseUid', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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
    
    let query = db.collection('orders');
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const allDocs = await query.orderBy('createdAt', 'desc').get();
    const total = allDocs.size;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedDocs = allDocs.docs.slice(offset, offset + parseInt(limit));

    const orders = paginatedDocs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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

    const orderData = {
      orderNumber: generateOrderNumber(),
      userId: req.dbUser.id,
      firebaseUid: req.user.uid,
      userEmail: req.user.email,
      items,
      shippingAddress,
      pricing,
      status: 'pending',
      paymentStatus: 'pending',
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      statusHistory: [{
        status: 'pending',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user.uid
      }],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const orderRef = await db.collection('orders').add(orderData);
    const orderDoc = await orderRef.get();
    const order = { id: orderDoc.id, ...orderDoc.data() };

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

    const orderRef = db.collection('orders').doc(req.params.id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderData = orderDoc.data();
    const statusHistory = orderData.statusHistory || [];
    
    statusHistory.push({
      status,
      note: adminNotes,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    });

    const updateData = {
      status,
      statusHistory,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await orderRef.update(updateData);
    const updatedDoc = await orderRef.get();
    const order = { id: updatedDoc.id, ...updatedDoc.data() };

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
    const orderRef = db.collection('orders').doc(req.params.id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderData = orderDoc.data();

    if (orderData.firebaseUid !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (orderData.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending orders can be cancelled' 
      });
    }

    await orderRef.update({
      status: 'cancelled',
      cancellation: {
        reason: req.body.reason,
        requestedBy: req.user.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await orderRef.get();
    const order = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
