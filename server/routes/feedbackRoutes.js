const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', authenticateUser, async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      userId: req.dbUser.id,
      firebaseUid: req.user.uid,
      userName: req.dbUser.displayName,
      userEmail: req.user.email,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const feedbackRef = await db.collection('feedback').add(feedbackData);
    const feedbackDoc = await feedbackRef.get();
    const feedback = { id: feedbackDoc.id, ...feedbackDoc.data() };

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
    
    let query = db.collection('feedback');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    if (type) {
      query = query.where('type', '==', type);
    }

    const feedbackSnapshot = await query.orderBy('createdAt', 'desc').get();
    const feedback = feedbackSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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

    const feedbackRef = db.collection('feedback').doc(req.params.id);
    const feedbackDoc = await feedbackRef.get();

    if (!feedbackDoc.exists) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    await feedbackRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await feedbackRef.get();
    const feedback = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback
// @access  Private/Admin
router.delete('/:id', authenticateUser, isAdmin, async (req, res) => {
  try {
    const feedbackRef = db.collection('feedback').doc(req.params.id);
    const feedbackDoc = await feedbackRef.get();

    if (!feedbackDoc.exists) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    await feedbackRef.delete();

    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
