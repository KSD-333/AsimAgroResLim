const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authenticateUser } = require('../middleware/auth');

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviewsSnapshot = await db.collection('reviews')
      .where('productId', '==', req.params.productId)
      .where('isApproved', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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
    const existingReviewSnapshot = await db.collection('reviews')
      .where('productId', '==', productId)
      .where('firebaseUid', '==', req.user.uid)
      .limit(1)
      .get();

    if (!existingReviewSnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }

    const reviewData = {
      productId,
      userId: req.dbUser.id,
      firebaseUid: req.user.uid,
      userName: req.dbUser.displayName,
      rating,
      comment,
      images: images || [],
      isApproved: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const reviewRef = await db.collection('reviews').add(reviewData);
    const reviewDoc = await reviewRef.get();

    // Update product rating
    const allReviewsSnapshot = await db.collection('reviews')
      .where('productId', '==', productId)
      .get();
    
    const totalRating = allReviewsSnapshot.docs.reduce((sum, doc) => sum + doc.data().rating, 0);
    const avgRating = totalRating / allReviewsSnapshot.size;

    const productRef = db.collection('products').doc(productId);
    await productRef.update({
      'rating.average': avgRating,
      'rating.count': allReviewsSnapshot.size
    });

    const review = { id: reviewDoc.id, ...reviewDoc.data() };
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
    const reviewRef = db.collection('reviews').doc(req.params.id);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const reviewData = reviewDoc.data();

    if (reviewData.firebaseUid !== req.user.uid && req.dbUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await reviewRef.delete();

    // Update product rating
    const allReviewsSnapshot = await db.collection('reviews')
      .where('productId', '==', reviewData.productId)
      .get();
    
    const avgRating = allReviewsSnapshot.empty ? 0 : 
      allReviewsSnapshot.docs.reduce((sum, doc) => sum + doc.data().rating, 0) / allReviewsSnapshot.size;

    const productRef = db.collection('products').doc(reviewData.productId);
    await productRef.update({
      'rating.average': avgRating,
      'rating.count': allReviewsSnapshot.size
    });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
