const mongoose = require('mongoose');

const nutrientSchema = new mongoose.Schema({
  nitrogen: { type: Number, default: 0, min: 0, max: 100 },
  phosphorus: { type: Number, default: 0, min: 0, max: 100 },
  potassium: { type: Number, default: 0, min: 0, max: 100 },
  otherNutrients: {
    type: Map,
    of: Number,
  },
}, { _id: false });

const customChemicalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  unit: { type: String, default: '%' },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    maxlength: 200,
  },
  category: {
    type: String,
    required: true,
    enum: ['Macronutrient', 'Micronutrient', 'Organic', 'Specialty', 'Fertilizers', 'Seeds', 'Pesticides', 'Equipment'],
    index: true,
  },
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false },
  }],
  sizes: [{
    type: String,
    required: true,
  }],
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  discountedPrice: {
    type: Number,
    min: 0,
  },
  pricePerSize: {
    type: Map,
    of: Number,
  },
  nutrients: nutrientSchema,
  customChemicals: [customChemicalSchema],
  applicationMethod: {
    type: String,
  },
  benefits: [{
    type: String,
  }],
  stockAvailability: {
    type: Boolean,
    default: true,
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  views: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  metadata: {
    manufacturer: String,
    batchNumber: String,
    expiryDate: Date,
  },
}, {
  timestamps: true,
});

// Validation for images array (1-8 images)
productSchema.path('images').validate(function(images) {
  return images && images.length >= 1 && images.length <= 8;
}, 'Product must have between 1 and 8 images');

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Calculate discounted price if discount is set
  if (this.discount > 0) {
    this.discountedPrice = this.price - (this.price * this.discount / 100);
  } else {
    this.discountedPrice = this.price;
  }
  
  next();
});

// Indexes for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
