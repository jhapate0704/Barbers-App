import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Building2, Users, Activity, MapPin, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:5000/api";

export default function SuperAdminPanel() {
  const navigate = useNavigate();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/salons`);
        setSalons(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setLoading(false);
      }
    };
    fetchPlatformData();
  }, []);

  const totalSalons = salons.length;
  const totalChairs = salons.reduce((acc, salon) => acc + (salon.chairs?.length || 0), 0);
  const totalPeopleInQueue = salons.reduce((acc, salon) => acc + (salon.currentQueue || 0), 0);

  const filteredSalons = salons.filter(s => 
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 relative overflow-hidden">
      {/* Background Admin Skeleton */}
      <div className="max-w-6xl mx-auto space-y-8 pointer-events-none select-none opacity-20">
        <div className="h-20 bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-slate-800 rounded-lg w-1/3 animate-pulse" />
          <div className="h-64 bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
      {/* Existing central loader */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
        <ShieldAlert size={48} className="text-indigo-500 animate-pulse mb-4" />
        <p className="text-xl font-bold tracking-widest uppercase text-indigo-400">Accessing Core Matrix...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Admin Header */}
        <header className="mb-8 border-b border-slate-800 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold w-fit">
              <ArrowLeft size={16} /> Exit Admin Console
            </button>
            <div>
              <div className="flex items-center text-indigo-400 mb-2">
                <ShieldAlert size={20} className="mr-2" />
                <span className="font-black tracking-[0.2em] uppercase text-[10px]">Global Control Console</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">Platform Overview</h1>
            </div>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <label htmlFor="admin-search-input" className="sr-only">Filter salons or cities</label>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              id="admin-search-input"
              name="adminSearch"
              type="text" 
              placeholder="Filter salons or cities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/50 border border-slate-800 text-white text-sm rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full pl-12 p-4 transition-all outline-none"
            />
          </div>
        </header>

        {/* Top-Level Platform Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
          {[
            { label: 'Network Partners', val: totalSalons, icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Active Chairs', val: totalChairs, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Live Sessions', val: totalPeopleInQueue, icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex items-center shadow-xl">
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl mr-5`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] mb-1">{stat.label}</p>
                <h2 className="text-3xl font-black text-white">{stat.val}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* Salon Management Table */}
        <div className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/50">
            <h3 className="text-lg md:text-xl font-black text-white">Marketplace Ecosystem</h3>
            <p className="text-slate-500 text-xs mt-1 font-bold">Managing {filteredSalons.length} active nodes</p>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm text-left text-slate-300 min-w-[800px]">
              <thead className="text-[10px] text-slate-500 uppercase font-black bg-slate-950/50 tracking-widest">
                <tr>
                  <th scope="col" className="px-8 py-5">Salon Entity</th>
                  <th scope="col" className="px-8 py-5">Geographic Link</th>
                  <th scope="col" className="px-8 py-5">Infrastructure</th>
                  <th scope="col" className="px-8 py-5">Current Load</th>
                  <th scope="col" className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredSalons.map((salon) => (
                  <tr key={salon._id} className="hover:bg-slate-800/30 transition-all group">
                    <td className="px-8 py-6">
                      <p className="font-black text-white group-hover:text-indigo-400 transition-colors">{salon.name}</p>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">ID: {salon._id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-xs font-bold text-slate-400">
                        <MapPin size={14} className="mr-2 text-indigo-500/50" /> {salon.address}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-xs">{salon.chairs?.length || 0} Virtual Chairs</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {salon.currentQueue > 0 ? (
                        <div className="inline-flex items-center bg-orange-500/10 text-orange-400 text-[10px] font-black px-3 py-1.5 rounded-lg border border-orange-500/20 uppercase">
                          {salon.currentQueue} Active Clients
                        </div>
                      ) : (
                        <div className="inline-flex items-center bg-slate-800/50 text-slate-500 text-[10px] font-black px-3 py-1.5 rounded-lg border border-slate-700/50 uppercase">
                          No Load
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors bg-indigo-500/5 px-4 py-2 rounded-lg hover:bg-indigo-500">Inspect</button>
                        <button className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-white transition-colors bg-red-500/5 px-4 py-2 rounded-lg hover:bg-red-500">Suspend</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSalons.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="bg-slate-800/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-slate-600" size={32} />
                      </div>
                      <p className="font-black text-slate-500 uppercase tracking-widest">No matching nodes found in the network</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
