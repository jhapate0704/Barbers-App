import React from 'react';
import { CheckCircle } from 'lucide-react';
import { formatTo12Hr } from './utils';

export default function RescheduleRequests({ bookings, handleRescheduleResponse }) {
  const pendingRequests = bookings.filter(b => b.rescheduleStatus === 'pending');

  if (pendingRequests.length === 0) return null;

  return (
    <>
      {pendingRequests.map(b => (
        <div key={b._id} className="relative rounded-3xl p-6 mb-8 overflow-hidden bg-white backdrop-blur-2xl border border-violet-500/25 shadow-[0_20px_60px_-20px_rgba(139,92,246,.45)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-[linear-gradient(180deg,#a78bfa_0%,#d946ef_100%)] shadow-[0_0_20px_rgba(167,139,250,.6)]" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-gradient-to-r from-violet-500/25 to-fuchsia-500/25 border border-violet-400/30 text-violet-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.15em]">⚡ Early Slot</span>
                <span className="text-xs text-violet-300 font-semibold">{b.salonId?.name}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Your chair is ready ahead of schedule</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Move your slot on <span className="text-slate-900 font-semibold">{b.appointmentDate && !isNaN(new Date(b.appointmentDate).getTime()) ? new Date(b.appointmentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A'}</span> for <span className="text-slate-900 font-semibold">{b.chairName}</span> to <span className="text-emerald-400 font-bold">{formatTo12Hr(b.proposedStartTime)}</span> – {formatTo12Hr(b.proposedEndTime)} (was {formatTo12Hr(b.startTime)})?
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
              <button
                onClick={() => handleRescheduleResponse(b._id, 'declined')}
                className="flex-1 md:flex-none text-xs font-semibold text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 transition-all duration-200 hover:bg-indigo-500/10 hover:border-indigo-500/20"
              >
                Decline
              </button>
              <button
                onClick={() => handleRescheduleResponse(b._id, 'accepted')}
                className="bg-[linear-gradient(135deg,#8b5cf6_0%,#d946ef_100%)] shadow-[0_10px_30px_-10px_rgba(139,92,246,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-250 hover:-translate-y-[1px] hover:shadow-[0_14px_36px_-10px_rgba(139,92,246,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-95 flex-1 md:flex-none text-xs font-bold text-slate-900 px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border-none"
              >
                <CheckCircle size={14} /> Accept & Shift
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
