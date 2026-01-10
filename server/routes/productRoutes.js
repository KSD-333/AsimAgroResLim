const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
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
      sort = 'createdAt', 
      sortDir = 'desc',
      page = 1, 
      limit = 20,
      featured,
      active = 'true' 
    } = req.query;

    let query = db.collection('products');

    // Apply filters
    if (active === 'true') {
      query = query.where('isActive', '==', true);
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    if (featured === 'true') {
      query = query.where('isFeatured', '==', true);
    }

    // Apply sorting
    query = query.orderBy(sort, sortDir);

    // Get all matching documents for count
    const allDocs = await query.get();
    const total = allDocs.size;

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedDocs = allDocs.docs.slice(offset, offset + parseInt(limit));

    const products = paginatedDocs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Handle search if provided (client-side filtering for now)
    let filteredProducts = products;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: filteredProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: search ? filteredProducts.length : total,
        pages: Math.ceil((search ? filteredProducts.length : total) / parseInt(limit)),
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
    const productsSnapshot = await db.collection('products')
      .where('isFeatured', '==', true)
      .where('isActive', '==', true)
      .limit(3)
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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
    const productRef = db.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Increment views
    await productRef.update({
      views: admin.firestore.FieldValue.increment(1)
    });

    const product = { id: productDoc.id, ...productDoc.data() };

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
    const productData = {
      ...req.body,
      views: 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const productRef = await db.collection('products').add(productData);
    const productDoc = await productRef.get();
    const product = { id: productDoc.id, ...productDoc.data() };

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
    const productRef = db.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await productRef.update(updateData);
    const updatedDoc = await productRef.get();
    const product = { id: updatedDoc.id, ...updatedDoc.data() };

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
    const productRef = db.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await productRef.delete();

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
