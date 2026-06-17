import React from 'react';
import { ArrowLeft, Menu, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ customerName, setMobileSidebarOpen, fetchBookings }) {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 pb-7 mb-10 border-b border-indigo-100/60">
      <div className="flex flex-col gap-3 w-full">
        <div className="flex justify-between items-center w-full">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center text-slate-500 hover:text-violet-500 transition-all text-xs font-semibold tracking-wide w-fit"
          >
            <ArrowLeft size={14} className="mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> BACK TO MARKETPLACE
          </button>
          
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden flex items-center justify-center p-2 bg-white border border-indigo-100 rounded-xl shadow-sm text-slate-700 active:scale-95 transition-all"
          >
            <Menu size={20} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30 ring-1 ring-white/10">
            <span className="text-slate-900 font-bold text-lg">{customerName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Welcome back</p>
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight bg-[linear-gradient(90deg,#1e293b_0%,#6366f1_50%,#1e293b_100%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-[pulse_4s_linear_infinite]">
              {customerName}
            </h1>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2.5 w-full sm:w-auto">
        <button
          onClick={fetchBookings}
          className="bg-white/90 backdrop-blur-xl border border-indigo-500/15 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.08)] flex items-center gap-2 px-4 py-2.5 rounded-xl hover:border-violet-400/40 text-slate-700 hover:text-slate-900 transition-all active:scale-95 text-xs font-semibold"
          title="Refresh"
        >
          <RefreshCw size={14} /> <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}
