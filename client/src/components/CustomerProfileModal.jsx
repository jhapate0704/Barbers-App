/**
 * CustomerProfileModal Component
 * 
 * A modal (popup) dialog that allows customers to view and edit their personal profile
 * details such as name, avatar, and contact information.
 */
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

const API_BASE = import.meta.env.VITE_API_URL;


const CustomerProfileModal = ({ isOpen, onClose, customerId, onProfileUpdated }) => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(''); // base64 or URL
  const [newAvatar, setNewAvatar] = useState(''); // base64 of newly selected image
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && customerId) {
      setLoading(true);
      setError('');
      setSuccess('');
      setNewAvatar('');
      axios.get(`${API_BASE}/users/${customerId}`)
        .then(res => {
          setProfile(res.data);
          setName(res.data.name || '');
          setAvatar(res.data.avatar || '');
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Failed to fetch profile details.');
          setLoading(false);
        });
    }
  }, [isOpen, customerId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewAvatar(reader.result);
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        userId: customerId,
        name: name.trim()
      };
      if (newAvatar) {
        payload.avatar = newAvatar;
      }

      const token = localStorage.getItem('customerToken');
      const res = await axios.put(`${API_BASE}/users/profile/update`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = res.data.user;
      
      localStorage.setItem('customerName', updatedUser.name);
      localStorage.setItem('customerAvatar', updatedUser.avatar || '');
      
      setSuccess('Profile updated successfully!');
      setNewAvatar('');
      setProfile(updatedUser);
      setAvatar(updatedUser.avatar || '');
      
      if (onProfileUpdated) {
        onProfileUpdated(updatedUser.name, updatedUser.avatar || '');
      }
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerAvatar');
    onClose();
    navigate('/');
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-200 flex items-center justify-center p-4">
      <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="h-1.5 bg-linear-to-r from-violet-600 to-indigo-600" />
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white p-2 rounded-xl transition-all"
        >
          <X size={18} />
        </button>

        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="text-indigo-400" size={22} /> Customer Profile
          </h2>

          {loading ? (
            <div className="space-y-5 animate-pulse">
              <div className="flex flex-col items-center justify-center gap-2 mb-2">
                <div className="w-24 h-24 rounded-full bg-white/5" />
                <div className="h-4 bg-white/5 rounded w-16" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-white/5 rounded w-12" />
                <div className="h-10 bg-white/5 rounded-xl w-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-white/5 rounded w-12" />
                <div className="h-10 bg-white/5 rounded-xl w-full" />
              </div>
              <div className="pt-2 flex justify-center items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Loading Details</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              
              <div className="flex flex-col items-center justify-center gap-2 mb-2">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/30 bg-[#1e1e2f] flex items-center justify-center shadow-lg">
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-500" />
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-full cursor-pointer shadow-md transition-all border border-[#13131f]">
                    <input 
                      id="avatar-upload"
                      name="avatarUpload"
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                      aria-label="Upload profile picture"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </label>
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Change Photo</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="profile-name" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    id="profile-name"
                    name="name"
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name" 
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:bg-white/[0.07] outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="profile-phone" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    id="profile-phone"
                    name="phone"
                    type="tel" 
                    value={profile?.phone || ''} 
                    disabled 
                    className="w-full p-3 bg-white/2 border border-white/5 rounded-xl text-gray-500 text-sm cursor-not-allowed outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-gray-400 bg-white/1 border border-white/4 p-3 rounded-xl">
                  <span>Member Since:</span>
                  <span className="font-semibold text-white">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl text-center">
                  {success}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {saving ? 'Saving changes...' : 'Save Details'}
                </button>

                <button 
                  type="button" 
                  onClick={handleLogout}
                  className="w-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]"
                >
                  Log Out
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};



// ==========================================
// 2. SUB-VIEWS
// ==========================================

export default CustomerProfileModal;

