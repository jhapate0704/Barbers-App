const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/booking_models.js');
const Salon = require('../models/salon_models.js');
const verifyToken = require('../middleware/auth.js');
const {
  calculateTotalDuration,
  addMinutes,
  timeToMinutes,
  minutesToTime,
  getLocalServerTime,
  decrementQueue,
  shiftUpcomingBookings
} = require('../services/booking_service.js');

// Validation Middleware Helper
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

// ==========================================
// POST ROUTE: Create a new booking
// URL: http://localhost:5000/api/bookings/create
// ==========================================
router.post('/create', [
  body('customerId').notEmpty().withMessage('customerId is required'),
  body('salonId').notEmpty().withMessage('salonId is required'),
  body('chairId').notEmpty().withMessage('chairId is required'),
  body('requestedServices').isArray({ min: 1 }).withMessage('requestedServices must be a non-empty array'),
  body('appointmentDate').isISO8601().withMessage('appointmentDate must be a valid date'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('startTime must be HH:MM format')
], validateRequest, async (req, res) => {
  try {
    const { customerId, salonId, chairId, requestedServices, appointmentDate, startTime } = req.body;

    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });

    const localNow = getLocalServerTime();
    const apptDateStr = new Date(appointmentDate).toISOString().split('T')[0];

    if (apptDateStr < localNow.dateStr) {
      return res.status(400).json({ message: 'Cannot book appointments for past dates.' });
    }
    if (apptDateStr === localNow.dateStr && startTime < localNow.timeStr) {
      return res.status(400).json({ message: 'Cannot book appointments for past times today.' });
    }

    if (startTime < salon.operatingHours.open || startTime > salon.operatingHours.close) {
      return res.status(400).json({ message: `Salon is only open between ${salon.operatingHours.open} and ${salon.operatingHours.close}` });
    }

    const dateObj = new Date(appointmentDate);
    if (dateObj.getDay() === salon.weeklyOffDay) {
      return res.status(400).json({ message: 'Salon is closed on this day of the week.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (salon.isOffToday && todayStr === apptDateStr) {
      return res.status(400).json({ message: 'Salon is marked as OFF for today.' });
    }

    const totalDuration = calculateTotalDuration(salon.services, requestedServices);
    if (totalDuration === 0) return res.status(400).json({ message: 'Invalid services requested.' });

    const endTime = addMinutes(startTime, totalDuration);

    const conflictingBooking = await Booking.findOne({
      salonId,
      chairId,
      appointmentDate,
      status: 'scheduled',
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked on this chair.' });
    }

    const chairName = salon.chairs.find(c => String(c._id) === String(chairId))?.name || 'Unknown Chair';

    const servicesToSave = requestedServices.map(name => {
      const serviceDetail = salon.services.find(s => s.name === name);
      return { name: serviceDetail.name, price: serviceDetail.price };
    });

    const newBooking = new Booking({
      customerId, salonId, chairId, chairName, services: servicesToSave, totalDuration, appointmentDate, startTime, endTime
    });

    const savedBooking = await newBooking.save();

    const updatedSalon = await Salon.findByIdAndUpdate(
      salonId, 
      { $inc: { currentQueue: 1 } }, 
      { returnDocument: 'after' }
    );

    if (req.io) {
      req.io.emit('queue_updated', { salonId: salon._id, newQueueCount: updatedSalon.currentQueue });
    }

    res.status(201).json({ message: 'Booking confirmed!', booking: savedBooking });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: 'Server error while booking' });
  }
});


// ==========================================
// PUT ROUTE: Mark booking as completed and trigger Bump-Up
// ==========================================
router.put('/complete', [
  body('bookingId').notEmpty().withMessage('bookingId is required')
], validateRequest, async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
        bookingId, 
        { status: 'completed' },
        { returnDocument: 'after' }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    await decrementQueue(booking.salonId, req.io);

    const nextBooking = await Booking.findOne({
      salonId: booking.salonId,
      chairId: booking.chairId,
      appointmentDate: booking.appointmentDate,
      status: 'scheduled',
      startTime: { $gte: booking.endTime } 
    }).sort({ startTime: 1 }); 

    res.status(200).json({
      message: 'Booking completed successfully.',
      nextInLine: nextBooking ? nextBooking._id : 'No more bookings'
    });

  } catch (error) {
    console.error("Error completing booking:", error);
    res.status(500).json({ message: 'Server error while updating booking' });
  }
});

// ==========================================
// PUT ROUTE: Complete booking early and handle upcoming queue
// ==========================================
router.put('/complete-early', [
  body('bookingId').notEmpty().withMessage('bookingId is required'),
  body('actualEndTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('actualEndTime must be HH:MM')
], validateRequest, async (req, res) => {
  try {
    const { bookingId, actualEndTime, shiftType } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const originalEndTime = booking.endTime;
    const originalEndMins = timeToMinutes(originalEndTime);
    const actualEndMins = timeToMinutes(actualEndTime);
    const diff = originalEndMins - actualEndMins;

    booking.status = 'completed';
    booking.endTime = actualEndTime;
    const startMins = timeToMinutes(booking.startTime);
    booking.totalDuration = Math.max(0, actualEndMins - startMins);
    await booking.save();

    let shiftedCount = 0;
    if (diff > 0) {
      if (shiftType === 'force') {
        shiftedCount = await shiftUpcomingBookings(booking.salonId, booking.chairId, booking.appointmentDate, originalEndTime, diff);
      } else {
        const nextBooking = await Booking.findOne({
          salonId: booking.salonId,
          chairId: booking.chairId,
          appointmentDate: booking.appointmentDate,
          status: 'scheduled',
          startTime: { $gte: originalEndTime }
        }).sort({ startTime: 1 });

        if (nextBooking) {
          const nextStartMins = timeToMinutes(nextBooking.startTime);
          const nextEndMins = timeToMinutes(nextBooking.endTime);

          nextBooking.rescheduleStatus = 'pending';
          nextBooking.proposedStartTime = minutesToTime(nextStartMins - diff);
          nextBooking.proposedEndTime = minutesToTime(nextEndMins - diff);
          await nextBooking.save();
          shiftedCount = 1;
        }
      }
    }

    await decrementQueue(booking.salonId, req.io);

    res.status(200).json({
      message: 'Booking completed early and queue processed successfully.',
      shiftedCount,
      shiftType
    });

  } catch (error) {
    console.error("Error completing booking early:", error);
    res.status(500).json({ message: 'Server error while completing booking early.' });
  }
});

// ==========================================
// PUT ROUTE: Customer responds to reschedule request
// ==========================================
router.put('/respond-reschedule', [
  body('bookingId').notEmpty().withMessage('bookingId is required'),
  body('response').isIn(['accepted', 'declined']).withMessage('response must be accepted or declined')
], validateRequest, async (req, res) => {
  try {
    const { bookingId, response } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (response === 'accepted' && booking.proposedStartTime) {
      const originalStartTime = booking.startTime;
      const proposedStartTime = booking.proposedStartTime;
      const diff = timeToMinutes(originalStartTime) - timeToMinutes(proposedStartTime);

      booking.startTime = booking.proposedStartTime;
      booking.endTime = booking.proposedEndTime;
      booking.rescheduleStatus = 'accepted';
      booking.proposedStartTime = undefined;
      booking.proposedEndTime = undefined;
      await booking.save();

      if (diff > 0) {
        await shiftUpcomingBookings(booking.salonId, booking.chairId, booking.appointmentDate, originalStartTime, diff);
      }
    } else {
      booking.rescheduleStatus = 'declined';
      booking.proposedStartTime = undefined;
      booking.proposedEndTime = undefined;
      await booking.save();
    }

    if (req.io) {
      const updatedSalon = await Salon.findById(booking.salonId);
      req.io.emit('queue_updated', { salonId: booking.salonId, newQueueCount: updatedSalon.currentQueue });
    }

    res.status(200).json({ message: `Reschedule request ${response} successfully.`, booking });

  } catch (error) {
    console.error("Error responding to reschedule request:", error);
    res.status(500).json({ message: 'Server error while responding to reschedule.' });
  }
});

// ==========================================
// PUT ROUTE: Owner forces or cancels reschedule request
// ==========================================
router.put('/action-reschedule', [
  body('bookingId').notEmpty().withMessage('bookingId is required'),
  body('action').isIn(['force', 'cancel']).withMessage('action must be force or cancel')
], validateRequest, async (req, res) => {
  try {
    const { bookingId, action } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (action === 'force' && booking.proposedStartTime) {
      const originalStartTime = booking.startTime;
      const proposedStartTime = booking.proposedStartTime;
      const diff = timeToMinutes(originalStartTime) - timeToMinutes(proposedStartTime);

      booking.startTime = booking.proposedStartTime;
      booking.endTime = booking.proposedEndTime;
      booking.rescheduleStatus = 'accepted';
      booking.proposedStartTime = undefined;
      booking.proposedEndTime = undefined;
      await booking.save();

      if (diff > 0) {
        await shiftUpcomingBookings(booking.salonId, booking.chairId, booking.appointmentDate, originalStartTime, diff);
      }
    } else {
      booking.rescheduleStatus = 'none';
      booking.proposedStartTime = undefined;
      booking.proposedEndTime = undefined;
      await booking.save();
    }

    if (req.io) {
      const updatedSalon = await Salon.findById(booking.salonId);
      req.io.emit('queue_updated', { salonId: booking.salonId, newQueueCount: updatedSalon.currentQueue });
    }

    res.status(200).json({ message: `Reschedule request action ${action} completed.`, booking });

  } catch (error) {
    console.error("Error executing action on reschedule request:", error);
    res.status(500).json({ message: 'Server error while processing reschedule action.' });
  }
});

// ==========================================
// PUT ROUTE: Cancel a booking
// ==========================================
router.put('/cancel', [
  body('bookingId').notEmpty().withMessage('bookingId is required')
], validateRequest, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { returnDocument: 'after' }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    await decrementQueue(booking.salonId, req.io);

    res.status(200).json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// ==========================================
// GET ROUTE: Secure Owner Dashboard Data (Paginated)
// ==========================================
router.get('/salon/dashboard', verifyToken, async (req, res) => {
  try {
    const salonId = req.user.id; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const mySalon = await Salon.findById(salonId);
    if (!mySalon) return res.status(404).json({ message: 'No salon found for this ID.' });

    const bookings = await Booking.find({ salonId: mySalon._id })
       .populate('customerId', 'name phone')
       .sort({ appointmentDate: 1, startTime: 1 })
       .skip(skip)
       .limit(limit);
       
    const total = await Booking.countDocuments({ salonId: mySalon._id });

    res.json({ 
      bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// GET ROUTE: Public Salon Bookings (Paginated)
// ==========================================
router.get('/salon/:salonId', async (req, res) => {
  try {
    const salonId = req.params.salonId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ salonId })
      .populate('customerId', 'name phone')
      .sort({ appointmentDate: -1, startTime: 1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Booking.countDocuments({ salonId });

    res.status(200).json({
      bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching salon bookings:", error);
    res.status(500).json({ message: 'Error fetching salon bookings' });
  }
});

// ==========================================
// GET ROUTE: Fetch bookings for a specific customer (Paginated)
// ==========================================
router.get('/customer/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ customerId })
      .populate('salonId', 'name address operatingHours ratings images')
      .sort({ appointmentDate: -1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments({ customerId });

    res.status(200).json({
      bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({ message: 'Error fetching customer bookings' });
  }
});

module.exports = router;