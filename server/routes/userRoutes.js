const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
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
    
    const userRef = db.collection('users').doc(req.dbUser.id);
    await userRef.update({
      displayName,
      preferences,
      updatedAt: db.FieldValue.serverTimestamp()
    });

    const userDoc = await userRef.get();
    const user = { id: userDoc.id, ...userDoc.data() };

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
    const userRef = db.collection('users').doc(req.dbUser.id);
    await userRef.update({
      shippingAddress: req.body,
      updatedAt: db.FieldValue.serverTimestamp()
    });

    const userDoc = await userRef.get();
    const user = { id: userDoc.id, ...userDoc.data() };

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
    const usersSnapshot = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .get();
    
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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
    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await userRef.delete();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
