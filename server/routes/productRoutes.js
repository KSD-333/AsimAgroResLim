const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateUser, isAdmin } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sort = '-createdAt', 
      page = 1, 
      limit = 20,
      featured,
      active = true 
    } = req.query;

    const query = { isActive: active === 'true' };

    if (category) {
      query.category = category;
    }

    if (featured) {
      query.isFeatured = featured === 'true';
    }

    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(3)
      .lean();

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/products/upload-images
// @desc    Upload product images
// @access  Private/Admin
router.post('/upload-images', authenticateUser, isAdmin, upload.array('images', 8), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    if (req.files.length > 8) {
      return res.status(400).json({ success: false, message: 'Maximum 8 images allowed' });
    }

    const uploadPromises = req.files.map((file) => 
      uploadToCloudinary(file.buffer, 'asim-agro/products')
    );

    const uploadedImages = await Promise.all(uploadPromises);

    const images = uploadedImages.map((img, index) => ({
      url: img.url,
      alt: req.body[`alt_${index}`] || '',
      isPrimary: index === 0,
    }));

    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', authenticateUser, isAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', authenticateUser, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', authenticateUser, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
