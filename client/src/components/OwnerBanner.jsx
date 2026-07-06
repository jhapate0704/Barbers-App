/**
 * OwnerBanner Component
 * 
 * A call-to-action banner specifically targeted at salon owners.
 * It encourages barbers and business owners to list their business on TrimSync.
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


const OwnerBanner = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full mt-8 mb-16 px-4 md:px-0">
      <div className="relative w-full max-w-6xl mx-auto rounded-[32px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] group">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 bg-gray-900">
          <img 
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80" 
            alt="Busy Barbershop" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-10 md:p-16 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <Store size={14} className="text-amber-400" />
              For Salon Owners
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Transforming Small Businesses into Success Stories.
            </h2>
            <p className="text-gray-300 text-base md:text-lg font-medium mb-8 max-w-xl">
              Join the revolution. Get your salon in front of thousands of clients, manage bookings effortlessly, and grow your revenue.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-gray-900 hover:bg-indigo-50 hover:text-indigo-600 font-bold px-8 py-4 rounded-xl transition-all shadow-xl active:scale-95 flex items-center gap-3 w-max cursor-pointer border-none outline-none"
            >
              List Your Business <ArrowLeft size={18} className="rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default OwnerBanner;

