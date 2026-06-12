const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    sparse: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    sparse: true,
    unique: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ['customer', 'salon_owner', 'super_admin'],
    default: 'customer',
  },
  notes: { type: String, default: '' },
  avatar: { type: String, default: '' },
  country: { type: String, default: 'India' },
  hairType: { type: String, default: '' },
  beardStyle: { type: String, default: '' },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true }
  }
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);