import React from 'react';
import { ShoppingBag, Landmark, Scissors } from 'lucide-react';

export default function StatsCards({ bookings, completedBookings }) {
  const totalSpent = completedBookings.reduce((sum, b) =>
    sum + (b.services?.reduce((acc, s) => acc + s.price, 0) || 0), 0
  );

  const preferredSalon = () => {
    if (bookings.length === 0) return 'None';
    const counts = {};
    bookings.forEach(b => {
      const name = b.salonId?.name;
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'None';
  };

  const stats = [
    { label: 'Visits Recorded', val: completedBookings.length, icon: ShoppingBag, grad: 'from-violet-500 to-indigo-500', glow: 'rgba(139,92,246,.35)', glowClass: 'hover:shadow-[0_18px_50px_-20px_rgba(124,58,237,0.45)]' },
    { label: 'Lifetime Investment', val: `₹${totalSpent.toLocaleString()}`, icon: Landmark, grad: 'from-emerald-400 to-teal-500', glow: 'rgba(16,185,129,.3)', glowClass: 'hover:shadow-[0_18px_50px_-20px_rgba(16,185,129,0.45)]' },
    { label: 'Preferred Salon', val: preferredSalon(), icon: Scissors, grad: 'from-amber-400 to-orange-500', glow: 'rgba(245,158,11,.3)', glowClass: 'hover:shadow-[0_18px_50px_-20px_rgba(245,158,11,0.45)]' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      {stats.map((stat, i) => (
        <div key={i} className={`bg-white/90 backdrop-blur-xl border border-indigo-500/15 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.08)] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:border-violet-400/35 ${stat.glowClass} rounded-2xl p-5 flex items-center relative overflow-hidden group`}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at top left, ${stat.glow}, transparent 70%)` }} />
          <div className={`relative p-3.5 bg-gradient-to-br ${stat.grad} rounded-2xl mr-4 shadow-lg ring-1 ring-white/15`} style={{ boxShadow: `0 10px 30px -10px ${stat.glow}` }}>
            <stat.icon size={20} className="text-slate-900" />
          </div>
          <div className="relative min-w-0">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">{stat.label}</p>
            <h3 className="text-xl font-bold text-slate-900 truncate max-w-[180px] sm:max-w-none">{stat.val}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
