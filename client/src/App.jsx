import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

import SuperAdminPanel from './pages/SuperAdminPanel';
import OwnerDashboard from './pages/OwnerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

import { formatTo12Hr } from './utils/formatTo12Hr';
import { formatRangeTo12Hr } from './utils/formatRangeTo12Hr';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import CustomerRoute from './components/CustomerRoute';
import Navbar from './components/Navbar';
import CustomerProfileModal from './components/CustomerProfileModal';
import { getAverageRating } from './utils/getAverageRating';
import SalonCard from './components/SalonCard';
import SalonMap from './components/SalonMap';
import SalonCarousel from './components/SalonCarousel';
import HowItWorks from './components/HowItWorks';
import OwnerBanner from './components/OwnerBanner';
import StyleInspiration from './components/StyleInspiration';
import MarketplaceView from './views/MarketplaceView';
import DrumColumn from './components/DrumColumn';
import BookingView from './views/BookingView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import Footer from './components/Footer';

const API_BASE = "http://localhost:5000/api";
const socket = io("http://localhost:5000");

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(() => {
    try {
      const saved = localStorage.getItem('trimSync_selectedSalon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [selectedServices, setSelectedServices] = useState(() => {
    try {
      const saved = localStorage.getItem('trimSync_selectedServices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return localStorage.getItem('trimSync_appointmentDate') || '';
  });
  const [startTime, setStartTime] = useState(() => {
    return localStorage.getItem('trimSync_startTime') || '';
  });
  const [selectedChair, setSelectedChair] = useState(() => {
    return localStorage.getItem('trimSync_selectedChair') || '';
  });
  const [bookingMessage, setBookingMessage] = useState({ text: '', type: '' });

  // Sync to localStorage
  useEffect(() => {
    if (selectedSalon) {
      localStorage.setItem('trimSync_selectedSalon', JSON.stringify(selectedSalon));
    } else {
      localStorage.removeItem('trimSync_selectedSalon');
    }
  }, [selectedSalon]);

  useEffect(() => {
    localStorage.setItem('trimSync_selectedServices', JSON.stringify(selectedServices));
  }, [selectedServices]);

  useEffect(() => {
    localStorage.setItem('trimSync_appointmentDate', appointmentDate);
  }, [appointmentDate]);

  useEffect(() => {
    localStorage.setItem('trimSync_startTime', startTime);
  }, [startTime]);

  useEffect(() => {
    localStorage.setItem('trimSync_selectedChair', selectedChair);
  }, [selectedChair]);

  // Customer Profile states
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [customerName, setCustomerName] = useState(localStorage.getItem('customerName') || 'Client');
  const [customerAvatar, setCustomerAvatar] = useState(localStorage.getItem('customerAvatar') || '');

  useEffect(() => {
    axios.get(`${API_BASE}/salons`).then(res => {
      setSalons(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
    const onUpdate = (data) => setSalons(prev => prev.map(s => s._id === data.salonId ? { ...s, currentQueue: data.newQueueCount } : s));
    socket.on('queue_updated', onUpdate);
    return () => socket.off('queue_updated', onUpdate);
  }, []);

  const handleBook = (salon) => {
    // Add to recently viewed
    try {
      let recent = JSON.parse(localStorage.getItem('trimSync_recentlyViewed')) || [];
      recent = [salon._id, ...recent.filter(id => id !== salon._id)].slice(0, 10);
      localStorage.setItem('trimSync_recentlyViewed', JSON.stringify(recent));
    } catch(e) {}

    setSelectedSalon(salon);
    setSelectedServices([]); setAppointmentDate(''); setStartTime('');
    if (salon.chairs?.length > 0) setSelectedChair(salon.chairs[0]._id);
    setBookingMessage({ text: '', type: '' });
    navigate('/book');
  };

  const submitBooking = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const customerId = localStorage.getItem('customerId');
    if (!customerId) return navigate('/login');

    const getLocalTime = () => {
      const d = new Date();
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - (offset * 60 * 1000));
      return {
        dateStr: local.toISOString().split('T')[0],
        timeStr: local.toISOString().split('T')[1].substring(0, 5)
      };
    };

    const localNow = getLocalTime();
    if (!appointmentDate) {
      setBookingMessage({ text: 'Please select a valid appointment date.', type: 'error' });
      return;
    }

    let apptDateStr;
    try {
      const apptD = new Date(appointmentDate);
      if (isNaN(apptD.getTime())) throw new Error();
      apptDateStr = apptD.toISOString().split('T')[0];
    } catch (_) {
      setBookingMessage({ text: 'Invalid appointment date selected.', type: 'error' });
      return;
    }

    if (apptDateStr < localNow.dateStr) {
      setBookingMessage({ text: 'Cannot book appointments for past dates.', type: 'error' });
      return;
    }
    if (apptDateStr === localNow.dateStr && startTime < localNow.timeStr) {
      setBookingMessage({ text: 'Cannot book appointments for past times today.', type: 'error' });
      return;
    }

    setBookingMessage({ text: 'Booking...', type: 'loading' });
    try {
      const res = await axios.post(`${API_BASE}/bookings/create`, { customerId, salonId: selectedSalon._id, chairId: selectedChair, requestedServices: selectedServices, appointmentDate, startTime });
      setBookingMessage({ text: `Success! Booked for ${res.data.booking.totalDuration} mins.`, type: 'success' });
      
      // Redirect to customer dashboard after a brief delay so they see the success message
      setTimeout(() => {
        setSelectedServices([]);
        setAppointmentDate('');
        setStartTime('');
        setBookingMessage({ text: '', type: '' });
        navigate('/customer');
      }, 1500);
    } catch (error) {
      setBookingMessage({ text: error.response?.data?.message || 'Error', type: 'error' });
    }
  };

  const hideNavbar = location.pathname.startsWith('/owner') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {!hideNavbar && (
        <Navbar 
          onProfileClick={() => {
            const customerId = localStorage.getItem('customerId');
            if (customerId) {
              sessionStorage.setItem('trimSync_customerActiveTab', 'profile');
              navigate('/customer');
              window.dispatchEvent(new Event('customer_profile_tab_click'));
            } else {
              navigate('/login');
            }
          }} 
          customerName={customerName} 
          customerAvatar={customerAvatar} 
        />
      )} 
      <div className={`flex-1 ${hideNavbar ? "" : "p-4 md:p-6"}`}>
        <Routes>
          <Route path="/" element={<MarketplaceView salons={salons} onBook={handleBook} />} />
          <Route path="/book" element={<BookingView selectedSalon={selectedSalon} selectedServices={selectedServices} toggleService={s => setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} selectedChair={selectedChair} setSelectedChair={setSelectedChair} appointmentDate={appointmentDate} setAppointmentDate={setAppointmentDate} startTime={startTime} setStartTime={setStartTime} onSubmit={submitBooking} message={bookingMessage} />} />
          <Route path="/login" element={<LoginView onLoginSuccess={(name, avatar) => { setCustomerName(name); setCustomerAvatar(avatar); }} />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/owner" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><SuperAdminPanel /></AdminRoute>} />
          <Route path="/customer" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
        </Routes>
      </div>

      {!hideNavbar && <Footer />}
    </div>
  );
}
