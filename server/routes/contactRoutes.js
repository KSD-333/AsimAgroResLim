const express = require('express');
const router = express.Router();
const ContactForm = require('../models/ContactForm');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Private
router.post('/', authenticateUser, async (req, res) => {
  try {
    const contactForm = await ContactForm.create({
      ...req.body,
      userId: req.dbUser._id,
      firebaseUid: req.user.uid,
    });

    res.status(201).json({ success: true, data: contactForm });
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
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;

    const forms = await ContactForm.find(query)
      .populate('userId', 'displayName email')
      .sort('-createdAt');

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

    const form = await ContactForm.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    res.json({ success: true, data: form });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/contact/:id/respond
// @desc    Respond to contact form
// @access  Private/Admin
router.post('/:id/respond', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { response } = req.body;

    const form = await ContactForm.findByIdAndUpdate(
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

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    res.json({ success: true, data: form });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
