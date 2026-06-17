import React from 'react';
import { Activity, Calendar, User, Shield, HelpCircle, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({
  activeTab, setActiveTab, mobileSidebarOpen, setMobileSidebarOpen,
  activeProfileSection, setActiveProfileSection, activeBookingsCount, pastBookingsCount
}) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerAvatar');
    navigate('/');
  };

  return (
    <>
      {mobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div className={`flex flex-col gap-2 shrink-0 transition-transform duration-300 ease-in-out z-[101] fixed top-0 left-0 h-full w-64 bg-white shadow-2xl p-5 overflow-y-auto md:relative md:translate-x-0 md:bg-transparent md:shadow-none md:p-0 md:h-auto md:w-64 md:z-auto md:flex ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="md:hidden flex items-center justify-between mb-4 pb-4 border-b border-indigo-100">
          <span className="font-black text-slate-900 text-lg">Menu</span>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <button onClick={() => { setActiveTab('bookings'); setMobileSidebarOpen(false); }} className={`flex items-center gap-3 px-5 py-3.5 text-xs md:text-sm font-bold tracking-wide transition-all border md:border-l-4 md:border-t-0 md:border-r-0 md:border-b-0 cursor-pointer shrink-0 ${activeTab === 'bookings' ? 'border-indigo-500 text-indigo-700 bg-indigo-50/80 shadow-sm rounded-xl md:rounded-r-xl md:rounded-l-none' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl md:rounded-r-xl md:rounded-l-none'}`}>
          <Activity size={16} className={activeTab === 'bookings' ? 'text-indigo-500' : 'text-slate-400'} /> Upcoming Bookings ({activeBookingsCount})
        </button>

        <button onClick={() => { setActiveTab('history'); setMobileSidebarOpen(false); }} className={`flex items-center gap-3 px-5 py-3.5 text-xs md:text-sm font-bold tracking-wide transition-all border md:border-l-4 md:border-t-0 md:border-r-0 md:border-b-0 cursor-pointer shrink-0 ${activeTab === 'history' ? 'border-indigo-500 text-indigo-700 bg-indigo-50/80 shadow-sm rounded-xl md:rounded-r-xl md:rounded-l-none' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl md:rounded-r-xl md:rounded-l-none'}`}>
          <Calendar size={16} className={activeTab === 'history' ? 'text-indigo-500' : 'text-slate-400'} /> Booking History ({pastBookingsCount})
        </button>

        <div className="hidden md:block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-4 mb-1 px-5">Settings & Profile</div>
        
        <button onClick={() => { setMobileSidebarOpen(false); setActiveTab('profile'); setActiveProfileSection('my-profile'); }} className={`flex items-center gap-3 px-5 py-3.5 text-xs md:text-sm font-bold tracking-wide transition-all border md:border-l-4 md:border-t-0 md:border-r-0 md:border-b-0 cursor-pointer shrink-0 ${activeTab === 'profile' && activeProfileSection === 'my-profile' ? 'border-indigo-500 text-indigo-700 bg-indigo-50/80 shadow-sm rounded-xl md:rounded-r-xl md:rounded-l-none' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl md:rounded-r-xl md:rounded-l-none'}`}>
          <User size={16} className={activeTab === 'profile' && activeProfileSection === 'my-profile' ? 'text-indigo-500' : 'text-slate-400'} /> My Profile
        </button>

        <button onClick={() => { setMobileSidebarOpen(false); setActiveTab('profile'); setActiveProfileSection('personal-settings'); }} className={`flex items-center gap-3 px-5 py-3.5 text-xs md:text-sm font-bold tracking-wide transition-all border md:border-l-4 md:border-t-0 md:border-r-0 md:border-b-0 cursor-pointer shrink-0 ${activeTab === 'profile' && activeProfileSection === 'personal-settings' ? 'border-indigo-500 text-indigo-700 bg-indigo-50/80 shadow-sm rounded-xl md:rounded-r-xl md:rounded-l-none' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl md:rounded-r-xl md:rounded-l-none'}`}>
          <Shield size={16} className={activeTab === 'profile' && activeProfileSection === 'personal-settings' ? 'text-indigo-500' : 'text-slate-400'} /> Personal Settings
        </button>

        <button onClick={() => { setMobileSidebarOpen(false); setActiveTab('profile'); setActiveProfileSection('help-support'); }} className={`flex items-center gap-3 px-5 py-3.5 text-xs md:text-sm font-bold tracking-wide transition-all border md:border-l-4 md:border-t-0 md:border-r-0 md:border-b-0 cursor-pointer shrink-0 ${activeTab === 'profile' && activeProfileSection === 'help-support' ? 'border-indigo-500 text-indigo-700 bg-indigo-50/80 shadow-sm rounded-xl md:rounded-r-xl md:rounded-l-none' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl md:rounded-r-xl md:rounded-l-none'}`}>
          <HelpCircle size={16} className={activeTab === 'profile' && activeProfileSection === 'help-support' ? 'text-indigo-500' : 'text-slate-400'} /> Help & Support
        </button>

        <div className="hidden md:block h-px w-full bg-indigo-100/50 my-2" />

        <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-3.5 text-xs md:text-sm font-bold tracking-wide transition-all border md:border-l-4 border-transparent text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl md:rounded-r-xl md:rounded-l-none cursor-pointer shrink-0 md:mt-2">
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </>
  );
}
