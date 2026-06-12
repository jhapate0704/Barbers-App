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

import SalonCard from '../components/SalonCard';
import SalonCarousel from '../components/SalonCarousel';
import HowItWorks from '../components/HowItWorks';
import OwnerBanner from '../components/OwnerBanner';
import StyleInspiration from '../components/StyleInspiration';
import { getAverageRating } from '../utils/getAverageRating';

const MarketplaceView = ({ salons, onBook }) => {
  const [visibleLimit, setVisibleLimit] = React.useState(6);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [recentlyViewedIds, setRecentlyViewedIds] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('trimSync_recentlyViewed')) || []; }
    catch { return []; }
  });
  const [nearbyMockActive, setNearbyMockActive] = React.useState(false);
  const [nearbyMessage, setNearbyMessage] = React.useState('');
  const [nearbySalons, setNearbySalons] = React.useState(null);

  const handleNearbyClick = () => {
    if (nearbySalons !== null) {
      setNearbySalons(null);
      setNearbyMessage('');
      return;
    }

    setNearbyMockActive(true);
    setNearbyMessage('Acquiring location...');

    if (!navigator.geolocation) {
      setNearbyMessage('Geolocation not supported');
      setNearbyMockActive(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setNearbyMessage('Finding nearby salons...');
        try {
          const response = await axios.get(`${API_BASE}/salons/nearby?lat=${latitude}&lng=${longitude}`);
          setNearbySalons(Array.isArray(response.data) ? response.data : []);
          setNearbyMessage(`Salons near you (${response.data.length} found)`);
        } catch (err) {
          console.error("Error fetching nearby salons:", err);
          setNearbyMessage('Failed to find nearby salons');
        } finally {
          setNearbyMockActive(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = 'Location permission denied';
        if (error.code === error.TIMEOUT) errorMsg = 'Location acquisition timed out';
        else if (error.code === error.POSITION_UNAVAILABLE) errorMsg = 'Location unavailable';
        setNearbyMessage(errorMsg);
        setNearbyMockActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const listToFilter = nearbySalons !== null ? nearbySalons : salons;

  const filteredSalons = listToFilter.filter(salon => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const matchesName = salon.name?.toLowerCase().includes(query);
    const matchesBusinessName = salon.businessName?.toLowerCase().includes(query);
    const matchesServices = salon.services?.some(s => s.name?.toLowerCase().includes(query));
    return matchesName || matchesBusinessName || matchesServices;
  });

  const visibleSalons = filteredSalons.slice(0, visibleLimit);

  const isDefaultView = !searchQuery && nearbySalons === null;
  const customerId = localStorage.getItem('customerId');
  
  // Carousel Data Preparation
  const trendingSalons = [...salons].sort((a,b) => (b.ratings?.length || 0) - (a.ratings?.length || 0));
  const newSalons = [...salons].sort((a,b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  // Stable random recommended based on salon ID to prevent reshuffling on every render
  const recommendedSalons = [...salons].sort((a,b) => (a._id > b._id ? 1 : -1)).slice(0, 8);
  const recentlyViewed = salons.filter(s => recentlyViewedIds.includes(s._id));

  return (
    <div className="max-w-[1440px] mx-auto mt-4 md:mt-8 px-4 md:px-10 pb-24 md:pb-12 flex flex-col items-center">
      {/* Hero Welcoming Section */}
      <div className="w-full text-center py-16 md:py-24 px-8 md:px-16 mb-12 bg-linear-to-br from-indigo-50/60 via-white to-purple-50/40 rounded-[36px] border border-indigo-100/50 shadow-[0_24px_60px_-15px_rgba(99,102,241,0.08)] relative overflow-hidden flex flex-col items-center justify-center">
        {/* Subtle background decorative shapes */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Tagline */}
        <div className="inline-flex items-center gap-2.5 px-4.5 py-2 bg-indigo-50/80 border border-indigo-100 rounded-full text-indigo-600 text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] mb-6 shadow-xs">
          <Scissors size={12} className="text-indigo-500 animate-pulse" />
          The Art of Grooming
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6">
          Elevate Your <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500">Signature Style</span>
        </h1>

        {/* Paragraph */}
        <p className="text-xs md:text-base lg:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8 font-semibold">
          Experience unparalleled luxury and precision styling. Book your private appointment with our master artisans today.
        </p>

        {/* Small subtle accent divider */}
        <div className="w-16 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 mx-auto rounded-full opacity-70" />
      </div>

      {/* Modern Search Bar */}
      <div className="w-full max-w-4xl -mt-20 mb-16 relative z-10 px-4">
        <div className="bg-white/85 backdrop-blur-md rounded-2xl md:rounded-full border border-indigo-100/80 shadow-[0_24px_50px_-15px_rgba(99,102,241,0.12)] p-2.5 md:p-3 flex flex-col md:flex-row items-center gap-3.5 md:gap-0 hover:border-indigo-200 md:hover:shadow-[0_24px_50px_-15px_rgba(99,102,241,0.18)] transition-all duration-350">
          
          {/* Left Section: Name Search */}
          <div className="flex items-center gap-3 px-4 py-1.5 w-full md:flex-1">
            <Search size={18} className="text-indigo-500 shrink-0" />
            <input
              type="text"
              placeholder="Search salons, services (e.g. Haircut, Barber)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-800 text-sm font-semibold placeholder-slate-400 outline-none border-none focus:ring-0"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-slate-200 mx-3" />

          {/* Right Section: Near Me Search */}
          <div className="flex items-center justify-between gap-3 px-4 py-1.5 w-full md:w-auto md:min-w-[300px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <MapPin size={18} className="text-violet-500 shrink-0" />
              <span className="text-xs md:text-sm font-semibold text-slate-500 truncate">
                {nearbyMessage || "Search Nearby Me"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNearbyClick}
              disabled={nearbyMockActive}
              className={`text-[10px] font-extrabold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95 shrink-0 ${
                nearbyMockActive 
                  ? 'bg-violet-100 text-violet-600 animate-pulse'
                  : nearbySalons !== null
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer border-none outline-none'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 cursor-pointer border-none outline-none'
              }`}
            >
              {nearbyMockActive ? "Locating..." : (nearbySalons !== null ? "Clear" : "Find Near Me")}
            </button>
          </div>

        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">TrimSync Marketplace</h2>
      
      {visibleSalons.length === 0 ? (
        <div className="w-full max-w-md bg-white border border-indigo-100/50 rounded-[32px] p-10 text-center flex flex-col items-center justify-center shadow-xs mb-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            {nearbySalons !== null ? <MapPin size={28} className="text-indigo-400" /> : <Search size={28} className="text-indigo-400" />}
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">
            {nearbySalons !== null ? "No salons found nearby" : "No matching salons found"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
            {nearbySalons !== null 
              ? "Try adjusting your search criteria or clearing the location filter to see all salons."
              : `We couldn't find any business matching "${searchQuery}". Double-check spelling or try searching another service.`}
          </p>
        </div>
      ) : isDefaultView ? (
        <div className="w-full flex flex-col pt-4">
          {customerId && recentlyViewed.length > 0 && (
            <SalonCarousel title="Recently Viewed" salons={recentlyViewed} onBook={onBook} />
          )}
          <SalonCarousel title="Recommended for You" salons={recommendedSalons} onBook={onBook} />
          <SalonCarousel title="Trending Salons" salons={trendingSalons} onBook={onBook} />
          <SalonCarousel title="New on TrimSync" salons={newSalons} onBook={onBook} />

          <StyleInspiration salons={salons} onBook={onBook} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
          {visibleSalons.map((salon) => (
            <SalonCard key={salon._id} salon={salon} onBook={onBook} />
          ))}
        </div>
      )}

      {!isDefaultView && filteredSalons.length > visibleLimit && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleLimit(prev => prev + 6)}
            className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-98 cursor-pointer border-none outline-none"
          >
            Show More Salons
          </button>
        </div>
      )}

      {/* How it works section ALWAYS visible at the bottom of the home page */}
      <HowItWorks />
      
      {/* Call to action for owners */}
      <OwnerBanner />

    </div>
  );
};

const HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const AMPMS = ["AM", "PM"];


export default MarketplaceView;
