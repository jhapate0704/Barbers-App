import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  LayoutDashboard, Users, Calendar, Scissors, Settings, BookUser, Camera
} from 'lucide-react';

import Sidebar from './OwnerDashboard/components/Sidebar';
import Topbar from './OwnerDashboard/components/Topbar';
import OverviewTab from './OwnerDashboard/components/OverviewTab';
import ChairsTab from './OwnerDashboard/components/ChairsTab';
import ServicesTab from './OwnerDashboard/components/ServicesTab';
import HistoryTab from './OwnerDashboard/components/HistoryTab';
import CustomersTab from './OwnerDashboard/components/CustomersTab';
import ConfigTab from './OwnerDashboard/components/ConfigTab';
import ProfileTab from './OwnerDashboard/components/ProfileTab';
import PortfolioTab from './OwnerDashboard/components/PortfolioTab';
import SettingsTab from './OwnerDashboard/components/SettingsTab';
import HelpTab from './OwnerDashboard/components/HelpTab';
import Modals from './OwnerDashboard/components/Modals';

const API_BASE = "http://localhost:5000/api";
const socket = io("http://localhost:5000");

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [salon, setSalon] = useState(null);
  const [data, setData] = useState({ liveQueue: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [showWalkin, setShowWalkin] = useState(false);
  const [showOwnerInfo, setShowOwnerInfo] = useState(false);
  const [showEarlyComplete, setShowEarlyComplete] = useState(false);
  const [earlyCompleteBooking, setEarlyCompleteBooking] = useState(null);
  const [earlyEndTime, setEarlyEndTime] = useState('');
  const [shiftType, setShiftType] = useState('request');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerTab, setCustomerTab] = useState('clients'); // 'clients' | 'detailed'
  const [walkin, setWalkin] = useState({ name: '', phone: '', chairId: '', services: [] });
  const [cfg, setCfg] = useState({
    openTime: '', closeTime: '', weeklyOffDay: -1, isOffToday: false,
    newChairName: '', newServiceName: '', newServicePrice: '', newServiceDuration: ''
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ ownerName: '', address: '' });
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutFormText, setAboutFormText] = useState('');
  
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ ownerName: '', phone: '', email: '' });
  
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const [bRes, sRes] = await Promise.all([
        axios.get(`${API_BASE}/bookings/salon/dashboard`, auth),
        axios.get(`${API_BASE}/salons`)
      ]);
      const id = localStorage.getItem('salonId');
      const s = Array.isArray(sRes.data) ? sRes.data.find(x => String(x._id) === String(id)) : null;
      if (s) {
        setSalon(s);
        setCfg(p => ({ ...p, openTime: s.operatingHours?.open || '', closeTime: s.operatingHours?.close || '', weeklyOffDay: s.weeklyOffDay ?? -1, isOffToday: !!s.isOffToday }));
        if (s.chairs?.length && !walkin.chairId) setWalkin(w => ({ ...w, chairId: s.chairs[0]._id }));
      }
      const all = Array.isArray(bRes.data?.bookings) ? bRes.data.bookings : [];
      setData({ liveQueue: all.filter(b => b.status === 'scheduled'), history: all.filter(b => b.status !== 'scheduled') });
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on('queue_updated', fetchData);
    return () => {
      socket.off('queue_updated', fetchData);
    };
  }, []);

  const earnings = () => data.history.filter(b => b.status === 'completed').reduce((t, b) => t + (b.services?.reduce((s, v) => s + v.price, 0) || 0), 0);
  const topService = () => {
    const c = {}; data.history.forEach(b => b.services?.forEach(s => { c[s.name] = (c[s.name] || 0) + 1; }));
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  };

  const customerRecords = useMemo(() => {
    const allBookings = [...data.history, ...data.liveQueue];
    const customersMap = {};
    
    allBookings.forEach(b => {
      const id = b.customerPhone || b.customerId?._id || b.customerName; 
      if (!id) return;
      
      if (!customersMap[id]) {
        customersMap[id] = {
          id: id,
          name: b.customerName || b.customerId?.name || 'Unknown Customer',
          phone: b.customerPhone || b.customerId?.phone || 'N/A',
          totalVisits: 0,
          totalRevenue: 0,
          lastVisitDate: b.appointmentDate || b.createdAt || '',
          status: 'Active'
        };
      }
      
      customersMap[id].totalVisits += 1;
      if (b.status === 'completed') {
        customersMap[id].totalRevenue += b.services?.reduce((s, v) => s + v.price, 0) || 0;
      }
      
      const bDate = new Date(b.appointmentDate || b.createdAt);
      const lastDate = new Date(customersMap[id].lastVisitDate);
      if (bDate > lastDate) {
        customersMap[id].lastVisitDate = b.appointmentDate || b.createdAt;
      }
    });
    
    return Object.values(customersMap).sort((a, b) => b.totalVisits - a.totalVisits);
  }, [data.history, data.liveQueue]);

  const completeBooking = async id => { try { await axios.post(`${API_BASE}/bookings/complete`, { bookingId: id }); fetchData(); } catch (_) {} };
  const cancelBooking  = async id => { if (!window.confirm('Cancel?')) return; try { await axios.post(`${API_BASE}/bookings/cancel`, { bookingId: id }); fetchData(); } catch (_) {} };
  
  const openEarlyComplete = (booking) => {
    setEarlyCompleteBooking(booking);
    
    const now = new Date();
    const currentStr = now.toTimeString().slice(0, 5); // "HH:MM"
    let defaultTime = currentStr;
    
    try {
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const [startH, startM] = booking.startTime.split(':').map(Number);
      const startMins = startH * 60 + startM;
      const [endH, endM] = booking.endTime.split(':').map(Number);
      const endMins = endH * 60 + endM;
      
      if (currentMins >= startMins && currentMins < endMins) {
        defaultTime = currentStr;
      } else if (currentMins < startMins) {
        defaultTime = booking.startTime;
      } else {
        const tenMinsBeforeEnd = Math.max(startMins, endMins - 10);
        const h = Math.floor(tenMinsBeforeEnd / 60) % 24;
        const m = tenMinsBeforeEnd % 60;
        defaultTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    } catch (_) {
      defaultTime = booking.startTime || "09:00";
    }

    setEarlyEndTime(defaultTime);
    setShiftType('request');
    setShowEarlyComplete(true);
  };

  const completeBookingEarly = async (e) => {
    e.preventDefault();
    if (!earlyCompleteBooking || !earlyEndTime) return;
    try {
      await axios.post(`${API_BASE}/bookings/complete-early`, {
        bookingId: earlyCompleteBooking._id,
        actualEndTime: earlyEndTime,
        shiftType: shiftType
      });
      setShowEarlyComplete(false);
      setEarlyCompleteBooking(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete booking early');
    }
  };

  const handleRescheduleAction = async (bookingId, action) => {
    try {
      await axios.post(`${API_BASE}/bookings/action-reschedule`, { bookingId, action });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update reschedule action.');
    }
  };

  const saveSettings = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/salons/settings/update`, { operatingHours: { open: cfg.openTime, close: cfg.closeTime }, weeklyOffDay: +cfg.weeklyOffDay, isOffToday: cfg.isOffToday }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Saved!'); fetchData();
    } catch (_) { alert('Failed'); }
  };

  const addChair = async () => {
    if (!cfg.newChairName) return;
    const token = localStorage.getItem('token');
    try { await axios.post(`${API_BASE}/salons/chairs/add`, { name: cfg.newChairName }, { headers: { Authorization: `Bearer ${token}` } }); setCfg(c => ({ ...c, newChairName: '' })); fetchData(); } catch (_) {}
  };
  const delChair = async id => { if (!window.confirm('Delete?')) return; const token = localStorage.getItem('token'); try { await axios.post(`${API_BASE}/salons/chairs/delete`, { chairId: id }, { headers: { Authorization: `Bearer ${token}` } }); fetchData(); } catch (_) {} };

  const addService = async () => {
    if (!cfg.newServiceName || !cfg.newServicePrice) return;
    const token = localStorage.getItem('token');
    try { await axios.post(`${API_BASE}/salons/services/add`, { name: cfg.newServiceName, price: +cfg.newServicePrice, duration: +(cfg.newServiceDuration || 30) }, { headers: { Authorization: `Bearer ${token}` } }); setCfg(c => ({ ...c, newServiceName: '', newServicePrice: '', newServiceDuration: '' })); fetchData(); } catch (_) {}
  };
  const delService = async id => { if (!window.confirm('Delete?')) return; const token = localStorage.getItem('token'); try { await axios.post(`${API_BASE}/salons/services/delete`, { serviceId: id }, { headers: { Authorization: `Bearer ${token}` } }); fetchData(); } catch (_) {} };

  const addWalkin = async e => {
    e.preventDefault();
    try {
      const uRes = await axios.post(`${API_BASE}/users/login`, { phone: walkin.phone });
      await axios.post(`${API_BASE}/bookings/create`, { customerId: uRes.data.user._id, salonId: salon._id, chairId: walkin.chairId, requestedServices: walkin.services, appointmentDate: new Date().toISOString().split('T')[0], startTime: new Date().toTimeString().slice(0, 5) });
      setShowWalkin(false); setWalkin({ name: '', phone: '', chairId: salon.chairs[0]._id, services: [] }); fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const saveNotes = async () => { try { await axios.post(`${API_BASE}/users/notes/update`, { userId: selectedCustomer._id, notes: customerNotes }); alert('Saved!'); fetchData(); } catch (_) {} };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('salonId'); navigate('/login'); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }
    const currentImages = salon?.images || [];
    if (currentImages.length >= 5) {
      alert("You can upload a maximum of 5 images.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result;
        const updatedImages = [...currentImages, base64String];
        const token = localStorage.getItem('token');
        await axios.post(
          `${API_BASE}/salons/settings/update`, 
          { images: updatedImages }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
      } catch (err) {
        alert("Failed to upload image");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = async (indexToDelete) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      const currentImages = salon?.images || [];
      const updatedImages = currentImages.filter((_, idx) => idx !== indexToDelete);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/salons/settings/update`, 
        { images: updatedImages }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      alert("Failed to delete image");
    }
  };

  const handlePortfolioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 15 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 15MB.");
      return;
    }
    
    const currentPortfolio = salon?.portfolio || [];
    if (currentPortfolio.length >= 10) {
      alert("You can upload a maximum of 10 images in your portfolio.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1080;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        
        try {
          const updatedPortfolio = [...currentPortfolio, compressedBase64];
          const token = localStorage.getItem('token');
          await axios.post(
            `${API_BASE}/salons/settings/update`, 
            { portfolio: updatedPortfolio }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          fetchData();
        } catch (err) {
          console.error("Upload error:", err);
          alert("Failed to upload image.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/salons/settings/update`, { about: aboutFormText }, auth);
      setSalon(prev => ({ ...prev, about: aboutFormText }));
      setIsEditingAbout(false);
      fetchData();
    } catch (err) {
      alert("Failed to save About section");
    }
  };

  const handleDeletePortfolioImage = async (indexToDelete) => {
    if (!window.confirm("Are you sure you want to delete this portfolio image?")) return;
    try {
      const currentPortfolio = salon?.portfolio || [];
      const updatedPortfolio = currentPortfolio.filter((_, idx) => idx !== indexToDelete);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/salons/settings/update`, 
        { portfolio: updatedPortfolio }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      alert("Failed to delete image from portfolio");
    }
  };

  const saveProfileDetails = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      
      let finalLat = null;
      let finalLng = null;
      
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profileForm.address)}&limit=1`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          finalLat = parseFloat(geoData[0].lat);
          finalLng = parseFloat(geoData[0].lon);
        }
      } catch (ge) {
        console.error("Geocoding failed inside dashboard settings:", ge);
      }

      await axios.post(`${API_BASE}/salons/settings/update`, {
        ownerName: profileForm.ownerName,
        address: profileForm.address,
        latitude: finalLat || undefined,
        longitude: finalLng || undefined
      }, auth);
      setIsEditingProfile(false);
      fetchData();
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  const saveContactDetails = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/salons/settings/update`, {
        ownerName: contactForm.ownerName,
        phone: contactForm.phone,
        email: contactForm.email
      }, auth);
      setIsEditingContact(false);
      fetchData();
      alert('Contact details updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating contact details');
    }
  };

  const handleUpdateLocation = () => {
    if (navigator.geolocation) {
      alert("Acquiring location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const token = localStorage.getItem('token');
            const auth = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_BASE}/salons/settings/update`, {
              latitude,
              longitude
            }, auth);
            fetchData();
            alert('Location updated successfully!');
          } catch (err) {
            alert('Error updating location');
          }
        },
        (err) => {
          alert("Unable to retrieve your location. Please check permissions.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleDeleteLocation = async () => {
    if (window.confirm("Are you sure you want to delete your salon's exact map location? It will no longer appear on proximity searches until you set it again.")) {
      try {
        const token = localStorage.getItem('token');
        const auth = { headers: { Authorization: `Bearer ${token}` } };
        await axios.post(`${API_BASE}/salons/settings/update`, {
          latitude: null,
          longitude: null
        }, auth);
        fetchData();
        alert('Location deleted successfully!');
      } catch (err) {
        alert('Error deleting location');
      }
    }
  };

  const handleVerifyCurrentPassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');
    try {
      const token = localStorage.getItem('token');
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/salons/settings/password/verify`, {
        currentPassword: passwordForm.currentPassword
      }, auth);
      setPasswordStep(2);
    } catch (err) {
      setPasswordError('Enter right password');
    }
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/salons/settings/password/update`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, auth);
      setPasswordSuccess('Password updated successfully!');
      setTimeout(() => {
        setPasswordFormOpen(false);
        setPasswordStep(1);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Error changing password');
    }
  };

  const toggleSalonVisibility = async () => {
    try {
      const token = localStorage.getItem('token');
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const nextIsOffToday = !cfg.isOffToday;
      await axios.post(`${API_BASE}/salons/settings/update`, {
        isOffToday: nextIsOffToday
      }, auth);
      setCfg(prev => ({ ...prev, isOffToday: nextIsOffToday }));
      fetchData();
    } catch (err) {
      alert('Error updating visibility');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/salons/settings/account/delete`, auth);
      localStorage.removeItem('token');
      localStorage.removeItem('salonId');
      alert('Your account has been deleted.');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting account');
    }
  };

  const openCRM = b => { setSelectedCustomer(b.customerId); setCustomerNotes(b.customerId?.notes || ''); };

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'chairs',   icon: Users,           label: 'Barbers' },
    { id: 'services', icon: Scissors,        label: 'Services' },
    { id: 'history',  icon: Calendar,        label: 'History' },
    { id: 'customers',icon: BookUser,        label: 'Customer Records' },
    { id: 'portfolio',icon: Camera,          label: 'Salon Portfolio' },
    { id: 'config',   icon: Settings,        label: 'Salon Settings' },
  ];

  /* loading screen */
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 font-sans relative overflow-hidden">
      {/* Skeleton Dashboard Mockup */}
      <div className="flex min-h-screen w-full">
        {/* Sidebar Skeleton */}
        <div className="hidden md:flex w-[240px] border-r border-white/5 bg-[#111119] p-6 flex-col gap-5">
          <div className="h-10 bg-white/[0.03] rounded-lg animate-pulse" />
          <div className="flex flex-col gap-3 mt-10">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-[35px] bg-white/[0.02] rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
        {/* Main Content Area Skeleton */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="w-[200px] h-8 bg-white/[0.03] rounded-lg animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-white/[0.03] animate-pulse" />
          </div>
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[110px] bg-white/[0.03] rounded-2xl border border-white/5 animate-pulse" />
            ))}
          </div>
          {/* Sub Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5 flex-1">
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6 flex flex-col gap-4 animate-pulse">
              <div className="h-6 w-[150px] bg-white/[0.02] rounded-md" />
              <div className="flex-1 bg-white/[0.01] rounded-xl" />
            </div>
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6 flex flex-col gap-4 animate-pulse">
              <div className="h-6 w-[120px] bg-white/[0.02] rounded-md" />
              <div className="flex-1 bg-white/[0.01] rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Existing Loader Overlaid in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-10 bg-[#0a0a0f]/85 p-[24px_32px] rounded-2xl border border-white/[0.08] backdrop-blur-md">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
          <Scissors size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-500" />
        </div>
        <p className="text-white/50 text-[11px] tracking-[0.2em] uppercase font-semibold m-0">Loading Shop Panel…</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0d0d14] text-slate-200 font-sans">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        mobileSidebar={mobileSidebar}
        setMobileSidebar={setMobileSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        salon={salon}
        handleLogout={handleLogout}
        navItems={navItems}
      />

      <main className={`flex-1 min-h-screen flex flex-col transition-all duration-250 ease-in-out w-full min-w-0 overflow-x-hidden ${sidebarOpen ? 'md:ml-[240px]' : 'md:ml-[68px]'}`}>
        <Topbar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileSidebar={mobileSidebar}
          setMobileSidebar={setMobileSidebar}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowWalkin={setShowWalkin}
          data={data}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          salon={salon}
          handleLogout={handleLogout}
        />

        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex-1">
          {activeTab === 'overview' && <OverviewTab data={data} earnings={earnings} topService={topService} fetchData={fetchData} cancelBooking={cancelBooking} openEarlyComplete={openEarlyComplete} completeBooking={completeBooking} handleRescheduleAction={handleRescheduleAction} openCRM={openCRM} />}
          {activeTab === 'chairs' && <ChairsTab salon={salon} cfg={cfg} setCfg={setCfg} addChair={addChair} delChair={delChair} />}
          {activeTab === 'services' && <ServicesTab salon={salon} cfg={cfg} setCfg={setCfg} addService={addService} delService={delService} />}
          {activeTab === 'history' && <HistoryTab data={data} historyDateFilter={historyDateFilter} setHistoryDateFilter={setHistoryDateFilter} historySearchQuery={historySearchQuery} setHistorySearchQuery={setHistorySearchQuery} />}
          {activeTab === 'customers' && <CustomersTab customerRecords={customerRecords} customerSearchQuery={customerSearchQuery} setCustomerSearchQuery={setCustomerSearchQuery} customerTab={customerTab} setCustomerTab={setCustomerTab} />}
          {activeTab === 'config' && <ConfigTab salon={salon} cfg={cfg} setCfg={setCfg} saveSettings={saveSettings} handleUpdateLocation={handleUpdateLocation} handleDeleteLocation={handleDeleteLocation} />}
          {activeTab === 'profile' && <ProfileTab salon={salon} profileForm={profileForm} setProfileForm={setProfileForm} isEditingProfile={isEditingProfile} setIsEditingProfile={setIsEditingProfile} saveProfileDetails={saveProfileDetails} handleImageUpload={handleImageUpload} handleDeleteImage={handleDeleteImage} aboutFormText={aboutFormText} setAboutFormText={setAboutFormText} isEditingAbout={isEditingAbout} setIsEditingAbout={setIsEditingAbout} handleSaveAbout={handleSaveAbout} />}
          {activeTab === 'portfolio' && <PortfolioTab salon={salon} handlePortfolioUpload={handlePortfolioUpload} handleDeletePortfolioImage={handleDeletePortfolioImage} aboutFormText={aboutFormText} setAboutFormText={setAboutFormText} isEditingAbout={isEditingAbout} setIsEditingAbout={setIsEditingAbout} handleSaveAbout={handleSaveAbout} />}
          {activeTab === 'settings' && <SettingsTab salon={salon} contactForm={contactForm} setContactForm={setContactForm} isEditingContact={isEditingContact} setIsEditingContact={setIsEditingContact} saveContactDetails={saveContactDetails} passwordForm={passwordForm} setPasswordForm={setPasswordForm} passwordStep={passwordStep} setPasswordStep={setPasswordStep} passwordError={passwordError} setPasswordError={setPasswordError} passwordSuccess={passwordSuccess} setPasswordSuccess={setPasswordSuccess} showCurrentPassword={showCurrentPassword} setShowCurrentPassword={setShowCurrentPassword} showNewPassword={showNewPassword} setShowNewPassword={setShowNewPassword} showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword} handleVerifyCurrentPassword={handleVerifyCurrentPassword} handleChangePassword={handleChangePassword} passwordFormOpen={passwordFormOpen} setPasswordFormOpen={setPasswordFormOpen} deleteConfirmOpen={deleteConfirmOpen} setDeleteConfirmOpen={setDeleteConfirmOpen} handleDeleteAccount={handleDeleteAccount} cfg={cfg} toggleSalonVisibility={toggleSalonVisibility} />}
          {activeTab === 'help' && <HelpTab />}
        </div>
      </main>

      <Modals 
        salon={salon}
        showWalkin={showWalkin}
        setShowWalkin={setShowWalkin}
        walkin={walkin}
        setWalkin={setWalkin}
        addWalkin={addWalkin}
        showEarlyComplete={showEarlyComplete}
        setShowEarlyComplete={setShowEarlyComplete}
        earlyCompleteBooking={earlyCompleteBooking}
        setEarlyCompleteBooking={setEarlyCompleteBooking}
        earlyEndTime={earlyEndTime}
        setEarlyEndTime={setEarlyEndTime}
        shiftType={shiftType}
        setShiftType={setShiftType}
        completeBookingEarly={completeBookingEarly}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        customerNotes={customerNotes}
        setCustomerNotes={setCustomerNotes}
        saveNotes={saveNotes}
        showOwnerInfo={showOwnerInfo}
        setShowOwnerInfo={setShowOwnerInfo}
        handleImageUpload={handleImageUpload}
        handleDeleteImage={handleDeleteImage}
      />
    </div>
  );
}