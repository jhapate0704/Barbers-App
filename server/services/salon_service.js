const Salon = require('../models/salon_models.js');
const Booking = require('../models/booking_models.js');
const { uploadToCloudinary } = require('../utils/cloudinary.js');

class SalonService {
  async getSalonsWithRush(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const totalSalons = await Salon.countDocuments();
    const salons = await Salon.find().skip(skip).limit(limit).lean();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysBookings = await Booking.find({
      appointmentDate: { $gte: today },
      status: 'scheduled'
    }).sort({ startTime: 1 }).lean();

    const bookingsBySalon = {};
    for (const booking of todaysBookings) {
      const sId = String(booking.salonId);
      if (!bookingsBySalon[sId]) {
        bookingsBySalon[sId] = [];
      }
      bookingsBySalon[sId].push(booking);
    }

    const salonsWithRush = salons.map((salon) => {
      const salonBookings = bookingsBySalon[String(salon._id)] || [];
      const busyTimes = salonBookings.map(b => `${b.startTime} - ${b.endTime}`);

      return { 
        ...salon, 
        currentQueue: salonBookings.length,
        busyTimes: busyTimes
      };
    });

    return {
      salons: salonsWithRush,
      totalSalons,
      totalPages: Math.ceil(totalSalons / limit),
      currentPage: page
    };
  }

  async getNearbySalonsWithRush(latitude, longitude, radiusInMeters, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const query = {
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // [lng, lat]
          },
          $maxDistance: radiusInMeters
        }
      }
    };
    
    const totalSalons = await Salon.countDocuments(query);
    const salons = await Salon.find(query).skip(skip).limit(limit).lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysBookings = await Booking.find({
      appointmentDate: { $gte: today },
      status: 'scheduled'
    }).sort({ startTime: 1 }).lean();

    const bookingsBySalon = {};
    for (const booking of todaysBookings) {
      const sId = String(booking.salonId);
      if (!bookingsBySalon[sId]) {
        bookingsBySalon[sId] = [];
      }
      bookingsBySalon[sId].push(booking);
    }

    const salonsWithRush = salons.map((salon) => {
      const salonBookings = bookingsBySalon[String(salon._id)] || [];
      const busyTimes = salonBookings.map(b => `${b.startTime} - ${b.endTime}`);

      // Calculate distance in meters using Haversine formula
      let distanceMeters = null;
      if (salon.latitude && salon.longitude) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (latitude * Math.PI) / 180;
        const φ2 = (salon.latitude * Math.PI) / 180;
        const Δφ = ((salon.latitude - latitude) * Math.PI) / 180;
        const Δλ = ((salon.longitude - longitude) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceMeters = R * c;
      }

      return { 
        ...salon, 
        currentQueue: salonBookings.length,
        busyTimes: busyTimes,
        distance: distanceMeters
      };
    });

    return {
      salons: salonsWithRush,
      totalSalons,
      totalPages: Math.ceil(totalSalons / limit),
      currentPage: page
    };
  }

  async uploadImages(images) {
    if (!images) return undefined;
    const uploadedUrls = [];
    for (const img of images) {
      if (img.startsWith('data:image')) {
        const secureUrl = await uploadToCloudinary(img);
        uploadedUrls.push(secureUrl);
      } else {
        uploadedUrls.push(img);
      }
    }
    return uploadedUrls;
  }
}

module.exports = new SalonService();
