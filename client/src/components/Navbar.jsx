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

        {/* Mobile Action (List Business instead of Hamburger) */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => navigate('/register')} 
            className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm active:scale-95 text-[10px] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Store size={12} /> List Business
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (iOS Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-around items-center px-2 py-3 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => navigate('/')} 
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-indigo-600 active:scale-95 transition-all"
        >
          <Home size={22} className={location.pathname === '/' ? "text-indigo-600" : ""} />
          <span className={`text-[9px] font-bold ${location.pathname === '/' ? 'text-indigo-600' : ''}`}>Home</span>
        </button>

        {isLoggedIn ? (
          <button 
            onClick={() => navigate('/owner')} 
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-indigo-600 active:scale-95 transition-all"
          >
            <LayoutDashboard size={22} className={location.pathname.includes('/owner') ? "text-indigo-600" : ""} />
            <span className={`text-[9px] font-bold ${location.pathname.includes('/owner') ? 'text-indigo-600' : ''}`}>Dashboard</span>
          </button>
        ) : hasCustomerId ? (
          <button 
            onClick={() => {
              sessionStorage.setItem('trimSync_customerActiveTab', 'bookings');
              navigate('/customer');
              window.dispatchEvent(new Event('customer_bookings_tab_click'));
            }} 
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-indigo-600 active:scale-95 transition-all"
          >
            <Calendar size={22} className={location.pathname === '/customer' ? "text-indigo-600" : ""} />
            <span className={`text-[9px] font-bold ${location.pathname === '/customer' ? 'text-indigo-600' : ''}`}>Bookings</span>
          </button>
        ) : (
          <button 
            onClick={() => navigate('/login')} 
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-indigo-600 active:scale-95 transition-all"
          >
            <Lock size={22} className={location.pathname === '/login' ? "text-indigo-600" : ""} />
            <span className={`text-[9px] font-bold ${location.pathname === '/login' ? 'text-indigo-600' : ''}`}>Log in</span>
          </button>
        )}

        {hasCustomerId && (
          <button 
            onClick={onProfileClick} 
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-indigo-600 active:scale-95 transition-all"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
              {customerAvatar ? (
                <img src={customerAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                  {customerName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold">Profile</span>
          </button>
        )}
      </div>
    </nav>
  );
};


export default Navbar;
