import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  LayoutDashboard, Users, Calendar, Scissors, Settings,
  DollarSign, Menu, X, LogOut, Info, Save,
  CheckCircle, XCircle, UserPlus, Plus, Trash2, Activity,
  Zap, Bell, Star, Coffee, ArrowLeft, Eye, EyeOff, MapPin, BookUser, Camera
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

/* ─── tiny helpers ─────────────────────────────────────── */
const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} style={{
    display: 'block', marginBottom: 6,
    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
    cursor: htmlFor ? 'pointer' : 'default'
  }}>{children}</label>
);

const InputField = ({ style, ...props }) => (
  <input {...props} style={{
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 10, color: '#e2e8f0',
    fontSize: 14, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    ...style
  }} onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.55)'; e.target.style.background = 'rgba(139,92,246,0.06)'; }}
    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }} />
);

const SelectField = ({ style, children, ...props }) => (
  <select {...props} style={{
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 10, color: '#e2e8f0',
    fontSize: 14, outline: 'none', cursor: 'pointer',
    fontFamily: 'inherit', boxSizing: 'border-box', appearance: 'none',
    ...style
  }}>{children}</select>
);

const Badge = ({ children, color = 'violet' }) => {
  const colors = {
    violet: { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd' },
    green:  { bg: 'rgba(34,197,94,0.13)',  text: '#86efac' },
    red:    { bg: 'rgba(239,68,68,0.13)',   text: '#fca5a5' },
    blue:   { bg: 'rgba(96,165,250,0.13)',  text: '#93c5fd' },
    amber:  { bg: 'rgba(251,191,36,0.13)',  text: '#fcd34d' },
  };
  const c = colors[color] || colors.violet;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      background: c.bg, color: c.text,
      whiteSpace: 'nowrap'
    }}>{children}</span>
  );
};

const IconBtn = ({ onClick, danger, children, style }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: 7, border: 'none', borderRadius: 8, cursor: 'pointer',
    background: danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)',
    color: danger ? '#fca5a5' : 'rgba(255,255,255,0.4)',
    transition: 'all 0.15s', ...style
  }}
    onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)'; }}>
    {children}
  </button>
);

const PrimaryBtn = ({ children, style, ...props }) => (
  <button {...props} style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 7, padding: '10px 20px',
    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    border: 'none', borderRadius: 10,
    color: 'white', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s', whiteSpace: 'nowrap',
    ...style
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(139,92,246,0.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
    {children}
  </button>
);

const Card = ({ children, style }) => (
  <div style={{
    background: '#13131f',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 24,
    ...style
  }}>{children}</div>
);

const SectionTitle = ({ icon: Icon, children, badge }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    {Icon && <Icon size={18} color="#8b5cf6" style={{ flexShrink: 0 }} />}
    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'white', flex: 1 }}>{children}</h2>
    {badge != null && <Badge color="violet">{badge}</Badge>}
  </div>
);

const ModalClose = ({ onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, flexShrink: 0,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8, cursor: 'pointer',
    color: 'rgba(255,255,255,0.5)'
  }}><X size={15} /></button>
);

/* ─── main component ────────────────────────────────────── */
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

  const customerRecords = React.useMemo(() => {
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
  const cancelBooking  = async id => { if (!confirm('Cancel?')) return; try { await axios.post(`${API_BASE}/bookings/cancel`, { bookingId: id }); fetchData(); } catch (_) {} };
  
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
        // If testing past bookings (current time is after slot end time),
        // default to 10 mins before original end time to ensure a positive gap (diff > 0)
        const tenMinsBeforeEnd = Math.max(startMins, endMins - 10);
        const h = Math.floor(tenMinsBeforeEnd / 60) % 24;
        const m = tenMinsBeforeEnd % 60;
        defaultTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    } catch (_) {
      defaultTime = booking.startTime || "09:00";
    }

    setEarlyEndTime(defaultTime);
    setShiftType('request'); // default to request
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
  const delChair = async id => { if (!confirm('Delete?')) return; const token = localStorage.getItem('token'); try { await axios.post(`${API_BASE}/salons/chairs/delete`, { chairId: id }, { headers: { Authorization: `Bearer ${token}` } }); fetchData(); } catch (_) {} };

  const addService = async () => {
    if (!cfg.newServiceName || !cfg.newServicePrice) return;
    const token = localStorage.getItem('token');
    try { await axios.post(`${API_BASE}/salons/services/add`, { name: cfg.newServiceName, price: +cfg.newServicePrice, duration: +(cfg.newServiceDuration || 30) }, { headers: { Authorization: `Bearer ${token}` } }); setCfg(c => ({ ...c, newServiceName: '', newServicePrice: '', newServiceDuration: '' })); fetchData(); } catch (_) {}
  };
  const delService = async id => { if (!confirm('Delete?')) return; const token = localStorage.getItem('token'); try { await axios.post(`${API_BASE}/salons/services/delete`, { serviceId: id }, { headers: { Authorization: `Bearer ${token}` } }); fetchData(); } catch (_) {} };

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
    if (!confirm("Are you sure you want to delete this image?")) return;
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
        
        // Compress to JPEG with 0.8 quality
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
          alert("Failed to upload image. It may still be too large or your network dropped.");
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
    if (!confirm("Are you sure you want to delete this portfolio image?")) return;
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
  const navTo = id => { setActiveTab(id); setMobileSidebar(false); };

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
    <div style={{ minHeight:'100vh', background:'#0a0a0f', color: '#e2e8f0', fontFamily:'sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Skeleton Dashboard Mockup */}
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        {/* Sidebar Skeleton */}
        <div style={{ width: 240, borderRight: '1px solid rgba(255,255,255,0.05)', background: '#111119', padding: 24, display: 'none', flexDirection: 'column', gap: 20 }} className="desktop-sidebar-loader">
          <div style={{ height: 40, background: 'rgba(255,255,255,0.03)', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: 35, background: 'rgba(255,255,255,0.02)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        </div>
        {/* Main Content Area Skeleton */}
        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header Skeleton */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 200, height: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
          </div>
          {/* Stats Cards Skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 110, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
          {/* Sub Grid Skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, flex: 1 }} className="dashboard-grid-loader">
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, animation: 'pulse 1.5s infinite' }}>
              <div style={{ height: 24, width: 150, background: 'rgba(255,255,255,0.02)', borderRadius: 6 }} />
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.01)', borderRadius: 12 }} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, animation: 'pulse 1.5s infinite' }}>
              <div style={{ height: 24, width: 120, background: 'rgba(255,255,255,0.02)', borderRadius: 6 }} />
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.01)', borderRadius: 12 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Existing Loader Overlaid in center */}
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.6} 50%{opacity:0.3}}
        @media (min-width: 769px) {
          .desktop-sidebar-loader { display: flex !important; }
        }
        @media (max-width: 768px) {
          .dashboard-grid-loader { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:16, zIndex: 10, background: 'rgba(10,10,15,0.85)', padding: '24px 32px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
        <div style={{ position:'relative', width:56, height:56 }}>
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid rgba(139,92,246,0.2)', borderTopColor:'#8b5cf6', animation:'spin 1s linear infinite' }} />
          <Scissors size={20} style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', color:'#8b5cf6' }} />
        </div>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight: 600, margin: 0 }}>Loading Shop Panel…</p>
      </div>
    </div>
  );

  /* ── sidebar width tokens ── */
  const SW = sidebarOpen ? 240 : 68; // desktop
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  return (
   <div style={{ display:'flex', minHeight:'100vh', background:'#0d0d14', color:'#e2e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 2px; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22); }
        input, select, textarea, button { font-family: inherit; }
        select option { background: #1a1a2e; color: #e2e8f0; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot { 0%,100%{ opacity:1;transform:scale(1); } 50%{ opacity:.5;transform:scale(.75); } }
        @keyframes slideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }

        /* nav */
        .ni { display:flex; align-items:center; gap:11px; width:100%; padding:9px 12px; border-radius:10px;
              font-size:14px; font-weight:500; color:rgba(255,255,255,0.4); background:transparent;
              border:none; cursor:pointer; transition:background .15s,color .15s; white-space:nowrap; overflow:hidden; text-align:left; }
        .ni:hover  { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.8); }
        .ni.on     { background:rgba(139,92,246,0.15); color:#c4b5fd; }

        /* table rows */
        .tr:hover td { background: rgba(255,255,255,0.018); }
        td { vertical-align: middle; }

        /* toggle */
        .tog { position:relative; display:inline-block; width:42px; height:23px; flex-shrink:0; }
        .tog input { opacity:0; width:0; height:0; position:absolute; }
        .tslide { position:absolute; inset:0; background:rgba(255,255,255,0.1); border-radius:12px; cursor:pointer; transition:.25s; }
        .tslide::before { content:''; position:absolute; width:17px; height:17px; left:3px; top:3px;
                          background:rgba(255,255,255,0.5); border-radius:50%; transition:.25s; }
        .tog input:checked + .tslide { background:rgba(139,92,246,0.65); }
        .tog input:checked + .tslide::before { transform:translateX(19px); background:#c4b5fd; }

        /* mobile overlay */
        .mob-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:199; }

        /* responsive */
        @media(max-width:768px){
          .stat-grid  { grid-template-columns: repeat(2,1fr) !important; }
          .svc-grid   { grid-template-columns: 1fr !important; }
          .topbar-right .user-info .user-text { display:none !important; }
          .topbar-right .user-info { padding:6px !important; border-radius:50% !important; }
          .mob-overlay { display:block; }
          .desktop-sidebar { display:none !important; }
          .mob-sidebar { display:flex !important; }
          .main-content { margin-left:0 !important; }
          .topbar-pad  { padding:12px 16px !important; }
          .content-pad { padding:16px !important; }
          .th-hide { display:none !important; }
          .td-hide { display:none !important; }
          .two-col { grid-template-columns:1fr !important; }
          .walkin-btn span.full { display:none; }
          .walkin-btn span.short { display:inline !important; }
        }
        @media(min-width:769px){
          .mob-overlay { display:none !important; }
          .mob-sidebar { display:none !important; }
          .walkin-btn span.short { display:none; }
        }
        @media(max-width:480px){
          .stat-grid { grid-template-columns:1fr 1fr !important; }
          .stat-val   { font-size:18px !important; }
        }
      `}</style>
      
      {/* ─── MOBILE OVERLAY ─── */}
      {mobileSidebar && <div className="mob-overlay" onClick={() => setMobileSidebar(false)} />}

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="desktop-sidebar" style={{
        width: SW, minHeight: '100vh', flexShrink: 0,
        background: '#0a0a0f', borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        padding: '18px 10px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
        transition: 'width 0.25s cubic-bezier(.4,0,.2,1)', overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 10px', marginBottom:28, overflow:'hidden' }}>
          <div style={{ width:34, height:34, flexShrink:0, background:'linear-gradient(135deg,#7c3aed,#5b21b6)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(124,58,237,0.4)' }}>
            <Scissors size={17} color="white" />
          </div>
          {sidebarOpen && (
            <div style={{ overflow:'hidden', maxWidth:150 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'white', letterSpacing:'-0.02em', lineHeight:1.2, textOverflow:'ellipsis', overflow:'hidden', whiteSpace:'nowrap' }}>{salon?.name || 'TrimSync'}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>Dashboard</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
          {sidebarOpen && <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'0 12px', marginBottom:6 }}>Menu</div>}
          {navItems.map(item => (
            <button key={item.id} className={`ni ${activeTab === item.id ? 'on' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
              <item.icon size={17} style={{ flexShrink:0 }} />
              {sidebarOpen && <span style={{ flex:1 }}>{item.label}</span>}
              {sidebarOpen && activeTab === item.id && <div style={{ width:5, height:5, borderRadius:'50%', background:'#8b5cf6', flexShrink:0 }} />}
            </button>
          ))}
        </nav>

        {/* Status chip */}
        {sidebarOpen && (
          <div style={{ margin:'10px 0', padding:'11px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', flexShrink:0, background: salon?.isOffToday ? '#ef4444' : '#22c55e', animation:'pulseDot 2s infinite' }} />
              <span style={{ fontSize:12, fontWeight:600, color: salon?.isOffToday ? '#fca5a5' : '#86efac' }}>{salon?.isOffToday ? 'Closed Today' : 'Open Now'}</span>
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', paddingLeft:15 }}>{formatTo12Hr(salon?.operatingHours?.open)} – {formatTo12Hr(salon?.operatingHours?.close)}</div>
          </div>
        )}

        {/* Logout */}
        <button className="ni" onClick={handleLogout} style={{ color:'rgba(239,68,68,0.6)', marginTop:4, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
          <LogOut size={17} style={{ flexShrink:0 }} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* ─── MOBILE SIDEBAR ─── */}
      <aside className="mob-sidebar" style={{
        display:'none', position:'fixed', top:0, left:0, height:'100vh', width:240, zIndex:200,
        background:'#0a0a0f', borderRight:'1px solid rgba(255,255,255,0.07)',
        flexDirection:'column', padding:'18px 10px',
        transform: mobileSidebar ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.25s cubic-bezier(.4,0,.2,1)'
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 4px', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, background:'linear-gradient(135deg,#7c3aed,#5b21b6)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Scissors size={17} color="white" />
            </div>
            <div style={{ fontSize:15, fontWeight:700, color:'white' }}>TrimSync</div>
          </div>
          <button onClick={() => setMobileSidebar(false)} style={{ background:'rgba(255,255,255,0.05)', border:'none', borderRadius:7, padding:6, cursor:'pointer', color:'rgba(255,255,255,0.5)', display:'flex' }}><X size={15} /></button>
        </div>
        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
          {navItems.map(item => (
            <button key={item.id} className={`ni ${activeTab === item.id ? 'on' : ''}`} onClick={() => navTo(item.id)}>
              <item.icon size={17} style={{ flexShrink:0 }} />
              <span style={{ flex:1 }}>{item.label}</span>
              {activeTab === item.id && <div style={{ width:5, height:5, borderRadius:'50%', background:'#8b5cf6' }} />}
            </button>
          ))}
        </nav>
        <button className="ni" onClick={handleLogout} style={{ color:'rgba(239,68,68,0.6)' }}>
          <LogOut size={17} /><span>Logout</span>
        </button>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="main-content" style={{
    flex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.25s ease',
    width: '100%',
    minWidth: 0,
    overflowX: 'hidden',
    marginLeft: window.innerWidth > 768 ? SW : 0
  }}>

        {/* Topbar */}
        <header className="topbar-pad" style={{
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
          padding:'14px 28px', borderBottom:'1px solid rgba(255,255,255,0.05)',
          background:'rgba(13,13,20,0.9)', backdropFilter:'blur(12px)',
          position:'sticky', top:0, zIndex:50
        }}>
          {/* Left */}
          <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
            {/* Desktop: collapse sidebar */}
            <button onClick={() => setSidebarOpen(o => !o)}
              className="desktop-sidebar"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:34, height:34, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, cursor:'pointer', color:'rgba(255,255,255,0.5)', flexShrink:0 }}>
              <Menu size={17} />
            </button>
            {/* Mobile: open sidebar */}
            <button onClick={() => setMobileSidebar(true)}
              className="mob-sidebar"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:34, height:34, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, cursor:'pointer', color:'rgba(255,255,255,0.5)', flexShrink:0 }}>
              <Menu size={17} />
            </button>
            <div style={{ minWidth:0 }}>
              <h1 style={{ fontSize:16, fontWeight:700, color:'white', textTransform:'capitalize', letterSpacing:'-0.01em', lineHeight:1.2 }}>{activeTab}</h1>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:1, whiteSpace:'nowrap' }}>
                {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="topbar-right" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <PrimaryBtn onClick={() => setShowWalkin(true)} className="walkin-btn" style={{ padding:'9px 16px', fontSize:13 }}>
              <UserPlus size={15} />
              <span className="full">Add Walk-in</span>
              <span className="short" style={{ display:'none' }}>Walk-in</span>
            </PrimaryBtn>

            <button style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', width:34, height:34, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, cursor:'pointer', color:'rgba(255,255,255,0.4)', flexShrink:0 }}>
              <Bell size={16} />
              {data.liveQueue.length > 0 && <div style={{ position:'absolute', top:7, right:7, width:6, height:6, background:'#8b5cf6', borderRadius:'50%' }} />}
            </button>

            <div className="user-info" onClick={() => setShowDropdown(d => !d)} style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 10px 6px 6px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, cursor:'pointer', position: 'relative' }}>
              <div style={{ width:28, height:28, flexShrink:0, background:'linear-gradient(135deg,#7c3aed,#5b21b6)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white' }}>
                {(salon?.ownerName?.[0] || 'A').toUpperCase()}
              </div>
              <div className="user-text" style={{ maxWidth: 120, overflow: 'hidden' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.8)', lineHeight:1.2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {salon?.ownerName || 'Owner'}
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.06em', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {salon?.name || 'Admin'}
                </div>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div onClick={e => e.stopPropagation()} style={{
                  position: 'absolute', top: '38px', right: 0, width: 280,
                  background: '#13131f', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  zIndex: 200, cursor: 'default'
                }}>
                  {/* Dropdown Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {(salon?.ownerName?.[0] || 'A').toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{salon?.ownerName || 'Owner'}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{salon?.name || 'Salon'}</div>
                      
                      {/* Ratings stars */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Star size={10} color="#fbbf24" fill="#fbbf24" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24' }}>
                          {(() => {
                            const ratings = salon?.ratings || [];
                            return ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) : "0.0";
                          })()}
                        </span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                          ({(salon?.ratings || []).length})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button onClick={() => { setActiveTab('profile'); setShowDropdown(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
                      background: activeTab === 'profile' ? 'rgba(139,92,246,0.1)' : 'transparent',
                      border: 'none', borderRadius: 10, color: activeTab === 'profile' ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, color 0.15s'
                    }} onMouseEnter={e => { if (activeTab !== 'profile') { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; } }}
                      onMouseLeave={e => { if (activeTab !== 'profile') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}>
                      My Profile
                    </button>
                    <button onClick={() => { setActiveTab('settings'); setShowDropdown(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
                      background: activeTab === 'settings' ? 'rgba(139,92,246,0.1)' : 'transparent',
                      border: 'none', borderRadius: 10, color: activeTab === 'settings' ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, color 0.15s'
                    }} onMouseEnter={e => { if (activeTab !== 'settings') { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; } }}
                      onMouseLeave={e => { if (activeTab !== 'settings') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}>
                      Personal Settings
                    </button>
                    <button onClick={() => { setActiveTab('help'); setShowDropdown(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
                      background: activeTab === 'help' ? 'rgba(139,92,246,0.1)' : 'transparent',
                      border: 'none', borderRadius: 10, color: activeTab === 'help' ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, color 0.15s'
                    }} onMouseEnter={e => { if (activeTab !== 'help') { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; } }}
                      onMouseLeave={e => { if (activeTab !== 'help') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}>
                      Help and Support
                    </button>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                    <button onClick={() => { setShowDropdown(false); handleLogout(); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
                      background: 'transparent', border: 'none', borderRadius: 10, color: 'rgba(239,68,68,0.7)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, color 0.15s'
                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#fca5a5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; }}>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="content-pad"  style={{
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '32px',
    flex: 1
  }}>

          {/* ══ OVERVIEW ══ */}
          {activeTab === 'overview' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Stat cards */}
              <div className="stat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
                {[
                  { label:'Revenue Today', val:`₹${earnings()}`,                  icon:DollarSign, color:'#4ade80', bg:'rgba(74,222,128,0.1)'  },
                  { label:'Total Clients',  val:data.history.length+data.liveQueue.length, icon:Users,       color:'#60a5fa', bg:'rgba(96,165,250,0.1)'  },
                  { label:'Live Queue',     val:data.liveQueue.length,              icon:Activity,   color:'#a78bfa', bg:'rgba(167,139,250,0.1)' },
                  { label:'Top Service',    val:topService(),                       icon:Star,       color:'#fbbf24', bg:'rgba(251,191,36,0.1)'  },
                ].map((s,i) => (
                  <div key={i} style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ width:36, height:36, background:s.bg, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <s.icon size={18} color={s.color} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>{s.label}</div>
                      <div className="stat-val" style={{ fontSize:20, fontWeight:700, color:'white', letterSpacing:'-0.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Queue table */}
              <Card style={{ padding:0, overflow:'hidden' }}>
                {/* header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:'#8b5cf6', animation:'pulseDot 2s infinite', flexShrink:0 }} />
                    <span style={{ fontSize:14, fontWeight:700, color:'white' }}>Live Queue</span>
                    <Badge color="violet">{data.liveQueue.length} active</Badge>
                  </div>
                  <button onClick={fetchData} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, cursor:'pointer', color:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:500 }}>
                    <Activity size={13} /> Refresh
                  </button>
                </div>

                {/* scrollable table wrapper */}
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
                    <thead>
                      <tr style={{ background:'rgba(255,255,255,0.02)' }}>
                        {['Client','Services','Time','Actions'].map(h => (
                          <th key={h} style={{ padding:'10px 22px', textAlign:'left', fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.liveQueue.map((b, i) => (
                        <tr key={b._id} className="tr" style={{ borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding:'14px 22px', whiteSpace:'nowrap' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                              <div style={{ width:34, height:34, flexShrink:0, background:`hsl(${(b.customerId?.name?.charCodeAt(0)||65)*5},50%,22%)`, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.7)' }}>
                                {(b.customerId?.name?.[0]||'W').toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)', lineHeight:1.2, display:'flex', flexWrap:'wrap', alignItems:'center', gap:6 }}>
                                  {b.customerId?.name||'Walk-in'}
                                  {b.rescheduleStatus === 'pending' && (
                                    <span style={{ padding:'2px 6px', background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.25)', borderRadius:12, fontSize:9, color:'#c4b5fd', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.03em' }}>Pending Shift Offer</span>
                                  )}
                                  {b.rescheduleStatus === 'declined' && (
                                    <span style={{ padding:'2px 6px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12, fontSize:9, color:'#fca5a5', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.03em' }}>Shift Declined</span>
                                  )}
                                </div>
                                <button onClick={() => openCRM(b)} style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, color:'#8b5cf6', background:'none', border:'none', cursor:'pointer', padding:0, marginTop:3 }}>
                                  <Info size={10} /> Profile
                                </button>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'14px 22px' }}>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                              {b.services.map((s,j) => (
                                <span key={j} style={{ padding:'3px 8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:500, whiteSpace:'nowrap' }}>{s.name}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding:'14px 22px', whiteSpace:'nowrap' }}>
                            <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.7)', fontFamily:'DM Mono, monospace' }}>{formatTo12Hr(b.startTime)}<span style={{ color:'rgba(255,255,255,0.2)', margin:'0 4px' }}>→</span>{formatTo12Hr(b.endTime)}</div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:2 }}>{b.chairName||'—'}</div>
                          </td>
                          <td style={{ padding:'14px 22px', whiteSpace:'nowrap' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              {b.rescheduleStatus === 'pending' ? (
                                <>
                                  <button onClick={() => handleRescheduleAction(b._id, 'cancel')} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, fontFamily:'inherit' }}
                                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}>
                                    Cancel Req
                                  </button>
                                  <button onClick={() => handleRescheduleAction(b._id, 'force')} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 10px', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:8, cursor:'pointer', color:'#c4b5fd', fontSize:11, fontWeight:600, fontFamily:'inherit' }}
                                    onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,0.25)'}
                                    onMouseLeave={e => e.currentTarget.style.background='rgba(139,92,246,0.15)'}>
                                    <Zap size={11} /> Force Shift
                                  </button>
                                </>
                              ) : b.rescheduleStatus === 'declined' ? (
                                <>
                                  <button onClick={() => handleRescheduleAction(b._id, 'cancel')} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, fontFamily:'inherit' }}
                                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}>
                                    Dismiss
                                  </button>
                                </>
                              ) : (
                                <>
                                  <IconBtn danger onClick={() => cancelBooking(b._id)} title="Cancel Booking"><XCircle size={15} /></IconBtn>
                                  <button onClick={() => openEarlyComplete(b)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.18)', borderRadius:8, cursor:'pointer', color:'#c4b5fd', fontSize:12, fontWeight:600, fontFamily:'inherit' }}
                                    onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,0.18)'}
                                    onMouseLeave={e => e.currentTarget.style.background='rgba(139,92,246,0.1)'}>
                                    <Zap size={14} /> Done Early
                                  </button>
                                  <button onClick={() => completeBooking(b._id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.18)', borderRadius:8, cursor:'pointer', color:'#86efac', fontSize:12, fontWeight:600, fontFamily:'inherit' }}
                                    onMouseEnter={e => e.currentTarget.style.background='rgba(34,197,94,0.18)'}
                                    onMouseLeave={e => e.currentTarget.style.background='rgba(34,197,94,0.1)'}>
                                    <CheckCircle size={14} /> Done
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {data.liveQueue.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ padding:'52px 22px', textAlign:'center' }}>
                            <div style={{ width:48, height:48, background:'rgba(255,255,255,0.03)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                              <Coffee size={22} color="rgba(255,255,255,0.12)" />
                            </div>
                            <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.25)', marginBottom:5 }}>Queue is empty</div>
                            <div style={{ fontSize:12, color:'rgba(255,255,255,0.12)' }}>New appointments appear here in real time.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ══ CHAIRS ══ */}
          {activeTab === 'chairs' && (
            <div style={{ maxWidth:560 }}>
              <Card>
                <SectionTitle icon={Users} badge={`${salon?.chairs.length||0} total`}>Barbers & Chairs</SectionTitle>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
                  {salon?.chairs.map((chair, i) => (
                    <div key={chair._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:11 }}>
                      <div style={{ width:34, height:34, flexShrink:0, background:`hsl(${260+i*22},55%,22%)`, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#c4b5fd' }}>{i+1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.85)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{chair.name}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:2 }}>Chair #{i+1}</div>
                      </div>
                      <IconBtn danger onClick={() => delChair(chair._id)}><Trash2 size={15} /></IconBtn>
                    </div>
                  ))}
                </div>
                {/* add row */}
                <div style={{ display:'flex', gap:10, padding:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:11 }}>
                  <label htmlFor="new-barber-name-input" className="sr-only">New barber name</label>
                  <InputField id="new-barber-name-input" name="newChairName" placeholder="New barber name…" value={cfg.newChairName} onChange={e => setCfg(c=>({...c,newChairName:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addChair()} style={{ flex:1 }} />
                  <PrimaryBtn onClick={addChair} style={{ padding:'10px 18px', flexShrink:0 }}><Plus size={15} /> Add</PrimaryBtn>
                </div>
              </Card>
            </div>
          )}

          {/* ══ SERVICES ══ */}
          {activeTab === 'services' && (
            <div className="svc-grid" style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:20, alignItems:'start' }}>
              {/* list */}
              <Card>
                <SectionTitle icon={Scissors} badge={`${salon?.services.length||0}`}>Service Menu</SectionTitle>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {salon?.services.map(s => (
                    <div key={s._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:11 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.85)', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <Badge color="green">₹{s.price}</Badge>
                          <Badge color="blue">{s.duration} min</Badge>
                        </div>
                      </div>
                      <IconBtn danger onClick={() => delService(s._id)}><Trash2 size={15} /></IconBtn>
                    </div>
                  ))}
                  {(!salon?.services||salon.services.length===0) && (
                    <div style={{ padding:'32px 0', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>No services yet.</div>
                  )}
                </div>
              </Card>

              {/* add form */}
              <Card style={{ border:'1px solid rgba(139,92,246,0.2)', background:'linear-gradient(160deg,#13131f,#120f20)' }}>
                <SectionTitle icon={Plus}>Add Service</SectionTitle>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div><Label htmlFor="new-service-name">Service name</Label><InputField id="new-service-name" name="newServiceName" placeholder="e.g. Skin Fade" value={cfg.newServiceName} onChange={e=>setCfg(c=>({...c,newServiceName:e.target.value}))} /></div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div><Label htmlFor="new-service-price">Price (₹)</Label><InputField id="new-service-price" name="newServicePrice" type="number" placeholder="500" value={cfg.newServicePrice} onChange={e=>setCfg(c=>({...c,newServicePrice:e.target.value}))} /></div>
                    <div><Label htmlFor="new-service-duration">Duration (min)</Label><InputField id="new-service-duration" name="newServiceDuration" type="number" placeholder="30" value={cfg.newServiceDuration} onChange={e=>setCfg(c=>({...c,newServiceDuration:e.target.value}))} /></div>
                  </div>
                  <PrimaryBtn onClick={addService} style={{ width:'100%', marginTop:4, padding:'11px' }}><Plus size={15} /> Add to Catalog</PrimaryBtn>
                </div>
              </Card>
            </div>
          )}

          {/* ══ HISTORY ══ */}
          {activeTab === 'history' && (() => {
            const filteredHistory = data.history.filter(b => {
              if (historyDateFilter) {
                const bDate = b.appointmentDate?.split('T')[0];
                if (bDate !== historyDateFilter) return false;
              }
              if (historySearchQuery.trim()) {
                const query = historySearchQuery.toLowerCase();
                const clientName = (b.customerId?.name || 'Walk-in').toLowerCase();
                const timeStr = `${b.startTime} ${b.endTime}`.toLowerCase();
                const servicesStr = b.services.map(s => s.name).join(' ').toLowerCase();
                const chairName = (b.chairName || '').toLowerCase();
                
                const matches = clientName.includes(query) || 
                                timeStr.includes(query) || 
                                servicesStr.includes(query) || 
                                chairName.includes(query);
                if (!matches) return false;
              }
              return true;
            });

            const sortedFilteredHistory = [...filteredHistory].sort((a, b) => {
              const dateA = new Date(a.appointmentDate);
              const dateB = new Date(b.appointmentDate);
              if (dateA.getTime() !== dateB.getTime()) {
                return dateB.getTime() - dateA.getTime();
              }
              return b.startTime.localeCompare(a.startTime);
            });

            return (
              <Card style={{ padding:0, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <Calendar size={16} color="#8b5cf6" />
                    <span style={{ fontSize:14, fontWeight:700, color:'white' }}>Booking History</span>
                  </div>
                  <Badge color="violet">
                    {historyDateFilter || historySearchQuery ? `${sortedFilteredHistory.length} matches` : `${data.history.length} records`}
                  </Badge>
                </div>

                {/* Filters Row */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:12, padding:'14px 22px', borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.01)', alignItems:'center' }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, minWidth:160 }}>
                    <Label htmlFor="history-date-filter-owner">Filter Date</Label>
                    <InputField 
                      id="history-date-filter-owner"
                      name="historyDateFilter"
                      type="date" 
                      value={historyDateFilter} 
                      onChange={e => setHistoryDateFilter(e.target.value)} 
                      style={{ padding:'8px 12px', fontSize:13 }} 
                    />
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1, minWidth:200 }}>
                    <Label htmlFor="history-search-query-owner">Search Client, Time, or Service</Label>
                    <InputField 
                      id="history-search-query-owner"
                      name="historySearchQuery"
                      type="text" 
                      placeholder="Search name, time (e.g. 10:30), or service..." 
                      value={historySearchQuery} 
                      onChange={e => setHistorySearchQuery(e.target.value)} 
                      style={{ padding:'8px 12px', fontSize:13 }} 
                    />
                  </div>
                  {(historyDateFilter || historySearchQuery) && (
                    <button 
                      onClick={() => { setHistoryDateFilter(''); setHistorySearchQuery(''); }} 
                      style={{ alignSelf:'flex-end', height:38, padding:'0 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, color:'#fca5a5', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', minWidth:460 }}>
                    <thead>
                      <tr style={{ background:'rgba(255,255,255,0.02)' }}>
                        {['Client','Services','Date & Time','Status'].map(h => (
                          <th key={h} style={{ padding:'10px 22px', textAlign:'left', fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFilteredHistory.map(b => (
                        <tr key={b._id} className="tr" style={{ borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding:'13px 22px', whiteSpace:'nowrap' }}>
                            <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.8)' }}>{b.customerId?.name||'Walk-in'}</div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', fontFamily:'DM Mono,monospace', marginTop:2 }}>#{b._id.slice(-6)}</div>
                          </td>
                          <td style={{ padding:'13px 22px', maxWidth:200 }}>
                            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.services.map(s=>s.name).join(', ')}</div>
                          </td>
                          <td style={{ padding:'13px 22px', whiteSpace:'nowrap' }}>
                            <div style={{ fontSize:12, color:'rgba(255,255,255,0.55)', fontFamily:'DM Mono,monospace' }}>{b.appointmentDate?.split('T')[0]}</div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:2, fontFamily:'DM Mono,monospace' }}>{formatTo12Hr(b.startTime)}</div>
                          </td>
                          <td style={{ padding:'13px 22px', whiteSpace:'nowrap' }}>
                            <Badge color={b.status==='completed'?'green':b.status==='cancelled'?'red':'blue'}>{b.status}</Badge>
                          </td>
                        </tr>
                      ))}
                      {sortedFilteredHistory.length===0 && (
                        <tr><td colSpan="4" style={{ padding:'52px', textAlign:'center', color:'rgba(255,255,255,0.18)', fontSize:13 }}>No matching records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })()}

          {/* ══ CUSTOMER RECORDS ══ */}
          {activeTab === 'customers' && (() => {
            const filteredCustomers = customerRecords.filter(c => 
              c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
              c.phone.toLowerCase().includes(customerSearchQuery.toLowerCase())
            );

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.3s ease' }}>
                <Card>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap', marginBottom:20 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:40, height:40, background:'rgba(255,255,255,0.05)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <BookUser size={20} color="#a78bfa" />
                      </div>
                      <div>
                        <h2 style={{ fontSize:18, fontWeight:700, color:'white', margin:0 }}>Customer Records</h2>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2, marginBottom:0 }}>{customerRecords.length} unique customers</p>
                      </div>
                    </div>
                    
                    {/* Tabs & Search */}
                    <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                      <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', padding:4, borderRadius:12, border:'1px solid rgba(255,255,255,0.08)' }}>
                        <button 
                          onClick={() => setCustomerTab('clients')}
                          style={{
                            padding: '6px 16px', background: customerTab === 'clients' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderRadius: 8, border: 'none', color: customerTab === 'clients' ? 'white' : 'rgba(255,255,255,0.5)',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                          }}
                        >
                          Clients
                        </button>
                        <button 
                          onClick={() => setCustomerTab('detailed')}
                          style={{
                            padding: '6px 16px', background: customerTab === 'detailed' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderRadius: 8, border: 'none', color: customerTab === 'detailed' ? 'white' : 'rgba(255,255,255,0.5)',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                          }}
                        >
                          Detailed Overview
                        </button>
                      </div>

                      <div style={{ position:'relative', width: 220 }}>
                        <InputField 
                          type="text" 
                          placeholder="Search customers..." 
                          value={customerSearchQuery}
                          onChange={e => setCustomerSearchQuery(e.target.value)}
                          style={{ paddingLeft: 36, height: 36, fontSize: 13 }}
                        />
                        <div style={{ position:'absolute', left: 12, top: 10 }}>
                          <Users size={14} color="rgba(255,255,255,0.3)" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px solid rgba(255,255,255,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Name</th>
                          <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</th>
                          {customerTab === 'detailed' && (
                            <>
                              <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Visits</th>
                              <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</th>
                              <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Visit</th>
                              <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={customerTab === 'detailed' ? 6 : 2} style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                              No customers found matching your search.
                            </td>
                          </tr>
                        ) : (
                          filteredCustomers.map(c => (
                            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                                    {c.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{c.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                                {c.phone}
                              </td>
                              {customerTab === 'detailed' && (
                                <>
                                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'white', fontWeight: 600 }}>
                                    {c.totalVisits} <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>visits</span>
                                  </td>
                                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#4ade80', fontWeight: 700 }}>
                                    ₹{c.totalRevenue}
                                  </td>
                                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                                    {c.lastVisitDate ? new Date(c.lastVisitDate).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td style={{ padding: '14px 16px' }}>
                                    <span style={{ background: c.totalVisits > 5 ? 'rgba(34,197,94,0.1)' : 'rgba(56,189,248,0.1)', color: c.totalVisits > 5 ? '#86efac' : '#bae6fd', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      {c.totalVisits > 5 ? 'VIP' : 'Regular'}
                                    </span>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            );
          })()}

          {/* ══ SALON CONFIGURATION ══ */}
          {activeTab === 'config' && (
            <div style={{ maxWidth:520, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                  <div style={{ width:38, height:38, flexShrink:0, background:'rgba(255,255,255,0.05)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Settings size={18} color="rgba(255,255,255,0.55)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize:15, fontWeight:700, color:'white', lineHeight:1.2 }}>Salon Configuration</h2>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)', marginTop:2 }}>Manage hours & availability</p>
                  </div>
                </div>

                <form onSubmit={saveSettings} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                  <div className="two-col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div><Label htmlFor="salon-config-opentime">Opening hour</Label><InputField id="salon-config-opentime" name="openTime" type="time" value={cfg.openTime} onChange={e=>setCfg(c=>({...c,openTime:e.target.value}))} /></div>
                    <div><Label htmlFor="salon-config-closetime">Closing hour</Label><InputField id="salon-config-closetime" name="closeTime" type="time" value={cfg.closeTime} onChange={e=>setCfg(c=>({...c,closeTime:e.target.value}))} /></div>
                  </div>

                  <div>
                    <Label htmlFor="salon-config-weeklyoff">Weekly day off</Label>
                    <SelectField id="salon-config-weeklyoff" name="weeklyOffDay" value={cfg.weeklyOffDay} onChange={e=>setCfg(c=>({...c,weeklyOffDay:e.target.value}))}>
                      <option value="-1">No regular holiday</option>
                      {days.map((d,i)=><option key={i} value={i}>{d}</option>)}
                    </SelectField>
                  </div>

                  {/* Emergency toggle */}
                  <div style={{ display:'flex', alignItems:'flex-start', gap:16, padding:'16px 18px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.12)', borderRadius:12 }}>
                    <label className="tog" style={{ marginTop:1 }} htmlFor="salon-config-offtoday">
                      <input id="salon-config-offtoday" name="isOffToday" type="checkbox" checked={cfg.isOffToday} onChange={e=>setCfg(c=>({...c,isOffToday:e.target.checked}))} aria-label="Emergency closure today" />
                      <span className="tslide" />
                    </label>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#fca5a5', marginBottom:4, lineHeight:1.2 }}>Emergency Closure</div>
                      <div style={{ fontSize:12, color:'rgba(252,165,165,0.45)', lineHeight:1.6 }}>Disables all bookings and marks your salon closed in the marketplace for today.</div>
                    </div>
                  </div>

                  <PrimaryBtn type="submit" style={{ width:'100%', padding:'12px', marginTop:2 }}>
                    <Save size={15} /> Save Configuration
                  </PrimaryBtn>
                </form>
              </Card>

              {/* Location Settings */}
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                  <div style={{ width:38, height:38, flexShrink:0, background:'rgba(255,255,255,0.05)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <MapPin size={18} color="rgba(255,255,255,0.55)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize:15, fontWeight:700, color:'white', lineHeight:1.2 }}>Location Settings</h2>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)', marginTop:2 }}>Manage geographic coordinates</p>
                  </div>
                </div>
                
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    This controls where your business appears on the map and in proximity searches.
                  </p>
                  
                  {salon?.latitude && salon?.longitude ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MapPin size={18} color="#4ade80" />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>Location Active</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
                            {salon.latitude.toFixed(6)}, {salon.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={handleUpdateLocation} style={{ flex: 1, padding: '8px 12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, color: '#c4b5fd', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s' }}>
                          Update via GPS
                        </button>
                        <button onClick={handleDeleteLocation} style={{ flex: 1, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s' }}>
                          Delete Location
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                      <MapPin size={28} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 12px auto' }} />
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>No Location Set</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px 0' }}>Your salon won't appear accurately on maps.</p>
                      <button onClick={handleUpdateLocation} style={{ padding: '8px 16px', background: 'white', border: 'none', borderRadius: 8, color: 'black', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Set Location via GPS
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ══ MY PROFILE ══ */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.3s ease' }}>
              <button 
                onClick={() => setActiveTab('overview')} 
                style={{
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  background: 'rgba(255,255,255,0.04)', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, 
                  padding: '8px 16px', 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 13, 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  transition: 'all 0.15s ease',
                  width: 'fit-content'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                <ArrowLeft size={16} /> Back 
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>My Profile</h1>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.15)', color: '#86efac', padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      <div style={{ width: 6, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulseDot 2s infinite' }} />
                      Online
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, marginBottom: 0 }}>Edit and manage the content of your online profile</p>
                </div>
              </div>

              <div style={{ maxWidth: 420 }}>
                {/* Profile Info */}
                <Card style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', textAlign: 'center', height: 'fit-content' }}>
                  <button onClick={() => {
                    if (isEditingProfile) {
                      setIsEditingProfile(false);
                    } else {
                      setIsEditingProfile(true);
                      setProfileForm({ ownerName: salon?.ownerName || '', address: salon?.address || '' });
                    }
                  }} style={{
                    position: 'absolute', top: 20, right: 20,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: '6px 12px', color: 'white', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    {isEditingProfile ? 'Cancel' : 'Edit'}
                  </button>

                  {/* Circular Avatar */}
                  <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36, fontWeight: 700, color: 'white',
                    marginBottom: 20, boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
                    border: '2px solid rgba(255,255,255,0.08)'
                  }}>
                    {(salon?.ownerName?.[0] || 'A').toUpperCase()}
                  </div>

                  {!isEditingProfile ? (
                    <>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 6 }}>{salon?.ownerName || 'Owner Name'}</h2>
                      
                      {/* Review stars */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((s) => {
                            const ratings = salon?.ratings || [];
                            const avg = ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length) : 0;
                            return (
                              <Star key={s} size={14} 
                                color={s <= Math.round(avg) ? "#fbbf24" : "rgba(255,255,255,0.15)"} 
                                fill={s <= Math.round(avg) ? "#fbbf24" : "transparent"} 
                              />
                            );
                          })}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                          {(() => {
                            const ratings = salon?.ratings || [];
                            return ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) : "0.0";
                          })()}
                        </span>
                      </div>

                      <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.06)', margin: '12px 0 20px 0' }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location Address</span>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>{salon?.address}</p>
                      </div>

                      <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

                      {/* Salon Photos (Storefront & Interior) */}
                      <div style={{ width: '100%', textAlign: 'left' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Salon Photos ({(salon?.images || []).length}/5)</span>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:6, width:'100%' }}>
                          {(salon?.images || []).map((imgUrl, idx) => (
                            <div key={idx} style={{ position:'relative', paddingBottom: '100%', borderRadius:8, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                              <img src={imgUrl} alt={`Salon storefront ${idx}`} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover' }} />
                              <button 
                                type="button"
                                onClick={() => handleDeleteImage(idx)} 
                                style={{ position:'absolute', top:2, right:2, width:14, height:14, borderRadius:4, background:'rgba(239,68,68,0.95)', color:'white', border:'none', fontSize:8, fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyItems:'center', justifyContent:'center' }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          
                          {(salon?.images || []).length < 5 && (
                            <label htmlFor="salon-storefront-upload" style={{ position: 'relative', paddingBottom: '100%', border:'1px dashed rgba(255,255,255,0.15)', borderRadius:8, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)', cursor:'pointer', background: 'rgba(255,255,255,0.01)' }}
                              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(139,92,246,0.5)'; e.currentTarget.style.color='white';}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.color='rgba(255,255,255,0.3)';}}>
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Plus size={14} />
                              </div>
                              <input id="salon-storefront-upload" name="salonStorefrontUpload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} aria-label="Upload Storefront Image" />
                            </label>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={saveProfileDetails} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', marginTop: 12 }}>
                      <div>
                        <Label htmlFor="edit-profile-name">Owner Name</Label>
                        <InputField id="edit-profile-name" value={profileForm.ownerName} onChange={e => setProfileForm(p => ({ ...p, ownerName: e.target.value }))} required />
                      </div>
                      <div>
                        <Label htmlFor="edit-profile-address">Salon Address</Label>
                        <textarea id="edit-profile-address" value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} required style={{
                          width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: '#e2e8f0',
                          fontSize: 13, outline: 'none', minHeight: 70, resize: 'vertical', fontFamily: 'inherit'
                        }} />
                      </div>
                      <PrimaryBtn type="submit" style={{ width: '100%', marginTop: 6, padding: 11 }}>Save Changes</PrimaryBtn>
                    </form>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ══ SALON PORTFOLIO ══ */}
          {activeTab === 'portfolio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Camera size={20} color="#a78bfa" />
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Salon Portfolio & About</h1>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8, marginBottom: 0 }}>
                    Manage your salon's description and showcase your best work to potential customers.
                  </p>
                </div>
              </div>

              <Card style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>About Salon</h2>
                  {!isEditingAbout && (
                    <button 
                      onClick={() => { setAboutFormText(salon?.about || ''); setIsEditingAbout(true); }}
                      style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', background: 'rgba(139,92,246,0.1)', padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      Edit Text
                    </button>
                  )}
                </div>

                {!isEditingAbout ? (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {salon?.about || "Write a brief description about your salon's hospitality, ambiance, and specialties..."}
                  </p>
                ) : (
                  <form onSubmit={handleSaveAbout} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <textarea 
                      value={aboutFormText} 
                      onChange={e => setAboutFormText(e.target.value)} 
                      placeholder="e.g. We specialize in premium fades and offer complimentary beverages..."
                      required 
                      style={{
                        width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, color: 'white',
                        fontSize: 13, outline: 'none', minHeight: 120, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5
                      }} 
                    />
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setIsEditingAbout(false)} style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                      <button type="submit" style={{ padding: '8px 16px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
                    </div>
                  </form>
                )}
              </Card>

              <Card style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Portfolio Gallery</h2>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>({(salon?.portfolio || []).length}/10 images)</span>
                </div>

                {/* Portfolio grid display */}
                {(salon?.portfolio || []).length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, width: '100%' }}>
                    {(salon?.portfolio || []).map((imgUrl, idx) => (
                      <div key={idx} style={{ position: 'relative', paddingBottom: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <img src={imgUrl} alt={`Portfolio ${idx}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button"
                          onClick={() => handleDeletePortfolioImage(idx)} 
                          style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 8, background: 'rgba(239,68,68,0.95)', color: 'white', border: 'none', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {(salon?.portfolio || []).length < 10 && (
                      <label htmlFor="portfolio-image-upload" style={{ position: 'relative', paddingBottom: '100%', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Plus size={24} />
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Add Photo</span>
                        </div>
                        <input id="portfolio-image-upload" name="portfolioImageUpload" type="file" accept="image/*" onChange={handlePortfolioUpload} style={{ display: 'none' }} aria-label="Upload Portfolio Image" />
                      </label>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
                      <Camera size={32} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Showcase Your Craft</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: 300, lineHeight: 1.5, marginBottom: 20 }}>Upload portfolio photos to display your team's signature haircuts and styling work to customers.</p>
                    
                    <label htmlFor="portfolio-empty-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'rgba(139,92,246,0.1)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.18)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}>
                      <Plus size={16} /> Upload Photos
                      <input id="portfolio-empty-upload" name="portfolioEmptyUpload" type="file" accept="image/*" onChange={handlePortfolioUpload} style={{ display: 'none' }} aria-label="Upload Portfolio Image" />
                    </label>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ══ PERSONAL SETTINGS ══ */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640, animation: 'fadeUp 0.3s ease' }}>
              <button 
                onClick={() => setActiveTab('overview')} 
                style={{
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  background: 'rgba(255,255,255,0.04)', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, 
                  padding: '8px 16px', 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 13, 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  transition: 'all 0.15s ease',
                  width: 'fit-content'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Personal Settings</h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, marginBottom: 0 }}>Manage your contact details and account security.</p>
              </div>

              {/* Section 1: Contact details */}
              <Card style={{ position: 'relative' }}>
                <button onClick={() => {
                  if (isEditingContact) {
                    setIsEditingContact(false);
                  } else {
                    setIsEditingContact(true);
                    setContactForm({
                      ownerName: salon?.ownerName || '',
                      phone: salon?.phone || '',
                      email: salon?.email || ''
                    });
                  }
                }} style={{
                  position: 'absolute', top: 20, right: 20,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, padding: '6px 12px', color: 'white', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {isEditingContact ? 'Cancel' : 'Edit'}
                </button>

                <SectionTitle icon={Users}>Contact details</SectionTitle>

                {!isEditingContact ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Name:</span>
                      <span style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>{salon?.ownerName}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Mobile Number:</span>
                      <span style={{ fontSize: 13, color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{salon?.phone || 'Not provided'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Email Address:</span>
                      <span style={{ fontSize: 13, color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{salon?.email}</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={saveContactDetails} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                    <div>
                      <Label htmlFor="edit-contact-name">Name</Label>
                      <InputField id="edit-contact-name" value={contactForm.ownerName} onChange={e => setContactForm(c => ({ ...c, ownerName: e.target.value }))} required />
                    </div>
                    <div>
                      <Label htmlFor="edit-contact-phone">Mobile Number</Label>
                      <InputField id="edit-contact-phone" value={contactForm.phone} onChange={e => setContactForm(c => ({ ...c, phone: e.target.value.replace(/[^0-9]/g, '') }))} required />
                    </div>
                    <div>
                      <Label htmlFor="edit-contact-email">Email Address</Label>
                      <InputField id="edit-contact-email" type="email" value={contactForm.email} onChange={e => setContactForm(c => ({ ...c, email: e.target.value }))} required />
                    </div>
                    <PrimaryBtn type="submit" style={{ width: '100%', marginTop: 6, padding: 11 }}>Save Details</PrimaryBtn>
                  </form>
                )}

                <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />

                {/* Salon Visibility */}
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 4 }}>Salon Visibility</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>
                      Hiding your salon marks it closed and removes it from listing searches. Toggle back to show it again on the TrimSync booking homepage.
                    </p>
                    <button onClick={toggleSalonVisibility} style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                      background: cfg.isOffToday ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: cfg.isOffToday ? '#fca5a5' : '#86efac',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap'
                    }} onMouseEnter={e => { e.currentTarget.style.background = cfg.isOffToday ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = cfg.isOffToday ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'; }}>
                      {cfg.isOffToday ? 'Salon Hidden' : 'Salon Visible'}
                    </button>
                  </div>
                </div>
              </Card>


              {/* Section 2: Login & Security */}
              <Card>
                <SectionTitle icon={Settings}>Login & security</SectionTitle>
                
                {!passwordFormOpen ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 12 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</span>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontFamily: 'monospace' }}>••••••••</div>
                    </div>
                    <button onClick={() => { setPasswordFormOpen(true); setPasswordStep(1); setPasswordError(''); setPasswordSuccess(''); }} style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '8px 16px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                    }}>
                      Change password
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    {passwordStep === 1 ? (
                      <form onSubmit={handleVerifyCurrentPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                          <Label htmlFor="current-pwd">Current Password</Label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <InputField
                              id="current-pwd"
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="Enter current password"
                              value={passwordForm.currentPassword}
                              onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                              style={{ paddingRight: 40 }}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              style={{
                                position: 'absolute',
                                right: 12,
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                              }}
                            >
                              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        {passwordError && <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600 }}>{passwordError}</div>}
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <button type="button" onClick={() => {
                            setPasswordFormOpen(false);
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setShowCurrentPassword(false);
                            setShowNewPassword(false);
                            setShowConfirmPassword(false);
                          }} style={{
                            flex: 1, padding: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                          }}>
                            Cancel
                          </button>
                          <PrimaryBtn type="submit" style={{ flex: 1, padding: 11 }}>Next</PrimaryBtn>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                          <Label htmlFor="new-pwd">New Password</Label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <InputField
                              id="new-pwd"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Min. 6 characters"
                              value={passwordForm.newPassword}
                              onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                              style={{ paddingRight: 40 }}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              style={{
                                position: 'absolute',
                                right: 12,
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                              }}
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="confirm-pwd">Confirm New Password</Label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <InputField
                              id="confirm-pwd"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              value={passwordForm.confirmPassword}
                              onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                              style={{ paddingRight: 40 }}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              style={{
                                position: 'absolute',
                                right: 12,
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                              }}
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        {passwordError && <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600 }}>{passwordError}</div>}
                        {passwordSuccess && <div style={{ fontSize: 12, color: '#86efac', fontWeight: 600 }}>{passwordSuccess}</div>}
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <button type="button" onClick={() => {
                            setPasswordFormOpen(false);
                            setPasswordStep(1);
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setShowCurrentPassword(false);
                            setShowNewPassword(false);
                            setShowConfirmPassword(false);
                          }} style={{
                            flex: 1, padding: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                          }}>
                            Cancel
                          </button>
                          <PrimaryBtn type="submit" style={{ flex: 1, padding: 11 }}>Save Password</PrimaryBtn>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </Card>

              {/* Section 3: Danger Zone */}
              <Card style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Trash2 size={18} color="#fca5a5" />
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fca5a5', margin: 0 }}>Delete account</h2>
                </div>
                
                <p style={{ fontSize: 12, color: 'rgba(252,165,165,0.5)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                  You will delete all your personal info and won't be able to retrieve it. Are you sure you want to delete your account?
                </p>

                {!deleteConfirmOpen ? (
                  <button onClick={() => setDeleteConfirmOpen(true)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                    background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                  }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}>
                    Delete Account
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px', background: 'rgba(239,68,68,0.05)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5' }}>Are you absolutely sure? This cannot be undone.</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setDeleteConfirmOpen(false)} style={{
                        flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}>
                        Cancel
                      </button>
                      <button onClick={handleDeleteAccount} style={{
                        flex: 1, padding: '8px 12px', background: '#ef4444', border: 'none',
                        borderRadius: 8, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}>
                        Yes, Delete My Account
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ══ HELP & SUPPORT ══ */}
          {activeTab === 'help' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640, animation: 'fadeUp 0.3s ease' }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Help & Support</h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, marginBottom: 0 }}>Get support and learn how to manage your salon queue.</p>
              </div>

              <Card style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SectionTitle icon={Info}>FAQ & Support Center</SectionTitle>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 6 }}>How do clients book appointments?</h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>
                      Clients visit the main marketplace homepage, select your salon, choose their requested services and date/time, and book. The slot immediately appears in your live queue dashboard.
                    </p>
                  </div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 6 }}>What is the "Live Queue" feature?</h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>
                      The live queue shows active scheduled clients for the day. You can click "Complete Early" if a service finishes ahead of schedule, which automatically shifts subsequent clients forward to eliminate gaps.
                    </p>
                  </div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 6 }}>Need further assistance?</h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                      Contact our global TrimSync support team at:
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#c4b5fd', fontWeight: 600, fontFamily: 'monospace' }}>
                      support@trimsync.com | +1 (555) 123-4567
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </div>{/* /content-pad */}
      </main>

      {/* ══ WALK-IN MODAL ══ */}
      {showWalkin && (
        <div onClick={e=>e.target===e.currentTarget&&setShowWalkin(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28, width:'100%', maxWidth:440, maxHeight:'90vh', overflowY:'auto' }}>
            {/* header */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:22 }}>
              <div>
                <h2 style={{ fontSize:18, fontWeight:700, color:'white', lineHeight:1.2 }}>Add Walk-in</h2>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.32)', marginTop:4 }}>Push a client directly to the floor queue.</p>
              </div>
              <ModalClose onClick={()=>setShowWalkin(false)} />
            </div>

            <form onSubmit={addWalkin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><Label htmlFor="walkin-client-name">Client name</Label><InputField id="walkin-client-name" name="clientName" placeholder="Full name" required value={walkin.name} onChange={e=>setWalkin(w=>({...w,name:e.target.value}))} /></div>
              <div><Label htmlFor="walkin-client-phone">Phone (optional)</Label><InputField id="walkin-client-phone" name="clientPhone" placeholder="e.g. 9876543210" value={walkin.phone} onChange={e=>setWalkin(w=>({...w,phone:e.target.value.replace(/[^0-9]/g,'')}))} /></div>
              <div>
                <Label htmlFor="walkin-assign-barber">Assign barber</Label>
                <SelectField id="walkin-assign-barber" name="chairId" value={walkin.chairId} onChange={e=>setWalkin(w=>({...w,chairId:e.target.value}))}>
                  {salon?.chairs.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </SelectField>
              </div>
              <div>
                <Label>Services</Label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {salon?.services.map(s => {
                    const sel = walkin.services.includes(s.name);
                    return (
                      <button key={s._id} type="button"
                        onClick={() => setWalkin(w=>({...w, services: sel ? w.services.filter(n=>n!==s.name) : [...w.services,s.name]}))}
                        style={{ padding:'6px 13px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
                          background: sel ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.04)',
                          border: sel ? '1px solid rgba(139,92,246,0.45)' : '1px solid rgba(255,255,255,0.09)',
                          color: sel ? '#c4b5fd' : 'rgba(255,255,255,0.45)'
                        }}>
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <PrimaryBtn type="submit" style={{ width:'100%', padding:'12px', marginTop:6 }}>
                <Zap size={15} /> Confirm & Push to Queue
              </PrimaryBtn>
            </form>
          </div>
        </div>
      )}

      {/* ══ EARLY COMPLETE MODAL ══ */}
      {showEarlyComplete && earlyCompleteBooking && (
        <div onClick={e=>e.target===e.currentTarget&&setShowEarlyComplete(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28, width:'100%', maxWidth:440 }}>
            {/* header */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:22 }}>
              <div>
                <h2 style={{ fontSize:18, fontWeight:700, color:'white', lineHeight:1.2 }}>Complete Early</h2>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.32)', marginTop:4 }}>Finish this slot early and shift subsequent bookings forward to eliminate gap.</p>
              </div>
              <ModalClose onClick={()=>{setShowEarlyComplete(false); setEarlyCompleteBooking(null);}} />
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)', borderRadius:14, padding:18, marginBottom:16 }}>
              <div>
                <Label>Client Name</Label>
                <div style={{ fontSize:14, fontWeight:600, color:'white' }}>{earlyCompleteBooking.customerId?.name || 'Walk-in'}</div>
              </div>
              
              <div>
                <Label>Scheduled Time</Label>
                <div style={{ fontSize:14, fontWeight:600, color:'white' }}>
                  {formatTo12Hr(earlyCompleteBooking.startTime)} – {formatTo12Hr(earlyCompleteBooking.endTime)}
                </div>
              </div>

              <div>
                <Label>Barber / Chair</Label>
                <div style={{ fontSize:14, fontWeight:600, color:'white' }}>{earlyCompleteBooking.chairName}</div>
              </div>
            </div>

            <form onSubmit={completeBookingEarly} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <Label htmlFor="early-completion-time">Actual Completion Time</Label>
                <InputField 
                  id="early-completion-time"
                  name="earlyEndTime"
                  type="time" 
                  required 
                  value={earlyEndTime} 
                  onChange={e=>setEarlyEndTime(e.target.value)} 
                />
              </div>

              <div>
                <Label htmlFor="queue-shift-type">Queue Shifting Method</Label>
                <SelectField id="queue-shift-type" name="shiftType" value={shiftType} onChange={e=>setShiftType(e.target.value)}>
                  <option value="request">Ask Customer via App Confirmation</option>
                  <option value="force">Force Shift Directly (Confirmed on Call)</option>
                </SelectField>
              </div>
              
              <PrimaryBtn type="submit" style={{ width:'100%', padding:'12px', marginTop:6 }}>
                <Zap size={15} /> Complete & Process Queue
              </PrimaryBtn>
            </form>
          </div>
        </div>
      )}

      {/* ══ CRM MODAL ══ */}
      {selectedCustomer && (
        <div onClick={e=>e.target===e.currentTarget&&setSelectedCustomer(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28, width:'100%', maxWidth:440 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:22 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:'white' }}>Client Profile</h2>
              <ModalClose onClick={()=>setSelectedCustomer(null)} />
            </div>

            {/* Avatar row */}
            <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.14)', borderRadius:12, marginBottom:20 }}>
              <div style={{ width:46, height:46, flexShrink:0, background:'rgba(139,92,246,0.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#c4b5fd' }}>
                {(selectedCustomer.name?.[0]||'C').toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{selectedCustomer.name}</div>
                <div style={{ fontSize:12, color:'#a78bfa', marginTop:2 }}>{selectedCustomer.phone||'No phone on record'}</div>
              </div>
            </div>

            <div style={{ marginBottom:18 }}>
              <Label>Private notes & style history</Label>
              <textarea value={customerNotes} onChange={e=>setCustomerNotes(e.target.value)}
                placeholder="e.g. Prefers low taper, allergic to eucalyptus…"
                style={{ width:'100%', height:130, padding:'10px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:10, color:'#e2e8f0', fontSize:13, outline:'none', resize:'none', lineHeight:1.6, fontFamily:'inherit', boxSizing:'border-box' }}
                onFocus={e=>{e.target.style.borderColor='rgba(139,92,246,0.55)';}}
                onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.09)';}} />
            </div>

            <PrimaryBtn onClick={saveNotes} style={{ width:'100%', padding:'12px' }}>
              <Save size={15} /> Save Record
            </PrimaryBtn>
          </div>
        </div>
      )}

      {/* ══ OWNER INFO MODAL ══ */}
      {showOwnerInfo && (
        <div onClick={e=>e.target===e.currentTarget&&setShowOwnerInfo(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28, width:'100%', maxWidth:440 }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:22 }}>
              <div>
                <h2 style={{ fontSize:18, fontWeight:700, color:'white', lineHeight:1.2 }}>Salon Profile Info</h2>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.32)', marginTop:4 }}>View and manage your listing details.</p>
              </div>
              <ModalClose onClick={()=>setShowOwnerInfo(false)} />
            </div>

            {/* Salon Image Gallery Section */}
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
              <Label>Salon Photos ({(salon?.images || []).length}/5)</Label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(68px, 1fr))', gap:8, width:'100%' }}>
                {(salon?.images || []).map((imgUrl, idx) => (
                  <div key={idx} style={{ position:'relative', height:68, borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <img src={imgUrl} alt={`Salon ${idx}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <button 
                      type="button"
                      onClick={() => handleDeleteImage(idx)} 
                      style={{ position:'absolute', top:2, right:2, width:18, height:18, borderRadius:4, background:'rgba(239,68,68,0.85)', color:'white', border:'none', fontSize:10, fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {(salon?.images || []).length < 5 && (
                  <label htmlFor="salon-image-upload" style={{ height:68, border:'1px dashed rgba(255,255,255,0.15)', borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)', cursor:'pointer' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(139,92,246,0.5)'; e.currentTarget.style.color='white';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.color='rgba(255,255,255,0.3)';}}>
                    <Plus size={16} />
                    <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', marginTop:2 }}>Add</span>
                    <input id="salon-image-upload" name="salonImageUpload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} aria-label="Upload Salon Image" />
                  </label>
                )}
              </div>
            </div>

            {/* Profile Info Details */}
            <div style={{ display:'flex', flexDirection:'column', gap:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)', borderRadius:14, padding:18, marginBottom:8 }}>
              <div>
                <Label>Salon Name</Label>
                <div style={{ fontSize:14, fontWeight:600, color:'white' }}>{salon?.name}</div>
              </div>
              
              <div>
                <Label>Owner Name</Label>
                <div style={{ fontSize:14, fontWeight:600, color:'white' }}>{salon?.ownerName}</div>
              </div>

              <div>
                <Label>Email Address</Label>
                <div style={{ fontSize:14, fontWeight:600, color:'white', fontFamily:'monospace' }}>{salon?.email}</div>
              </div>

              <div>
                <Label>Salon Listed Date</Label>
                <div style={{ fontSize:14, fontWeight:600, color:'white' }}>
                  {salon?.createdAt ? new Date(salon.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}