const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'dealer'],
    default: 'user',
  },
  shippingAddress: shippingAddressSchema,
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  preferences: {
    newsletter: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
  },
}, {
  timestamps: true,
});

// Indexes for performance
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
