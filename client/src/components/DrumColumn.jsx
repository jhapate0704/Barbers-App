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


const DrumColumn = ({ options, value, onChange }) => {
  const containerRef = React.useRef(null);
  const scrollTimeoutRef = React.useRef(null);
  const isScrollingRef = React.useRef(false);
  const itemHeight = 40; // px

  // Sync scroll position only when the value changes from outside (with tolerance)
  useEffect(() => {
    if (isScrollingRef.current) return;
    const idx = options.indexOf(value);
    if (idx !== -1 && containerRef.current) {
      const currentScrollTop = containerRef.current.scrollTop;
      const targetScrollTop = idx * itemHeight;
      if (Math.abs(currentScrollTop - targetScrollTop) > 2) {
        containerRef.current.scrollTop = targetScrollTop;
      }
    }
  }, [value, options]);

  const handleScroll = (e) => {
    const target = e.target;
    isScrollingRef.current = true;

    // Clear the previous scroll end timer
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set a timer to detect when the scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      if (target) {
        const scrollTop = target.scrollTop;
        const idx = Math.round(scrollTop / itemHeight);
        if (idx >= 0 && idx < options.length) {
          const selectedValue = options[idx];
          if (selectedValue !== value) {
            onChange(selectedValue);
          }
        }
      }
      isScrollingRef.current = false;
    }, 150); // 150ms debounce
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (idx) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: idx * itemHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative h-30 w-14 overflow-hidden select-none">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Scrollable snap container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Top spacer to allow the first item to align in the center */}
        <div className="h-10 shrink-0 pointer-events-none" />
        
        {options.map((opt, idx) => {
          const isSelected = opt === value;
          return (
            <div 
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`h-10 snap-center flex items-center justify-center text-sm font-bold cursor-pointer transition-all ${
                isSelected ? 'text-indigo-600 text-base scale-110' : 'text-gray-400 text-xs'
              }`}
            >
              {opt}
            </div>
          );
        })}
        
        {/* Bottom spacer to allow the last item to align in the center */}
        <div className="h-10 shrink-0 pointer-events-none" />
      </div>
    </div>
  );
};


export default DrumColumn;
