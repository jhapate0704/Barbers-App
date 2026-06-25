import React from 'react';

const AboutSalon = ({ about }) => {
  if (!about) return null;
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        Why Choose Us
      </h3>
      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[15px]">
        {about}
      </p>
    </div>
  );
};

export default AboutSalon;
