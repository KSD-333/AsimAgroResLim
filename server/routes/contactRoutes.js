const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Private
router.post('/', authenticateUser, async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      userId: req.dbUser.id,
      firebaseUid: req.user.uid,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const contactRef = await db.collection('contactForms').add(contactData);
    const contactDoc = await contactRef.get();
    const contact = { id: contactDoc.id, ...contactDoc.data() };

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/contact
// @desc    Get all contact forms
// @access  Private/Admin
router.get('/', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = db.collection('contactForms');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    if (type) {
      query = query.where('type', '==', type);
    }

    const formsSnapshot = await query.orderBy('createdAt', 'desc').get();
    const forms = formsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/contact/:id/status
// @desc    Update contact form status
// @access  Private/Admin
router.patch('/:id/status', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const formRef = db.collection('contactForms').doc(req.params.id);
    const formDoc = await formRef.get();

    if (!formDoc.exists) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    await formRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await formRef.get();
    const form = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, data: form });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact form
// @access  Private/Admin
router.delete('/:id', authenticateUser, isAdmin, async (req, res) => {
  try {
    const formRef = db.collection('contactForms').doc(req.params.id);
    const formDoc = await formRef.get();

    if (!formDoc.exists) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    await formRef.delete();

    res.json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
