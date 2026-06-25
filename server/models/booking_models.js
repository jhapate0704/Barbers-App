const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salon',
    required: true,
    index: true,
  },
  chairId: {
    type: mongoose.Schema.Types.ObjectId, // Connects to a specific chair in the Salon
    required: true,
    index: true,
  },
  chairName: {
    type: String, // Store the name directly for easier display
  },
  services: [{
    name: String,
    price: Number
  }],
  totalDuration: {
    type: Number,
    required: true, // This is your Time-Math result (e.g., 50 mins)
  },
  appointmentDate: {
    type: Date,
    required: true,
    index: true,
  },
  startTime: {
    type: String, // e.g., "10:00"
    required: true,
  },
  endTime: {
    type: String, // e.g., "10:50"
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  rescheduleStatus: {
    type: String,
    enum: ['none', 'pending', 'accepted', 'declined'],
    default: 'none',
  },
  proposedStartTime: {
    type: String,
  },
  proposedEndTime: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);