/**
 * Footer Component
 * 
 * The standard footer displayed at the bottom of the main application pages.
 * It typically contains copyright info, social links, and secondary navigation.
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


const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-955 text-gray-400 border-t border-white/5 py-12 px-6" style={{ backgroundColor: '#07060f' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center cursor-pointer gap-2.5" onClick={() => navigate('/')}>
              <div className="bg-linear-to-br from-gray-900 to-black text-white p-2 rounded-xl border border-white/10 shadow-md">
                <Scissors size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                TrimSync
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly book top-rated barbers, salons, spas, and wellness experts near you. Experience hassle-free beauty services.
            </p>
            <div className="flex items-center gap-3.5 pt-2">
              <a href="#" className="text-slate-500 hover:text-white transition-colors"><FaInstagram size={18} /></a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors"><FaFacebook size={18} /></a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors"><FaTwitter size={18} /></a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors"><FaLinkedin size={18} /></a>
            </div>
          </div>

          {/* Column 2: Discover */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors text-left">Browse Barbershops</button></li>
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors text-left">Hair Salons</button></li>
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors text-left">Nail Salons</button></li>
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors text-left">Spas & Wellness</button></li>
            </ul>
          </div>

          {/* Column 3: Partners */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Partners</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors text-left">List Your Business</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors text-left">Business Log In</button></li>
              <li><button onClick={() => navigate('/owner')} className="hover:text-white transition-colors text-left">Management Dashboard</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing & Features</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-slate-500" />
                <a href="mailto:support@trimsync.com" className="hover:text-white transition-colors">support@trimsync.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-slate-500" />
                <span className="text-slate-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-500" />
                <span className="text-slate-400">123 Beauty Lane, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} TrimSync. All Rights Reserved. Built and Maintained by Niraj Developers.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookies Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ==========================================
// 4. MAIN APP
// ==========================================

export default Footer;

