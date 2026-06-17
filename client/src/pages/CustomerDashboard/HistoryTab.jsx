import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Star } from 'lucide-react';
import { formatTo12Hr } from './utils';

export default function HistoryTab({ pastBookings, openRateModal }) {
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  const filteredPastBookings = pastBookings.filter(b => {
    if (historyDateFilter) {
      const bDate = b.appointmentDate?.split('T')[0];
      if (bDate !== historyDateFilter) return false;
    }
    if (historySearchQuery.trim()) {
      const query = historySearchQuery.toLowerCase();
      const salonName = (b.salonId?.name || '').toLowerCase();
      const servicesStr = (b.services || []).map(s => s.name).join(' ').toLowerCase();
      const statusStr = (b.status || '').toLowerCase();
      if (!salonName.includes(query) && !servicesStr.includes(query) && !statusStr.includes(query)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.appointmentDate);
    const dateB = new Date(b.appointmentDate);
    if (dateB.getTime() !== dateA.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    return b.startTime.localeCompare(a.startTime);
  });

  return (
    <div className="space-y-5 max-w-4xl animate-[fadeIn_0.3s_ease]">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg bg-fuchsia-500/15 border border-fuchsia-400/25 flex items-center justify-center">
          <Calendar size={14} className="text-fuchsia-500" />
        </span>
        Booking History
        <span className="text-xs text-slate-500 font-semibold">({filteredPastBookings.length})</span>
      </h2>

      <div className="bg-white/90 backdrop-blur-xl border border-indigo-100/60 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="history-search-input" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Search History</label>
            <input
              id="history-search-input"
              name="historySearch"
              type="text"
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              placeholder="Search Salon or Service..."
              className="w-full bg-white border border-indigo-100/60 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="history-date-filter" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Filter by Date</label>
            <input
              id="history-date-filter"
              name="historyDate"
              type="date"
              value={historyDateFilter}
              onChange={(e) => setHistoryDateFilter(e.target.value)}
              className="w-full bg-white border border-indigo-100/60 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
        </div>
        {(historyDateFilter || historySearchQuery) && (
          <div className="flex justify-end">
            <button
              onClick={() => { setHistoryDateFilter(''); setHistorySearchQuery(''); }}
              className="text-xs font-bold text-red-500 bg-red-500/15 hover:bg-red-500/20 border border-red-500/25 px-4 py-2 rounded-xl transition-all cursor-pointer text-center"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {filteredPastBookings.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 text-center text-slate-500 border border-indigo-100/60 text-xs font-medium">
          No past transactions recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPastBookings.map((b) => {
            let formattedDate = 'N/A';
            if (b.appointmentDate) {
              const d = new Date(b.appointmentDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                });
              }
            }
            const sumCost = b.services?.reduce((acc, s) => acc + s.price, 0) || 0;

            return (
              <div
                key={b._id}
                className="bg-white/90 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:border-violet-400/35 hover:shadow-[0_18px_50px_-20px_rgba(124,58,237,0.45)] rounded-2xl p-4 flex flex-col justify-between gap-3 border border-indigo-100/60"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{b.salonId?.name || 'Local Salon'}</h3>
                    <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">{formattedDate} · {formatTo12Hr(b.startTime)}</span>
                  </div>

                  <div className="shrink-0">
                    {b.status === 'completed' ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-400/20 px-2 py-1 rounded-full uppercase tracking-wider">
                        <CheckCircle size={10} className="mr-1" /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-400/20 px-2 py-1 rounded-full uppercase tracking-wider">
                        <XCircle size={10} className="mr-1" /> Canceled
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-indigo-100/60 pt-2.5 gap-3">
                  <span className="text-slate-500 font-medium truncate">
                    {(b.services || []).map(s => s.name).join(', ')}
                  </span>
                  <span className="font-bold text-violet-500 shrink-0">₹{sumCost}</span>
                </div>

                {b.status === 'completed' && (
                  <div className="flex justify-end pt-2.5 border-t border-indigo-100/60">
                    <button
                      onClick={() => openRateModal(b)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <Star size={11} className="fill-amber-400" /> Rate Salon
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
