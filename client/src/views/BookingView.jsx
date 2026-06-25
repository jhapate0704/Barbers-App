import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

import { useBooking } from '../hooks/useBooking';
import { formatTo12Hr } from '../utils/formatTo12Hr';

import SalonMap from '../components/SalonMap';
import BookingHeader from '../components/Booking/BookingHeader';
import BookingGallery from '../components/Booking/BookingGallery';
import LiveShopFloor from '../components/Booking/LiveShopFloor';
import ServicesMenu from '../components/Booking/ServicesMenu';
import BookingWidget from '../components/Booking/BookingWidget';
import AboutSalon from '../components/Booking/AboutSalon';
import PortfolioGallery from '../components/Booking/PortfolioGallery';
import TopReviews from '../components/Booking/TopReviews';

const HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const AMPMS = ["AM", "PM"];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80"
];

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const convert12HrTo24Hr = (hr, min, ampmVal) => {
  let h = parseInt(hr, 10);
  if (ampmVal === 'PM' && h !== 12) h += 12;
  if (ampmVal === 'AM' && h === 12) h = 0;
  const hStr = String(h).padStart(2, '0');
  const mStr = String(min).padStart(2, '0');
  return `${hStr}:${mStr}`;
};

const convert24HrTo12HrParts = (time24) => {
  if (!time24 || !time24.includes(':')) {
    return { hour: '9', minute: '00', ampm: 'AM' };
  }
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const ampmVal = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return {
    hour: String(h),
    minute: mStr,
    ampm: ampmVal
  };
};

const getLocalDateString = (d) => {
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BookingView = ({ selectedSalon, selectedServices, toggleService, selectedChair, setSelectedChair, appointmentDate, setAppointmentDate, startTime, setStartTime, onSubmit, message }) => {
  const { allSalonBookings } = useBooking(selectedSalon);
  const navigate = useNavigate();

  const [bookingStep, setBookingStep] = useState('services');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [chosenBarberId, setChosenBarberId] = useState('any');
  const [currentTime, setCurrentTime] = useState(new Date());

  const chairsList = useMemo(() => selectedSalon?.chairs || [], [selectedSalon?.chairs]);
  const selectedChairObj = chairsList.find(c => String(c._id) === String(selectedChair));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedLocalDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const formattedLocalTime = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

  const initialParts = convert24HrTo12HrParts(startTime || "09:00");
  const [drumHour, setDrumHour] = useState(initialParts.hour);
  const [drumMinute, setDrumMinute] = useState(initialParts.minute);
  const [drumAmpm, setDrumAmpm] = useState(initialParts.ampm);

  useEffect(() => {
    const parts = convert24HrTo12HrParts(startTime || "09:00");
    setDrumHour(parts.hour);
    setDrumMinute(parts.minute);
    setDrumAmpm(parts.ampm);
  }, [startTime]);

  useEffect(() => {
    const time24 = convert12HrTo24Hr(drumHour, drumMinute, drumAmpm);
    setStartTime(time24);
  }, [drumHour, drumMinute, drumAmpm]);

  const [timeAvailability, setTimeAvailability] = useState({ available: false, message: '', chairId: '' });

  if (!selectedSalon) return <Navigate to="/" replace />;

  const images = (selectedSalon.images && selectedSalon.images.length >= 2) ? selectedSalon.images : FALLBACK_IMAGES;

  const totalDuration = selectedServices.reduce((sum, name) => {
    const svc = selectedSalon.services.find(s => s.name === name);
    return sum + (svc ? svc.duration : 0);
  }, 0);

  const totalPrice = selectedServices.reduce((sum, name) => {
    const svc = selectedSalon.services.find(s => s.name === name);
    return sum + (svc ? svc.price : 0);
  }, 0);

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const todayBookings = useMemo(() => allSalonBookings.filter(b => {
    const bDateStr = new Date(b.appointmentDate).toISOString().split('T')[0];
    return bDateStr === todayStr && b.status === 'scheduled';
  }), [allSalonBookings, todayStr]);

  const selectedDateBookings = useMemo(() => allSalonBookings.filter(b => {
    const bDateStr = new Date(b.appointmentDate).toISOString().split('T')[0];
    return bDateStr === (appointmentDate || todayStr) && b.status === 'scheduled';
  }), [allSalonBookings, appointmentDate, todayStr]);

  const openTime = selectedSalon.operatingHours?.open || "09:00";
  const closeTime = selectedSalon.operatingHours?.close || "21:00";

  const selectedDateObj = appointmentDate ? new Date(appointmentDate) : null;
  const isWeeklyOff = selectedDateObj && selectedDateObj.getDay() === selectedSalon.weeklyOffDay;
  const isSalonOffToday = selectedSalon.isOffToday && todayStr === (appointmentDate || '');
  const isSelectedToday = appointmentDate === todayStr;
  const currentTotalMins = new Date().getHours() * 60 + new Date().getMinutes();

  useEffect(() => {
    if (!startTime || !appointmentDate || selectedServices.length === 0) {
      setTimeAvailability({ available: false, message: 'Please select services first.', chairId: '' });
      setSelectedChair('');
      return;
    }

    const time24 = startTime;
    const duration = totalDuration;

    if (time24 < openTime || time24 > closeTime) {
      setTimeAvailability({ available: false, message: `Closed. Salon is only open between ${formatTo12Hr(openTime)} and ${formatTo12Hr(closeTime)}.`, chairId: '' });
      setSelectedChair('');
      return;
    }

    if (isWeeklyOff) {
      setTimeAvailability({ available: false, message: 'Closed today (Weekly Off Day).', chairId: '' });
      setSelectedChair('');
      return;
    }

    if (isSalonOffToday) {
      setTimeAvailability({ available: false, message: 'Closed today (Off Duty).', chairId: '' });
      setSelectedChair('');
      return;
    }

    const isPast = isSelectedToday && timeToMinutes(time24) <= currentTotalMins + 15;
    if (isPast) {
      setTimeAvailability({ available: false, message: 'Cannot book slots in the past.', chairId: '' });
      setSelectedChair('');
      return;
    }

    const startMin = timeToMinutes(time24);
    const endMin = startMin + duration;

    if (chosenBarberId === 'any') {
      let foundChairId = null;
      for (const chair of chairsList) {
        const hasConflict = selectedDateBookings.some(b => {
          if (String(b.chairId) !== String(chair._id)) return false;
          const bStart = timeToMinutes(b.startTime);
          const bEnd = timeToMinutes(b.endTime);
          return (
            (startMin >= bStart && startMin < bEnd) ||
            (endMin > bStart && endMin <= bEnd) ||
            (startMin <= bStart && endMin >= bEnd)
          );
        });
        if (!hasConflict) {
          foundChairId = chair._id;
          break;
        }
      }

      if (foundChairId) {
        setTimeAvailability({ available: true, message: 'Available! Any professional is ready. ✓', chairId: foundChairId });
        setSelectedChair(foundChairId);
      } else {
        setTimeAvailability({ available: false, message: 'Fully booked. No professionals are free for this slot.', chairId: '' });
        setSelectedChair('');
      }
    } else {
      const selectedChairObj = chairsList.find(c => String(c._id) === String(chosenBarberId));
      if (!selectedChairObj) {
        setTimeAvailability({ available: false, message: 'Barber not found.', chairId: '' });
        setSelectedChair('');
        return;
      }

      const hasConflict = selectedDateBookings.some(b => {
        if (String(b.chairId) !== String(chosenBarberId)) return false;
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return (
          (startMin >= bStart && startMin < bEnd) ||
          (endMin > bStart && endMin <= bEnd) ||
          (startMin <= bStart && endMin >= bEnd)
        );
      });

      if (!hasConflict) {
        setTimeAvailability({ available: true, message: `Available! ${selectedChairObj.name} is ready. ✓`, chairId: chosenBarberId });
        setSelectedChair(chosenBarberId);
      } else {
        setTimeAvailability({ available: false, message: `Occupied. ${selectedChairObj.name} is busy at this slot.`, chairId: '' });
        setSelectedChair('');
      }
    }
  }, [startTime, appointmentDate, chosenBarberId, allSalonBookings, selectedSalon, totalDuration, chairsList, openTime, closeTime, isWeeklyOff, isSalonOffToday, isSelectedToday, currentTotalMins, selectedDateBookings, setSelectedChair]);

  const next7Days = [];
  const tempToday = new Date();
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(tempToday);
    nextDay.setDate(tempToday.getDate() + i);
    next7Days.push(nextDay);
  }

  const getFormattedConfirmDate = () => {
    if (!appointmentDate) return '';
    const dateObj = new Date(appointmentDate);
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <BookingHeader selectedSalon={selectedSalon} navigate={navigate} />
      <BookingGallery images={images} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
        <div className="lg:col-span-2 space-y-8">
          <SalonMap 
            latitude={selectedSalon.latitude}
            longitude={selectedSalon.longitude}
            address={selectedSalon.address}
            salonName={selectedSalon.name}
          />
          <LiveShopFloor 
            todayBookings={todayBookings} 
            formattedLocalDate={formattedLocalDate} 
            formattedLocalTime={formattedLocalTime} 
          />
          <ServicesMenu 
            selectedSalon={selectedSalon} 
            selectedServices={selectedServices} 
            toggleService={toggleService} 
          />
        </div>

        <div className="lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:sticky lg:top-22.5 w-full">
          <BookingWidget
            selectedSalon={selectedSalon}
            selectedServices={selectedServices}
            totalDuration={totalDuration}
            totalPrice={totalPrice}
            appointmentDate={appointmentDate}
            setAppointmentDate={setAppointmentDate}
            startTime={startTime}
            bookingStep={bookingStep}
            setBookingStep={setBookingStep}
            showCustomDatePicker={showCustomDatePicker}
            setShowCustomDatePicker={setShowCustomDatePicker}
            next7Days={next7Days}
            getLocalDateString={getLocalDateString}
            chosenBarberId={chosenBarberId}
            setChosenBarberId={setChosenBarberId}
            chairsList={chairsList}
            timeAvailability={timeAvailability}
            HOURS={HOURS}
            MINUTES={MINUTES}
            AMPMS={AMPMS}
            drumHour={drumHour}
            setDrumHour={setDrumHour}
            drumMinute={drumMinute}
            setDrumMinute={setDrumMinute}
            drumAmpm={drumAmpm}
            setDrumAmpm={setDrumAmpm}
            onSubmit={onSubmit}
            message={message}
            getFormattedConfirmDate={getFormattedConfirmDate}
            selectedChairObj={selectedChairObj}
            todayStr={todayStr}
          />
        </div>

        <div className="lg:col-span-2 lg:col-start-1 space-y-8 w-full">
          <AboutSalon about={selectedSalon.about} />
          <PortfolioGallery portfolio={selectedSalon.portfolio} />
          <TopReviews ratings={selectedSalon.ratings} />
        </div>
      </div>
    </div>
  );
};

export default BookingView;
