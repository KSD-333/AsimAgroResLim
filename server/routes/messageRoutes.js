const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// @route   GET /api/messages/user/me
// @desc    Get current user's messages
// @access  Private
router.get('/user/me', authenticateUser, async (req, res) => {
  try {
    const messagesSnapshot = await db.collection('orderMessages')
      .where('firebaseUid', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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
    
    let query = db.collection('orderMessages');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    if (type) {
      query = query.where('type', '==', type);
    }

    const messagesSnapshot = await query.orderBy('createdAt', 'desc').get();
    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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
    const messageData = {
      ...req.body,
      userId: req.dbUser.id,
      firebaseUid: req.user.uid,
      userName: req.dbUser.displayName,
      userEmail: req.user.email,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const messageRef = await db.collection('orderMessages').add(messageData);
    const messageDoc = await messageRef.get();
    const message = { id: messageDoc.id, ...messageDoc.data() };

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/messages/:id/status
// @desc    Update message status
// @access  Private/Admin
router.patch('/:id/status', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const messageRef = db.collection('orderMessages').doc(req.params.id);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await messageRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await messageRef.get();
    const message = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private/Admin
router.delete('/:id', authenticateUser, isAdmin, async (req, res) => {
  try {
    const messageRef = db.collection('orderMessages').doc(req.params.id);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await messageRef.delete();

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
