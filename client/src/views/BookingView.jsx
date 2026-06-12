import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  Scissors, MapPin, Clock, History, CheckCircle, ArrowLeft, Phone, User, LogOut,
  Users, AlertCircle, Lock, ShieldAlert, Building2, Activity, Search, Menu, Home, Store,
  X, LayoutDashboard, Heart, Share2, Star, Mail, Eye, EyeOff, Map, ExternalLink, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

const API_BASE = "http://localhost:5000/api";

import SalonMap from '../components/SalonMap';
import DrumColumn from '../components/DrumColumn';
import { formatTo12Hr } from '../utils/formatTo12Hr';
import { formatRangeTo12Hr } from '../utils/formatRangeTo12Hr';
import { getAverageRating } from '../utils/getAverageRating';

const socket = io("http://localhost:5000");

const HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const AMPMS = ["AM", "PM"];

const BookingView = ({ selectedSalon, selectedServices, toggleService, selectedChair, setSelectedChair, appointmentDate, setAppointmentDate, startTime, setStartTime, onSubmit, message }) => {
  const [allSalonBookings, setAllSalonBookings] = useState([]);
  const [bookingStep, setBookingStep] = useState('services'); // 'services', 'time', 'confirm'
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [chosenBarberId, setChosenBarberId] = useState('any'); // 'any' or a specific chairId
  const [currentTime, setCurrentTime] = useState(new Date());
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [portfolioLightboxIndex, setPortfolioLightboxIndex] = useState(null);
  const navigate = useNavigate();

  const chairsList = selectedSalon?.chairs || [];
  const selectedChairObj = chairsList.find(c => String(c._id) === String(selectedChair));

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

  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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

  // Keep live floor clock ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedLocalDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const formattedLocalTime = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

  // Fetch all salon bookings and bind Socket updates
  const fetchBookings = React.useCallback(() => {
    if (selectedSalon) {
      axios.get(`${API_BASE}/bookings/salon/${selectedSalon._id}`).then(res => {
        if (Array.isArray(res.data)) {
          setAllSalonBookings(res.data);
        }
      }).catch(() => {});
    }
  }, [selectedSalon]);

  useEffect(() => {
    fetchBookings();
    socket.on('queue_updated', fetchBookings);
    return () => {
      socket.off('queue_updated', fetchBookings);
    };
  }, [selectedSalon, fetchBookings]);

  // Drum Picker sub-states (controlled by scroll updates on start time)
  const initialParts = convert24HrTo12HrParts(startTime || "09:00");
  const [drumHour, setDrumHour] = useState(initialParts.hour);
  const [drumMinute, setDrumMinute] = useState(initialParts.minute);
  const [drumAmpm, setDrumAmpm] = useState(initialParts.ampm);

  // Sync drum picker values when startTime prop changes from outside (e.g. cleared)
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

  if (!selectedSalon) return <Navigate to="/" replace />;

  const images = (selectedSalon.images && selectedSalon.images.length >= 2) 
    ? selectedSalon.images 
    : FALLBACK_IMAGES;

  const totalDuration = selectedServices.reduce((sum, name) => {
    const svc = selectedSalon.services.find(s => s.name === name);
    return sum + (svc ? svc.duration : 0);
  }, 0);

  const totalPrice = selectedServices.reduce((sum, name) => {
    const svc = selectedSalon.services.find(s => s.name === name);
    return sum + (svc ? svc.price : 0);
  }, 0);

  const getLocalDateString = (d) => {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Group bookings by dates for live occupancy and time validations
  const todayStr = getLocalDateString(new Date());
  const todayBookings = allSalonBookings.filter(b => {
    const bDateStr = new Date(b.appointmentDate).toISOString().split('T')[0];
    return bDateStr === todayStr && b.status === 'scheduled';
  });

  const selectedDateBookings = allSalonBookings.filter(b => {
    const bDateStr = new Date(b.appointmentDate).toISOString().split('T')[0];
    return bDateStr === (appointmentDate || todayStr) && b.status === 'scheduled';
  });

  const openTime = selectedSalon.operatingHours?.open || "09:00";
  const closeTime = selectedSalon.operatingHours?.close || "21:00";

  // Helpers for time picker validation
  const selectedDateObj = appointmentDate ? new Date(appointmentDate) : null;
  const isWeeklyOff = selectedDateObj && selectedDateObj.getDay() === selectedSalon.weeklyOffDay;
  const isSalonOffToday = selectedSalon.isOffToday && todayStr === (appointmentDate || '');
  const isSelectedToday = appointmentDate === todayStr;
  const currentTotalMins = new Date().getHours() * 60 + new Date().getMinutes();

  // Dynamic Availability check state
  const [timeAvailability, setTimeAvailability] = useState({ available: false, message: '', chairId: '' });

  useEffect(() => {
    if (!startTime || !appointmentDate || selectedServices.length === 0) {
      setTimeAvailability({ available: false, message: 'Please select services first.', chairId: '' });
      setSelectedChair('');
      return;
    }

    const time24 = startTime;
    const duration = totalDuration;

    // 1. Operating hours check
    if (time24 < openTime || time24 > closeTime) {
      setTimeAvailability({
        available: false,
        message: `Closed. Salon is only open between ${formatTo12Hr(openTime)} and ${formatTo12Hr(closeTime)}.`,
        chairId: ''
      });
      setSelectedChair('');
      return;
    }

    // 2. Weekly off day check
    if (isWeeklyOff) {
      setTimeAvailability({ available: false, message: 'Closed today (Weekly Off Day).', chairId: '' });
      setSelectedChair('');
      return;
    }

    // 3. Special off day check
    if (isSalonOffToday) {
      setTimeAvailability({ available: false, message: 'Closed today (Off Duty).', chairId: '' });
      setSelectedChair('');
      return;
    }

    // 4. Past time check
    const isPast = isSelectedToday && timeToMinutes(time24) <= currentTotalMins + 15;
    if (isPast) {
      setTimeAvailability({ available: false, message: 'Cannot book slots in the past.', chairId: '' });
      setSelectedChair('');
      return;
    }

    // 5. Chair Availability
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
        setTimeAvailability({
          available: true,
          message: 'Available! Any professional is ready. ✓',
          chairId: foundChairId
        });
        setSelectedChair(foundChairId);
      } else {
        setTimeAvailability({
          available: false,
          message: 'Fully booked. No professionals are free for this slot.',
          chairId: ''
        });
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
        setTimeAvailability({
          available: true,
          message: `Available! ${selectedChairObj.name} is ready. ✓`,
          chairId: chosenBarberId
        });
        setSelectedChair(chosenBarberId);
      } else {
        setTimeAvailability({
          available: false,
          message: `Occupied. ${selectedChairObj.name} is busy at this slot.`,
          chairId: ''
        });
        setSelectedChair('');
      }
    }
  }, [startTime, appointmentDate, chosenBarberId, allSalonBookings, selectedSalon, totalDuration]);

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
      {/* 1. Header Section */}
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="flex items-center text-gray-500 hover:text-black mb-4 transition-colors text-sm font-medium">
          <ArrowLeft size={16} className="mr-2" /> Back to Marketplace
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{selectedSalon.name}</h1>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm text-gray-600">
          {/* Average Rating */}
          <div className="flex items-center">
            <Star className="text-amber-500 fill-amber-500 mr-1 shrink-0" size={16} />
            <span className="font-bold text-gray-800 mr-1">
              {getAverageRating(selectedSalon.ratings) || "New"}
            </span>
            <span className="text-gray-400">
              {selectedSalon.ratings?.length > 0 ? `(${selectedSalon.ratings.length} reviews)` : "(No reviews)"}
            </span>
          </div>

          {/* Operating Hours */}
          <div className="flex items-center">
            <Clock className="text-indigo-500 mr-1.5 shrink-0" size={16} />
            <span>Open today: {formatTo12Hr(selectedSalon.operatingHours?.open)} - {formatTo12Hr(selectedSalon.operatingHours?.close)}</span>
          </div>

          {/* Address */}
          <div className="flex items-center">
            <MapPin className="text-red-500 mr-1.5 shrink-0" size={16} />
            <span className="truncate max-w-sm md:max-w-md">{selectedSalon.address}</span>
          </div>
        </div>
      </div>

      {/* 2. Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-60 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-sm">
        <div className="col-span-1 md:col-span-2 h-full overflow-hidden">
          <img src={images[0]} alt="Salon space main" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-3 h-full overflow-hidden">
          <div className="overflow-hidden h-full">
            <img src={images[1]} alt="Salon detail" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
          </div>
          <div className="overflow-hidden h-full">
            <img src={images[2]} alt="Salon ambiance" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
          </div>
        </div>
      </div>

      {/* 3. Main Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
        
        {/* Left Column: Live Shop Floor (Top) + Services Menu (Bottom) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Salon Map Section */}
          <SalonMap 
            latitude={selectedSalon.latitude}
            longitude={selectedSalon.longitude}
            address={selectedSalon.address}
            salonName={selectedSalon.name}
          />
          
          {/* Live Shop Floor */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
              <div className="flex items-center gap-2.5">
                <Activity className="text-indigo-600 animate-pulse" size={24} />
                <h3 className="text-lg font-bold text-gray-900">Live Shop Floor</h3>
              </div>
              <p className="text-xs text-gray-500 font-semibold">
                {formattedLocalDate} • <span className="text-indigo-600 font-bold">{formattedLocalTime}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayBookings.length === 0 ? (
                <div className="col-span-full bg-white p-6 rounded-xl border border-gray-100 text-center shadow-sm">
                  <CheckCircle className="mx-auto text-green-500 mb-2" />
                  <p className="font-bold text-gray-800 text-sm">Shop is Wide Open today!</p>
                </div>
              ) : (
                todayBookings.map((b, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-xs md:text-sm font-bold text-gray-800">
                        {formatTo12Hr(b.startTime)} - {formatTo12Hr(b.endTime)}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">Duration: {b.totalDuration} mins</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Occupied
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1 font-semibold">{b.chairName}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Services Menu */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Scissors size={20} className="text-indigo-600" />
                Services Menu
              </h2>
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <label htmlFor="service-search-input" className="sr-only">Search services</label>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="service-search-input"
                  name="serviceSearch"
                  type="text"
                  placeholder="Search services..."
                  value={serviceSearchQuery}
                  onChange={e => setServiceSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 font-semibold shadow-sm"
                />
                {serviceSearchQuery && (
                  <button
                    onClick={() => setServiceSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-[10px]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(() => {
                const filtered = (selectedSalon.services || []).filter(service =>
                  service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
                );
                if (filtered.length === 0) {
                  return (
                    <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">No services match your search.</p>
                    </div>
                  );
                }
                return filtered.map(service => {
                  const isSelected = selectedServices.includes(service.name);
                  return (
                    <div 
                      key={service._id} 
                      onClick={() => toggleService(service.name)}
                      className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                          : 'border-gray-150 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="font-bold text-gray-800 text-sm sm:text-base">{service.name}</span>
                        <span className="text-xs text-gray-400 font-semibold">{service.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-extrabold text-gray-900 text-sm sm:text-base">₹{service.price}</span>
                        <button 
                          type="button"
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                            isSelected 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {isSelected ? 'Added ✓' : 'Add +'}
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

                  </div>

{/* Right Column: Sticky Booking Widget (40% / col-span-1) */}
        <div className="lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:sticky lg:top-22.5 w-full">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl relative max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            <div className="h-1.5 bg-linear-to-r from-indigo-500 to-fuchsia-500" />
            
            {/* Step Indicators */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking Stage</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bookingStep === 'services' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>Services</span>
                <span className="text-xs text-gray-300">➔</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bookingStep === 'time' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>Time</span>
                <span className="text-xs text-gray-300">➔</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bookingStep === 'confirm' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>Confirm</span>
              </div>
            </div>

            <div className="p-6">
              {/* STEP 1: SERVICES SUMMARY */}
              {bookingStep === 'services' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">Select Services</h3>
                    <p className="text-xs text-gray-400">Choose the treatments you want to book.</p>
                  </div>

                  {selectedServices.length === 0 ? (
                    <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 px-4">
                      <Scissors size={28} className="mx-auto text-gray-300 mb-2.5" />
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">Select one or more services from the list on the left to start booking.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="max-h-40 overflow-y-auto pr-1 space-y-2">
                        {selectedServices.map(name => {
                          const svc = selectedSalon.services.find(s => s.name === name);
                          return (
                            <div key={name} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                              <div className="font-medium text-gray-700 truncate mr-2">{name}</div>
                              <div className="font-bold text-gray-900 shrink-0">₹{svc?.price}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Duration</span>
                          <span className="text-sm font-bold text-gray-700">{totalDuration} mins</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Price</span>
                          <span className="text-lg font-extrabold text-indigo-600">₹{totalPrice}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!appointmentDate) {
                            setAppointmentDate(todayStr);
                          }
                          setBookingStep('time');
                        }}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-lg"
                      >
                        Choose Date & Time ➔
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: TIME & BARBER SELECTION */}
              {bookingStep === 'time' && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-0.5">Select Professional & Time</h3>
                      <p className="text-[10px] text-gray-400 font-semibold">Customize your appointment scheduling.</p>
                    </div>
                    <button 
                      onClick={() => setBookingStep('services')} 
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-500"
                    >
                      Change Services
                    </button>
                  </div>

                  {/* Visual 7-day selector */}
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">1. Choose Date</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                      {next7Days.map((date, idx) => {
                        const dateStr = getLocalDateString(date);
                        const isSelected = appointmentDate === dateStr;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setAppointmentDate(dateStr);
                            }}
                            className={`flex flex-col items-center py-2.5 px-3 rounded-xl border cursor-pointer min-w-14 text-center select-none transition-all active:scale-95 ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                                : 'border-gray-200 bg-white hover:border-indigo-400 text-gray-700'
                            }`}
                          >
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-base font-extrabold leading-tight mt-0.5">
                              {date.getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1.5">
                      <button 
                        onClick={() => setShowCustomDatePicker(!showCustomDatePicker)} 
                        className="text-[10px] font-bold text-slate-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                      >
                        📅 {showCustomDatePicker ? "Hide custom picker" : "Pick another date..."}
                      </button>
                    </div>

                    {showCustomDatePicker && (
                      <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl mt-2">
                        <label htmlFor="appointment-date-picker" className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Select Specific Date</label>
                        <input 
                          id="appointment-date-picker"
                          name="appointmentDate"
                          type="date" 
                          min={todayStr} 
                          value={appointmentDate} 
                          onChange={e => {
                            setAppointmentDate(e.target.value);
                          }}
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-indigo-500" 
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. Choose Professional / Chair */}
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">2. Select Professional</span>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {/* Any Barber */}
                      <div
                        onClick={() => setChosenBarberId('any')}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer min-w-30 select-none transition-all active:scale-95 shrink-0 ${
                          chosenBarberId === 'any'
                            ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-bold'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          chosenBarberId === 'any' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Scissors size={14} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold leading-none">Any Barber</p>
                          <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Auto-assigns free</p>
                        </div>
                      </div>

                      {/* Specific Chairs */}
                      {(selectedSalon.chairs || []).map(chair => {
                        const isSelected = chosenBarberId === chair._id;
                        return (
                          <div
                            key={chair._id}
                            onClick={() => setChosenBarberId(chair._id)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer min-w-30 select-none transition-all active:scale-95 shrink-0 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-bold'
                                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {chair.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-xs font-bold leading-none truncate">{chair.name}</p>
                              <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Barber / Stylist</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Choose Time (Scrollable Drum Picker) */}
                  <div className="space-y-3">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">3. Choose Time</span>
                    
                    {/* Visual iOS/Android Drum Picker */}
                    <div className="relative flex justify-center items-center gap-2 bg-gray-50 border border-gray-150 rounded-2xl p-4 overflow-hidden h-33.75">
                      {/* Highlight Selection Indicator */}
                      <div className="absolute left-4 right-4 h-10 border-t border-b border-indigo-500/20 bg-indigo-500/5 rounded-xl pointer-events-none" />
                      
                      <DrumColumn options={HOURS} value={drumHour} onChange={setDrumHour} />
                      <span className="text-indigo-400 font-extrabold text-sm shrink-0 leading-none pb-1">:</span>
                      <DrumColumn options={MINUTES} value={drumMinute} onChange={setDrumMinute} />
                      <div className="w-1" />
                      <DrumColumn options={AMPMS} value={drumAmpm} onChange={setDrumAmpm} />
                      
                      {/* Translucent fade gradients */}
                      <div className="absolute top-0 left-0 right-0 h-10 bg-linear-to-b from-gray-50 to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-gray-50 to-transparent pointer-events-none" />
                    </div>

                    {/* Live Validation Alert feedback */}
                    <div className={`p-3 rounded-xl border text-xs font-bold text-center leading-relaxed transition-all ${
                      timeAvailability.available 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {timeAvailability.message}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex gap-2.5">
                    <button
                      onClick={() => setBookingStep('services')}
                      className="w-1/3 border border-gray-300 hover:border-black text-gray-800 font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98]"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setBookingStep('confirm')}
                      disabled={!timeAvailability.available}
                      className="w-2/3 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      Proceed to Confirm ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONFIRM & BOOK */}
              {bookingStep === 'confirm' && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 text-lg">Confirm Booking</h3>
                    <button 
                      onClick={() => setBookingStep('time')} 
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-500"
                    >
                      Change Date/Time
                    </button>
                  </div>

                  {/* Booking Receipt Summary */}
                  <div className="bg-gray-50 border border-gray-150 p-4 rounded-2xl space-y-3">
                    {/* Salon address */}
                    <div className="text-xs">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Venue</span>
                      <span className="font-bold text-gray-800 block">{selectedSalon.name}</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">{selectedSalon.address}</span>
                    </div>

                    {/* Appt date & time */}
                    <div className="text-xs border-t border-gray-200/60 pt-3">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Appointment Date & Time</span>
                      <span className="font-extrabold text-gray-900 block mt-0.5">
                        {getFormattedConfirmDate()}
                      </span>
                      <span className="text-indigo-600 font-extrabold block text-sm mt-0.5">
                        at {formatTo12Hr(startTime)}
                      </span>
                    </div>

                    {/* Professional */}
                    <div className="text-xs border-t border-gray-200/60 pt-3">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Professional</span>
                      <span className="font-bold text-gray-800 block mt-0.5">
                        {selectedChairObj ? selectedChairObj.name : 'Any Barber (Auto-assigned)'}
                      </span>
                    </div>

                    {/* Services list */}
                    <div className="text-xs border-t border-gray-200/60 pt-3 space-y-1.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Chosen Treatments</span>
                      {selectedServices.map(name => {
                        const svc = selectedSalon.services.find(s => s.name === name);
                        return (
                          <div key={name} className="flex justify-between items-center font-medium text-slate-600">
                            <span className="truncate mr-2">{name}</span>
                            <span className="text-gray-900 font-bold shrink-0">₹{svc?.price}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total summary */}
                    <div className="text-xs border-t border-gray-200 pt-3 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Total Duration</span>
                        <span className="font-bold text-slate-700 text-xs">{totalDuration} mins</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Total Investment</span>
                        <span className="font-extrabold text-indigo-600 text-lg">₹{totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-4 pt-1">
                    <button 
                      type="submit" 
                      className="w-full bg-linear-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-extrabold py-3.5 rounded-xl text-base transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                    >
                      Book Appointment Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingStep('time')}
                      className="w-full text-slate-500 hover:text-slate-800 text-xs font-bold text-center"
                    >
                      ➔ Back to Date & Time
                    </button>
                  </form>

                  {message.text && (
                    <div className={`p-3.5 rounded-xl border mt-3 text-xs font-medium text-center ${
                      message.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : message.type === 'loading'
                          ? 'bg-blue-50 border-blue-200 text-blue-800 animate-pulse'
                          : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      {message.text}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Left Column Part 2 */}
        <div className="lg:col-span-2 lg:col-start-1 space-y-8 w-full">
          {/* About Salon */}
          {selectedSalon.about && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Why Choose Us
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[15px]">
                {selectedSalon.about}
              </p>
            </div>
          )}

          {/* Our Work Skills (Portfolio Gallery) */}
          {selectedSalon.portfolio && selectedSalon.portfolio.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Salon Highlights
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedSalon.portfolio.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 border border-gray-200">
                    <img 
                      src={imgUrl} 
                      alt={`Portfolio image ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPortfolioLightboxIndex(idx); }}
                        className="bg-white/90 text-gray-900 font-bold px-4 py-2 rounded-full text-xs shadow-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:scale-105"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lightbox Modal for Portfolio */}
          {portfolioLightboxIndex !== null && selectedSalon.portfolio && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300" onClick={() => setPortfolioLightboxIndex(null)}>
              <button 
                onClick={(e) => { e.stopPropagation(); setPortfolioLightboxIndex(null); }}
                className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X size={24} />
              </button>
              
              <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
                {selectedSalon.portfolio.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPortfolioLightboxIndex((prev) => (prev > 0 ? prev - 1 : selectedSalon.portfolio.length - 1)); }}
                    className="absolute left-4 md:left-8 z-10 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all transform hover:scale-110"
                  >
                    <ChevronLeft size={32} />
                  </button>
                )}
                
                <img 
                  src={selectedSalon.portfolio[portfolioLightboxIndex]} 
                  alt={`Portfolio ${portfolioLightboxIndex + 1}`}
                  className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl animate-[fadeUp_0.3s_ease]"
                />
                
                {selectedSalon.portfolio.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPortfolioLightboxIndex((prev) => (prev < selectedSalon.portfolio.length - 1 ? prev + 1 : 0)); }}
                    className="absolute right-4 md:right-8 z-10 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all transform hover:scale-110"
                  >
                    <ChevronRight size={32} />
                  </button>
                )}
              </div>
              
              <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                <span className="text-white/80 bg-black/50 px-4 py-2 rounded-full text-sm font-semibold tracking-wide backdrop-blur-md">
                  {portfolioLightboxIndex + 1} / {selectedSalon.portfolio.length}
                </span>
              </div>
            </div>
          )}

          {/* Top Rated Reviews */}
          {selectedSalon.ratings && selectedSalon.ratings.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Top Rated Reviews
              </h3>
              <div className="flex flex-col gap-4">
                {[...selectedSalon.ratings]
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 5)
                  .map((review, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                        {review.customerName?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900">{review.customerName || 'Customer'}</span>
                          <div className="flex items-center text-amber-400 text-xs gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < (review.rating || 5) ? '★' : '☆'}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          "{review.reviewText || 'Excellent service and great atmosphere. Highly recommended!'}"
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}

        </div>

              </div>

    </div>
  );
};


export default BookingView;
