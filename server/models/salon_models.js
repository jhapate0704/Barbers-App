const mongoose = require('mongoose');

const chairSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  price: { type: Number, required: true }
});

const ratingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  reviewText: { type: String, default: '' }
}, { timestamps: true });

const salonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  // 🚨 NEWLY ADDED FIELDS FOR AUTHENTICATION 🚨
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  images: [{ type: String }],
  portfolio: [{ type: String }],
  about: { type: String, default: '' },
  
  ownerName: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  operatingHours: {
    open: { type: String, required: true },
    close: { type: String, required: true }
  },
  weeklyOffDay: { type: Number, default: -1 }, // -1 means no regular off day, 0=Sun, 1=Mon, etc.
  isOffToday: { type: Boolean, default: false },
  services: [serviceSchema],
  chairs: [chairSchema],
  currentQueue: { type: Number, default: 0 },
  busyTimes: [{ type: String }], // Array of strings like "10:00 - 10:30"
  ratings: [ratingSchema],
  latitude: { type: Number },
  longitude: { type: Number },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  }
}, {
  timestamps: true
});

salonSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Salon', salonSchema);