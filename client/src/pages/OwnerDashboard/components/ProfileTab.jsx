import React from 'react';
import { Star, Plus, Check } from 'lucide-react';
import { Card, Label, InputField, PrimaryBtn } from './Shared';

export default function ProfileTab({
  salon,
  profileForm,
  setProfileForm,
  isEditingProfile,
  setIsEditingProfile,
  saveProfileDetails,
  handleImageUpload,
  handleDeleteImage,
  aboutFormText,
  setAboutFormText,
  isEditingAbout,
  setIsEditingAbout,
  handleSaveAbout
}) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start max-w-[1000px] animate-[fadeUp_0.3s_ease]">
      
      {/* LEFT COLUMN: About Section */}
      <div className="flex-1 w-full flex flex-col gap-6">
        <Card className="relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-white uppercase tracking-[0.05em] flex items-center gap-2 m-0">
              <div className="w-[3px] h-3.5 bg-violet-500 rounded-full" /> About The Shop
            </h2>
            <button 
              onClick={() => {
                if (isEditingAbout) {
                  setIsEditingAbout(false);
                } else {
                  setIsEditingAbout(true);
                  setAboutFormText(salon?.about || '');
                }
              }} 
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-[11px] font-bold cursor-pointer uppercase tracking-[0.05em] hover:bg-white/[0.08] transition-colors"
            >
              {isEditingAbout ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          {!isEditingAbout ? (
            <p className="text-[13px] text-white/50 leading-[1.8] m-0 whitespace-pre-wrap">
              {salon?.about || "Add a brief description about your barbershop, your history, and what makes your services special."}
            </p>
          ) : (
            <form onSubmit={handleSaveAbout} className="flex flex-col gap-3.5">
              <textarea 
                value={aboutFormText} 
                onChange={e => setAboutFormText(e.target.value)} 
                placeholder="Tell clients about your barbershop..."
                className="w-full p-[14px_16px] bg-white/5 border border-white/10 rounded-xl text-white/80 text-[13px] leading-[1.6] outline-none min-h-[140px] resize-y font-inherit focus:border-violet-500/50 transition-colors" 
              />
              <PrimaryBtn type="submit" className="w-full mt-1.5 !py-[11px]">
                <Check size={15} /> Save Description
              </PrimaryBtn>
            </form>
          )}
        </Card>
      </div>

      {/* RIGHT COLUMN: Profile Info Card */}
      <div className="w-full md:w-[320px] shrink-0">
        <Card className="flex flex-col items-center text-center relative p-7">
          <button onClick={() => {
            if (isEditingProfile) {
              setIsEditingProfile(false);
            } else {
              setIsEditingProfile(true);
              setProfileForm({ ownerName: salon?.ownerName || '', address: salon?.address || '' });
            }
          }} className="absolute top-5 right-5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-[11px] font-bold cursor-pointer uppercase tracking-[0.05em] hover:bg-white/[0.08] transition-colors">
            {isEditingProfile ? 'Cancel' : 'Edit'}
          </button>

          {/* Circular Avatar */}
          <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-[36px] font-bold text-white mb-5 shadow-[0_8px_24px_rgba(124,58,237,0.3)] border-2 border-white/10">
            {(salon?.ownerName?.[0] || 'A').toUpperCase()}
          </div>

          {!isEditingProfile ? (
            <>
              <h2 className="text-[18px] font-bold text-white mb-1.5 m-0">{salon?.ownerName || 'Owner Name'}</h2>
              
              {/* Review stars */}
              <div className="flex items-center gap-1.5 mb-5">
                <div className="flex gap-[2px]">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const ratings = salon?.ratings || [];
                    const avg = ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length) : 0;
                    return (
                      <Star key={s} size={14} 
                        color={s <= Math.round(avg) ? "#fbbf24" : "rgba(255,255,255,0.15)"} 
                        fill={s <= Math.round(avg) ? "#fbbf24" : "transparent"} 
                      />
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-white/50">
                  {(() => {
                    const ratings = salon?.ratings || [];
                    return ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) : "0.0";
                  })()}
                </span>
              </div>

              <div className="h-[1px] w-full bg-white/[0.06] my-[12px_20px]" />

              <div className="flex flex-col gap-1 w-full text-left">
                <span className="text-[10px] font-bold text-white/25 uppercase tracking-[0.08em]">Location Address</span>
                <p className="text-[13px] text-white/60 leading-[1.5] m-0">{salon?.address}</p>
              </div>

              <div className="h-[1px] w-full bg-white/[0.06] my-4" />

              {/* Salon Photos (Storefront & Interior) */}
              <div className="w-full text-left">
                <span className="text-[10px] font-bold text-white/25 uppercase tracking-[0.08em] block mb-2">Salon Photos ({(salon?.images || []).length}/5)</span>
                <div className="grid grid-cols-5 gap-1.5 w-full">
                  {(salon?.images || []).map((imgUrl, idx) => (
                    <div key={idx} className="relative pb-[100%] rounded-lg overflow-hidden border border-white/[0.08]">
                      <img src={imgUrl} alt={`Salon storefront ${idx}`} className="absolute top-0 left-0 w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleDeleteImage(idx)} 
                        className="absolute top-0.5 right-0.5 w-[14px] h-[14px] rounded bg-red-500/95 text-white border-none text-[8px] font-bold cursor-pointer flex items-center justify-center hover:bg-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  {(salon?.images || []).length < 5 && (
                    <label htmlFor="salon-storefront-upload" className="relative pb-[100%] border border-dashed border-white/15 rounded-lg flex flex-col items-center justify-center text-white/30 cursor-pointer bg-white/[0.01] hover:border-violet-500/50 hover:text-white transition-colors">
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Plus size={14} />
                      </div>
                      <input id="salon-storefront-upload" name="salonStorefrontUpload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" aria-label="Upload Storefront Image" />
                    </label>
                  )}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={saveProfileDetails} className="w-full flex flex-col gap-3.5 text-left mt-3">
              <div>
                <Label htmlFor="edit-profile-name">Owner Name</Label>
                <InputField id="edit-profile-name" value={profileForm.ownerName} onChange={e => setProfileForm(p => ({ ...p, ownerName: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="edit-profile-address">Salon Address</Label>
                <textarea id="edit-profile-address" value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} required className="w-full p-[10px_14px] bg-white/5 border border-white/10 rounded-xl text-slate-200 text-[13px] outline-none min-h-[70px] resize-y font-inherit focus:border-violet-500/50 transition-colors" />
              </div>
              <PrimaryBtn type="submit" className="w-full mt-1.5 !p-[11px]">Save Changes</PrimaryBtn>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
