import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PortfolioGallery = ({ portfolio }) => {
  const [portfolioLightboxIndex, setPortfolioLightboxIndex] = useState(null);

  if (!portfolio || portfolio.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          Salon Highlights
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {portfolio.map((imgUrl, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 border border-gray-200">
              <img 
                src={imgUrl} 
                alt={`Portfolio image ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button 
                  onClick={(e) => { e.stopPropagation(); setPortfolioLightboxIndex(idx); }}
                  className="bg-white/90 text-gray-900 font-bold px-4 py-2 rounded-full text-xs shadow-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:scale-105"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {portfolioLightboxIndex !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300" onClick={() => setPortfolioLightboxIndex(null)}>
          <button 
            onClick={(e) => { e.stopPropagation(); setPortfolioLightboxIndex(null); }}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            {portfolio.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setPortfolioLightboxIndex((prev) => (prev > 0 ? prev - 1 : portfolio.length - 1)); }}
                className="absolute left-4 md:left-8 z-10 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all transform hover:scale-110"
              >
                <ChevronLeft size={32} />
              </button>
            )}
            
            <img 
              src={portfolio[portfolioLightboxIndex]} 
              alt={`Portfolio ${portfolioLightboxIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl animate-[fadeUp_0.3s_ease]"
            />
            
            {portfolio.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setPortfolioLightboxIndex((prev) => (prev < portfolio.length - 1 ? prev + 1 : 0)); }}
                className="absolute right-4 md:right-8 z-10 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all transform hover:scale-110"
              >
                <ChevronRight size={32} />
              </button>
            )}
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
            <span className="text-white/80 bg-black/50 px-4 py-2 rounded-full text-sm font-semibold tracking-wide backdrop-blur-md">
              {portfolioLightboxIndex + 1} / {portfolio.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioGallery;
