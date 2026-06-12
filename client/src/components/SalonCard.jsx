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

import { getAverageRating } from '../utils/getAverageRating';

const SalonCard = ({ salon, onBook }) => {
  const images = salon.images && salon.images.length > 0 ? salon.images : [];
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Stagger intervals by generating a randomized speed between 3s and 5.5s per card
  const intervalSpeed = React.useMemo(() => 3000 + Math.random() * 2500, []);

  React.useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, intervalSpeed);
    return () => clearInterval(timer);
  }, [images.length, intervalSpeed]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 relative flex flex-col h-full">
      {/* Salon Cover Carousel */}
      <div style={{ height: 160, width: '100%', background: 'linear-gradient(135deg, #f5f3ff, #eef2f6)', position: 'relative', overflow: 'hidden' }}>
        {images.length > 0 ? (
          images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`${salon.name} image ${idx}`} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                opacity: currentSlide === idx ? 1 : 0,
                transform: currentSlide === idx ? 'scale(1)' : 'scale(1.05)',
                transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out' 
              }} 
            />
          ))
        ) : (
          <div className="text-indigo-400 flex flex-col items-center justify-center h-full gap-2">
            <Scissors size={34} />
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">No Image Listed</span>
          </div>
        )}
        
        {/* Slides indicator dots */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 10 }}>
            {images.map((_, idx) => (
              <div 
                key={idx} 
                style={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  background: idx === currentSlide ? 'white' : 'rgba(255, 255, 255, 0.4)', 
                  transition: 'background 0.2s' 
                }} 
              />
            ))}
          </div>
        )}

        <div className={`absolute top-0 right-0 px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold text-white flex items-center rounded-bl-lg ${salon.currentQueue === 0 ? 'bg-green-500' : salon.currentQueue < 3 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ zIndex: 11 }}>
          <Users size={14} className="mr-1.5" style={{ zIndex: 12 }} />
          {salon.currentQueue === 0 ? 'No Rush' : `${salon.currentQueue} in Queue`}
        </div>
      </div>

      <div className="p-5 md:p-6 flex flex-col flex-1">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{salon.name}</h3>
        
        {/* Average Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <Star size={15} className="text-amber-500 fill-amber-500 shrink-0" />
          <span className="text-xs font-bold text-gray-800">
            {getAverageRating(salon.ratings) || "New"}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            {salon.ratings?.length > 0 ? `(${salon.ratings.length} reviews)` : "(No reviews)"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-gray-600 mb-4 text-xs md:text-sm">
          <div className="flex items-center min-w-0">
            <MapPin size={16} className="mr-2 text-blue-500 shrink-0" />
            <span className="truncate">{salon.address}</span>
          </div>
          {salon.distance !== undefined && salon.distance !== null && (
            <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md border border-indigo-100 font-bold shrink-0">
              {salon.distance < 1000 
                ? `${Math.round(salon.distance)} m` 
                : `${(salon.distance / 1000).toFixed(1)} km`} away
            </span>
          )}
        </div>
        <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-[10px] md:text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center"><AlertCircle size={14} className="mr-1" /> Busy Slots Today</p>
          {salon.busyTimes?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {salon.busyTimes.map((time, idx) => <span key={idx} className="bg-red-50 text-red-600 text-[10px] md:text-xs px-2 py-1 rounded border border-red-100 font-medium">{formatRangeTo12Hr(time)}</span>)}
            </div>
          ) : <p className="text-[10px] md:text-xs text-green-600 font-medium">No bookings yet. Shop is free!</p>}
        </div>
        <button onClick={() => onBook(salon)} className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 mt-auto flex items-center justify-center transition-colors">
          <Scissors size={18} className="mr-2" /> Book Appointment
        </button>
      </div>
    </div>
  );
};


export default SalonCard;
