const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { authenticateUser } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authenticateUser, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.dbUser._id })
      .populate('items.productId', 'name imageUrl price');

    if (!cart) {
      cart = await Cart.create({
        userId: req.dbUser._id,
        firebaseUid: req.user.uid,
        items: [],
      });
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

    let cart = await Cart.findOne({ userId: req.dbUser._id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.dbUser._id,
        firebaseUid: req.user.uid,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.size === size
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, name, quantity, size, price, image, nutrients });
    }

    await cart.save();

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
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.dbUser._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(
      item => item.productId.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

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
    const cart = await Cart.findOne({ userId: req.dbUser._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== req.params.productId
    );

    await cart.save();

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
    const cart = await Cart.findOne({ userId: req.dbUser._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
