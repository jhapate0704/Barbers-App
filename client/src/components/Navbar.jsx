import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Scissors, Home, Store, LayoutDashboard, Calendar, Lock, User 
} from 'lucide-react';

const Navbar = ({ onProfileClick, customerName, customerAvatar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');
  const hasCustomerId = !!localStorage.getItem('customerId');
  const navBtnClasses = "bg-white text-gray-900 font-bold px-[18px] py-2 rounded-full shadow-sm hover:shadow-md hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 border border-gray-200 active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5";

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-[#E5E5FF] z-50 shadow-sm px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* Animated Logo Section */}
          <div onClick={() => navigate('/')} className="group flex items-center cursor-pointer gap-2.5">
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
                    {customerName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => navigate('/')} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Home size={20} className={location.pathname === '/' ? "text-indigo-600" : ""} />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          {isLoggedIn ? (
            <button 
              onClick={() => navigate('/owner')} 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname.includes('/owner') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <LayoutDashboard size={20} className={location.pathname.includes('/owner') ? "text-indigo-600" : ""} />
              <span className="text-[10px] font-bold">Dashboard</span>
            </button>
          ) : hasCustomerId ? (
            <button 
              onClick={() => {
                sessionStorage.setItem('trimSync_customerActiveTab', 'bookings');
                navigate('/customer');
                window.dispatchEvent(new Event('customer_bookings_tab_click'));
              }} 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/customer' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Calendar size={20} className={location.pathname === '/customer' ? "text-indigo-600" : ""} />
              <span className="text-[10px] font-bold">Bookings</span>
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/login' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Lock size={20} className={location.pathname === '/login' ? "text-indigo-600" : ""} />
              <span className="text-[10px] font-bold">Log in</span>
            </button>
          )}

          <button 
            onClick={() => navigate('/register')} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/register' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Store size={20} className={location.pathname === '/register' ? "text-indigo-600" : ""} />
            <span className="text-[10px] font-bold">Business</span>
          </button>

          {hasCustomerId && (
            <button 
              onClick={onProfileClick} 
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 hover:text-gray-900"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
                {customerAvatar ? (
                  <img src={customerAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold text-[8px]">
                    {customerName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold">Profile</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;

