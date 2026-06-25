const express = require('express');
const router = express.Router();
const Salon = require('../models/salon_models.js');
const Booking = require('../models/booking_models.js');
const User = require('../models/user_models.js');
const { uploadToCloudinary } = require('../utils/cloudinary.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyToken = require('../middleware/auth.js');
const { body, validationResult } = require('express-validator');
const salonService = require('../services/salon_service.js');

// ==========================================
// POST ROUTE: Register a new salon
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, ownerName, email, password, address, phone, country, operatingHours, services, chairs, latitude, longitude } = req.body;
    
    if (!name || !ownerName || !address || !email || !password || !phone || !country) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingSalon = await Salon.findOne({ email: email });
    if (existingSalon) {
      return res.status(400).json({ message: 'A salon with this email is already registered.' });
    }

    // 1. Get or create a User record for the salon owner
    let ownerUser = await User.findOne({ phone });
    if (!ownerUser) {
      ownerUser = new User({
        name: ownerName,
        phone: phone,
        role: 'salon_owner'
      });
      await ownerUser.save();
    } else {
      // If user exists, upgrade their role to salon_owner if they are currently a customer
      if (ownerUser.role === 'customer') {
        ownerUser.role = 'salon_owner';
        await ownerUser.save();
      }
    }

    // 2. Hash password and save Salon
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const latVal = latitude ? Number(latitude) : undefined;
    const lngVal = longitude ? Number(longitude) : undefined;

    const newSalon = new Salon({ 
      name, 
      ownerName,
      ownerId: ownerUser._id, 
      email, 
      password: hashedPassword, 
      address, 
      phone,
      country,
      operatingHours, 
      services, 
      chairs,
      latitude: latVal,
      longitude: lngVal,
      location: (latVal !== undefined && lngVal !== undefined) ? { type: 'Point', coordinates: [lngVal, latVal] } : undefined
    });
    
    const savedSalon = await newSalon.save();
    
    const token = jwt.sign(
      { id: savedSalon._id, role: 'owner' }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'Salon registered successfully!', 
      salon: savedSalon,
      token: token,
      salonId: savedSalon._id
    });
  } catch (error) {
    console.error("Error creating salon:", error);
    res.status(500).json({ message: 'Server error while creating salon' });
  }
});

// ==========================================
// GET ROUTE: Fetch all salons WITH RUSH COUNT AND BUSY TIMES
// ==========================================
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await salonService.getSalonsWithRush(page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching salons:", error);
    res.status(500).json({ message: 'Error fetching salons' });
  }
});

// ==========================================
// GET ROUTE: Fetch nearby salons based on lat/lng query params
// URL: http://localhost:5000/api/salons/nearby?lat=xx&lng=xx&radius=10000
// ==========================================
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius, page, limit } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and Longitude are required query parameters.' });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    const radiusInMeters = Number(radius) || 10000; // default 10 km
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const result = await salonService.getNearbySalonsWithRush(latitude, longitude, radiusInMeters, pageNum, limitNum);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching nearby salons:", error);
    res.status(500).json({ message: 'Error searching nearby salons' });
  }
});

// ==========================================
// POST ROUTE: Secure Login
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const salon = await Salon.findOne({ email: email });
    if (!salon) return res.status(400).json({ message: 'Email not found' });

    const validPassword = await bcrypt.compare(password, salon.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: salon._id, role: 'owner' }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Logged in successfully',
      token: token,
      salonId: salon._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// PATCH ROUTE: Update Salon Settings
// ==========================================
router.patch('/settings/update', verifyToken, async (req, res) => {
  try {
    const { 
      name, ownerName, email, phone, country, address,
      operatingHours, weeklyOffDay, isOffToday, image, images, portfolio, about,
      latitude, longitude
    } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (about !== undefined) updateData.about = about;
    if (ownerName !== undefined) updateData.ownerName = ownerName;
    if (email !== undefined) {
      const emailCheck = await Salon.findOne({ email, _id: { $ne: req.user.id } });
      if (emailCheck) {
        return res.status(400).json({ message: 'Email already registered.' });
      }
      updateData.email = email;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (country !== undefined) updateData.country = country;
    if (address !== undefined) updateData.address = address;
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
    if (weeklyOffDay !== undefined) updateData.weeklyOffDay = weeklyOffDay;
    if (isOffToday !== undefined) updateData.isOffToday = isOffToday;
    
    if (latitude !== undefined) {
      updateData.latitude = latitude === null ? null : Number(latitude);
    }
    if (longitude !== undefined) {
      updateData.longitude = longitude === null ? null : Number(longitude);
    }
    if (latitude !== undefined && longitude !== undefined) {
      if (latitude === null || longitude === null) {
        updateData.$unset = { location: 1 };
      } else {
        updateData.location = { type: 'Point', coordinates: [Number(longitude), Number(latitude)] };
      }
    }
    
    // Process images using Cloudinary (Salon photos)
    let targetImages = images;
    if (image !== undefined) {
      targetImages = [image];
    }

    if (targetImages !== undefined) {
      updateData.images = await salonService.uploadImages(targetImages);
    }

    // Process portfolio images using Cloudinary
    if (portfolio !== undefined) {
      updateData.portfolio = await salonService.uploadImages(portfolio);
    }

    const salon = await Salon.findByIdAndUpdate(
      req.user.id,
      updateData,
      { returnDocument: 'after' }
    );

    // Sync owner details with User record
    if (salon && (ownerName !== undefined || phone !== undefined)) {
      const userUpdate = {};
      if (ownerName !== undefined) userUpdate.name = ownerName;
      if (phone !== undefined) userUpdate.phone = phone;
      await User.findByIdAndUpdate(salon.ownerId, userUpdate);
    }

    res.status(200).json({ message: 'Settings updated!', salon });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// ==========================================
// POST ROUTE: Add a Chair
// ==========================================
router.post('/chairs/add', verifyToken, [
  body('name').notEmpty().withMessage('Chair name is required').trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name } = req.body;
    const salon = await Salon.findById(req.user.id);
    salon.chairs.push({ name });
    await salon.save();
    res.status(200).json({ message: 'Chair added!', salon });
  } catch (error) {
    res.status(500).json({ message: 'Error adding chair' });
  }
});

// ==========================================
// DELETE ROUTE: Delete a Chair
// ==========================================
router.delete('/chairs/:chairId', verifyToken, async (req, res) => {
  try {
    const { chairId } = req.params;
    const salon = await Salon.findById(req.user.id);
    salon.chairs = salon.chairs.filter(c => String(c._id) !== String(chairId));
    await salon.save();
    res.status(200).json({ message: 'Chair deleted!', salon });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chair' });
  }
});

// ==========================================
// POST ROUTE: Add a Service
// ==========================================
router.post('/services/add', verifyToken, [
  body('name').notEmpty().withMessage('Service name is required').trim(),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('price').isNumeric().withMessage('Price must be a number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, duration, price } = req.body;
    const salon = await Salon.findById(req.user.id);
    salon.services.push({ name, duration, price });
    await salon.save();
    res.status(200).json({ message: 'Service added!', salon });
  } catch (error) {
    res.status(500).json({ message: 'Error adding service' });
  }
});

// ==========================================
// DELETE ROUTE: Delete a Service
// ==========================================
router.delete('/services/:serviceId', verifyToken, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const salon = await Salon.findById(req.user.id);
    salon.services = salon.services.filter(s => String(s._id) !== String(serviceId));
    await salon.save();
    res.status(200).json({ message: 'Service deleted!', salon });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service' });
  }
});

// ==========================================
// POST ROUTE: Add rating/review to a salon
// URL: http://localhost:5000/api/salons/:salonId/rate
// ==========================================
router.post('/:salonId/rate', async (req, res) => {
  try {
    const { customerId, customerName, rating, reviewText } = req.body;
    
    if (!customerId || !customerName || !rating) {
      return res.status(400).json({ message: 'Missing required review fields' });
    }

    const salon = await Salon.findById(req.params.salonId);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });

    // Check if user already reviewed this salon (optional, but good practice)
    const existingReviewIndex = salon.ratings.findIndex(r => String(r.customerId) === String(customerId));
    if (existingReviewIndex !== -1) {
      // Update existing review
      salon.ratings[existingReviewIndex].rating = rating;
      salon.ratings[existingReviewIndex].reviewText = reviewText || '';
    } else {
      // Add new review
      salon.ratings.push({ customerId, customerName, rating, reviewText: reviewText || '' });
    }

    await salon.save();
    res.status(200).json({ message: 'Rating saved successfully!', salon });
  } catch (error) {
    console.error("Error rating salon:", error);
    res.status(500).json({ message: 'Error adding rating' });
  }
});

// ==========================================
// POST ROUTE: Verify Current Password
// ==========================================
router.post('/settings/password/verify', verifyToken, async (req, res) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required' });
    }
    const salon = await Salon.findById(req.user.id);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });

    const validPassword = await bcrypt.compare(currentPassword, salon.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid current password', valid: false });
    }
    res.status(200).json({ message: 'Password verified', valid: true });
  } catch (error) {
    console.error("Error verifying password:", error);
    res.status(500).json({ message: 'Server error while verifying password' });
  }
});

// ==========================================
// PATCH ROUTE: Verify and Update Password
// ==========================================
router.patch('/settings/password/update', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing password fields' });
    }

    const salon = await Salon.findById(req.user.id);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });

    // Compare with current password
    const validPassword = await bcrypt.compare(currentPassword, salon.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    salon.password = hashedPassword;
    await salon.save();

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: 'Server error while updating password' });
  }
});

// ==========================================
// DELETE ROUTE: Delete Salon Account
// ==========================================
router.delete('/settings/account/delete', verifyToken, async (req, res) => {
  try {
    const salon = await Salon.findById(req.user.id);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });

    // Delete companion User document
    if (salon.ownerId) {
      await User.findByIdAndDelete(salon.ownerId);
    }

    // Delete Salon document
    await Salon.findByIdAndDelete(req.user.id);

    // Delete all bookings associated with this salon
    const Booking = require('../models/booking_models.js');
    await Booking.deleteMany({ salonId: req.user.id });

    res.status(200).json({ message: 'Account deleted successfully!' });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
});

module.exports = router;