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


const LoginView = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState('select');
  const [customerStep, setCustomerStep] = useState(1);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('India');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Owner credentials
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);

  const handleOwnerLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/salons/login`, { email: ownerEmail, password: ownerPassword });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('salonId', response.data.salonId);
      navigate('/owner');
    } catch (err) { 
      setError(err.response?.data?.message || 'Login failed.'); 
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithEmail = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/users/check-email`, { email });
      if (res.data.exists) {
        setIsSigningUp(false);
        setCustomerStep(3); // Go to password login
      } else {
        setIsSigningUp(true);
        setCustomerStep(2); // Go to signup details
      }
    } catch (err) {
      setError('Failed to check email. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (customerStep === 2) {
        // Registering
        if (!agreedToTerms) {
          setError('You must agree to the terms of service.');
          setLoading(false);
          return;
        }
        const name = `${firstName} ${lastName}`.trim();
        const phone = `${phoneCountryCode} ${phoneNumber}`.trim();
        
        const res = await axios.post(`${API_BASE}/users/register`, {
          name,
          email,
          phone,
          password,
          country,
          role: 'customer'
        });
        
        localStorage.setItem('customerToken', res.data.token);
        localStorage.setItem('customerId', res.data.user._id);
        localStorage.setItem('customerName', res.data.user.name);
        localStorage.setItem('customerAvatar', res.data.user.avatar || '');
        if (onLoginSuccess) onLoginSuccess(res.data.user.name, res.data.user.avatar || '');
      } else if (customerStep === 3) {
        // Logging in
        const res = await axios.post(`${API_BASE}/users/login`, {
          email,
          password
        });
        
        localStorage.setItem('customerToken', res.data.token);
        localStorage.setItem('customerId', res.data.user._id);
        localStorage.setItem('customerName', res.data.user.name);
        localStorage.setItem('customerAvatar', res.data.user.avatar || '');
        if (onLoginSuccess) onLoginSuccess(res.data.user.name, res.data.user.avatar || '');
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (loginMode === 'select') return (
    <div className="max-w-3xl mx-auto mt-10 md:mt-20 px-4 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Welcome back.<br className="md:hidden" /> How are you logging in?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div onClick={() => { setLoginMode('customer'); setCustomerStep(1); }} className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-500 cursor-pointer transition-all hover:shadow-md active:scale-[0.99] group">
          <User size={48} className="mx-auto text-indigo-500 mb-4 md:size-16 group-hover:scale-105 transition-transform" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">I'm a Customer</h3>
          <p className="text-sm text-gray-500 font-semibold">I want to book an appointment.</p>
        </div>
        <div onClick={() => setLoginMode('owner')} className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200 hover:border-black cursor-pointer transition-all hover:shadow-md active:scale-[0.99] group">
          <Store size={48} className="mx-auto text-black mb-4 md:size-16 group-hover:scale-105 transition-transform" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">I'm a Salon Owner</h3>
          <p className="text-sm text-gray-500 font-semibold">I want to manage my shop.</p>
        </div>
      </div>
    </div>
  );

  if (loginMode === 'owner') return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 mt-10 md:mt-20 px-4">
      <button onClick={() => setLoginMode('select')} className="flex items-center text-gray-500 mb-6 font-bold text-xs hover:text-black transition-colors bg-transparent border-none cursor-pointer outline-none"><ArrowLeft size={14} className="mr-1.5" /> BACK</button>
      <div className="text-center mb-8">
        <Lock size={44} className="mx-auto text-black mb-3" />
        <h2 className="text-2xl font-bold text-gray-900">Owner Portal</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">Log in to manage your bookings and services menu.</p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl mb-4 text-xs text-center font-bold">{error}</div>}
      
      <form onSubmit={handleOwnerLogin} className="space-y-4">
        <div>
          <label htmlFor="owner-login-email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
          <input 
            id="owner-login-email" 
            name="ownerEmail" 
            autoComplete="email" 
            type="email" 
            placeholder="owner@salon.com" 
            required 
            value={ownerEmail} 
            onChange={(e) => setOwnerEmail(e.target.value)} 
            className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold" 
          />
        </div>
        <div>
          <label htmlFor="owner-login-password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <input 
              id="owner-login-password" 
              name="ownerPassword" 
              autoComplete="current-password" 
              type={showOwnerPassword ? "text" : "password"} 
              required 
              value={ownerPassword} 
              onChange={(e) => setOwnerPassword(e.target.value)} 
              className="w-full p-3.5 pr-11 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold" 
              placeholder="Password" 
            />
            <button
              type="button"
              onClick={() => setShowOwnerPassword(!showOwnerPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer outline-none flex items-center justify-center p-1"
            >
              {showOwnerPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading || !ownerEmail || !ownerPassword}
          className="w-full bg-black hover:bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-lg transition-all text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none outline-none mt-2 active:scale-98"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto mt-6 md:mt-10 mb-10 px-4">
      {/* Back button */}
      <button 
        onClick={() => {
          if (customerStep > 1) {
            setCustomerStep(customerStep - 1);
            setError('');
          } else {
            setLoginMode('select');
            setError('');
          }
        }}
        className="group flex items-center text-gray-400 hover:text-gray-900 transition-colors text-xs font-bold tracking-wider w-fit bg-transparent border-none cursor-pointer outline-none mb-6"
        aria-label="Back"
      >
        <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-0.5 transition-transform" /> BACK
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl mb-4 text-xs text-center font-bold">
          {error}
        </div>
      )}

      {/* STEP 1: EMAIL ENTRY */}
      {customerStep === 1 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col">
          <div className="text-center mb-8">
            <User size={48} className="mx-auto text-indigo-600 mb-3" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Sign In</h2>
            <p className="text-xs text-gray-400 font-semibold mt-1">Sign in or register to book your appointment.</p>
          </div>

          <form onSubmit={handleContinueWithEmail} className="space-y-4">
            <div>
              <label htmlFor="customer-email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                id="customer-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !email.includes('@')}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-98 cursor-pointer border-none outline-none"
            >
              {loading ? 'Checking...' : 'Continue with Email'}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => {
                  setEmail('google.client@gmail.com');
                  setIsSigningUp(true);
                  setCustomerStep(2);
                }} 
                className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-xs cursor-pointer active:scale-98 bg-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.41 0-6.19-2.78-6.19-6.19 0-3.41 2.78-6.19 6.19-6.19 1.488 0 2.85.534 3.914 1.424l3.08-3.08C18.995 1.84 15.827 1 12.24 1a11 11 0 00-11 11 11 11 0 0011 11c5.962 0 11.24-4.306 11.24-11.24 0-.693-.06-1.353-.173-1.985H12.24z"/>
                </svg>
                Google
              </button>
              <button 
                type="button"
                onClick={() => {
                  setEmail('fb.client@gmail.com');
                  setIsSigningUp(true);
                  setCustomerStep(2);
                }} 
                className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-xs cursor-pointer active:scale-98 bg-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: REGISTRATION DETAILS */}
      {customerStep === 2 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Customer Account</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Complete your details for <span className="text-indigo-600 font-bold">{email}</span> to continue.
            </p>
          </div>

          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="customer-firstname" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">First Name</label>
                <input 
                  id="customer-firstname"
                  type="text" 
                  placeholder="First name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  required
                />
              </div>
              <div>
                <label htmlFor="customer-lastname" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Last Name</label>
                <input 
                  id="customer-lastname"
                  type="text" 
                  placeholder="Last name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="customer-phone" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="flex gap-2">
                <select 
                  id="customer-phone-code"
                  aria-label="Phone Country Code"
                  value={phoneCountryCode} 
                  onChange={e => setPhoneCountryCode(e.target.value)}
                  className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none font-semibold focus:border-indigo-500"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                </select>
                <input 
                  id="customer-phone"
                  type="tel" 
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                    setPhoneNumber(cleanVal);
                  }}
                  className="flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="customer-password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  id="customer-password"
                  type={showCustomerPassword ? "text" : "password"} 
                  placeholder="Choose password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 pr-11 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer outline-none flex items-center justify-center p-1"
                >
                  {showCustomerPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="customer-country" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Country</label>
              <select 
                id="customer-country"
                value={country} 
                onChange={e => setCountry(e.target.value)}
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
                checked={agreedToTerms} 
                onChange={e => setAgreedToTerms(e.target.checked)}
                className="mt-1 accent-indigo-600 rounded" 
              />
              <span className="text-xs text-slate-500 font-semibold leading-relaxed">
                I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !firstName || !lastName || !phoneNumber || !password || !agreedToTerms}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-98 cursor-pointer mt-2 border-none outline-none"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm">
            <button 
              type="button" 
              onClick={() => {
                setIsSigningUp(false);
                setCustomerStep(3);
                setError('');
              }} 
              className="text-indigo-600 font-medium hover:underline bg-none border-none cursor-pointer"
            >
              Already have an account? Log in
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PASSWORD LOGIN */}
      {customerStep === 3 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col">
          <div className="mb-6 text-center">
            <Lock size={44} className="mx-auto text-indigo-600 mb-3" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Enter Password</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Please enter the password for <span className="text-indigo-600 font-bold">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div>
              <label htmlFor="customer-login-password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  id="customer-login-password"
                  type={showCustomerPassword ? "text" : "password"} 
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 pr-11 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer outline-none flex items-center justify-center p-1"
                >
                  {showCustomerPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-98 cursor-pointer mt-2 border-none outline-none"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm">
            <button 
              type="button" 
              onClick={() => {
                setIsSigningUp(true);
                setCustomerStep(2);
                setError('');
              }} 
              className="text-indigo-600 font-medium hover:underline bg-none border-none cursor-pointer"
            >
              New customer? Create an account here
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export default LoginView;
