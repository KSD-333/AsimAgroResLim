const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authenticateUser } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authenticateUser, async (req, res) => {
  try {
    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartDoc = await cartRef.get();

    let cart;
    if (!cartDoc.exists) {
      cart = {
        userId: req.dbUser.id,
        firebaseUid: req.user.uid,
        items: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await cartRef.set(cart);
      cart = { id: req.user.uid, ...cart };
    } else {
      cart = { id: cartDoc.id, ...cartDoc.data() };
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Private
router.post('/items', authenticateUser, async (req, res) => {
  try {
    const { productId, name, quantity, size, price, image, nutrients } = req.body;

    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartDoc = await cartRef.get();

    let items = [];
    if (cartDoc.exists) {
      items = cartDoc.data().items || [];
    }

    const existingItemIndex = items.findIndex(
      item => item.productId === productId && item.size === size
    );

    if (existingItemIndex > -1) {
      items[existingItemIndex].quantity += quantity;
    } else {
      items.push({ productId, name, quantity, size, price, image, nutrients });
    }

    await cartRef.set({
      userId: req.dbUser.id,
      firebaseUid: req.user.uid,
      items,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    const updatedDoc = await cartRef.get();
    const cart = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/cart/items/:productId
// @desc    Update cart item quantity
// @access  Private
router.put('/items/:productId', authenticateUser, async (req, res) => {
  try {
    const { quantity, size } = req.body;

    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const items = cartDoc.data().items || [];
    const itemIndex = items.findIndex(
      item => item.productId === req.params.productId && (size ? item.size === size : true)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    items[itemIndex].quantity = quantity;

    await cartRef.update({
      items,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await cartRef.get();
    const cart = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart/items/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/items/:productId', authenticateUser, async (req, res) => {
  try {
    const { size } = req.query;

    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    let items = cartDoc.data().items || [];
    items = items.filter(
      item => !(item.productId === req.params.productId && (size ? item.size === size : true))
    );

    await cartRef.update({
      items,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await cartRef.get();
    const cart = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', authenticateUser, async (req, res) => {
  try {
    const cartRef = db.collection('carts').doc(req.user.uid);
    
    await cartRef.update({
      items: [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await cartRef.get();
    const cart = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
