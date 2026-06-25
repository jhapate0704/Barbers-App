import React, { useState } from 'react';
import { Scissors, Search } from 'lucide-react';

const ServicesMenu = ({ selectedSalon, selectedServices, toggleService }) => {
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Scissors size={20} className="text-indigo-600" />
          Services Menu
        </h2>
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <label htmlFor="service-search-input" className="sr-only">Search services</label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            id="service-search-input"
            name="serviceSearch"
            type="text"
            placeholder="Search services..."
            value={serviceSearchQuery}
            onChange={e => setServiceSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 font-semibold shadow-sm"
          />
          {serviceSearchQuery && (
            <button
              onClick={() => setServiceSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-[10px]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {(() => {
          const filtered = (selectedSalon.services || []).filter(service =>
            service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
          );
          if (filtered.length === 0) {
            return (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-500 font-medium">No services match your search.</p>
              </div>
            );
          }
          return filtered.map(service => {
            const isSelected = selectedServices.includes(service.name);
            return (
              <div 
                key={service._id} 
                onClick={() => toggleService(service.name)}
                className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                    : 'border-gray-150 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex flex-col gap-1 pr-4">
                  <span className="font-bold text-gray-800 text-sm sm:text-base">{service.name}</span>
                  <span className="text-xs text-gray-400 font-semibold">{service.duration} mins</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-extrabold text-gray-900 text-sm sm:text-base">₹{service.price}</span>
                  <button 
                    type="button"
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected ? 'Added ✓' : 'Add +'}
                  </button>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default ServicesMenu;
