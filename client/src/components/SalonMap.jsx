/**
 * SalonMap Component
 * 
 * Integrates a map view to show multiple salon locations geographically.
 * Allows users to visually see where nearby barbers are located.
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


const SalonMap = ({ latitude, longitude, address, salonName, hideDirections }) => {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (window.L && latitude && longitude && mapRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const lat = Number(latitude);
      const lng = Number(longitude);
      
      const map = window.L.map(mapRef.current).setView([lat, lng], 15);
      mapInstanceRef.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          
      }).addTo(map);

      const marker = window.L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`<b>${salonName}</b><br/>${address}`).openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, address, salonName]);

  if (!latitude || !longitude) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 h-48">
        <MapPin size={32} className="text-slate-400" />
        <p className="text-slate-600 font-bold text-sm">No Location Registered</p>
        <p className="text-slate-400 text-xs max-w-xs">This salon has not registered their physical location coordinates on the map yet.</p>
      </div>
    );
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs overflow-hidden flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Map className="text-indigo-600" size={18} />
            Salon Location & Route
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{address}</p>
        </div>
        {!hideDirections && (
          <a 
            href={directionsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer decoration-none"
          >
            <ExternalLink size={14} />
            Get Directions
          </a>
        )}
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-xl border border-gray-100 relative z-0" 
        style={{ minHeight: '256px', width: '100%' }}
      />
    </div>
  );
};

export default SalonMap;

