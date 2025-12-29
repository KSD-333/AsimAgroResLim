const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { authenticateUser } = require('../middleware/auth');

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      productId: req.params.productId,
      isApproved: true 
    })
      .populate('userId', 'displayName')
      .sort('-createdAt');

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.dbUser._id,
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }

    const review = await Review.create({
      productId,
      userId: req.dbUser._id,
      firebaseUid: req.user.uid,
      userName: req.dbUser.displayName,
      rating,
      comment,
      images: images || [],
    });

    // Update product rating
    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      'rating.average': avgRating,
      'rating.count': reviews.length,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.userId.toString() !== req.dbUser._id.toString() && req.dbUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await review.deleteOne();

    // Update product rating
    const reviews = await Review.find({ productId: review.productId });
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    
    await Product.findByIdAndUpdate(review.productId, {
      'rating.average': avgRating,
      'rating.count': reviews.length,
    });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
