import React from 'react';
import { Activity, CheckCircle } from 'lucide-react';
import { formatTo12Hr } from '../../utils/formatTo12Hr';

const LiveShopFloor = ({ todayBookings, formattedLocalDate, formattedLocalTime }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div className="flex items-center gap-2.5">
          <Activity className="text-indigo-600 animate-pulse" size={24} />
          <h3 className="text-lg font-bold text-gray-900">Live Shop Floor</h3>
        </div>
        <p className="text-xs text-gray-500 font-semibold">
          {formattedLocalDate} • <span className="text-indigo-600 font-bold">{formattedLocalTime}</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {todayBookings.length === 0 ? (
          <div className="col-span-full bg-white p-6 rounded-xl border border-gray-100 text-center shadow-sm">
            <CheckCircle className="mx-auto text-green-500 mb-2" />
            <p className="font-bold text-gray-800 text-sm">Shop is Wide Open today!</p>
          </div>
        ) : (
          todayBookings.map((b, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-800">
                  {formatTo12Hr(b.startTime)} - {formatTo12Hr(b.endTime)}
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">Duration: {b.totalDuration} mins</p>
              </div>
              <div className="text-right">
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Occupied
                </span>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">{b.chairName}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveShopFloor;
