import React from 'react';

const BookingGallery = ({ images }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-60 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-sm">
      <div className="col-span-1 md:col-span-2 h-full overflow-hidden">
        <img src={images[0]} alt="Salon space main" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
      </div>
      <div className="hidden md:grid grid-rows-2 gap-3 h-full overflow-hidden">
        <div className="overflow-hidden h-full">
          <img src={images[1]} alt="Salon detail" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
        </div>
        <div className="overflow-hidden h-full">
          <img src={images[2]} alt="Salon ambiance" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
};

export default BookingGallery;
