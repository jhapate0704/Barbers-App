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

import SalonCard from '../components/SalonCard';

const SalonCarousel = ({ title, salons, onBook }) => {
  const scrollRef = React.useRef(null);

  if (!salons || salons.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -340 : 340;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full mb-10 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 rounded-full bg-white border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 text-gray-500 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer outline-none"><ChevronLeft size={20} /></button>
          <button onClick={() => scroll('right')} className="p-2 rounded-full bg-white border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 text-gray-500 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer outline-none"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
        {salons.map(salon => (
          <div key={salon._id} className="min-w-[300px] md:min-w-[340px] max-w-[300px] md:max-w-[340px] snap-start shrink-0">
            <SalonCard salon={salon} onBook={onBook} />
          </div>
        ))}
      </div>
    </div>
  );
};


export default SalonCarousel;
