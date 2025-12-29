const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  nutrients: {
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
  },
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
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
  userEmail: {
    type: String,
    required: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'delayed', 'returned'],
    default: 'pending',
    index: true,
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: String,
  }],
  payment: {
    method: {
      type: String,
      enum: ['cod', 'online', 'bank_transfer'],
      default: 'cod',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: String,
    amount: Number,
  },
  pricing: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  estimatedDeliveryDate: {
    type: Date,
    required: true,
  },
  actualDeliveryDate: {
    type: Date,
  },
  adminNotes: {
    type: String,
  },
  trackingNumber: {
    type: String,
  },
  courier: {
    name: String,
    contact: String,
  },
  cancellation: {
    reason: String,
    requestedBy: String,
    timestamp: Date,
  },
}, {
  timestamps: true,
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.orderNumber = `ORD-${year}${month}-${String(count).padStart(6, '0')}`;
  }
  next();
});

// Indexes for performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ firebaseUid: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ userEmail: 1 });

module.exports = mongoose.model('Order', orderSchema);
