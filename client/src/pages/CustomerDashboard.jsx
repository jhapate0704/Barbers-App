import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Scissors } from 'lucide-react';

import Sidebar from './CustomerDashboard/Sidebar';
import Header from './CustomerDashboard/Header';
import StatsCards from './CustomerDashboard/StatsCards';
import RescheduleRequests from './CustomerDashboard/RescheduleRequests';
import BookingsTab from './CustomerDashboard/BookingsTab';
import HistoryTab from './CustomerDashboard/HistoryTab';
import ProfileTab from './CustomerDashboard/ProfileTab';
import RateModal from './CustomerDashboard/RateModal';

const API_BASE = import.meta.env.VITE_API_URL;
const socket = io(import.meta.env.VITE_SOCKET_URL);

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [queuePositions, setQueuePositions] = useState({});
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingSalonId, setRatingSalonId] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const [activeTab, setActiveTab] = useState(() => {
    const saved = sessionStorage.getItem('trimSync_customerActiveTab');
    if (saved) {
      sessionStorage.removeItem('trimSync_customerActiveTab');
      return saved;
    }
    return 'bookings';
  });
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeProfileSection, setActiveProfileSection] = useState('my-profile');

  const customerId = localStorage.getItem('customerId');
  const customerName = localStorage.getItem('customerName') || 'Customer';

  useEffect(() => {
    if (!customerId) {
      navigate('/login');
    }
  }, [customerId, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/bookings/customer/${customerId}`);
      const fetchedBookings = Array.isArray(res.data.bookings) ? res.data.bookings : (Array.isArray(res.data) ? res.data : []);
      setBookings(fetchedBookings);
      calculateQueuePositions(fetchedBookings);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bookings. Make sure the backend is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchBookings();
      const handleQueueUpdate = () => { fetchBookings(); };
      socket.on('queue_updated', handleQueueUpdate);
      return () => { socket.off('queue_updated', handleQueueUpdate); };
    }
  }, [customerId]);

  useEffect(() => {
    const handleProfileTabEvent = () => setActiveTab('profile');
    const handleBookingsTabEvent = () => setActiveTab('bookings');
    window.addEventListener('customer_profile_tab_click', handleProfileTabEvent);
    window.addEventListener('customer_bookings_tab_click', handleBookingsTabEvent);
    return () => {
      window.removeEventListener('customer_profile_tab_click', handleProfileTabEvent);
      window.removeEventListener('customer_bookings_tab_click', handleBookingsTabEvent);
    };
  }, []);

  const calculateQueuePositions = async (allBookings) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysActiveBookings = allBookings.filter(b => {
      if (!b.appointmentDate) return false;
      const d = new Date(b.appointmentDate);
      if (isNaN(d.getTime())) return false;
      return b.status === 'scheduled' && d.toISOString().split('T')[0] === todayStr;
    });
    const positions = {};
    for (const booking of todaysActiveBookings) {
      try {
        const salonIdVal = booking.salonId?._id || booking.salonId;
        if (!salonIdVal) continue;
        const res = await axios.get(`${API_BASE}/bookings/salon/${salonIdVal}`);
        const chairBookingsRaw = Array.isArray(res.data.bookings) ? res.data.bookings : (Array.isArray(res.data) ? res.data : []);
        if (chairBookingsRaw.length > 0) {
          const chairBookingsToday = chairBookingsRaw.filter(b => {
            if (!b.appointmentDate) return false;
            const d = new Date(b.appointmentDate);
            if (isNaN(d.getTime())) return false;
            return String(b.chairId) === String(booking.chairId) &&
              b.status === 'scheduled' &&
              d.toISOString().split('T')[0] === todayStr;
          });
          chairBookingsToday.sort((a, b) => a.startTime.localeCompare(b.startTime));
          const myIndex = chairBookingsToday.findIndex(b => String(b._id) === String(booking._id));
          if (myIndex !== -1) {
            positions[booking._id] = { position: myIndex + 1, peopleAhead: myIndex };
          }
        }
      } catch (err) {
        console.error('Error calculating queue position:', err);
      }
    }
    setQueuePositions(positions);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.put(`${API_BASE}/bookings/cancel`, { bookingId });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleRescheduleResponse = async (bookingId, response) => {
    try {
      await axios.put(`${API_BASE}/bookings/respond-reschedule`, { bookingId, response });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update reschedule choice.');
    }
  };

  const openRateModal = (booking) => {
    const salonIdVal = booking.salonId?._id || booking.salonId;
    setRatingSalonId(salonIdVal);
    const existingRating = booking.salonId?.ratings?.find(r => String(r.customerId) === String(customerId));
    if (existingRating) {
      setRatingVal(existingRating.rating);
      setReviewText(existingRating.reviewText || '');
    } else {
      setRatingVal(5);
      setReviewText('');
    }
    setShowRateModal(true);
  };

  const submitRating = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/salons/${ratingSalonId}/rate`, {
        customerId, customerName, rating: ratingVal, reviewText
      });
      setShowRateModal(false);
      fetchBookings();
    } catch (err) {
      alert("Failed to submit rating");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-slate-700 font-sans pb-16 relative overflow-hidden bg-slate-50">
        <div className="absolute inset-0 z-0">
          <div className="absolute w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(139,92,246,0.12),transparent_70%)] -top-[180px] -left-[120px] rounded-full blur-[110px] pointer-events-none" />
        </div>
        <div className="max-w-6xl mx-auto px-5 pt-8 relative z-10 space-y-8 select-none pointer-events-none opacity-25">
          <div className="flex justify-between items-center pb-7 border-b border-indigo-100/60">
            <div className="space-y-3">
              <div className="h-4 bg-black/5 rounded-full w-28 animate-pulse" />
              <div className="h-8 bg-black/5 rounded-full w-56 animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-black/5 rounded-2xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-black/5 border border-indigo-100/60 rounded-3xl animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-6 bg-black/5 rounded-full w-40 animate-pulse" />
              <div className="h-56 bg-black/5 border border-indigo-100/60 rounded-3xl animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-6 bg-black/5 rounded-full w-24 animate-pulse" />
              <div className="h-72 bg-black/5 border border-indigo-100/60 rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-5 z-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 backdrop-blur-sm flex items-center justify-center">
              <Scissors size={20} className="text-violet-500" />
            </div>
          </div>
          <p className="text-slate-500 text-[11px] tracking-[0.3em] uppercase font-semibold">Preparing your dashboard</p>
        </div>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => b.status === 'scheduled');
  const pastBookings = bookings.filter(b => b.status !== 'scheduled');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-16 relative overflow-x-hidden bg-slate-50 font-['Plus_Jakarta_Sans','Inter',sans-serif]">
      {/* Background Orbs */}
      <div className="fixed w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_70%)] -top-[180px] -left-[120px] rounded-full blur-[110px] pointer-events-none z-0 animate-pulse duration-[12000ms]" />
      <div className="fixed w-[480px] h-[480px] bg-[radial-gradient(circle,rgba(217,70,239,0.18),transparent_70%)] -bottom-[160px] -right-[140px] rounded-full blur-[110px] pointer-events-none z-0 animate-pulse duration-[12000ms] delay-500" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-5 pt-8 relative z-10">
        <Header 
          customerName={customerName} 
          setMobileSidebarOpen={setMobileSidebarOpen} 
          fetchBookings={fetchBookings} 
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2.5 backdrop-blur-sm">
            <span className="shrink-0 font-bold">!</span> {error}
          </div>
        )}

        <RescheduleRequests bookings={bookings} handleRescheduleResponse={handleRescheduleResponse} />

        <StatsCards bookings={bookings} completedBookings={completedBookings} />

        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            mobileSidebarOpen={mobileSidebarOpen} 
            setMobileSidebarOpen={setMobileSidebarOpen}
            activeProfileSection={activeProfileSection}
            setActiveProfileSection={setActiveProfileSection}
            activeBookingsCount={activeBookings.length}
            pastBookingsCount={pastBookings.length}
          />

          <div className="flex-1 transition-all duration-300 ease-in-out w-full min-w-0">
            {activeTab === 'bookings' && (
              <BookingsTab 
                activeBookings={activeBookings} 
                queuePositions={queuePositions} 
                handleCancelBooking={handleCancelBooking} 
              />
            )}
            {activeTab === 'history' && (
              <HistoryTab 
                pastBookings={pastBookings} 
                openRateModal={openRateModal} 
              />
            )}
            {activeTab === 'profile' && (
              <ProfileTab 
                customerId={customerId} 
                activeProfileSection={activeProfileSection} 
              />
            )}
          </div>
        </div>
      </div>

      {showRateModal && (
        <RateModal 
          setShowRateModal={setShowRateModal} 
          submitRating={submitRating} 
          ratingVal={ratingVal} 
          setRatingVal={setRatingVal} 
          hoveredRating={hoveredRating} 
          setHoveredRating={setHoveredRating} 
          reviewText={reviewText} 
          setReviewText={setReviewText} 
        />
      )}
    </div>
  );
}
