const mongoose = require('mongoose');

const orderMessageSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  firebaseUid: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['complaint', 'return', 'exchange', 'inquiry', 'feedback'],
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending',
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  adminResponse: {
    comment: String,
    respondedBy: String,
    respondedAt: Date,
    attachments: [String],
  },
  attachments: [{
    url: String,
    type: String,
    filename: String,
  }],
  resolution: {
    type: String,
    enum: ['refund', 'replacement', 'compensation', 'resolved', 'rejected'],
  },
  resolutionDetails: {
    amount: Number,
    trackingNumber: String,
    notes: String,
  },
}, {
  timestamps: true,
});

// Indexes
orderMessageSchema.index({ orderId: 1, createdAt: -1 });
orderMessageSchema.index({ userId: 1, status: 1 });
orderMessageSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('OrderMessage', orderMessageSchema);
