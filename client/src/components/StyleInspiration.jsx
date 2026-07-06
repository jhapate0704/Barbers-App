/**
 * StyleInspiration Component
 * 
 * A visual gallery component that displays trendy haircuts and styles
 * to give customers ideas before they make a booking.
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


const StyleInspiration = ({ salons, onBook }) => {
  const allImages = React.useMemo(() => {
    let images = [];
    salons.forEach(salon => {
      if (salon.portfolio && salon.portfolio.length > 0) {
        salon.portfolio.forEach((imgUrl, idx) => {
          images.push({ id: `${salon._id}-${idx}`, imgUrl, salon });
        });
      }
    });
    // Shuffle deterministically so it doesn't jump every re-render but changes on load
    return images.sort(() => 0.5 - Math.random()).slice(0, 16);
  }, [salons]);

  if (allImages.length === 0) return null;

  return (
    <div className="w-full mt-12 mb-8 border-t border-gray-100/60 pt-12">
      <div className="flex flex-col mb-8 px-4 md:px-0">
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Style Inspiration</h3>
        <p className="text-sm md:text-base text-gray-500 font-medium">Discover fresh looks crafted by our top professionals</p>
      </div>
      
      {/* Masonry CSS columns */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 px-4 md:px-0 space-y-4">
        {allImages.map((item) => (
          <div 
            key={item.id} 
            className="relative group rounded-2xl overflow-hidden break-inside-avoid cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-gray-100"
            onClick={() => onBook(item.salon)}
          >
            <img 
              src={item.imgUrl} 
              alt={`Look by ${item.salon.name}`} 
              className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-5">
              <span className="text-white font-bold text-sm md:text-base translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-sm">{item.salon.name}</span>
              <span className="text-indigo-300 text-[10px] md:text-xs font-bold uppercase tracking-wider translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 shadow-sm mt-1">Book this look &rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default StyleInspiration;

