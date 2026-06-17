import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Scissors, Home, Store, LayoutDashboard, Calendar, Lock, User, Menu, X 
} from 'lucide-react';

const Navbar = ({ onProfileClick, customerName, customerAvatar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');
  const hasCustomerId = !!localStorage.getItem('customerId');
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navBtnClasses = "bg-white text-gray-900 font-bold px-[18px] py-2 rounded-full shadow-sm hover:shadow-md hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 border border-gray-200 active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5";

  return (
    <nav className="w-full bg-[#E5E5FF] px-4 md:px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Animated Logo Section */}
        <div onClick={() => { navigate('/'); setIsOpen(false); }} className="group flex items-center cursor-pointer gap-2.5">
          <div className="bg-gradient-to-br from-gray-900 to-black text-white p-2 rounded-xl border border-white/10 shadow-md group-hover:rotate-180 group-hover:scale-110 group-hover:shadow-indigo-500/30 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <Scissors size={20} className="text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-500">
            TrimSync
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-5">
          <button onClick={() => navigate('/register')} className={navBtnClasses}>
            List Your Business
          </button>
          <button onClick={() => navigate('/')} className={navBtnClasses}>
            <Home size={16} /> Home
          </button>
          
          {isLoggedIn ? (
            <button onClick={() => navigate('/owner')} className={navBtnClasses}>
              Dashboard
            </button>
          ) : hasCustomerId ? (
            <button 
              onClick={() => {
                sessionStorage.setItem('trimSync_customerActiveTab', 'bookings');
                navigate('/customer');
                window.dispatchEvent(new Event('customer_bookings_tab_click'));
              }} 
              className={navBtnClasses}
            >
              My Bookings
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className={navBtnClasses}>
              Log in
            </button>
          )}

          {hasCustomerId && (
            <button 
              onClick={onProfileClick} 
              className="group relative flex items-center justify-center rounded-full w-11 h-11 shrink-0 overflow-hidden transition-all duration-300 outline-none bg-white border-2 border-slate-100 hover:border-indigo-500 shadow-sm hover:shadow-md active:scale-95 hover:-translate-y-0.5"
              title={customerName}
            >
              {customerAvatar ? (
                <img src={customerAvatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 font-bold text-lg transition-colors duration-300 group-hover:from-indigo-100 group-hover:to-purple-100">
                  {customerName.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="lg:hidden flex items-center gap-4">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-gray-900 p-2 rounded-md hover:bg-white/50 transition-colors focus:outline-none"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#E5E5FF] shadow-lg border-t border-indigo-100 py-4 px-6 flex flex-col gap-4 z-40">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/50 text-gray-800 font-bold transition-colors"
          >
            <Home size={20} className={location.pathname === '/' ? "text-indigo-600" : ""} />
            <span className={location.pathname === '/' ? "text-indigo-600" : ""}>Home</span>
          </button>

          <button 
            onClick={() => navigate('/register')} 
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/50 text-gray-800 font-bold transition-colors"
          >
            <Store size={20} />
            <span>List Your Business</span>
          </button>

          {isLoggedIn ? (
            <button 
              onClick={() => navigate('/owner')} 
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/50 text-gray-800 font-bold transition-colors"
            >
              <LayoutDashboard size={20} className={location.pathname.includes('/owner') ? "text-indigo-600" : ""} />
              <span className={location.pathname.includes('/owner') ? "text-indigo-600" : ""}>Dashboard</span>
            </button>
          ) : hasCustomerId ? (
            <button 
              onClick={() => {
                sessionStorage.setItem('trimSync_customerActiveTab', 'bookings');
                navigate('/customer');
                window.dispatchEvent(new Event('customer_bookings_tab_click'));
              }} 
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/50 text-gray-800 font-bold transition-colors"
            >
              <Calendar size={20} className={location.pathname === '/customer' ? "text-indigo-600" : ""} />
              <span className={location.pathname === '/customer' ? "text-indigo-600" : ""}>My Bookings</span>
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/50 text-gray-800 font-bold transition-colors"
            >
              <Lock size={20} className={location.pathname === '/login' ? "text-indigo-600" : ""} />
              <span className={location.pathname === '/login' ? "text-indigo-600" : ""}>Log in</span>
            </button>
          )}

          {hasCustomerId && (
            <button 
              onClick={() => { setIsOpen(false); onProfileClick(); }} 
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/50 text-gray-800 font-bold transition-colors"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
                {customerAvatar ? (
                  <img src={customerAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span>Profile</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

