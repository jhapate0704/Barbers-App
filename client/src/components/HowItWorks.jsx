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


const HowItWorks = () => {
  return (
    <div className="w-full mt-16 mb-8 pt-16 border-t border-gray-100/60">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">How TrimSync Works</h2>
        <p className="text-gray-500 font-medium">Three simple steps to your perfect look</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto px-4 md:px-0">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col items-center text-center cursor-default">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-inner">
            <Search size={30} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2.5">1. Find Your Barber</h3>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">Discover top-rated salons, browse their portfolio, and explore their services to find the perfect match for your style.</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(217,70,239,0.15)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col items-center text-center cursor-default" style={{ animationDelay: '100ms' }}>
          <div className="w-16 h-16 bg-fuchsia-50 text-fuchsia-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-300 shadow-inner">
            <Calendar size={30} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2.5">2. Lock Your Slot</h3>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">Select an available date and time, pick your preferred specialist, and confirm your private appointment instantly.</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col items-center text-center cursor-default" style={{ animationDelay: '200ms' }}>
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner">
            <Star size={30} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2.5">3. Look Fresh</h3>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">Skip the waiting room. Show up at your reserved time, get an amazing haircut, and walk out looking your absolute best.</p>
        </div>
      </div>
    </div>
  );
};


export default HowItWorks;
