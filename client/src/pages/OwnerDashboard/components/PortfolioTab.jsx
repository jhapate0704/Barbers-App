import React from 'react';
import { Camera, Plus } from 'lucide-react';
import { Card } from './Shared';

export default function PortfolioTab({
  salon,
  handlePortfolioUpload,
  handleDeletePortfolioImage,
  aboutFormText,
  setAboutFormText,
  isEditingAbout,
  setIsEditingAbout,
  handleSaveAbout
}) {
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] animate-[fadeUp_0.3s_ease]">
      
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
          <Camera size={24} className="text-white/50" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white m-0">Salon Portfolio</h1>
          <p className="text-xs text-white/35 mt-2 m-0">
            Manage your salon's description and showcase your best work to potential customers.
          </p>
        </div>
      </div>

      <Card className="flex flex-col gap-4 relative">
        <div className="flex justify-between items-center">
          <h2 className="text-[15px] font-bold text-white m-0">About Salon</h2>
          {!isEditingAbout && (
            <button 
              onClick={() => { setAboutFormText(salon?.about || ''); setIsEditingAbout(true); }}
              className="text-xs font-semibold text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all duration-150 hover:bg-violet-500/20"
            >
              Edit Text
            </button>
          )}
        </div>

        {!isEditingAbout ? (
          <p className="text-[13px] text-white/60 leading-[1.6] m-0 whitespace-pre-wrap">
            {salon?.about || "Write a brief description about your salon's hospitality, ambiance, and specialties..."}
          </p>
        ) : (
          <form onSubmit={handleSaveAbout} className="flex flex-col gap-3">
            <textarea 
              value={aboutFormText} 
              onChange={e => setAboutFormText(e.target.value)} 
              placeholder="e.g. We specialize in premium fades and offer complimentary beverages..."
              required 
              className="w-full p-3 bg-white/[0.03] border border-violet-500/30 rounded-xl text-white text-[13px] outline-none min-h-[120px] resize-y font-inherit leading-[1.5] focus:border-violet-500/60 transition-colors" 
            />
            <div className="flex gap-2.5 justify-end">
              <button type="button" onClick={() => setIsEditingAbout(false)} className="px-4 py-2 bg-transparent border-none text-white/50 text-xs font-semibold cursor-pointer hover:text-white/80 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-violet-500 text-white border-none rounded-lg text-xs font-semibold cursor-pointer hover:bg-violet-600 transition-colors">Save Changes</button>
            </div>
          </form>
        )}
      </Card>

      <Card className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[15px] font-bold text-white m-0">Portfolio Gallery</h2>
          <span className="text-xs text-white/30 font-semibold">({(salon?.portfolio || []).length}/10 images)</span>
        </div>

        {/* Portfolio grid display */}
        {(salon?.portfolio || []).length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 w-full">
            {(salon?.portfolio || []).map((imgUrl, idx) => (
              <div key={idx} className="relative pb-[100%] rounded-xl overflow-hidden border border-white/[0.08]">
                <img src={imgUrl} alt={`Portfolio ${idx}`} className="absolute top-0 left-0 w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => handleDeletePortfolioImage(idx)} 
                  className="absolute top-2 right-2 w-[26px] h-[26px] rounded-lg bg-red-500/95 text-white border-none text-[13px] font-bold cursor-pointer flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}

            {(salon?.portfolio || []).length < 10 && (
              <label htmlFor="portfolio-image-upload" className="relative pb-[100%] border border-dashed border-white/15 rounded-xl flex flex-col items-center justify-center text-white/30 cursor-pointer bg-white/[0.01] hover:border-violet-500/50 hover:text-white transition-colors group">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                  <Plus size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold uppercase">Add Photo</span>
                </div>
                <input id="portfolio-image-upload" name="portfolioImageUpload" type="file" accept="image/*" onChange={handlePortfolioUpload} className="hidden" aria-label="Upload Portfolio Image" />
              </label>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-[64px_24px] border border-dashed border-white/[0.08] rounded-[14px] bg-white/[0.01]">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center text-white/25 mb-4">
              <Camera size={32} />
            </div>
            <h3 className="text-base font-semibold text-white/70 mb-1.5">Showcase Your Craft</h3>
            <p className="text-[13px] text-white/30 text-center max-w-[300px] leading-[1.5] mb-5">Upload portfolio photos to display your team's signature haircuts and styling work to customers.</p>
            
            <label htmlFor="portfolio-empty-upload" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500/10 text-violet-300 border border-violet-500/25 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-150 hover:bg-violet-500/20">
              <Plus size={16} /> Upload Photos
              <input id="portfolio-empty-upload" name="portfolioEmptyUpload" type="file" accept="image/*" onChange={handlePortfolioUpload} className="hidden" aria-label="Upload Portfolio Image" />
            </label>
          </div>
        )}
      </Card>
    </div>
  );
}
