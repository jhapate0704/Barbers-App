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


const Navbar = ({ onProfileClick, customerName, customerAvatar }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const hasCustomerId = !!localStorage.getItem('customerId');
  const [isOpen, setIsOpen] = useState(false);




  // Reusable button classes (including your provided ones, plus a lift effect)
  
  const navBtnClasses = "bg-white text-gray-900 font-bold px-[18px] py-2 rounded-full shadow-sm hover:shadow-md hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 border border-gray-200 active:scale-95 text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5";
  
  return (
    <nav className="w-full bg-[#E5E5FF] px-4 md:px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

       {/* Animated Logo Section */}
          <div onClick={() => { navigate('/'); setIsOpen(false); }} className="group flex items-center cursor-pointer gap-2.5">
            <div className="bg-linear-to-br from-gray-900 to-black text-white p-2 rounded-xl border border-white/10 shadow-md group-hover:rotate-180 group-hover:scale-110 group-hover:shadow-indigo-500/30 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
              <Scissors size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-br from-gray-900 via-gray-700 to-gray-900 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-500">
              TrimSync
            </span>
          </div>

        <div className="hidden md:flex items-center gap-5">
          {/* List Your Business Button - Order 1 */}
          <button 
            onClick={() => navigate('/register')} 
            className= {navBtnClasses}         >
            List Your Business
          </button>

          {/* Home Link - Order 2 */}
          <button 
            onClick={() => navigate('/')} 
            className= {navBtnClasses}         >
            <Home size={16} /> Home
          </button>
          
          {/* My Bookings / Dashboard / Login Link - Order 3 */}
          {isLoggedIn ? (
            <button 
              onClick={() => navigate('/owner')} 
              className= {navBtnClasses}
            >
              Dashboard
            </button>
          ) : hasCustomerId ? (
            <button 
              onClick={() => {
                sessionStorage.setItem('trimSync_customerActiveTab', 'bookings');
                navigate('/customer');
                window.dispatchEvent(new Event('customer_bookings_tab_click'));
              }} 
              className= {navBtnClasses}
            >
              My Bookings
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className= {navBtnClasses}
            >
              Log in
            </button>
          )}

          {/* Customer Profile Icon - Order 4 */}
           {hasCustomerId && (
              <button 
                onClick={onProfileClick} 
                className="group relative flex items-center justify-center rounded-full w-11 h-11 shrink-0 overflow-hidden transition-all duration-300 ease-out outline-none bg-white border-2 border-slate-100 hover:border-indigo-500 shadow-sm hover:shadow-md hover:shadow-indigo-500/30 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 hover:-translate-y-0.5"
                title={customerName}
              >
                {customerAvatar ? (
                  <img src={customerAvatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-50 to-purple-50 text-indigo-700 font-bold text-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-colors duration-300 group-hover:from-indigo-100 group-hover:to-purple-100">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-900">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex flex-col gap-4">
          {/* List Your Business - Order 1 */}
          <button 
            onClick={() => { navigate('/register'); setIsOpen(false); }} 
            className="bg-black text-white font-bold p-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-600 active:scale-98 transition-all"
          >
            <Store size={18} /> List Your Business
          </button>

          {/* Home Link - Order 2 */}
          <button 
            onClick={() => { navigate('/'); setIsOpen(false); }} 
            className="flex items-center gap-2 font-bold text-gray-800 p-2.5 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-lg text-left transition-all"
          >
            <Home size={18} /> Home
          </button>

          {/* My Bookings / Dashboard / Login Link - Order 3 */}
          {isLoggedIn ? (
            <button 
              onClick={() => { navigate('/owner'); setIsOpen(false); }} 
              className="flex items-center gap-2 font-bold text-gray-800 p-2.5 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-lg text-left transition-all"
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
          ) : hasCustomerId ? (
            <button 
              onClick={() => {
                sessionStorage.setItem('trimSync_customerActiveTab', 'bookings');
                navigate('/customer');
                setIsOpen(false);
                window.dispatchEvent(new Event('customer_bookings_tab_click'));
              }} 
              className="flex items-center gap-2 font-bold text-gray-800 p-2.5 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-lg text-left transition-all"
            >
              <LayoutDashboard size={18} /> My Bookings
            </button>
          ) : (
            <button 
              onClick={() => { navigate('/login'); setIsOpen(false); }} 
              className="flex items-center gap-2 font-bold text-gray-800 p-2.5 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-lg text-left transition-all"
            >
              <Lock size={18} /> Log in
            </button>
          )}

          {/* Customer Profile Link - Order 4 */}
          {hasCustomerId && (
            <button 
              onClick={() => { onProfileClick(); setIsOpen(false); }} 
              className="flex items-center gap-3 font-bold text-gray-800 p-2.5 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-lg text-left w-full transition-all"
            >
              {customerAvatar ? (
                <img src={customerAvatar} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-black/15 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-gray-800 font-bold text-sm shrink-0">
                  {customerName.charAt(0).toUpperCase()}
                </div>
              )}
              <span>My Profile</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};


export default Navbar;
