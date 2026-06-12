import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Scissors, Calendar, Clock, MapPin, ArrowLeft, LogOut, CheckCircle,
  XCircle, AlertCircle, ShoppingBag, Landmark, Activity, RefreshCw, Star,
  Settings, User, Lock, Eye, EyeOff, HelpCircle, Shield
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api";
const socket = io("http://localhost:5000");

const formatTo12Hr = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mFormatted = String(m).padStart(2, '0');
  return `${h12}:${mFormatted} ${ampm}`;
};

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
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = sessionStorage.getItem('trimSync_customerActiveTab');
    if (saved) {
      sessionStorage.removeItem('trimSync_customerActiveTab');
      return saved;
    }
    return 'bookings';
  });
  
  // Profile & Settings States
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'India',
    hairType: '',
    beardStyle: '',
    notifications: { email: true, sms: true },
    avatar: ''
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeProfileSection, setActiveProfileSection] = useState('my-profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' });
  const [supportSuccess, setSupportSuccess] = useState(false);

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
      const fetchedBookings = Array.isArray(res.data) ? res.data : [];
      setBookings(fetchedBookings);
      calculateQueuePositions(fetchedBookings);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bookings. Make sure the backend is running.');
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/${customerId}`);
      if (res.data) {
        setProfileData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          country: res.data.country || 'India',
          hairType: res.data.hairType || '',
          beardStyle: res.data.beardStyle || '',
          notifications: res.data.notifications || { email: true, sms: true },
          avatar: res.data.avatar || ''
        });
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchBookings();
      fetchUserProfile();
      const handleQueueUpdate = () => { fetchBookings(); };
      socket.on('queue_updated', handleQueueUpdate);
      return () => { socket.off('queue_updated', handleQueueUpdate); };
    }
  }, [customerId]);

  useEffect(() => {
    const handleProfileTabEvent = () => {
      setActiveTab('profile');
    };
    const handleBookingsTabEvent = () => {
      setActiveTab('bookings');
    };
    window.addEventListener('customer_profile_tab_click', handleProfileTabEvent);
    window.addEventListener('customer_bookings_tab_click', handleBookingsTabEvent);
    return () => {
      window.removeEventListener('customer_profile_tab_click', handleProfileTabEvent);
      window.removeEventListener('customer_bookings_tab_click', handleBookingsTabEvent);
    };
  }, []);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);
    try {
      const payload = {
        userId: customerId,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        country: profileData.country,
        hairType: profileData.hairType,
        beardStyle: profileData.beardStyle,
        notifications: profileData.notifications,
        avatar: profileData.avatar
      };

      if (passwordForm.newPassword) {
        if (passwordForm.newPassword.length < 6) {
          setProfileError('New password must be at least 6 characters.');
          setSavingProfile(false);
          return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          setProfileError('Passwords do not match.');
          setSavingProfile(false);
          return;
        }
        payload.currentPassword = passwordForm.currentPassword;
        payload.newPassword = passwordForm.newPassword;
      }

      const res = await axios.post(`${API_BASE}/users/profile/update`, payload);
      setProfileSuccess('Profile updated successfully!');
      
      localStorage.setItem('customerName', res.data.user.name);
      localStorage.setItem('customerAvatar', res.data.user.avatar || '');
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
      setProfileData({
        name: res.data.user.name || '',
        email: res.data.user.email || '',
        phone: res.data.user.phone || '',
        country: res.data.user.country || 'India',
        hairType: res.data.user.hairType || '',
        beardStyle: res.data.user.beardStyle || '',
        notifications: res.data.user.notifications || { email: true, sms: true },
        avatar: res.data.user.avatar || ''
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportForm.subject || !supportForm.message) return;
    setSupportSuccess(true);
    setSupportForm({ subject: '', message: '' });
    setTimeout(() => {
      setSupportSuccess(false);
    }, 4000);
  };

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
        if (Array.isArray(res.data)) {
          const chairBookingsToday = res.data.filter(b => {
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
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.post(`${API_BASE}/bookings/cancel`, { bookingId });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerAvatar');
    navigate('/');
  };

  const handleRescheduleResponse = async (bookingId, response) => {
    try {
      await axios.post(`${API_BASE}/bookings/respond-reschedule`, { bookingId, response });
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

  const activeBookings = bookings.filter(b => b.status === 'scheduled');
  const pastBookings = bookings.filter(b => b.status !== 'scheduled').filter(b => {
    if (historyDateFilter) {
      const bDate = b.appointmentDate?.split('T')[0];
      if (bDate !== historyDateFilter) return false;
    }
    if (historySearchQuery.trim()) {
      const query = historySearchQuery.toLowerCase();
      const salonName = (b.salonId?.name || '').toLowerCase();
      const servicesStr = (b.services || []).map(s => s.name).join(' ').toLowerCase();
      const statusStr = (b.status || '').toLowerCase();
      if (!salonName.includes(query) && !servicesStr.includes(query) && !statusStr.includes(query)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.appointmentDate);
    const dateB = new Date(b.appointmentDate);
    if (dateB.getTime() !== dateA.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    return b.startTime.localeCompare(a.startTime);
  });
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum, b) =>
    sum + (b.services?.reduce((acc, s) => acc + s.price, 0) || 0), 0
  );

  const preferredSalon = () => {
    if (bookings.length === 0) return 'None';
    const counts = {};
    bookings.forEach(b => {
      const name = b.salonId?.name;
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'None';
  };

  if (loading) {
    return (
      <div className="min-h-screen text-slate-300 font-sans pb-16 relative overflow-hidden" style={{ background: '#07060f' }}>
        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes pulse{0%,100%{opacity:0.6} 50%{opacity:0.3}}
          .skeleton-pulse { animation: pulse 1.5s infinite ease-in-out; }
        `}</style>

        {/* Ambient background orbs */}
        <div style={{ content:'\'\'', position:'fixed', borderRadius:'50%', filter:'blur(110px)', pointerEvents:'none', zIndex:0, width:'520px', height:'520px', background:'radial-gradient(circle, rgba(139,92,246,.12), transparent 70%)', top:'-180px', left:'-120px' }} />

        {/* Dashboard Mockup Grid Skeleton */}
        <div className="max-w-6xl mx-auto px-5 pt-8 relative z-1 space-y-8 select-none pointer-events-none opacity-25">
          {/* Header */}
          <div className="flex justify-between items-center pb-7 border-b border-white/[0.06]">
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded-full w-28 skeleton-pulse" />
              <div className="h-8 bg-white/5 rounded-full w-56 skeleton-pulse" />
            </div>
            <div className="w-12 h-12 bg-white/5 rounded-2xl skeleton-pulse" />
          </div>

          {/* Stats Cards Mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/5 border border-white/[0.05] rounded-3xl skeleton-pulse" />
            ))}
          </div>

          {/* Main sections Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-6 bg-white/5 rounded-full w-40 skeleton-pulse" />
              <div className="h-56 bg-white/5 border border-white/[0.05] rounded-3xl skeleton-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-6 bg-white/5 rounded-full w-24 skeleton-pulse" />
              <div className="h-72 bg-white/5 border border-white/[0.05] rounded-3xl skeleton-pulse" />
            </div>
          </div>
        </div>

        {/* Loader Overlaid in center */}
        <div className="absolute inset-0 bg-[#07060f]/80 backdrop-blur-md flex flex-col items-center justify-center gap-5 z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-[spin_1s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full bg-linear-to-br from-violet-500/30 to-fuchsia-500/20 backdrop-blur-sm flex items-center justify-center">
              <Scissors size={20} className="text-violet-300" />
            </div>
          </div>
          <p className="text-slate-400 text-[11px] tracking-[0.3em] uppercase font-semibold">Preparing your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200 font-sans pb-16 relative overflow-hidden" style={{ background: '#07060f', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; background: #07060f; }
        .glass { background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .glass-strong { background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%); backdrop-filter: blur(24px); }
        .card-hover { transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s, border-color .35s; }
        .card-hover:hover { transform: translateY(-2px); border-color: rgba(167,139,250,0.35); box-shadow: 0 18px 50px -20px rgba(124,58,237,0.45); }
        .btn-primary { background: linear-gradient(135deg,#8b5cf6 0%,#d946ef 100%); box-shadow: 0 10px 30px -10px rgba(139,92,246,.6), inset 0 1px 0 rgba(255,255,255,.18); transition: all .25s; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 14px 36px -10px rgba(139,92,246,.75), inset 0 1px 0 rgba(255,255,255,.22); }
        .btn-primary:active { transform: translateY(0) scale(.98); }
        .chip { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); transition: all .2s; }
        .chip:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.12); }
        .accent-bar { background: linear-gradient(180deg,#a78bfa 0%,#d946ef 100%); box-shadow: 0 0 20px rgba(167,139,250,.6); }
        @keyframes float-slow { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-15px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .shimmer-text { background: linear-gradient(90deg,#fff 0%,#c4b5fd 50%,#fff 100%); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shimmer 4s linear infinite; }
        .bg-orbs::before, .bg-orbs::after { content:''; position:fixed; border-radius:50%; filter: blur(110px); pointer-events:none; z-index:0; animation: float-slow 12s ease-in-out infinite; }
        .bg-orbs::before { width:520px; height:520px; background: radial-gradient(circle, rgba(139,92,246,.22), transparent 70%); top:-180px; left:-120px; }
        .bg-orbs::after { width:480px; height:480px; background: radial-gradient(circle, rgba(217,70,239,.18), transparent 70%); bottom:-160px; right:-140px; animation-delay: -6s; }
      `}</style>

      <div className="bg-orbs" />

      <div className="max-w-6xl mx-auto px-5 pt-8 relative" style={{ zIndex: 1 }}>

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 pb-7 mb-10 border-b border-white/[0.06]">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/')}
              className="group flex items-center text-slate-500 hover:text-violet-300 transition-all text-xs font-semibold tracking-wide w-fit"
            >
              <ArrowLeft size={14} className="mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> BACK TO MARKETPLACE
            </button>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30 ring-1 ring-white/10">
                <span className="text-white font-bold text-lg">{customerName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Welcome back</p>
                <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight shimmer-text leading-tight">
                  {customerName}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={fetchBookings}
              className="glass flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-violet-400/40 text-slate-300 hover:text-white transition-all active:scale-95 text-xs font-semibold"
              title="Refresh"
            >
              <RefreshCw size={14} /> <span className="hidden sm:inline">Refresh</span>
            </button>
            
          </div>
        </header>

        {error && (
          <div className="bg-red-500/[0.08] border border-red-500/25 text-red-300 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2.5 backdrop-blur-sm">
            <AlertCircle size={18} className="shrink-0" /> {error}
          </div>
        )}

        {/* Reschedule Requests */}
        {bookings.filter(b => b.rescheduleStatus === 'pending').map(b => (
          <div key={b._id} className="relative rounded-3xl p-6 mb-8 overflow-hidden glass-strong border border-violet-500/25" style={{ boxShadow: '0 20px 60px -20px rgba(139,92,246,.45)' }}>
            <div className="absolute top-0 left-0 w-1 h-full accent-bar" />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-linear-to-r from-violet-500/25 to-fuchsia-500/25 border border-violet-400/30 text-violet-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.15em]">⚡ Early Slot</span>
                  <span className="text-xs text-violet-300 font-semibold">{b.salonId?.name}</span>
                </div>
                <h3 className="text-base font-bold text-white">Your chair is ready ahead of schedule</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Move your slot on <span className="text-white font-semibold">{b.appointmentDate && !isNaN(new Date(b.appointmentDate).getTime()) ? new Date(b.appointmentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A'}</span> for <span className="text-white font-semibold">{b.chairName}</span> to <span className="text-emerald-400 font-bold">{formatTo12Hr(b.proposedStartTime)}</span> – {formatTo12Hr(b.proposedEndTime)} (was {formatTo12Hr(b.startTime)})?
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => handleRescheduleResponse(b._id, 'declined')}
                  className="flex-1 md:flex-none text-xs font-semibold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl chip transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleRescheduleResponse(b._id, 'accepted')}
                  className="btn-primary flex-1 md:flex-none text-xs font-bold text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={14} /> Accept & Shift
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Visits Recorded', val: completedBookings.length, icon: ShoppingBag, grad: 'from-violet-500 to-indigo-500', glow: 'rgba(139,92,246,.35)' },
            { label: 'Lifetime Investment', val: `₹${totalSpent.toLocaleString()}`, icon: Landmark, grad: 'from-emerald-400 to-teal-500', glow: 'rgba(16,185,129,.3)' },
            { label: 'Preferred Salon', val: preferredSalon(), icon: Scissors, grad: 'from-amber-400 to-orange-500', glow: 'rgba(245,158,11,.3)' }
          ].map((stat, i) => (
            <div key={i} className="glass card-hover rounded-2xl p-5 flex items-center border border-white/[0.06] relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at top left, ${stat.glow}, transparent 70%)` }} />
              <div className={`relative p-3.5 bg-linear-to-br ${stat.grad} rounded-2xl mr-4 shadow-lg ring-1 ring-white/15`} style={{ boxShadow: `0 10px 30px -10px ${stat.glow}` }}>
                <stat.icon size={20} className="text-white" />
              </div>
              <div className="relative min-w-0">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                <h3 className="text-xl font-bold text-white truncate max-w-[180px] sm:max-w-none">{stat.val}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/[0.08] mb-8 gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-violet-500 text-white bg-white/[0.02]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]'
            } rounded-t-xl`}
          >
            <Activity size={14} className={activeTab === 'bookings' ? 'text-violet-400' : 'text-slate-500'} />
            Upcoming Bookings ({activeBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-violet-500 text-white bg-white/[0.02]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]'
            } rounded-t-xl`}
          >
            <Calendar size={14} className={activeTab === 'history' ? 'text-violet-400' : 'text-slate-500'} />
            Booking History ({pastBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-violet-500 text-white bg-white/[0.02]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]'
            } rounded-t-xl`}
          >
            <Settings size={14} className={activeTab === 'profile' ? 'text-violet-400' : 'text-slate-500'} />
            Settings & Profile
          </button>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'bookings' && (
            <div className="space-y-5 max-w-4xl animate-[fadeUp_0.3s_ease]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-400/25 flex items-center justify-center">
                    <Activity size={14} className="text-violet-300" />
                  </span>
                  Upcoming Bookings
                  <span className="text-xs text-slate-500 font-semibold">({activeBookings.length})</span>
                </h2>
              </div>

              {activeBookings.length === 0 ? (
                <div className="glass rounded-3xl p-10 text-center flex flex-col items-center justify-center border border-white/[0.06]">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500/15 to-fuchsia-500/10 border border-violet-400/20 flex items-center justify-center mb-4">
                    <Scissors size={28} className="text-violet-300" />
                  </div>
                  <h3 className="text-base font-bold text-slate-200 mb-1.5">No appointments scheduled</h3>
                  <p className="text-xs text-slate-500 mb-6 max-w-xs">Looking sharp takes planning. Discover a salon near you and lock in your slot.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="btn-primary text-white font-bold px-6 py-3 rounded-xl text-sm cursor-pointer"
                  >
                    Browse Salons
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeBookings.map((booking) => {
                    const hasQueueInfo = queuePositions[booking._id] !== undefined;
                    const queueInfo = queuePositions[booking._id];
                    let formattedDate = 'N/A';
                    if (booking.appointmentDate) {
                      const d = new Date(booking.appointmentDate);
                      if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric'
                        });
                      }
                    }

                    return (
                      <div
                        key={booking._id}
                        className="glass card-hover rounded-3xl p-5 sm:p-6 border border-white/[0.06] relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full accent-bar" />
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-white tracking-tight">{booking.salonId?.name || 'Local Salon'}</h3>
                            <div className="flex items-center text-slate-400 text-xs mt-1.5">
                              <MapPin size={12} className="mr-1.5 text-violet-400 shrink-0" />
                              <span className="truncate">{booking.salonId?.address || 'Location Address'}</span>
                            </div>
                          </div>

                          <div className="glass-strong border border-violet-400/20 px-3.5 py-2 rounded-xl text-center sm:text-right shrink-0">
                            <span className="text-[9px] text-violet-300 font-bold block uppercase tracking-[0.15em]">Chair / Barber</span>
                            <span className="text-xs text-white font-bold">{booking.chairName}</span>
                          </div>
                        </div>

                        <div className="relative bg-black/20 border border-white/[0.05] rounded-2xl p-4 mb-4">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] block mb-2.5">Booked Services</span>
                          <div className="flex flex-wrap gap-2">
                            {(booking.services || []).map((service, idx) => (
                              <span
                                key={idx}
                                className="chip text-xs px-3 py-1.5 rounded-lg text-slate-200 font-medium"
                              >
                                {service.name} <span className="text-violet-300 font-bold ml-0.5">₹{service.price}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center text-xs text-slate-300 font-medium">
                              <Calendar size={14} className="mr-1.5 text-violet-400" />
                              <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center text-xs text-slate-300 font-medium">
                              <Clock size={14} className="mr-1.5 text-violet-400" />
                              <span>{formatTo12Hr(booking.startTime)} – {formatTo12Hr(booking.endTime)}</span>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="text-[11px] font-bold text-red-300 hover:text-red-200 px-3.5 py-2 rounded-lg bg-red-500/[0.08] hover:bg-red-500/15 border border-red-500/20 transition-all cursor-pointer"
                            >
                              Cancel Appointment
                            </button>
                          </div>
                        </div>

                        {(() => {
                          const isToday = new Date(booking.appointmentDate).toDateString() === new Date().toDateString();
                          
                          return (
                            <div className="relative mt-5 pt-4 border-t border-white/[0.05] space-y-4">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="relative flex h-2.5 w-2.5">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isToday ? '' : 'hidden'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isToday ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                                    {isToday ? 'Live Status' : 'Queue Status'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  {isToday ? (
                                    hasQueueInfo ? (
                                      queueInfo.position === 1 ? (
                                        <span className="text-xs font-bold text-fuchsia-300 animate-pulse">💈 Next Up — Head to shop!</span>
                                      ) : (
                                        <span className="text-xs text-slate-400 font-semibold">
                                          Position <span className="text-indigo-400 font-bold">#{queueInfo.position}</span> ({queueInfo.peopleAhead} ahead)
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-xs text-slate-500 animate-pulse">Loading live queue...</span>
                                    )
                                  ) : (
                                    <span className="text-xs text-slate-500 font-semibold">Scheduled</span>
                                  )}
                                </div>
                              </div>

                              {/* Stepper Pipeline */}
                              <div className="flex items-center w-full gap-2 pt-2 px-1">
                                {/* Step 1: Confirmed */}
                                <div className="flex-1 flex flex-col items-center text-center gap-1.5">
                                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/5">
                                    ✓
                                  </div>
                                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wide">Confirmed</span>
                                </div>

                                {/* Line 1 */}
                                <div className={`h-[2px] flex-1 rounded-full ${isToday ? 'bg-linear-to-r from-emerald-500 to-indigo-500' : 'bg-white/5'}`} />

                                {/* Step 2: In Queue */}
                                <div className="flex-1 flex flex-col items-center text-center gap-1.5">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                                    isToday
                                      ? hasQueueInfo
                                        ? queueInfo.position > 1
                                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 animate-pulse shadow-lg shadow-indigo-500/10'
                                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5'
                                        : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300 animate-pulse'
                                      : 'bg-white/5 border-white/10 text-slate-600'
                                  }`}>
                                    {isToday 
                                      ? hasQueueInfo 
                                        ? queueInfo.position > 1 
                                          ? `#${queueInfo.position}` 
                                          : '✓'
                                        : '...' 
                                      : '⏳'}
                                  </div>
                                  <span className={`text-[9px] font-bold uppercase tracking-wide ${
                                    isToday 
                                      ? hasQueueInfo && queueInfo.position === 1 
                                        ? 'text-emerald-400' 
                                        : 'text-indigo-400' 
                                      : 'text-slate-500'
                                  }`}>
                                    {isToday 
                                      ? hasQueueInfo 
                                        ? queueInfo.position > 1 
                                          ? 'Waiting' 
                                          : 'Ready'
                                        : 'Checking' 
                                      : 'Soon'}
                                  </span>
                                </div>

                                {/* Line 2 */}
                                <div className={`h-[2px] flex-1 rounded-full ${isToday && hasQueueInfo && queueInfo.position === 1 ? 'bg-linear-to-r from-indigo-500 to-fuchsia-500' : 'bg-white/5'}`} />

                                {/* Step 3: Next Up */}
                                <div className="flex-1 flex flex-col items-center text-center gap-1.5">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                                    isToday && hasQueueInfo && queueInfo.position === 1
                                      ? 'bg-linear-to-br from-fuchsia-500/30 to-pink-500/20 border-fuchsia-400 text-fuchsia-300 animate-bounce shadow-lg shadow-fuchsia-500/20'
                                      : 'bg-white/5 border-white/10 text-slate-600'
                                  }`}>
                                    💈
                                  </div>
                                  <span className={`text-[9px] font-bold uppercase tracking-wide ${isToday && hasQueueInfo && queueInfo.position === 1 ? 'text-fuchsia-400 font-extrabold animate-pulse' : 'text-slate-500'}`}>
                                    Next Up
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-5 max-w-4xl animate-[fadeUp_0.3s_ease]">
              <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-fuchsia-500/15 border border-fuchsia-400/25 flex items-center justify-center">
                  <Calendar size={14} className="text-fuchsia-300" />
                </span>
                Booking History
                <span className="text-xs text-slate-500 font-semibold">({pastBookings.length})</span>
              </h2>

              {/* Filters Row */}
              <div className="glass border border-white/[0.04] rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="history-search-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Search History</label>
                    <input
                      id="history-search-input"
                      name="historySearch"
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Search Salon or Service..."
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="history-date-filter" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filter by Date</label>
                    <input
                      id="history-date-filter"
                      name="historyDate"
                      type="date"
                      value={historyDateFilter}
                      onChange={(e) => setHistoryDateFilter(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                </div>
                {(historyDateFilter || historySearchQuery) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setHistoryDateFilter(''); setHistorySearchQuery(''); }}
                      className="text-xs font-bold text-red-300 bg-red-500/15 hover:bg-red-500/20 border border-red-500/25 px-4 py-2 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {pastBookings.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center text-slate-500 border border-white/[0.05] text-xs font-medium">
                  No past transactions recorded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastBookings.map((b) => {
                    let formattedDate = 'N/A';
                    if (b.appointmentDate) {
                      const d = new Date(b.appointmentDate);
                      if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        });
                      }
                    }
                    const sumCost = b.services?.reduce((acc, s) => acc + s.price, 0) || 0;

                    return (
                      <div
                        key={b._id}
                        className="glass card-hover rounded-2xl p-4 flex flex-col justify-between gap-3 border border-white/[0.05]"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-white truncate">{b.salonId?.name || 'Local Salon'}</h3>
                            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">{formattedDate} · {formatTo12Hr(b.startTime)}</span>
                          </div>

                          <div className="shrink-0">
                            {b.status === 'completed' ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-300 bg-emerald-500/12 border border-emerald-400/20 px-2 py-1 rounded-full uppercase tracking-wider">
                                <CheckCircle size={10} className="mr-1" /> Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-red-300 bg-red-500/12 border border-red-400/20 px-2 py-1 rounded-full uppercase tracking-wider">
                                <XCircle size={10} className="mr-1" /> Canceled
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs border-t border-white/[0.04] pt-2.5 gap-3">
                          <span className="text-slate-400 font-medium truncate">
                            {(b.services || []).map(s => s.name).join(', ')}
                          </span>
                          <span className="font-bold text-violet-300 shrink-0">₹{sumCost}</span>
                        </div>

                        {b.status === 'completed' && (
                          <div className="flex justify-end pt-2.5 border-t border-white/[0.04]">
                            <button
                              onClick={() => openRateModal(b)}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/[0.08] hover:bg-amber-500/15 border border-amber-400/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              <Star size={11} className="fill-amber-400" /> Rate Salon
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-[fadeUp_0.3s_ease]">
              {/* Profile Sidebar */}
              <div className="md:col-span-1 flex flex-col gap-2.5">
                {[
                  { id: 'my-profile', label: 'My Profile', icon: User },
                  { id: 'personal-settings', label: 'Personal Settings', icon: Shield },
                  { id: 'help-support', label: 'Help & Support', icon: HelpCircle }
                ].map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveProfileSection(sec.id);
                      setProfileError('');
                      setProfileSuccess('');
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      activeProfileSection === sec.id
                        ? 'bg-violet-600/20 border-violet-500/50 text-white shadow-lg shadow-violet-500/5'
                        : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <sec.icon size={15} className={activeProfileSection === sec.id ? 'text-violet-400' : 'text-slate-500'} />
                    {sec.label}
                  </button>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-red-500/[0.04] border border-red-500/10 hover:border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold transition-all text-left cursor-pointer mt-4"
                >
                  <LogOut size={15} />
                  Log Out
                </button>
              </div>

              {/* Profile Detail Content Area */}
              <div className="md:col-span-3 glass-strong border border-white/[0.06] rounded-3xl p-6 md:p-8 relative">
                {profileError && (
                  <div className="bg-red-500/[0.08] border border-red-500/25 text-red-300 p-3.5 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" /> {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="bg-emerald-500/[0.08] border border-emerald-500/25 text-emerald-300 p-3.5 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle size={14} className="shrink-0" /> {profileSuccess}
                  </div>
                )}

                {activeProfileSection === 'my-profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                      <h2 className="text-base font-bold text-white mb-1">My Profile</h2>
                      <p className="text-xs text-slate-500">Manage your avatar details and grooming style preferences.</p>
                    </div>

                    {/* Avatar Picker */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-white/[0.01] border border-white/[0.04] rounded-2xl">
                      <div className="relative group shrink-0">
                        {profileData.avatar ? (
                          <img
                            src={profileData.avatar}
                            alt="Profile Avatar"
                            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-violet-500/40"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg ring-2 ring-violet-500/20">
                            {profileData.name ? profileData.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-opacity">
                          CHANGE
                          <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                        </label>
                      </div>
                      <div className="text-center sm:text-left space-y-2">
                        <label htmlFor="avatar-file-upload" className="text-xs font-bold text-violet-300 hover:text-violet-200 cursor-pointer underline">
                          Upload new profile picture
                          <input id="avatar-file-upload" type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                        </label>
                        <p className="text-[10px] text-slate-500">Supports PNG, JPG, or GIF up to 2MB. Preset avatar initializes automatically from name.</p>
                      </div>
                    </div>

                    {/* Name input */}
                    <div className="space-y-2">
                      <label htmlFor="profile-fullname" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                      <input
                        id="profile-fullname"
                        type="text"
                        value={profileData.name}
                        onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/50 transition-colors font-medium font-semibold"
                        required
                      />
                    </div>

                    {/* Grooming Preferences */}
                    <div className="space-y-4 pt-2">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-0.5">Style Preferences</h3>
                        <p className="text-[11px] text-slate-500">Select your hair texture and beard choice to help barbers prepare styles custom-tailored to you.</p>
                      </div>

                      {/* Hair Type selectors */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hair Texture</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {['Straight', 'Wavy', 'Curly', 'Coily'].map(style => {
                            const isSelected = profileData.hairType === style;
                            return (
                              <button
                                key={style}
                                type="button"
                                onClick={() => setProfileData(prev => ({ ...prev, hairType: style }))}
                                className={`py-3 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-violet-600/15 border-violet-500 text-violet-300 shadow-md shadow-violet-500/5'
                                    : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:text-slate-350 hover:border-white/[0.08]'
                                }`}
                              >
                                {style}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Beard style selectors */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Beard Preference</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {['Clean Shaven', 'Stubble', 'Full Beard', 'Goatee'].map(style => {
                            const isSelected = profileData.beardStyle === style;
                            return (
                              <button
                                key={style}
                                type="button"
                                onClick={() => setProfileData(prev => ({ ...prev, beardStyle: style }))}
                                className={`py-3 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-violet-600/15 border-violet-500 text-violet-300 shadow-md shadow-violet-500/5'
                                    : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:text-slate-350 hover:border-white/[0.08]'
                                }`}
                              >
                                {style}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-primary text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer w-full sm:w-auto border-none"
                    >
                      {savingProfile ? 'Saving Details...' : 'Save Details'}
                    </button>
                  </form>
                )}

                {activeProfileSection === 'personal-settings' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                      <h2 className="text-base font-bold text-white mb-1">Personal Settings</h2>
                      <p className="text-xs text-slate-500">Edit contact details, configure notification options, or update your account password.</p>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label htmlFor="settings-email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                      <input
                        id="settings-email"
                        type="email"
                        value={profileData.email}
                        onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/50 transition-colors font-semibold"
                        required
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                      <label htmlFor="settings-phone" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                      <input
                        id="settings-phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={e => {
                          const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                          setProfileData(prev => ({ ...prev, phone: cleanVal }));
                        }}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/50 transition-colors font-semibold"
                        required
                      />
                    </div>

                    {/* Country Input */}
                    <div className="space-y-2">
                      <label htmlFor="settings-country" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Country</label>
                      <select
                        id="settings-country"
                        value={profileData.country}
                        onChange={e => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/50 transition-colors font-semibold bg-slate-900"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                      </select>
                    </div>

                    {/* Notifications Switches */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Communication Preferences</span>
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={profileData.notifications.email}
                            onChange={e => setProfileData(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, email: e.target.checked }
                            }))}
                            className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                          />
                          <span className="text-xs text-slate-300 font-semibold">Receive booking summaries and reminders via Email</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={profileData.notifications.sms}
                            onChange={e => setProfileData(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, sms: e.target.checked }
                            }))}
                            className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                          />
                          <span className="text-xs text-slate-300 font-semibold">Receive live queue alerts and SMS updates</span>
                        </label>
                      </div>
                    </div>

                    {/* Change Password Block */}
                    <div className="border-t border-white/[0.05] pt-5 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-0.5">Change Password</h3>
                        <p className="text-[11px] text-slate-500">Leave these fields blank if you do not wish to update your password.</p>
                      </div>

                      {/* Current password */}
                      <div className="space-y-2">
                        <label htmlFor="settings-curr-pwd" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Password</label>
                        <div className="relative">
                          <input
                            id="settings-curr-pwd"
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            value={passwordForm.currentPassword}
                            onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-slate-200 outline-none focus:border-violet-500/50 transition-colors font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 bg-transparent border-none cursor-pointer outline-none flex items-center justify-center p-1"
                          >
                            {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* New password */}
                        <div className="space-y-2">
                          <label htmlFor="settings-new-pwd" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Password</label>
                          <div className="relative">
                            <input
                              id="settings-new-pwd"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Min. 6 characters"
                              value={passwordForm.newPassword}
                              onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-slate-200 outline-none focus:border-violet-500/50 transition-colors font-semibold"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 bg-transparent border-none cursor-pointer outline-none flex items-center justify-center p-1"
                            >
                              {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm password */}
                        <div className="space-y-2">
                          <label htmlFor="settings-confirm-pwd" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm Password</label>
                          <div className="relative">
                            <input
                              id="settings-confirm-pwd"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              value={passwordForm.confirmPassword}
                              onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-slate-200 outline-none focus:border-violet-500/50 transition-colors font-semibold"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 bg-transparent border-none cursor-pointer outline-none flex items-center justify-center p-1"
                            >
                              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-primary text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer w-full sm:w-auto border-none"
                    >
                      {savingProfile ? 'Saving Settings...' : 'Save Settings'}
                    </button>
                  </form>
                )}

                {activeProfileSection === 'help-support' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-base font-bold text-white mb-1">Help & Support</h2>
                      <p className="text-xs text-slate-500">Read cancellation details or send a query directly to the TrimSync administration team.</p>
                    </div>

                    {/* FAQs Accordion */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Frequently Asked Questions</span>
                      <div className="space-y-2.5">
                        {[
                          { q: 'How do I check my position in the queue?', a: 'Go to your "Upcoming Bookings" tab. On the day of your appointment, a live queue tracker shows your real-time position (e.g. #3) and the number of people ahead of you.' },
                          { q: 'What is the booking cancellation policy?', a: 'You can cancel any booking free of charge up to 2 hours prior to the scheduled slot. The cancellation option is available in the booking details card.' },
                          { q: 'Can I request an earlier time slot?', a: 'Yes! If a barber finishes early, TrimSync will auto-generate an early shift invitation. You will see a notification bar at the top of your dashboard to accept or decline the change.' }
                        ].map((faq, idx) => (
                          <details key={idx} className="group bg-white/[0.01] border border-white/[0.04] rounded-2xl p-4 cursor-pointer [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex justify-between items-center text-xs font-bold text-slate-200 outline-none select-none">
                              <span>{faq.q}</span>
                              <span className="text-violet-400 transition-transform duration-200 group-open:rotate-180">▼</span>
                            </summary>
                            <p className="text-xs text-slate-500 leading-relaxed mt-2.5 pt-2.5 border-t border-white/[0.03]">
                              {faq.a}
                            </p>
                          </details>
                        ))}
                      </div>
                    </div>

                    {/* Support message form */}
                    <form onSubmit={handleSupportSubmit} className="space-y-4 border-t border-white/[0.05] pt-5">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-0.5">Submit Support Ticket</h3>
                        <p className="text-[11px] text-slate-500">Have feedback or encountered issues? Submit details below and we will investigate.</p>
                      </div>

                      {supportSuccess && (
                        <div className="bg-emerald-500/[0.08] border border-emerald-500/25 text-emerald-300 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                          <CheckCircle size={14} className="shrink-0" /> Support ticket submitted successfully! We will get back to you shortly.
                        </div>
                      )}

                      <div className="space-y-2">
                        <label htmlFor="support-subject" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject / Issue Title</label>
                        <input
                          id="support-subject"
                          type="text"
                          value={supportForm.subject}
                          onChange={e => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="e.g. Queue tracker delay or payment enquiry"
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-violet-500/50 transition-colors"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="support-message" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message Details</label>
                        <textarea
                          id="support-message"
                          value={supportForm.message}
                          onChange={e => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Please describe your problem or suggestions here..."
                          className="w-full h-28 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-violet-500/50 transition-colors resize-none fontFamily-inherit bg-transparent"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="glass border border-violet-500/25 text-violet-300 hover:text-white hover:bg-violet-600/10 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer w-full sm:w-auto"
                      >
                        Submit Ticket
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rate Modal */}
      {showRateModal && (
        <div onClick={e => e.target === e.currentTarget && setShowRateModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(5,3,15,0.78)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'linear-gradient(180deg,#15121f 0%,#0c0a16 100%)', border: '1px solid rgba(167,139,250,0.18)', borderRadius: 24, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 40px 90px -20px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', color: '#a78bfa', textTransform: 'uppercase', marginBottom: 4 }}>Your Feedback</p>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>Rate & Review</h2>
              </div>
              <button onClick={() => setShowRateModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, width: 32, height: 32, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <form onSubmit={submitRating} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}>Select Rating</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', textShadow: '0 0 10px rgba(245,158,11,0.2)' }}>
                    {(() => {
                      const active = hoveredRating || ratingVal;
                      switch(active) {
                        case 1: return "Disappointed 😞";
                        case 2: return "Below Average 😕";
                        case 3: return "Good Experience 🙂";
                        case 4: return "Very Good! 😃";
                        case 5: return "Outstanding Masterpiece! 🤩";
                        default: return "Select a score";
                      }
                    })()}
                  </span>
                </div>
                <div 
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{ display: 'flex', gap: 8, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, justifyContent: 'space-between' }}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeVal = hoveredRating || ratingVal;
                    const isStarred = star <= activeVal;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingVal(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(.85)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1.15)'}
                        className="star-btn-hover"
                      >
                        <Star
                          size={32}
                          className={isStarred ? "text-amber-400 fill-amber-400" : "text-slate-700"}
                          style={{
                            transition: 'color 0.2s, fill 0.2s, filter 0.2s',
                            filter: isStarred ? 'drop-shadow(0 0 10px rgba(245,158,11,0.6))' : 'none'
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
                <style>{`
                  .star-btn-hover:hover { transform: scale(1.2); }
                `}</style>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Write a Review</span>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  style={{ width: '100%', height: 100, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#e2e8f0', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#8b5cf6 0%,#d946ef 100%)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em', boxShadow: '0 14px 36px -10px rgba(139,92,246,0.6), inset 0 1px 0 rgba(255,255,255,0.2)' }}
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
