import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Card, Badge, Label, InputField } from './Shared';

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

export default function HistoryTab({
  data,
  historyDateFilter,
  setHistoryDateFilter,
  historySearchQuery,
  setHistorySearchQuery
}) {
  const sortedFilteredHistory = useMemo(() => {
    const filtered = data.history.filter(b => {
      if (historyDateFilter) {
        const bDate = b.appointmentDate?.split('T')[0];
        if (bDate !== historyDateFilter) return false;
      }
      if (historySearchQuery.trim()) {
        const query = historySearchQuery.toLowerCase();
        const clientName = (b.customerId?.name || 'Walk-in').toLowerCase();
        const timeStr = `${b.startTime} ${b.endTime}`.toLowerCase();
        const servicesStr = b.services.map(s => s.name).join(' ').toLowerCase();
        const chairName = (b.chairName || '').toLowerCase();
        
        const matches = clientName.includes(query) || 
                        timeStr.includes(query) || 
                        servicesStr.includes(query) || 
                        chairName.includes(query);
        if (!matches) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      return b.startTime.localeCompare(a.startTime);
    });
  }, [data.history, historyDateFilter, historySearchQuery]);

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between p-[16px_22px] border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Calendar size={16} className="text-violet-500" />
          <span className="text-sm font-bold text-white">Booking History</span>
        </div>
        <Badge color="violet">
          {historyDateFilter || historySearchQuery ? `${sortedFilteredHistory.length} matches` : `${data.history.length} records`}
        </Badge>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 p-[14px_22px] border-b border-white/5 bg-white/[0.01]">
        <div className="flex flex-col gap-1 min-w-[160px]">
          <Label htmlFor="history-date-filter-owner">Filter Date</Label>
          <InputField 
            id="history-date-filter-owner"
            name="historyDateFilter"
            type="date" 
            value={historyDateFilter} 
            onChange={e => setHistoryDateFilter(e.target.value)} 
            className="!p-[8px_12px] !text-[13px]"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <Label htmlFor="history-search-query-owner">Search Client, Time, or Service</Label>
          <InputField 
            id="history-search-query-owner"
            name="historySearchQuery"
            type="text" 
            placeholder="Search name, time (e.g. 10:30), or service..." 
            value={historySearchQuery} 
            onChange={e => setHistorySearchQuery(e.target.value)} 
            className="!p-[8px_12px] !text-[13px]"
          />
        </div>
        {(historyDateFilter || historySearchQuery) && (
          <button 
            onClick={() => { setHistoryDateFilter(''); setHistorySearchQuery(''); }} 
            className="self-end h-[38px] px-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-xs font-semibold cursor-pointer transition-all duration-150 hover:bg-red-500/20"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[460px]">
          <thead>
            <tr className="bg-white/[0.02]">
              {['Client', 'Services', 'Date & Time', 'Status'].map(h => (
                <th key={h} className="p-[10px_22px] text-left text-[10px] text-white/25 font-bold uppercase tracking-[0.09em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedFilteredHistory.map(b => (
              <tr key={b._id} className="border-t border-white/[0.04] hover:bg-white/[0.018] group">
                <td className="p-[13px_22px] whitespace-nowrap">
                  <div className="text-[13px] font-semibold text-white/80">{b.customerId?.name || 'Walk-in'}</div>
                  <div className="text-[10px] text-white/20 font-mono mt-0.5">#{b._id.slice(-6)}</div>
                </td>
                <td className="p-[13px_22px] max-w-[200px]">
                  <div className="text-xs text-white/45 overflow-hidden text-ellipsis whitespace-nowrap">{b.services.map(s => s.name).join(', ')}</div>
                </td>
                <td className="p-[13px_22px] whitespace-nowrap">
                  <div className="text-xs text-white/55 font-mono">{b.appointmentDate?.split('T')[0]}</div>
                  <div className="text-[11px] text-white/25 mt-0.5 font-mono">{formatTo12Hr(b.startTime)}</div>
                </td>
                <td className="p-[13px_22px] whitespace-nowrap">
                  <Badge color={b.status === 'completed' ? 'green' : b.status === 'cancelled' ? 'red' : 'blue'}>{b.status}</Badge>
                </td>
              </tr>
            ))}
            {sortedFilteredHistory.length === 0 && (
              <tr>
                <td colSpan="4" className="p-[52px] text-center text-white/20 text-[13px]">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
