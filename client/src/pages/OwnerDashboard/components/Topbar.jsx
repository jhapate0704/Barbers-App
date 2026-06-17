import React from 'react';
import { Menu, UserPlus, Bell, Star } from 'lucide-react';
import { PrimaryBtn } from './Shared';

export default function Topbar({
  sidebarOpen,
  setSidebarOpen,
  mobileSidebar,
  setMobileSidebar,
  activeTab,
  setActiveTab,
  setShowWalkin,
  data,
  showDropdown,
  setShowDropdown,
  salon,
  handleLogout
}) {
  return (
    <header className="flex items-center justify-between gap-3 p-[14px_16px] md:p-[14px_28px] border-b border-white/5 bg-[#0d0d14]/90 backdrop-blur-md sticky top-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Desktop: collapse sidebar */}
        <button 
          onClick={() => setSidebarOpen(o => !o)}
          className="hidden md:flex items-center justify-center w-[34px] h-[34px] bg-white/[0.04] border border-white/[0.08] rounded-lg cursor-pointer text-white/50 shrink-0"
        >
          <Menu size={17} />
        </button>
        {/* Mobile: open sidebar */}
        <button 
          onClick={() => setMobileSidebar(true)}
          className="md:hidden flex items-center justify-center w-[34px] h-[34px] bg-white/[0.04] border border-white/[0.08] rounded-lg cursor-pointer text-white/50 shrink-0"
        >
          <Menu size={17} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-white capitalize tracking-[-0.01em] leading-[1.2] m-0">{activeTab}</h1>
          <p className="text-[11px] text-white/25 mt-0.5 whitespace-nowrap m-0">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5 shrink-0">
        <PrimaryBtn onClick={() => setShowWalkin(true)} className="!px-4 !py-[9px] !text-[13px]">
          <UserPlus size={15} />
          <span className="hidden md:inline">Add Walk-in</span>
          <span className="inline md:hidden">Walk-in</span>
        </PrimaryBtn>

        <button className="relative flex items-center justify-center w-[34px] h-[34px] bg-white/[0.04] border border-white/[0.08] rounded-lg cursor-pointer text-white/40 shrink-0">
          <Bell size={16} />
          {data?.liveQueue?.length > 0 && <div className="absolute top-[7px] right-[7px] w-1.5 h-1.5 bg-violet-500 rounded-full" />}
        </button>

        <div onClick={() => setShowDropdown(d => !d)} className="relative flex items-center gap-[9px] p-[6px_10px_6px_6px] md:p-[6px_10px_6px_6px] bg-white/[0.04] border border-white/[0.08] rounded-[10px] cursor-pointer md:rounded-[10px] rounded-full p-[6px]">
          <div className="w-7 h-7 shrink-0 bg-gradient-to-br from-violet-600 to-violet-800 rounded-md flex items-center justify-center text-xs font-bold text-white">
            {(salon?.ownerName?.[0] || 'A').toUpperCase()}
          </div>
          <div className="hidden md:block max-w-[120px] overflow-hidden">
            <div className="text-xs font-semibold text-white/80 leading-[1.2] overflow-hidden text-ellipsis whitespace-nowrap">
              {salon?.ownerName || 'Owner'}
            </div>
            <div className="text-[10px] text-white/25 uppercase tracking-[0.06em] overflow-hidden text-ellipsis whitespace-nowrap">
              {salon?.name || 'Admin'}
            </div>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div onClick={e => e.stopPropagation()} className="absolute top-[38px] right-0 w-[280px] bg-[#13131f] border border-white/[0.08] rounded-2xl p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] z-[200] cursor-default">
              {/* Dropdown Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06] mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-violet-800 rounded-[10px] flex items-center justify-center text-base font-bold text-white shrink-0">
                  {(salon?.ownerName?.[0] || 'A').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-white overflow-hidden text-ellipsis whitespace-nowrap">{salon?.ownerName || 'Owner'}</div>
                  <div className="text-[11px] text-white/40 overflow-hidden text-ellipsis whitespace-nowrap mt-[1px]">{salon?.name || 'Salon'}</div>
                  
                  {/* Ratings stars */}
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400">
                      {(() => {
                        const ratings = salon?.ratings || [];
                        return ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) : "0.0";
                      })()}
                    </span>
                    <span className="text-[9px] text-white/30">
                      ({(salon?.ratings || []).length})
                    </span>
                  </div>
                </div>
              </div>

              {/* Dropdown Items */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => { setActiveTab('profile'); setShowDropdown(false); }} className={`flex items-center gap-2.5 w-full p-[10px_12px] rounded-[10px] border-none text-[13px] font-semibold cursor-pointer text-left transition-colors duration-150 ${activeTab === 'profile' ? 'bg-violet-500/10 text-violet-300' : 'bg-transparent text-white/60 hover:bg-white/[0.04] hover:text-white'}`}>
                  My Profile
                </button>
                <button onClick={() => { setActiveTab('settings'); setShowDropdown(false); }} className={`flex items-center gap-2.5 w-full p-[10px_12px] rounded-[10px] border-none text-[13px] font-semibold cursor-pointer text-left transition-colors duration-150 ${activeTab === 'settings' ? 'bg-violet-500/10 text-violet-300' : 'bg-transparent text-white/60 hover:bg-white/[0.04] hover:text-white'}`}>
                  Personal Settings
                </button>
                <button onClick={() => { setActiveTab('help'); setShowDropdown(false); }} className={`flex items-center gap-2.5 w-full p-[10px_12px] rounded-[10px] border-none text-[13px] font-semibold cursor-pointer text-left transition-colors duration-150 ${activeTab === 'help' ? 'bg-violet-500/10 text-violet-300' : 'bg-transparent text-white/60 hover:bg-white/[0.04] hover:text-white'}`}>
                  Help and Support
                </button>
                <div className="h-[1px] bg-white/[0.06] my-1.5" />
                <button onClick={() => { setShowDropdown(false); handleLogout(); }} className="flex items-center gap-2.5 w-full p-[10px_12px] bg-transparent border-none rounded-[10px] text-red-500/70 text-[13px] font-semibold cursor-pointer text-left transition-colors duration-150 hover:bg-red-500/10 hover:text-red-300">
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
