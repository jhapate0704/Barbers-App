const express = require('express');
const router = express.Router();
const Booking = require('../models/booking_models.js');
const Salon = require('../models/salon_models.js');
const verifyToken = require('../middleware/auth.js');

// Helper function to calculate total duration of requested services
const calculateTotalDuration = (salonServices, requestedServiceNames) => {
  let totalTime = 0;
  requestedServiceNames.forEach(reqServiceName => {
    const service = salonServices.find(s => s.name === reqServiceName);
    if (service) totalTime += service.duration;
  });
  return totalTime;
};

// HELPER FUNCTION: Add minutes to a time string (e.g., "10:00" + 50 mins = "10:50")
const addMinutes = (timeString, minsToAdd) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + minsToAdd);
  return date.toTimeString().substring(0, 5); // returns "HH:MM"
};

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// ==========================================
// POST ROUTE: Create a new booking
// URL: http://localhost:5000/api/bookings/create
// ==========================================
router.post('/create', async (req, res) => {
  try {
    const { customerId, salonId, chairId, requestedServices, appointmentDate, startTime } = req.body;

    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });

    // ⏳ VALIDATION: Prevent Booking in the Past (Time/Date)
    const getLocalServerTime = () => {
      const d = new Date();
      const offset = d.getTimezoneOffset(); // in minutes
      const localTime = new Date(d.getTime() - (offset * 60 * 1000));
      const [date, time] = localTime.toISOString().split('T');
      return {
        dateStr: date,
        timeStr: time.substring(0, 5) // "HH:MM"
      };
    };

    const localNow = getLocalServerTime();
    const apptDateStr = new Date(appointmentDate).toISOString().split('T')[0];

    if (apptDateStr < localNow.dateStr) {
      return res.status(400).json({ message: 'Cannot book appointments for past dates.' });
    }
    if (apptDateStr === localNow.dateStr && startTime < localNow.timeStr) {
      return res.status(400).json({ message: 'Cannot book appointments for past times today.' });
    }

    // 🕒 VALIDATION: Check Operating Hours
    if (startTime < salon.operatingHours.open || startTime > salon.operatingHours.close) {
      return res.status(400).json({ message: `Salon is only open between ${salon.operatingHours.open} and ${salon.operatingHours.close}` });
    }

    // 🗓️ VALIDATION: Check Weekly Off Day
    const dateObj = new Date(appointmentDate);
    if (dateObj.getDay() === salon.weeklyOffDay) {
      return res.status(400).json({ message: 'Salon is closed on this day of the week.' });
    }

    // 🛑 VALIDATION: Check "Off Today" flag
    const todayStr = new Date().toISOString().split('T')[0];
    const apptStr = new Date(appointmentDate).toISOString().split('T')[0];
    if (salon.isOffToday && todayStr === apptStr) {
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

    // 🚀 QUEUE UPDATE: Increment the salon's queue!
    const updatedSalon = await Salon.findByIdAndUpdate(
      salonId, 
      { $inc: { currentQueue: 1 } }, 
      { returnDocument: 'after' }
    );

    // ✨ WEBSOCKET MAGIC: Broadcast the new higher queue to the marketplace
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
// POST ROUTE: Mark booking as completed and trigger Bump-Up
// URL: http://localhost:5000/api/bookings/complete
// ==========================================
router.post('/complete', async (req, res) => {
  try {
    const { bookingId } = req.body; // Getting ID from the body now, matching the frontend!
    
    const booking = await Booking.findByIdAndUpdate(
        bookingId, 
        { status: 'completed' },
        { returnDocument: 'after' }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // 🚀 QUEUE UPDATE: Decrement the salon's queue!
    const updatedSalon = await Salon.findByIdAndUpdate(
      booking.salonId,
      { $inc: { currentQueue: -1 } }, 
      { returnDocument: 'after' }
    );

    // Failsafe to ensure queue doesn't go below 0
    if (updatedSalon.currentQueue < 0) {
        updatedSalon.currentQueue = 0;
        await updatedSalon.save();
    }

    console.log(`\n--- DEBUGGING BUMP UP ---`);
    console.log(`Booking ${bookingId} Completed!`);

    const nextBooking = await Booking.findOne({
      salonId: booking.salonId,
      chairId: booking.chairId,
      appointmentDate: booking.appointmentDate,
      status: 'scheduled',
      startTime: { $gte: booking.endTime } 
    }).sort({ startTime: 1 }); 

    if (nextBooking) {
      console.log(`🚀 BUMP UP ALERT: Tell user ${nextBooking.customerId} that their chair is ready early!`);
    } else {
      console.log(`❌ No upcoming bookings found for this chair today.`);
    }
    console.log(`-------------------------\n`);

    // ✨ WEBSOCKET MAGIC: Broadcast the new lower queue to the marketplace
    if (req.io) {
      req.io.emit('queue_updated', { salonId: updatedSalon._id, newQueueCount: updatedSalon.currentQueue });
    }

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
// POST ROUTE: Complete booking early and handle upcoming queue
// URL: http://localhost:5000/api/bookings/complete-early
// ==========================================
router.post('/complete-early', async (req, res) => {
  try {
    const { bookingId, actualEndTime, shiftType } = req.body; // shiftType: 'force' or 'request'

    if (!bookingId || !actualEndTime) {
      return res.status(400).json({ message: 'Booking ID and actual end time are required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

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
        const upcomingBookings = await Booking.find({
          salonId: booking.salonId,
          chairId: booking.chairId,
          appointmentDate: booking.appointmentDate,
          status: 'scheduled',
          startTime: { $gte: originalEndTime }
        });

        for (const upcoming of upcomingBookings) {
          const uStartMins = timeToMinutes(upcoming.startTime);
          const uEndMins = timeToMinutes(upcoming.endTime);

          upcoming.startTime = minutesToTime(uStartMins - diff);
          upcoming.endTime = minutesToTime(uEndMins - diff);
          await upcoming.save();
        }
        shiftedCount = upcomingBookings.length;
      } else {
        // Send request to the next customer in line
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

    const updatedSalon = await Salon.findByIdAndUpdate(
      booking.salonId,
      { $inc: { currentQueue: -1 } },
      { returnDocument: 'after' }
    );

    if (updatedSalon.currentQueue < 0) {
      updatedSalon.currentQueue = 0;
      await updatedSalon.save();
    }

    if (req.io) {
      req.io.emit('queue_updated', { salonId: updatedSalon._id, newQueueCount: updatedSalon.currentQueue });
    }

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
// POST ROUTE: Customer responds to reschedule request
// URL: http://localhost:5000/api/bookings/respond-reschedule
// ==========================================
router.post('/respond-reschedule', async (req, res) => {
  try {
    const { bookingId, response } = req.body; // response: 'accepted' or 'declined'

    if (!bookingId || !response) {
      return res.status(400).json({ message: 'Booking ID and response are required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (response === 'accepted' && booking.proposedStartTime) {
      const originalStartTime = booking.startTime;
      const proposedStartTime = booking.proposedStartTime;
      const originalStartMins = timeToMinutes(originalStartTime);
      const proposedStartMins = timeToMinutes(proposedStartTime);
      const diff = originalStartMins - proposedStartMins;

      // Update current booking times
      booking.startTime = booking.proposedStartTime;
      booking.endTime = booking.proposedEndTime;
      booking.rescheduleStatus = 'accepted';
      booking.proposedStartTime = undefined;
      booking.proposedEndTime = undefined;
      await booking.save();

      // Shift subsequent bookings on the same chair and day
      if (diff > 0) {
        const upcomingBookings = await Booking.find({
          salonId: booking.salonId,
          chairId: booking.chairId,
          appointmentDate: booking.appointmentDate,
          status: 'scheduled',
          startTime: { $gte: originalStartTime }
        });

        for (const upcoming of upcomingBookings) {
          const uStartMins = timeToMinutes(upcoming.startTime);
          const uEndMins = timeToMinutes(upcoming.endTime);

          upcoming.startTime = minutesToTime(uStartMins - diff);
          upcoming.endTime = minutesToTime(uEndMins - diff);
          await upcoming.save();
        }
      }
    } else {
      // Declined
      booking.rescheduleStatus = 'declined';
      booking.proposedStartTime = undefined;
      booking.proposedEndTime = undefined;
      await booking.save();
    }

    // Trigger update
    const updatedSalon = await Salon.findById(booking.salonId);
    if (req.io) {
      req.io.emit('queue_updated', { salonId: booking.salonId, newQueueCount: updatedSalon.currentQueue });
    }

    res.status(200).json({ message: `Reschedule request ${response} successfully.`, booking });

  } catch (error) {
    console.error("Error responding to reschedule request:", error);
    res.status(500).json({ message: 'Server error while responding to reschedule.' });
  }
});

// ==========================================
// POST ROUTE: Owner forces or cancels reschedule request
// URL: http://localhost:5000/api/bookings/action-reschedule
// ==========================================
router.post('/action-reschedule', async (req, res) => {
  try {
    const { bookingId, action } = req.body; // action: 'force' or 'cancel'

    if (!bookingId || !action) {
      return res.status(400).json({ message: 'Booking ID and action are required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (action === 'force' && booking.proposedStartTime) {
      const originalStartTime = booking.startTime;
      const proposedStartTime = booking.proposedStartTime;
      const originalStartMins = timeToMinutes(originalStartTime);
      const proposedStartMins = timeToMinutes(proposedStartTime);
      const diff = originalStartMins - proposedStartMins;

      // Update times
      booking.startTime = booking.proposedStartTime;
      booking.endTime = booking.proposedEndTime;
      booking.rescheduleStatus = 'accepted';
      booking.proposedStartTime = undefined;
      booking.proposedEndTime = undefined;
      await booking.save();

      // Shift subsequent bookings
      if (diff > 0) {
        const upcomingBookings = await Booking.find({
          salonId: booking.salonId,
          chairId: booking.chairId,
          appointmentDate: booking.appointmentDate,
          status: 'scheduled',
          startTime: { $gte: originalStartTime }
        });

        for (const upcoming of upcomingBookings) {
          const uStartMins = timeToMinutes(upcoming.startTime);
          const uEndMins = timeToMinutes(upcoming.endTime);

          upcoming.startTime = minutesToTime(uStartMins - diff);
          upcoming.endTime = minutesToTime(uEndMins - diff);
          await upcoming.save();
        }
      }
    } else {
      // Cancel request
      booking.rescheduleStatus = 'none';
      booking.proposedStartTime = undefined;
      booking.proposedEndTime = undefined;
      await booking.save();
    }

    // Trigger update
    const updatedSalon = await Salon.findById(booking.salonId);
    if (req.io) {
      req.io.emit('queue_updated', { salonId: booking.salonId, newQueueCount: updatedSalon.currentQueue });
    }

    res.status(200).json({ message: `Reschedule request action ${action} completed.`, booking });

  } catch (error) {
    console.error("Error executing action on reschedule request:", error);
    res.status(500).json({ message: 'Server error while processing reschedule action.' });
  }
});

// ==========================================
// POST ROUTE: Cancel a booking
// URL: http://localhost:5000/api/bookings/cancel
// ==========================================
router.post('/cancel', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { returnDocument: 'after' }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Decrement queue count
    const updatedSalon = await Salon.findByIdAndUpdate(
      booking.salonId,
      { $inc: { currentQueue: -1 } },
      { returnDocument: 'after' }
    );
    if (updatedSalon.currentQueue < 0) {
      updatedSalon.currentQueue = 0;
      await updatedSalon.save();
    }

    if (req.io) {
      req.io.emit('queue_updated', { salonId: updatedSalon._id, newQueueCount: updatedSalon.currentQueue });
    }

    res.status(200).json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// ==========================================
// GET ROUTE: Secure Owner Dashboard Data
// URL: http://localhost:5000/api/bookings/salon/dashboard
// ==========================================
router.get('/salon/dashboard', verifyToken, async (req, res) => {
  try {
    // 1. req.user.id is the ID of the logged-in salon (stored in the token)
    const salonId = req.user.id; 

    // 2. Find the Salon directly by ID
    const mySalon = await Salon.findById(salonId);

    if (!mySalon) {
      return res.status(404).json({ message: 'No salon found for this ID.' });
    }

    // 3. Now search for bookings using the actual Salon ID
    const bookings = await Booking.find({ salonId: mySalon._id })
       .populate('customerId', 'name phone')
       // Optional: sort by date and time so the queue is in the right order
       .sort({ appointmentDate: 1, startTime: 1 }); 

    res.json({ bookings: bookings });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// GET ROUTE: Public Salon Bookings (Used if needed)
// URL: http://localhost:5000/api/bookings/salon/:salonId
// ==========================================
router.get('/salon/:salonId', async (req, res) => {
  try {
    const salonId = req.params.salonId;
    const bookings = await Booking.find({ salonId: salonId })
      .populate('customerId', 'name phone')
      .sort({ appointmentDate: -1, startTime: 1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching salon bookings:", error);
    res.status(500).json({ message: 'Error fetching salon bookings' });
  }
});

// ==========================================
// GET ROUTE: Fetch bookings for a specific customer
// URL: http://localhost:5000/api/bookings/customer/:customerId
// ==========================================
router.get('/customer/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const bookings = await Booking.find({ customerId: customerId })
      .populate('salonId', 'name address operatingHours ratings images')
      .sort({ appointmentDate: -1, startTime: 1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({ message: 'Error fetching customer bookings' });
  }
});

module.exports = router;