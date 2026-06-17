import React from 'react';
import { Scissors, LogOut, X } from 'lucide-react';

const formatTo12Hr = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mFormatted = String(m).padStart(2, '0');
  return `${h12}:${mFormatted} ${ampm}`;
};

export default function Sidebar({
  sidebarOpen,
  mobileSidebar,
  setMobileSidebar,
  activeTab,
  setActiveTab,
  salon,
  handleLogout,
  navItems
}) {
  const SW = sidebarOpen ? 'w-[240px]' : 'w-[68px]';

  return (
    <>
      {/* ─── MOBILE OVERLAY ─── */}
      {mobileSidebar && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]" 
          onClick={() => setMobileSidebar(false)} 
        />
      )}

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className={`hidden md:flex flex-col bg-[#0a0a0f] border-r border-white/5 p-[18px_10px] fixed top-0 left-0 h-screen z-[100] transition-[width] duration-250 ease-[cubic-bezier(.4,0,.2,1)] overflow-hidden ${SW} shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 p-[6px_10px] mb-7 overflow-hidden">
          <div className="w-[34px] h-[34px] shrink-0 bg-gradient-to-br from-violet-600 to-violet-800 rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.4)]">
            <Scissors size={17} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden max-w-[150px]">
              <div className="text-[15px] font-bold text-white tracking-[-0.02em] leading-[1.2] text-ellipsis overflow-hidden whitespace-nowrap">
                {salon?.name || 'TrimSync'}
              </div>
              <div className="text-[10px] text-white/25 font-semibold tracking-[0.1em] uppercase">
                Dashboard
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5">
          {sidebarOpen && <div className="text-[10px] text-white/20 font-bold tracking-[0.12em] uppercase px-3 mb-1.5">Menu</div>}
          {navItems.map(item => (
            <button key={item.id} className={`flex items-center gap-[11px] w-full p-[9px_12px] rounded-[10px] text-sm font-medium border-none cursor-pointer transition-colors duration-150 whitespace-nowrap overflow-hidden text-left ${sidebarOpen ? 'justify-start' : 'justify-center'} ${activeTab === item.id ? 'bg-violet-500/15 text-violet-300' : 'bg-transparent text-white/40 hover:bg-white/[0.06] hover:text-white/80'}`}
              onClick={() => setActiveTab(item.id)}>
              <item.icon size={17} className="shrink-0" />
              {sidebarOpen && <span className="flex-1">{item.label}</span>}
              {sidebarOpen && activeTab === item.id && <div className="w-[5px] h-[5px] rounded-full bg-violet-500 shrink-0" />}
            </button>
          ))}
        </nav>

        {/* Status chip */}
        {sidebarOpen && (
          <div className="my-2.5 p-[11px_14px] bg-white/[0.03] border border-white/5 rounded-[10px]">
            <div className="flex items-center gap-2 mb-[3px]">
              <div className={`w-[7px] h-[7px] rounded-full shrink-0 animate-[pulseDot_2s_infinite] ${salon?.isOffToday ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className={`text-xs font-semibold ${salon?.isOffToday ? 'text-red-300' : 'text-green-300'}`}>
                {salon?.isOffToday ? 'Closed Today' : 'Open Now'}
              </span>
            </div>
            <div className="text-[11px] text-white/25 pl-[15px]">
              {formatTo12Hr(salon?.operatingHours?.open)} – {formatTo12Hr(salon?.operatingHours?.close)}
            </div>
          </div>
        )}

        {/* Logout */}
        <button className={`flex items-center gap-[11px] w-full p-[9px_12px] rounded-[10px] text-sm font-medium border-none cursor-pointer transition-colors duration-150 whitespace-nowrap overflow-hidden text-left mt-1 bg-transparent text-red-500/60 hover:bg-white/[0.06] hover:text-white/80 ${sidebarOpen ? 'justify-start' : 'justify-center'}`} onClick={handleLogout}>
          <LogOut size={17} className="shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* ─── MOBILE SIDEBAR ─── */}
      <aside className={`md:hidden fixed top-0 left-0 h-screen w-[240px] z-[200] bg-[#0a0a0f] border-r border-white/10 flex flex-col p-[18px_10px] transition-transform duration-250 ease-[cubic-bezier(.4,0,.2,1)] ${mobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-1 mb-7">
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] bg-gradient-to-br from-violet-600 to-violet-800 rounded-lg flex items-center justify-center">
              <Scissors size={17} className="text-white" />
            </div>
            <div className="text-[15px] font-bold text-white">TrimSync</div>
          </div>
          <button onClick={() => setMobileSidebar(false)} className="bg-white/5 border-none rounded-md p-1.5 cursor-pointer text-white/50 flex">
            <X size={15} />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-0.5">
          {navItems.map(item => (
            <button key={item.id} className={`flex items-center gap-[11px] w-full p-[9px_12px] rounded-[10px] text-sm font-medium border-none cursor-pointer transition-colors duration-150 whitespace-nowrap overflow-hidden text-left justify-start ${activeTab === item.id ? 'bg-violet-500/15 text-violet-300' : 'bg-transparent text-white/40 hover:bg-white/[0.06] hover:text-white/80'}`} onClick={() => { setActiveTab(item.id); setMobileSidebar(false); }}>
              <item.icon size={17} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {activeTab === item.id && <div className="w-[5px] h-[5px] rounded-full bg-violet-500" />}
            </button>
          ))}
        </nav>
        <button className="flex items-center gap-[11px] w-full p-[9px_12px] rounded-[10px] text-sm font-medium border-none cursor-pointer transition-colors duration-150 whitespace-nowrap overflow-hidden text-left bg-transparent text-red-500/60 hover:bg-white/[0.06]" onClick={handleLogout}>
          <LogOut size={17} /><span>Logout</span>
        </button>
      </aside>
    </>
  );
}
