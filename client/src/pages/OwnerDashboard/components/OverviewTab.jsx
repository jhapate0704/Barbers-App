import React from 'react';
import { DollarSign, Users, Activity, Star, Coffee, Info, Zap, CheckCircle, XCircle } from 'lucide-react';
import { Card, Badge, IconBtn } from './Shared';

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

export default function OverviewTab({
  data,
  earnings,
  topService,
  fetchData,
  cancelBooking,
  openEarlyComplete,
  completeBooking,
  handleRescheduleAction,
  openCRM
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: 'Revenue Today', val: `₹${earnings()}`, icon: DollarSign, iconColor: 'text-[#4ade80]', bg: 'bg-[#4ade80]/10' },
          { label: 'Total Clients', val: data.history.length + data.liveQueue.length, icon: Users, iconColor: 'text-[#60a5fa]', bg: 'bg-[#60a5fa]/10' },
          { label: 'Live Queue', val: data.liveQueue.length, icon: Activity, iconColor: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10' },
          { label: 'Top Service', val: topService(), icon: Star, iconColor: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10' },
        ].map((s, i) => (
          <div key={i} className="bg-[#13131f] border border-white/5 rounded-[14px] p-4 md:p-[18px_20px] flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center shrink-0`}>
                <s.icon size={18} className={s.iconColor} />
              </div>
            </div>
            <div>
              <div className="text-[11px] text-white/30 font-semibold uppercase tracking-[0.07em] mb-1">{s.label}</div>
              <div className="text-lg md:text-xl font-bold text-white tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Queue table */}
      <Card className="!p-0 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between p-[16px_22px] border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-[7px] h-[7px] rounded-full bg-violet-500 animate-[pulseDot_2s_infinite] shrink-0" />
            <span className="text-sm font-bold text-white">Live Queue</span>
            <Badge color="violet">{data.liveQueue.length} active</Badge>
          </div>
          <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer text-white/45 text-xs font-medium hover:bg-white/10 transition-colors">
            <Activity size={13} /> Refresh
          </button>
        </div>

        {/* scrollable table wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-white/5">
                {['Client', 'Services', 'Time', 'Actions'].map(h => (
                  <th key={h} className="p-[10px_22px] text-left text-[10px] text-white/25 font-bold uppercase tracking-[0.09em] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.liveQueue.map((b, i) => (
                <tr key={b._id} className="border-t border-white/5 hover:bg-white/[0.018] group">
                  <td className="p-[14px_22px] whitespace-nowrap">
                    <div className="flex items-center gap-[11px]">
                      <div
                        className="w-[34px] h-[34px] shrink-0 rounded-lg flex items-center justify-center text-[13px] font-bold text-white/70"
                        style={{ background: `hsl(${((b.customerId?.name?.charCodeAt(0) || 65) * 5) % 360}, 50%, 22%)` }}
                      >
                        {(b.customerId?.name?.[0] || 'W').toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-white/85 leading-[1.2] flex flex-wrap items-center gap-1.5">
                          {b.customerId?.name || 'Walk-in'}
                          {b.rescheduleStatus === 'pending' && (
                            <span className="px-1.5 py-0.5 bg-violet-400/10 border border-violet-400/25 rounded-full text-[9px] text-violet-300 font-bold uppercase tracking-[0.03em]">Pending Shift Offer</span>
                          )}
                          {b.rescheduleStatus === 'declined' && (
                            <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/25 rounded-full text-[9px] text-red-300 font-bold uppercase tracking-[0.03em]">Shift Declined</span>
                          )}
                        </div>
                        <button onClick={() => openCRM(b)} className="flex items-center gap-[3px] text-[11px] text-violet-500 bg-transparent border-none cursor-pointer p-0 mt-[3px] hover:text-violet-400 transition-colors">
                          <Info size={10} /> Profile
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-[14px_22px]">
                    <div className="flex flex-wrap gap-[5px]">
                      {b.services.map((s, j) => (
                        <span key={j} className="px-2 py-[3px] bg-white/5 border border-white/10 rounded-md text-[11px] text-white/50 font-medium whitespace-nowrap">{s.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-[14px_22px] whitespace-nowrap">
                    <div className="text-[13px] font-semibold text-white/70 font-mono">
                      {formatTo12Hr(b.startTime)}
                      <span className="text-white/20 mx-1">→</span>
                      {formatTo12Hr(b.endTime)}
                    </div>
                    <div className="text-[11px] text-white/25 mt-0.5">{b.chairName || '—'}</div>
                  </td>
                  <td className="p-[14px_22px] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {b.rescheduleStatus === 'pending' ? (
                        <>
                          <button onClick={() => handleRescheduleAction(b._id, 'cancel')} className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer text-white/60 text-[11px] font-semibold hover:bg-white/10 transition-colors">
                            Cancel Req
                          </button>
                          <button onClick={() => handleRescheduleAction(b._id, 'force')} className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-500/15 border border-violet-500/30 rounded-lg cursor-pointer text-violet-300 text-[11px] font-semibold hover:bg-violet-500/25 transition-colors">
                            <Zap size={11} /> Force Shift
                          </button>
                        </>
                      ) : b.rescheduleStatus === 'declined' ? (
                        <button onClick={() => handleRescheduleAction(b._id, 'cancel')} className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer text-white/60 text-[11px] font-semibold hover:bg-white/10 transition-colors">
                          Dismiss
                        </button>
                      ) : (
                        <>
                          <IconBtn danger onClick={() => cancelBooking(b._id)} title="Cancel Booking"><XCircle size={15} /></IconBtn>
                          <button onClick={() => openEarlyComplete(b)} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg cursor-pointer text-violet-300 text-xs font-semibold hover:bg-violet-500/20 transition-colors">
                            <Zap size={14} /> Done Early
                          </button>
                          <button onClick={() => completeBooking(b._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg cursor-pointer text-green-300 text-xs font-semibold hover:bg-green-500/20 transition-colors">
                            <CheckCircle size={14} /> Done
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data.liveQueue.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-[52px_22px] text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                      <Coffee size={22} className="text-white/10" />
                    </div>
                    <div className="text-[13px] font-semibold text-white/25 mb-[5px]">Queue is empty</div>
                    <div className="text-xs text-white/10">New appointments appear here in real time.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
