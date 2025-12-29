const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
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
    index: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  images: [{
    url: { type: String, required: true },
    caption: String,
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isApproved: {
    type: Boolean,
    default: true,
  },
  adminResponse: {
    comment: String,
    respondedBy: String,
    respondedAt: Date,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isApproved: 1 });

module.exports = mongoose.model('Review', reviewSchema);
