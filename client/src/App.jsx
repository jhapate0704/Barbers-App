import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

// --- Page Components ---
import SuperAdminPanel from './pages/SuperAdminPanel';
import OwnerDashboard from './pages/OwnerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

// --- Utility functions ---
import { formatTo12Hr } from './utils/formatTo12Hr';
import { formatRangeTo12Hr } from './utils/formatRangeTo12Hr';
import { getAverageRating } from './utils/getAverageRating';

// --- Route guards (High-Order Components) to protect specific routes based on user role ---
import ProtectedRoute from './components/ProtectedRoute'; // For salon owners
import AdminRoute from './components/AdminRoute'; // For super admin
import CustomerRoute from './components/CustomerRoute'; // For customers

// --- UI Components ---
import Navbar from './components/Navbar';
import CustomerProfileModal from './components/CustomerProfileModal';
import SalonCard from './components/SalonCard';
import SalonMap from './components/SalonMap';
import SalonCarousel from './components/SalonCarousel';
import HowItWorks from './components/HowItWorks';
import OwnerBanner from './components/OwnerBanner';
import StyleInspiration from './components/StyleInspiration';
import DrumColumn from './components/DrumColumn';
import Footer from './components/Footer';

// --- Main Views/Pages for the application ---
import MarketplaceView from './views/MarketplaceView'; // Home page showing all salons
import BookingView from './views/BookingView'; // Page for booking an appointment
import LoginView from './views/LoginView'; // User login page
import RegisterView from './views/RegisterView'; // Business registration page

// Load environment variables for backend API and WebSockets (Socket.io)
const API_BASE = import.meta.env.VITE_API_URL;
const socket = io(import.meta.env.VITE_SOCKET_URL);

export default function App() {
  // Navigation hook to programmatically switch routes (e.g., navigating to /login)
  const navigate = useNavigate();
  // Location hook to get current URL path
  const location = useLocation();

  // State to store the list of salons fetched from the backend
  const [salons, setSalons] = useState([]);

  // State to store the currently selected salon, initializing from localStorage if available
  const [selectedSalon, setSelectedSalon] = useState(() => {
    try {
      const saved = localStorage.getItem('trimSync_selectedSalon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  // State to store selected services for booking, initialized from localStorage
  const [selectedServices, setSelectedServices] = useState(() => {
    try {
      const saved = localStorage.getItem('trimSync_selectedServices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State to store the chosen appointment date, initialized from localStorage
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return localStorage.getItem('trimSync_appointmentDate') || '';
  });

  // State to store the chosen appointment start time, initialized from localStorage
  const [startTime, setStartTime] = useState(() => {
    return localStorage.getItem('trimSync_startTime') || '';
  });

  // State to store the selected barber chair for the booking, initialized from localStorage
  const [selectedChair, setSelectedChair] = useState(() => {
    return localStorage.getItem('trimSync_selectedChair') || '';
  });

  // State to display booking status or error messages
  const [bookingMessage, setBookingMessage] = useState({ text: '', type: '' });

  // -------------------------
  // LocalStorage Sync Effects
  // -------------------------
  
  // Sync the `selectedSalon` state to localStorage whenever it changes
  useEffect(() => {
    if (selectedSalon) {
      localStorage.setItem('trimSync_selectedSalon', JSON.stringify(selectedSalon));
    } else {
      localStorage.removeItem('trimSync_selectedSalon');
    }
  }, [selectedSalon]);

  // Sync `selectedServices` to localStorage
  useEffect(() => {
    localStorage.setItem('trimSync_selectedServices', JSON.stringify(selectedServices));
  }, [selectedServices]);

  // Sync `appointmentDate` to localStorage
  useEffect(() => {
    localStorage.setItem('trimSync_appointmentDate', appointmentDate);
  }, [appointmentDate]);

  // Sync `startTime` to localStorage
  useEffect(() => {
    localStorage.setItem('trimSync_startTime', startTime);
  }, [startTime]);

  // Sync `selectedChair` to localStorage
  useEffect(() => {
    localStorage.setItem('trimSync_selectedChair', selectedChair);
  }, [selectedChair]);

  // -------------------------
  // Customer Profile States
  // -------------------------
  // States to manage display name, avatar, and profile modal visibility
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [customerName, setCustomerName] = useState(localStorage.getItem('customerName') || 'Client');
  const [customerAvatar, setCustomerAvatar] = useState(localStorage.getItem('customerAvatar') || '');

  // -------------------------
  // Initial Data Fetching
  // -------------------------
  // Effect to fetch initial salons list and setup real-time socket listeners for queue updates
  useEffect(() => {
    // Fetch all salons from the API
    axios.get(`${API_BASE}/salons`).then(res => {
      setSalons(Array.isArray(res.data) ? res.data : (res.data.salons || []));
    }).catch(() => {});
    
    // Socket listener to update the real-time queue count when 'queue_updated' event fires
    const onUpdate = (data) => setSalons(prev => prev.map(s => s._id === data.salonId ? { ...s, currentQueue: data.newQueueCount } : s));
    socket.on('queue_updated', onUpdate);
    
    // Cleanup socket listener on component unmount
    return () => socket.off('queue_updated', onUpdate);
  }, []);

  // -------------------------
  // Event Handlers
  // -------------------------
  
  // Handler for when a user clicks 'Book' on a salon card
  const handleBook = (salon) => {
    // Add the salon to the 'recently viewed' list in localStorage
    try {
      let recent = JSON.parse(localStorage.getItem('trimSync_recentlyViewed')) || [];
      // Keep only unique IDs, limited to the 10 most recent
      recent = [salon._id, ...recent.filter(id => id !== salon._id)].slice(0, 10);
      localStorage.setItem('trimSync_recentlyViewed', JSON.stringify(recent));
    } catch(e) {}

    // Set all booking-related states for the selected salon
    setSelectedSalon(salon);
    setSelectedServices([]); 
    setAppointmentDate(''); 
    setStartTime('');
    
    // Auto-select the first chair if available
    if (salon.chairs?.length > 0) setSelectedChair(salon.chairs[0]._id);
    
    // Clear any previous booking messages
    setBookingMessage({ text: '', type: '' });
    
    // Navigate the user to the booking view
    navigate('/book');
  };

  // Handler function triggered when the user submits a booking form
  const submitBooking = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Ensure the customer is logged in; if not, redirect to login page
    const customerId = localStorage.getItem('customerId');
    if (!customerId) return navigate('/login');

    // Utility to get current local date and time strings for validation
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
    
    // Validate that an appointment date was selected
    if (!appointmentDate) {
      setBookingMessage({ text: 'Please select a valid appointment date.', type: 'error' });
      return;
    }

    // Attempt to parse the appointment date to verify it's valid
    let apptDateStr;
    try {
      const apptD = new Date(appointmentDate);
      if (isNaN(apptD.getTime())) throw new Error();
      apptDateStr = apptD.toISOString().split('T')[0];
    } catch (_) {
      setBookingMessage({ text: 'Invalid appointment date selected.', type: 'error' });
      return;
    }

    // Validate that the appointment date is not in the past
    if (apptDateStr < localNow.dateStr) {
      setBookingMessage({ text: 'Cannot book appointments for past dates.', type: 'error' });
      return;
    }
    
    // If the appointment is today, ensure the time is not in the past
    if (apptDateStr === localNow.dateStr && startTime < localNow.timeStr) {
      setBookingMessage({ text: 'Cannot book appointments for past times today.', type: 'error' });
      return;
    }

    // Set loading state
    setBookingMessage({ text: 'Booking...', type: 'loading' });
    try {
      // Send the booking request to the backend API
      const res = await axios.post(`${API_BASE}/bookings/create`, { 
        customerId, 
        salonId: selectedSalon._id, 
        chairId: selectedChair, 
        requestedServices: selectedServices, 
        appointmentDate, 
        startTime 
      });
      
      // Update message on success
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
      // Show error message if the API call fails
      setBookingMessage({ text: error.response?.data?.message || 'Error', type: 'error' });
    }
  };

  // Determine whether to hide the top navbar based on the current URL route (e.g., owner or admin panels)
  const hideNavbar = location.pathname.startsWith('/owner') || location.pathname.startsWith('/admin');

  return (
    // Main wrapper for the entire application, setting minimum height and background
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col overflow-x-hidden">
      
      {/* Conditionally render the Navbar if hideNavbar is false */}
      {!hideNavbar && (
        <Navbar 
          onProfileClick={() => {
            const customerId = localStorage.getItem('customerId');
            if (customerId) {
              // If logged in, set active tab to 'profile' and navigate to customer dashboard
              sessionStorage.setItem('trimSync_customerActiveTab', 'profile');
              navigate('/customer');
              window.dispatchEvent(new Event('customer_profile_tab_click'));
            } else {
              // Otherwise, send to login
              navigate('/login');
            }
          }} 
          customerName={customerName} 
          customerAvatar={customerAvatar} 
        />
      )} 
      
      {/* Main content area containing all the routes. Uses padding to prevent overlap with fixed navbar/footer */}
      <div className={`flex-1 ${hideNavbar ? "" : "px-4 md:px-6 pt-24 pb-20 md:pb-10"}`}>
        
        {/* React Router Definitions to map paths to specific view components */}
        <Routes>
          {/* Home Marketplace Route */}
          <Route path="/" element={<MarketplaceView salons={salons} onBook={handleBook} />} />
          
          {/* Booking View Route with all its state management props */}
          <Route path="/book" element={<BookingView 
            selectedSalon={selectedSalon} 
            selectedServices={selectedServices} 
            toggleService={s => setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} 
            selectedChair={selectedChair} 
            setSelectedChair={setSelectedChair} 
            appointmentDate={appointmentDate} 
            setAppointmentDate={setAppointmentDate} 
            startTime={startTime} 
            setStartTime={setStartTime} 
            onSubmit={submitBooking} 
            message={bookingMessage} 
          />} />
          
          {/* Login and Registration Routes */}
          <Route path="/login" element={<LoginView onLoginSuccess={(name, avatar) => { setCustomerName(name); setCustomerAvatar(avatar); }} />} />
          <Route path="/register" element={<RegisterView />} />
          
          {/* Protected Routes for specific user roles */}
          <Route path="/owner" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><SuperAdminPanel /></AdminRoute>} />
          <Route path="/customer" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
        </Routes>
      </div>

      {/* Conditionally render the Footer if hideNavbar is false */}
      {!hideNavbar && <Footer />}
    </div>
  );
}
