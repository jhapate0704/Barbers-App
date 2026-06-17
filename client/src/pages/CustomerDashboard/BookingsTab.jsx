import React from 'react';
import { Activity, Scissors, MapPin, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTo12Hr } from './utils';

export default function BookingsTab({ activeBookings, queuePositions, handleCancelBooking }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 max-w-4xl animate-[fadeIn_0.3s_ease]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-400/25 flex items-center justify-center">
            <Activity size={14} className="text-violet-500" />
          </span>
          Upcoming Bookings
          <span className="text-xs text-slate-500 font-semibold">({activeBookings.length})</span>
        </h2>
      </div>

      {activeBookings.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-xl border border-indigo-500/15 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.08)] rounded-3xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 border border-violet-400/20 flex items-center justify-center mb-4">
            <Scissors size={28} className="text-violet-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1.5">No appointments scheduled</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-xs">Looking sharp takes planning. Discover a salon near you and lock in your slot.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[linear-gradient(135deg,#8b5cf6_0%,#d946ef_100%)] shadow-[0_10px_30px_-10px_rgba(139,92,246,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-250 hover:-translate-y-[1px] hover:shadow-[0_14px_36px_-10px_rgba(139,92,246,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-95 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm cursor-pointer border-none"
          >
            Browse Salons
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeBookings.map((booking) => {
            const hasQueueInfo = queuePositions[booking._id] !== undefined;
            const queueInfo = queuePositions[booking._id];
            let formattedDate = 'N/A';
            if (booking.appointmentDate) {
              const d = new Date(booking.appointmentDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric'
                });
              }
            }

            const isToday = new Date(booking.appointmentDate).toDateString() === new Date().toDateString();

            return (
              <div
                key={booking._id}
                className="bg-white/90 backdrop-blur-xl border border-indigo-500/15 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/35 hover:shadow-[0_18px_50px_-20px_rgba(124,58,237,0.45)] rounded-3xl p-5 sm:p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[linear-gradient(180deg,#a78bfa_0%,#d946ef_100%)] shadow-[0_0_20px_rgba(167,139,250,0.6)]" />
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{booking.salonId?.name || 'Local Salon'}</h3>
                    <div className="flex items-center text-slate-500 text-xs mt-1.5">
                      <MapPin size={12} className="mr-1.5 text-violet-400 shrink-0" />
                      <span className="truncate">{booking.salonId?.address || 'Location Address'}</span>
                    </div>
                  </div>

                  <div className="bg-white backdrop-blur-2xl border border-violet-400/20 px-3.5 py-2 rounded-xl text-center sm:text-right shrink-0">
                    <span className="text-[9px] text-violet-500 font-bold block uppercase tracking-[0.15em]">Chair / Barber</span>
                    <span className="text-xs text-slate-900 font-bold">{booking.chairName}</span>
                  </div>
                </div>

                <div className="relative bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-4 mb-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] block mb-2.5">Booked Services</span>
                  <div className="flex flex-wrap gap-2">
                    {(booking.services || []).map((service, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-500/5 border border-indigo-500/10 transition-all duration-200 hover:bg-indigo-500/10 hover:border-indigo-500/20 text-xs px-3 py-1.5 rounded-lg text-slate-800 font-medium"
                      >
                        {service.name} <span className="text-violet-500 font-bold ml-0.5">₹{service.price}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center text-xs text-slate-700 font-medium">
                      <Calendar size={14} className="mr-1.5 text-violet-500" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-700 font-medium">
                      <Clock size={14} className="mr-1.5 text-violet-500" />
                      <span>{formatTo12Hr(booking.startTime)} – {formatTo12Hr(booking.endTime)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="text-[11px] font-bold text-red-500 hover:text-red-600 px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>

                <div className="relative mt-5 pt-4 border-t border-indigo-100/60 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isToday ? '' : 'hidden'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isToday ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                        {isToday ? 'Live Status' : 'Queue Status'}
                      </span>
                    </div>
                    <div className="text-right">
                      {isToday ? (
                        hasQueueInfo ? (
                          queueInfo.position === 1 ? (
                            <span className="text-xs font-bold text-fuchsia-500 animate-pulse">💈 Next Up — Head to shop!</span>
                          ) : (
                            <span className="text-xs text-slate-500 font-semibold">
                              Position <span className="text-indigo-500 font-bold">#{queueInfo.position}</span> ({queueInfo.peopleAhead} ahead)
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-500 animate-pulse">Loading live queue...</span>
                        )
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold">Scheduled</span>
                      )}
                    </div>
                  </div>

                  {/* Stepper Pipeline */}
                  <div className="flex items-center w-full gap-2 pt-2 px-1">
                    <div className="flex-1 flex flex-col items-center text-center gap-1.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 text-xs font-bold shadow-lg shadow-emerald-500/5">
                        ✓
                      </div>
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide">Confirmed</span>
                    </div>

                    <div className={`h-[2px] flex-1 rounded-full ${isToday ? 'bg-gradient-to-r from-emerald-500 to-indigo-500' : 'bg-black/5'}`} />

                    <div className="flex-1 flex flex-col items-center text-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                        isToday
                          ? hasQueueInfo
                            ? queueInfo.position > 1
                              ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-500 animate-pulse shadow-lg shadow-indigo-500/10'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-lg shadow-emerald-500/5'
                            : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-500 animate-pulse'
                          : 'bg-black/5 border-indigo-100 text-slate-600'
                      }`}>
                        {isToday 
                          ? hasQueueInfo 
                            ? queueInfo.position > 1 
                              ? `#${queueInfo.position}` 
                              : '✓'
                            : '...' 
                          : '⏳'}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${
                        isToday 
                          ? hasQueueInfo && queueInfo.position === 1 
                            ? 'text-emerald-500' 
                            : 'text-indigo-500' 
                          : 'text-slate-500'
                      }`}>
                        {isToday 
                          ? hasQueueInfo 
                            ? queueInfo.position > 1 
                              ? 'Waiting' 
                              : 'Ready'
                            : 'Checking' 
                          : 'Soon'}
                      </span>
                    </div>

                    <div className={`h-[2px] flex-1 rounded-full ${isToday && hasQueueInfo && queueInfo.position === 1 ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500' : 'bg-black/5'}`} />

                    <div className="flex-1 flex flex-col items-center text-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                        isToday && hasQueueInfo && queueInfo.position === 1
                          ? 'bg-gradient-to-br from-fuchsia-500/30 to-pink-500/20 border-fuchsia-400 text-fuchsia-500 animate-bounce shadow-lg shadow-fuchsia-500/20'
                          : 'bg-black/5 border-indigo-100 text-slate-600'
                      }`}>
                        💈
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${isToday && hasQueueInfo && queueInfo.position === 1 ? 'text-fuchsia-500 font-extrabold animate-pulse' : 'text-slate-500'}`}>
                        Next Up
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
