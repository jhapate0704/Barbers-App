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


const RegisterView = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    password: '',
    country: 'India',
    agreedToTerms: false,
    businessName: '',
    chairCountOption: '',
    customChairCount: '',
    selectedAddressText: '',
    latitude: null,
    longitude: null,
    addressDetails: {
      street: '',
      aptBuilding: '',
      district: '',
      city: '',
      county: '',
      state: '',
      postcode: '',
      country: 'India'
    }
  });

  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showWizardPassword, setShowWizardPassword] = useState(false);

  const MOCK_ADDRESSES = [
    "123 Beauty Lane, New York, NY 10001",
    "456 Grooming Blvd, Los Angeles, CA 90001",
    "789 Styling St, London, EC1A 1BB",
    "101 Haircut Way, Mumbai, MH 400001",
    "202 Precision Rd, Bangalore, KA 560001"
  ];

  const filteredSuggestions = MOCK_ADDRESSES.filter(addr =>
    addr.toLowerCase().includes(addressSearchQuery.toLowerCase())
  );

  const handleSelectSuggestion = (addr) => {
    setFormData(prev => ({ ...prev, selectedAddressText: addr }));
    setAddressSearchQuery(addr);
    setShowSuggestions(false);
  };

  const handleSaveModalAddress = (e) => {
    e.preventDefault();
    const details = formData.addressDetails;
    const formatted = [
      details.street,
      details.aptBuilding,
      details.city,
      details.state,
      details.postcode,
      details.country
    ].filter(Boolean).join(', ');
    setFormData(prev => ({
      ...prev,
      selectedAddressText: formatted
    }));
    setIsAddressModalOpen(false);
  };

  const detectMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }));
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
              setFormData(prev => ({
                ...prev,
                selectedAddressText: data.display_name
              }));
              setAddressSearchQuery(data.display_name);
            } else {
              setFormData(prev => ({
                ...prev,
                selectedAddressText: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
              }));
            }
          } catch (err) {
            setFormData(prev => ({
              ...prev,
              selectedAddressText: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
            }));
          }
        },
        (err) => {
          alert("Unable to retrieve your location. Please search for your address manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleFinalRegisterSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const ownerName = `${formData.firstName} ${formData.lastName}`.trim();
      const count = formData.chairCountOption === 'custom' 
        ? parseInt(formData.customChairCount, 10) 
        : parseInt(formData.chairCountOption, 10);
      const chairs = Array.from({ length: isNaN(count) ? 1 : count }, (_, i) => ({
        name: i === 0 ? "Main Chair" : `Chair ${i + 1}`
      }));

      let finalLat = formData.latitude;
      let finalLng = formData.longitude;

      if (!finalLat || !finalLng) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.selectedAddressText)}&limit=1`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            finalLat = parseFloat(geoData[0].lat);
            finalLng = parseFloat(geoData[0].lon);
          }
        } catch (e) {
          console.error("Geocoding failed", e);
        }
      }

      if (!finalLat || !finalLng) {
        // Default fallbacks (center of Mumbai)
        finalLat = 19.076;
        finalLng = 72.877;
      }

      const payload = {
        name: formData.businessName,
        ownerName,
        email: formData.email,
        password: formData.password,
        phone: `${formData.phoneCountryCode} ${formData.phoneNumber}`.trim(),
        country: formData.country,
        address: formData.selectedAddressText || "Salon Venue Address",
        operatingHours: { open: "09:00", close: "21:00" },
        services: [{ name: "Standard Haircut", price: 200, duration: 30 }],
        chairs,
        latitude: finalLat,
        longitude: finalLng
      };

      const res = await axios.post(`${API_BASE}/salons/register`, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('salonId', res.data.salonId);
      setStep(6);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (step === 6) {
      const timer = setTimeout(() => {
        navigate('/owner');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const progressPercent = step > 1 && step < 6 ? ((step - 1) / 4) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 md:mt-10 mb-10 px-4">
      {/* Global Navigation Header (Steps 2 to 5) */}
      {step > 1 && step < 6 && (
        <div className="w-full max-w-md mx-auto mb-6 flex flex-col gap-3">
          <button 
            onClick={() => setStep(prev => prev - 1)}
            className="group flex items-center text-gray-400 hover:text-gray-900 transition-colors text-xs font-bold tracking-wider w-fit bg-transparent border-none cursor-pointer outline-none"
            aria-label="Back to previous step"
          >
            <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-0.5 transition-transform" /> BACK
          </button>
          
          {/* Horizontal progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: CREATE ACCOUNT */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col">
          <div className="text-center mb-8">
            <Store size={48} className="mx-auto text-indigo-600 mb-3" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h2>
            <p className="text-xs text-gray-400 font-semibold mt-1">Join as a business owner to manage your salon.</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl mb-4 text-xs text-center font-bold">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="step1-email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                id="step1-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                required
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.email || !formData.email.includes('@')}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-98 cursor-pointer border-none outline-none"
            >
              Continue with Email
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStep(2)} className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-xs cursor-pointer active:scale-98 bg-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.41 0-6.19-2.78-6.19-6.19 0-3.41 2.78-6.19 6.19-6.19 1.488 0 2.85.534 3.914 1.424l3.08-3.08C18.995 1.84 15.827 1 12.24 1a11 11 0 00-11 11 11 11 0 0011 11c5.962 0 11.24-4.306 11.24-11.24 0-.693-.06-1.353-.173-1.985H12.24z"/>
                </svg>
                Google
              </button>
              <button onClick={() => setStep(2)} className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-xs cursor-pointer active:scale-98 bg-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PERSONAL DETAILS */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">You're almost there!</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Create your new account for <span className="text-indigo-600 font-bold">{formData.email || 'your email'}</span> by completing these details.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="step2-firstname" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">First Name</label>
                <input 
                  id="step2-firstname"
                  type="text" 
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  required
                />
              </div>
              <div>
                <label htmlFor="step2-lastname" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Last Name</label>
                <input 
                  id="step2-lastname"
                  type="text" 
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="step2-phone" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="flex gap-2">
                <select 
                  id="step2-phone-code"
                  aria-label="Phone Country Code"
                  value={formData.phoneCountryCode} 
                  onChange={e => setFormData(prev => ({ ...prev, phoneCountryCode: e.target.value }))}
                  className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none font-semibold focus:border-indigo-500"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                </select>
                <input 
                  id="step2-phone"
                  type="tel" 
                  placeholder="Phone number"
                  value={formData.phoneNumber}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, phoneNumber: cleanVal }));
                  }}
                  className="flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="step2-password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  id="step2-password"
                  type={showWizardPassword ? "text" : "password"} 
                  placeholder="Choose password"
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 pr-11 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowWizardPassword(!showWizardPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer outline-none flex items-center justify-center p-1"
                >
                  {showWizardPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="step2-country" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Country</label>
              <select 
                id="step2-country"
                value={formData.country} 
                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none font-semibold focus:border-indigo-500"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>

            <label className="flex items-start gap-3 mt-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={formData.agreedToTerms} 
                onChange={e => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                className="mt-1 accent-indigo-600 rounded" 
              />
              <span className="text-xs text-slate-500 font-semibold leading-relaxed">
                I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.
              </span>
            </label>

            <button
              onClick={() => setStep(3)}
              disabled={!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.password || !formData.agreedToTerms}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-98 cursor-pointer mt-2 border-none outline-none"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: BUSINESS NAME */}
      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-150 p-8 flex flex-col items-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">What's your business name?</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">This is the name clients will see when booking.</p>
          </div>

          <div className="w-full max-w-md space-y-8 flex flex-col items-center">
            <div className="w-full">
              <label htmlFor="step3-bizname" className="sr-only">Business Name</label>
              <input 
                id="step3-bizname"
                type="text" 
                placeholder="Enter salon name"
                value={formData.businessName}
                onChange={e => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                className="bg-transparent border-t-0 border-x-0 border-b-2 border-gray-200 text-center font-bold text-2xl focus:border-indigo-600 focus:ring-0 outline-none w-full py-2 transition-all"
                required
              />
            </div>

            <button
              onClick={() => setStep(4)}
              disabled={!formData.businessName.trim()}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-98 cursor-pointer border-none outline-none"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CHAIR COUNT */}
      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How many chairs do you have?</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">This helps us set up your calendar correctly.</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', 'custom'].map(opt => {
                const isSelected = formData.chairCountOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setFormData(prev => ({ ...prev, chairCountOption: opt }))}
                    className={`py-4 rounded-xl border text-center transition-all cursor-pointer font-bold text-sm ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                        : 'border-gray-200 hover:border-indigo-400 text-gray-700 bg-white'
                    }`}
                  >
                    {opt === 'custom' ? 'Custom' : opt}
                  </button>
                );
              })}
            </div>

            {formData.chairCountOption === 'custom' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 origin-top space-y-2">
                <label htmlFor="step4-custom" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enter total chairs</label>
                <input 
                  id="step4-custom"
                  type="number" 
                  min="1"
                  placeholder="e.g. 8"
                  value={formData.customChairCount}
                  onChange={e => setFormData(prev => ({ ...prev, customChairCount: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                />
              </div>
            )}

            <button
              onClick={() => setStep(5)}
              disabled={
                !formData.chairCountOption || 
                (formData.chairCountOption === 'custom' && !formData.customChairCount)
              }
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-98 cursor-pointer mt-2 border-none outline-none"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: LOCATION MAP & SEARCH */}
      {step === 5 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Where is {formData.businessName || 'your business'} located?
            </h2>
          </div>

          {!formData.selectedAddressText ? (
            /* State 1: Search View */
            <div className="space-y-4 relative">
              <button
                type="button"
                onClick={detectMyLocation}
                className="w-full py-2.5 px-4 rounded-xl border border-indigo-100 hover:bg-indigo-50/40 text-indigo-600 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer bg-white"
              >
                <MapPin size={14} className="text-indigo-500 animate-pulse" />
                Use My Current GPS Position
              </button>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search business address..."
                  value={addressSearchQuery}
                  onChange={e => {
                    setAddressSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                />
              </div>

              {showSuggestions && addressSearchQuery && (
                <div className="absolute left-0 right-0 top-14 bg-white border border-gray-150 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-gray-100 max-h-56 overflow-y-auto">
                  {filteredSuggestions.map((addr, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelectSuggestion(addr)}
                      className="p-3.5 text-xs text-gray-700 hover:bg-indigo-50/40 cursor-pointer font-semibold transition-colors flex items-center gap-2"
                    >
                      <MapPin size={14} className="text-indigo-500 shrink-0" />
                      {addr}
                    </div>
                  ))}
                  {filteredSuggestions.length === 0 && (
                    <div className="p-4 text-center text-xs text-gray-400 font-medium">
                      No results found. Feel free to type custom text.
                    </div>
                  )}
                </div>
              )}

              {/* Back-up input directly if no suggestion chosen */}
              {addressSearchQuery && (
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, selectedAddressText: addressSearchQuery }));
                    setShowSuggestions(false);
                  }}
                  className="w-full py-3 border border-dashed border-indigo-200 hover:bg-indigo-50/20 text-indigo-600 rounded-xl text-xs font-bold transition-all bg-white"
                >
                  Use typed address: "{addressSearchQuery}"
                </button>
              )}
            </div>
          ) : (
            /* State 2: Map View */
            <div className="space-y-6">
              {/* Mock Map div */}
              <div className="w-full h-64 bg-slate-100 rounded-3xl border border-gray-200 relative flex items-center justify-center overflow-hidden shadow-inner">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-15" style={{ 
                  backgroundImage: 'radial-gradient(#4f46e5 1.5px, transparent 1.5px)', 
                  backgroundSize: '16px 16px' 
                }} />
                
                {/* Bouncy pin */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="animate-bounce mb-2">
                    <MapPin size={36} className="text-indigo-600 fill-indigo-200" />
                  </div>
                  <div className="w-4 h-1.5 bg-black/10 rounded-full animate-pulse blur-xs" />
                </div>

                {/* Edit details pencil button */}
                <button 
                  onClick={() => setIsAddressModalOpen(true)}
                  className="absolute top-4 right-4 bg-slate-900/90 text-white rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 hover:bg-black transition-all active:scale-95 shadow-md border-none outline-none cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
                  Edit details
                </button>
              </div>

              {/* Address detail card */}
              <div className="bg-gray-50 border border-gray-150 p-4 rounded-2xl flex items-start gap-3">
                <MapPin size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Selected Address</span>
                  <span className="text-sm font-bold text-gray-800 leading-relaxed block">{formData.selectedAddressText}</span>
                </div>
              </div>

              {/* Error block */}
              {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs text-center font-bold">{error}</div>}

              {/* Confirm / Continue Button */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, selectedAddressText: '' }));
                    setAddressSearchQuery('');
                  }}
                  className="w-1/3 border border-gray-300 hover:border-black text-gray-800 font-bold py-3.5 rounded-xl text-xs transition-all active:scale-98 bg-white cursor-pointer"
                >
                  Back to Search
                </button>
                <button
                  onClick={handleFinalRegisterSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 text-white font-extrabold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 border-none outline-none"
                >
                  {isSubmitting ? 'Registering...' : 'Confirm Location ➔'}
                </button>
              </div>
            </div>
          )}

          {/* EDIT LOCATION MODAL OVERLAY */}
          {isAddressModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
              <div className="bg-white rounded-t-[32px] w-full max-w-xl p-6 md:p-8 transform translate-y-0 transition-transform duration-300 ease-out border-t border-gray-100 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Edit business location</h3>
                  <button 
                    onClick={() => setIsAddressModalOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-full border-none outline-none cursor-pointer flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <form onSubmit={handleSaveModalAddress} className="space-y-4">
                  <div>
                    <label htmlFor="modal-street" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Street Address</label>
                    <input 
                      id="modal-street"
                      type="text" 
                      placeholder="e.g. 123 Beauty Lane"
                      value={formData.addressDetails.street}
                      onChange={e => setFormData(prev => ({ ...prev, addressDetails: { ...prev.addressDetails, street: e.target.value } }))}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="modal-apt" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Apt/Building (Optional)</label>
                      <input 
                        id="modal-apt"
                        type="text" 
                        placeholder="e.g. Suite 4B"
                        value={formData.addressDetails.aptBuilding}
                        onChange={e => setFormData(prev => ({ ...prev, addressDetails: { ...prev.addressDetails, aptBuilding: e.target.value } }))}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label htmlFor="modal-city" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">City</label>
                      <input 
                        id="modal-city"
                        type="text" 
                        placeholder="e.g. Mumbai"
                        value={formData.addressDetails.city}
                        onChange={e => setFormData(prev => ({ ...prev, addressDetails: { ...prev.addressDetails, city: e.target.value } }))}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="modal-state" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">State/Region</label>
                      <input 
                        id="modal-state"
                        type="text" 
                        placeholder="e.g. Maharashtra"
                        value={formData.addressDetails.state}
                        onChange={e => setFormData(prev => ({ ...prev, addressDetails: { ...prev.addressDetails, state: e.target.value } }))}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="modal-postcode" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Postcode</label>
                      <input 
                        id="modal-postcode"
                        type="text" 
                        placeholder="e.g. 400001"
                        value={formData.addressDetails.postcode}
                        onChange={e => setFormData(prev => ({ ...prev, addressDetails: { ...prev.addressDetails, postcode: e.target.value } }))}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="modal-country" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Country</label>
                    <input 
                      id="modal-country"
                      type="text" 
                      placeholder="e.g. India"
                      value={formData.addressDetails.country}
                      onChange={e => setFormData(prev => ({ ...prev, addressDetails: { ...prev.addressDetails, country: e.target.value } }))}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 rounded-xl bg-black text-white font-bold transition-all shadow-lg hover:bg-gray-900 cursor-pointer text-sm border-none outline-none"
                  >
                    Save Address Details
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: SUCCESS ANIMATION */}
      {step === 6 && (
        <div className="animate-in zoom-in-95 duration-500 w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center py-16">
          <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
            {/* Ripple ring */}
            <div className="absolute w-20 h-20 bg-emerald-500/10 rounded-full animate-ping border border-emerald-500/20" />
            <div className="relative w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              {/* Checkmark SVG */}
              <svg className="w-10 h-10 text-emerald-500 animate-in zoom-in duration-300 delay-100" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">All Set!</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider animate-pulse">Preparing your dashboard...</p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. FOOTER COMPONENT
// ==========================================

export default RegisterView;
