import React from 'react';
import { BookUser, Users } from 'lucide-react';
import { Card, InputField } from './Shared';

export default function CustomersTab({
  customerRecords,
  customerSearchQuery,
  setCustomerSearchQuery,
  customerTab,
  setCustomerTab
}) {
  const filteredCustomers = customerRecords.filter(c => 
    c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
    c.phone.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-[fadeUp_0.3s_ease]">
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
              <BookUser size={20} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white m-0">Customer Records</h2>
              <p className="text-xs text-white/40 mt-0.5 mb-0">{customerRecords.length} unique customers</p>
            </div>
          </div>
          
          {/* Tabs & Search */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setCustomerTab('clients')}
                className={`px-4 py-1.5 rounded-lg border-none text-xs font-bold cursor-pointer transition-all duration-150 ${customerTab === 'clients' ? 'bg-white/10 text-white' : 'bg-transparent text-white/50'}`}
              >
                Clients
              </button>
              <button 
                onClick={() => setCustomerTab('detailed')}
                className={`px-4 py-1.5 rounded-lg border-none text-xs font-bold cursor-pointer transition-all duration-150 ${customerTab === 'detailed' ? 'bg-white/10 text-white' : 'bg-transparent text-white/50'}`}
              >
                Detailed Overview
              </button>
            </div>

            <div className="relative w-[220px]">
              <InputField 
                type="text" 
                placeholder="Search customers..." 
                value={customerSearchQuery}
                onChange={e => setCustomerSearchQuery(e.target.value)}
                className="pl-9 h-9 text-[13px]"
              />
              <div className="absolute left-3 top-2.5">
                <Users size={14} className="text-white/30" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white/[0.02] rounded-xl border border-white/5">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10">
                <th className="p-[12px_16px] text-[11px] font-bold text-white/40 uppercase tracking-[0.05em]">Customer Name</th>
                <th className="p-[12px_16px] text-[11px] font-bold text-white/40 uppercase tracking-[0.05em]">Phone Number</th>
                {customerTab === 'detailed' && (
                  <>
                    <th className="p-[12px_16px] text-[11px] font-bold text-white/40 uppercase tracking-[0.05em]">Total Visits</th>
                    <th className="p-[12px_16px] text-[11px] font-bold text-white/40 uppercase tracking-[0.05em]">Total Revenue</th>
                    <th className="p-[12px_16px] text-[11px] font-bold text-white/40 uppercase tracking-[0.05em]">Last Visit</th>
                    <th className="p-[12px_16px] text-[11px] font-bold text-white/40 uppercase tracking-[0.05em]">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={customerTab === 'detailed' ? 6 : 2} className="p-[32px_16px] text-center text-white/30 text-[13px]">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="border-b border-white/5">
                    <td className="p-[14px_16px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-300 flex items-center justify-center text-xs font-bold">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-semibold text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-[14px_16px] text-[13px] text-white/70 font-mono">
                      {c.phone}
                    </td>
                    {customerTab === 'detailed' && (
                      <>
                        <td className="p-[14px_16px] text-[13px] text-white font-semibold">
                          {c.totalVisits} <span className="text-[11px] text-white/30 font-normal">visits</span>
                        </td>
                        <td className="p-[14px_16px] text-[13px] text-green-400 font-bold">
                          ₹{c.totalRevenue}
                        </td>
                        <td className="p-[14px_16px] text-xs text-white/50">
                          {c.lastVisitDate ? new Date(c.lastVisitDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-[14px_16px]">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.05em] ${c.totalVisits > 5 ? 'bg-green-500/10 text-green-300' : 'bg-sky-500/10 text-sky-300'}`}>
                            {c.totalVisits > 5 ? 'VIP' : 'Regular'}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
