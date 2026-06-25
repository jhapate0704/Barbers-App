const Booking = require('../models/booking_models.js');
const Salon = require('../models/salon_models.js');

const calculateTotalDuration = (salonServices, requestedServiceNames) => {
  let totalTime = 0;
  requestedServiceNames.forEach(reqServiceName => {
    const service = salonServices.find(s => s.name === reqServiceName);
    if (service) totalTime += service.duration;
  });
  return totalTime;
};

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

const decrementQueue = async (salonId, io) => {
  const updatedSalon = await Salon.findByIdAndUpdate(
    salonId,
    { $inc: { currentQueue: -1 } },
    { returnDocument: 'after' }
  );

  if (updatedSalon.currentQueue < 0) {
    updatedSalon.currentQueue = 0;
    await updatedSalon.save();
  }

  if (io) {
    io.emit('queue_updated', { salonId: updatedSalon._id, newQueueCount: updatedSalon.currentQueue });
  }
  return updatedSalon;
};

const shiftUpcomingBookings = async (salonId, chairId, appointmentDate, originalStartTime, diff) => {
  const upcomingBookings = await Booking.find({
    salonId,
    chairId,
    appointmentDate,
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
  return upcomingBookings.length;
};

module.exports = {
  calculateTotalDuration,
  addMinutes,
  timeToMinutes,
  minutesToTime,
  getLocalServerTime,
  decrementQueue,
  shiftUpcomingBookings
};
