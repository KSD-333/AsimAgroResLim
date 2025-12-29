const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
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
    enum: ['general', 'product', 'service', 'website', 'delivery', 'other'],
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  subject: {
    type: String,
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    enum: ['bug', 'suggestion', 'praise', 'complaint', 'question'],
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'in_progress', 'resolved', 'archived'],
    default: 'new',
    index: true,
  },
  adminNotes: [{
    note: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now },
  }],
  isPublic: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
