const mongoose = require('mongoose');

const contactFormSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['message', 'getStarted', 'catalog', 'dealer', 'complaint', 'support'],
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  firebaseUid: {
    type: String,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  // Dealer specific fields
  businessType: {
    type: String,
    enum: ['retailer', 'wholesaler', 'distributor', 'other'],
  },
  location: {
    type: String,
  },
  businessName: String,
  yearsInBusiness: String,
  existingBrands: String,
  monthlySales: String,
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending',
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  adminResponse: {
    comment: String,
    respondedBy: String,
    respondedAt: Date,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: [{
    note: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

// Indexes
contactFormSchema.index({ status: 1, createdAt: -1 });
contactFormSchema.index({ type: 1, status: 1 });
contactFormSchema.index({ email: 1 });

module.exports = mongoose.model('ContactForm', contactFormSchema);
