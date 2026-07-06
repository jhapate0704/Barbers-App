/**
 * Navbar Component
 * 
 * The main top navigation bar for the application.
 * On desktop, it displays links to Home, Dashboard, Bookings, Login, etc.
 * On mobile devices, it uses a fixed bottom navigation bar for a better user experience.
 */
import React from 'react';
// Import routing hooks to get current URL and navigate between pages programmatically
import { useNavigate, useLocation } from 'react-router-dom';
// Import icons from lucide-react to be used in navigation buttons
import { 
  Scissors, Home, Store, LayoutDashboard, Calendar, Lock, User 
} from 'lucide-react';

// Define the Navbar functional component and accept props for user profile handling
const Navbar = ({ onProfileClick, customerName, customerAvatar }) => {
  // Hook to navigate to different URLs (e.g. navigate('/login'))
  const navigate = useNavigate();
  // Hook to access the current URL path so we can highlight active tabs
  const location = useLocation();
  
  // Check if a standard user/owner is logged in by looking for a generic 'token' in localStorage
  const isLoggedIn = !!localStorage.getItem('token');
  // Check if a customer is logged in specifically by looking for 'customerId' in localStorage
  const hasCustomerId = !!localStorage.getItem('customerId');
  
  // A reusable string containing Tailwind CSS classes for desktop navigation buttons to keep code DRY
  const navBtnClasses = "bg-white text-gray-900 font-bold px-[18px] py-2 rounded-full shadow-sm hover:shadow-md hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 border border-gray-200 active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5";

  return (
    // React Fragment to wrap the Top Navbar and the Mobile Bottom Navbar
    <>
      {/* 
        ========================================
        Top Navbar (Always visible on Desktop, Logo visible on Mobile)
        ========================================
      */}
      {/* The main nav element fixed to the top of the viewport with a high z-index to stay above content */}
      <nav className="fixed top-0 left-0 w-full bg-[#E5E5FF] z-50 shadow-sm px-4 md:px-6 py-4">
        {/* Container to center the navbar content and limit its maximum width */}
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* 
            Animated Logo Section 
            Clicking the logo takes the user back to the home page (Marketplace)
          */}
          <div onClick={() => navigate('/')} className="group flex items-center cursor-pointer gap-2.5">
            {/* Dark rounded box containing the Scissors icon with hover animation effects */}
            <div className="bg-gradient-to-br from-gray-900 to-black text-white p-2 rounded-xl border border-white/10 shadow-md group-hover:rotate-180 group-hover:scale-110 group-hover:shadow-indigo-500/30 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
              <Scissors size={20} className="text-white" />
            </div>
            {/* The 'TrimSync' text with a gradient color that changes on hover */}
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-500">
              TrimSync
            </span>
          </div>

          {/* 
            ========================================
            Desktop Navigation Links
            (Hidden on screens smaller than 'lg' breakpoint)
            ========================================
          */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Button to navigate to the Business Registration page */}
            <button onClick={() => navigate('/register')} className={navBtnClasses}>
              List Your Business
            </button>
            {/* Button to navigate to the Home/Marketplace page */}
            <button onClick={() => navigate('/')} className={navBtnClasses}>
              <Home size={16} /> Home
            </button>
            
            {/* Conditional Rendering for User-specific Links */}
            {isLoggedIn ? (
              // If a generic user (Owner/Admin) is logged in, show the Dashboard button
              <button onClick={() => navigate('/owner')} className={navBtnClasses}>
                Dashboard
              </button>
            ) : hasCustomerId ? (
              // If a Customer is logged in, show the 'My Bookings' button
              <button 
                onClick={() => {
                  // Set a session variable to default to the bookings tab, then navigate
                  sessionStorage.setItem('trimSync_customerActiveTab', 'bookings');
                  navigate('/customer');
                  // Dispatch a custom event in case the user is already on the customer page
                  window.dispatchEvent(new Event('customer_bookings_tab_click'));
                }} 
                className={navBtnClasses}
              >
                My Bookings
              </button>
            ) : (
              // If no one is logged in, show the default 'Log in' button
              <button onClick={() => navigate('/login')} className={navBtnClasses}>
                Log in
              </button>
            )}

            {/* Profile Avatar Icon (Only shown if a customer is logged in) */}
            {hasCustomerId && (
              <button 
                onClick={onProfileClick} // Triggers the profile modal provided via props
                className="group relative flex items-center justify-center rounded-full w-11 h-11 shrink-0 overflow-hidden transition-all duration-300 outline-none bg-white border-2 border-slate-100 hover:border-indigo-500 shadow-sm hover:shadow-md active:scale-95 hover:-translate-y-0.5"
                title={customerName}
              >
                {/* If the customer has an avatar URL, display the image */}
                {customerAvatar ? (
                  <img src={customerAvatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  // Otherwise, display a fallback gradient circle containing their first initial
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 font-bold text-lg transition-colors duration-300 group-hover:from-indigo-100 group-hover:to-purple-100">
                    {customerName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 
        ========================================
        Mobile Bottom Navigation
        (Visible only on small/medium screens, hidden on 'lg' and up)
        ========================================
      */}
      {/* Fixed to the bottom of the screen with a top border and shadow */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Flex container to evenly space the navigation icons */}
        <div className="flex justify-around items-center h-16">
          
          {/* Mobile Home Button */}
          <button 
            onClick={() => navigate('/')} 
            // Dynamically apply indigo color if the current route is '/'
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Home size={20} className={location.pathname === '/' ? "text-indigo-600" : ""} />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          {/* Mobile Conditional Dashboard/Bookings/Login Button */}
          {isLoggedIn ? (
            // Owner Dashboard
            <button 
              onClick={() => navigate('/owner')} 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname.includes('/owner') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <LayoutDashboard size={20} className={location.pathname.includes('/owner') ? "text-indigo-600" : ""} />
              <span className="text-[10px] font-bold">Dashboard</span>
            </button>
          ) : hasCustomerId ? (
            // Customer Bookings
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
            // Guest Login
            <button 
              onClick={() => navigate('/login')} 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/login' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Lock size={20} className={location.pathname === '/login' ? "text-indigo-600" : ""} />
              <span className="text-[10px] font-bold">Log in</span>
            </button>
          )}

          {/* Mobile Business Registration Button */}
          <button 
            onClick={() => navigate('/register')} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/register' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Store size={20} className={location.pathname === '/register' ? "text-indigo-600" : ""} />
            <span className="text-[10px] font-bold">Business</span>
          </button>

          {/* Mobile Customer Profile Button (Only shown if logged in as customer) */}
          {hasCustomerId && (
            <button 
              onClick={onProfileClick} // Triggers the profile modal
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 hover:text-gray-900"
            >
              {/* Circular container for avatar */}
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
