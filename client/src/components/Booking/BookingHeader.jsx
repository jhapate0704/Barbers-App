import React from 'react';
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react';
import { getAverageRating } from '../../utils/getAverageRating';
import { formatTo12Hr } from '../../utils/formatTo12Hr';

const BookingHeader = ({ selectedSalon, navigate }) => {
  return (
    <div className="mb-6">
      <button onClick={() => navigate('/')} className="flex items-center text-gray-500 hover:text-black mb-4 transition-colors text-sm font-medium">
        <ArrowLeft size={16} className="mr-2" /> Back to Marketplace
      </button>
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{selectedSalon.name}</h1>
      
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm text-gray-600">
        {/* Average Rating */}
        <div className="flex items-center">
          <Star className="text-amber-500 fill-amber-500 mr-1 shrink-0" size={16} />
          <span className="font-bold text-gray-800 mr-1">
            {getAverageRating(selectedSalon.ratings) || "New"}
          </span>
          <span className="text-gray-400">
            {selectedSalon.ratings?.length > 0 ? `(${selectedSalon.ratings.length} reviews)` : "(No reviews)"}
          </span>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center">
          <Clock className="text-indigo-500 mr-1.5 shrink-0" size={16} />
          <span>Open today: {formatTo12Hr(selectedSalon.operatingHours?.open)} - {formatTo12Hr(selectedSalon.operatingHours?.close)}</span>
        </div>

        {/* Address */}
        <div className="flex items-center">
          <MapPin className="text-red-500 mr-1.5 shrink-0" size={16} />
          <span className="truncate max-w-sm md:max-w-md">{selectedSalon.address}</span>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;
