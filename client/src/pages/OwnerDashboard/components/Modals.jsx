import React from 'react';
import { Zap, Save, Plus } from 'lucide-react';
import { Label, InputField, SelectField, PrimaryBtn, ModalClose } from './Shared';

const formatTo12Hr = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mFormatted = String(m).padStart(2, '0');
  return `${h12}:${mFormatted} ${ampm}`;
};

export default function Modals({
  salon,
  showWalkin,
  setShowWalkin,
  walkin,
  setWalkin,
  addWalkin,
  showEarlyComplete,
  setShowEarlyComplete,
  earlyCompleteBooking,
  setEarlyCompleteBooking,
  earlyEndTime,
  setEarlyEndTime,
  shiftType,
  setShiftType,
  completeBookingEarly,
  selectedCustomer,
  setSelectedCustomer,
  customerNotes,
  setCustomerNotes,
  saveNotes,
  showOwnerInfo,
  setShowOwnerInfo,
  handleImageUpload,
  handleDeleteImage
}) {
  return (
    <>
      {/* ══ WALK-IN MODAL ══ */}
      {showWalkin && (
        <div onClick={e => e.target === e.currentTarget && setShowWalkin(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-2xl p-7 w-full max-w-[440px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white leading-[1.2] m-0">Add Walk-in</h2>
                <p className="text-xs text-white/30 mt-1 m-0">Push a client directly to the floor queue.</p>
              </div>
              <ModalClose onClick={() => setShowWalkin(false)} />
            </div>

            <form onSubmit={addWalkin} className="flex flex-col gap-3.5">
              <div>
                <Label htmlFor="walkin-client-name">Client name</Label>
                <InputField id="walkin-client-name" name="clientName" placeholder="Full name" required value={walkin.name} onChange={e => setWalkin(w => ({ ...w, name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="walkin-client-phone">Phone (optional)</Label>
                <InputField id="walkin-client-phone" name="clientPhone" placeholder="e.g. 9876543210" value={walkin.phone} onChange={e => setWalkin(w => ({ ...w, phone: e.target.value.replace(/[^0-9]/g, '') }))} />
              </div>
              <div>
                <Label htmlFor="walkin-assign-barber">Assign barber</Label>
                <SelectField id="walkin-assign-barber" name="chairId" value={walkin.chairId} onChange={e => setWalkin(w => ({ ...w, chairId: e.target.value }))}>
                  {salon?.chairs?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </SelectField>
              </div>
              <div>
                <Label>Services</Label>
                <div className="flex flex-wrap gap-2">
                  {salon?.services?.map(s => {
                    const sel = walkin.services.includes(s.name);
                    return (
                      <button key={s._id} type="button"
                        onClick={() => setWalkin(w => ({ ...w, services: sel ? w.services.filter(n => n !== s.name) : [...w.services, s.name] }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${sel ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300' : 'bg-white/5 border border-white/10 text-white/45'}`}>
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <PrimaryBtn type="submit" className="w-full mt-1.5 !py-3">
                <Zap size={15} /> Confirm & Push to Queue
              </PrimaryBtn>
            </form>
          </div>
        </div>
      )}

      {/* ══ EARLY COMPLETE MODAL ══ */}
      {showEarlyComplete && earlyCompleteBooking && (
        <div onClick={e => e.target === e.currentTarget && setShowEarlyComplete(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-2xl p-7 w-full max-w-[440px]">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white leading-[1.2] m-0">Complete Early</h2>
                <p className="text-xs text-white/30 mt-1 m-0">Finish this slot early and shift subsequent bookings forward to eliminate gap.</p>
              </div>
              <ModalClose onClick={() => { setShowEarlyComplete(false); setEarlyCompleteBooking(null); }} />
            </div>

            <div className="flex flex-col gap-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 mb-4">
              <div>
                <Label>Client Name</Label>
                <div className="text-sm font-semibold text-white">{earlyCompleteBooking.customerId?.name || 'Walk-in'}</div>
              </div>
              
              <div>
                <Label>Scheduled Time</Label>
                <div className="text-sm font-semibold text-white">
                  {formatTo12Hr(earlyCompleteBooking.startTime)} – {formatTo12Hr(earlyCompleteBooking.endTime)}
                </div>
              </div>

              <div>
                <Label>Barber / Chair</Label>
                <div className="text-sm font-semibold text-white">{earlyCompleteBooking.chairName}</div>
              </div>
            </div>

            <form onSubmit={completeBookingEarly} className="flex flex-col gap-3.5">
              <div>
                <Label htmlFor="early-completion-time">Actual Completion Time</Label>
                <InputField 
                  id="early-completion-time"
                  name="earlyEndTime"
                  type="time" 
                  required 
                  value={earlyEndTime} 
                  onChange={e => setEarlyEndTime(e.target.value)} 
                />
              </div>

              <div>
                <Label htmlFor="queue-shift-type">Queue Shifting Method</Label>
                <SelectField id="queue-shift-type" name="shiftType" value={shiftType} onChange={e => setShiftType(e.target.value)}>
                  <option value="request">Ask Customer via App Confirmation</option>
                  <option value="force">Force Shift Directly (Confirmed on Call)</option>
                </SelectField>
              </div>
              
              <PrimaryBtn type="submit" className="w-full mt-1.5 !py-3">
                <Zap size={15} /> Complete & Process Queue
              </PrimaryBtn>
            </form>
          </div>
        </div>
      )}

      {/* ══ CRM MODAL ══ */}
      {selectedCustomer && (
        <div onClick={e => e.target === e.currentTarget && setSelectedCustomer(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-2xl p-7 w-full max-w-[440px]">
            <div className="flex items-start justify-between gap-3 mb-5">
              <h2 className="text-lg font-bold text-white m-0">Client Profile</h2>
              <ModalClose onClick={() => setSelectedCustomer(null)} />
            </div>

            {/* Avatar row */}
            <div className="flex items-center gap-3.5 p-[14px_16px] bg-violet-500/[0.08] border border-violet-500/[0.14] rounded-xl mb-5">
              <div className="w-[46px] h-[46px] shrink-0 bg-violet-500/20 rounded-xl flex items-center justify-center text-lg font-bold text-violet-300">
                {(selectedCustomer.name?.[0] || 'C').toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-bold text-white overflow-hidden text-ellipsis whitespace-nowrap">{selectedCustomer.name}</div>
                <div className="text-xs text-violet-400 mt-0.5">{selectedCustomer.phone || 'No phone on record'}</div>
              </div>
            </div>

            <div className="mb-4">
              <Label>Private notes & style history</Label>
              <textarea value={customerNotes} onChange={e => setCustomerNotes(e.target.value)}
                placeholder="e.g. Prefers low taper, allergic to eucalyptus…"
                className="w-full h-[130px] p-[10px_14px] bg-white/5 border border-white/10 rounded-xl text-slate-200 text-[13px] outline-none resize-none leading-[1.6] font-inherit focus:border-violet-500/50 transition-colors" />
            </div>

            <PrimaryBtn onClick={saveNotes} className="w-full !py-3">
              <Save size={15} /> Save Record
            </PrimaryBtn>
          </div>
        </div>
      )}

      {/* ══ OWNER INFO MODAL ══ */}
      {showOwnerInfo && (
        <div onClick={e => e.target === e.currentTarget && setShowOwnerInfo(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-2xl p-7 w-full max-w-[440px]">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white leading-[1.2] m-0">Salon Profile Info</h2>
                <p className="text-xs text-white/30 mt-1 m-0">View and manage your listing details.</p>
              </div>
              <ModalClose onClick={() => setShowOwnerInfo(false)} />
            </div>

            {/* Salon Image Gallery Section */}
            <div className="flex flex-col gap-3 mb-6">
              <Label>Salon Photos ({(salon?.images || []).length}/5)</Label>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(68px,1fr))] gap-2 w-full">
                {(salon?.images || []).map((imgUrl, idx) => (
                  <div key={idx} className="relative h-[68px] rounded-lg overflow-hidden border border-white/10">
                    <img src={imgUrl} alt={`Salon ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleDeleteImage(idx)} 
                      className="absolute top-0.5 right-0.5 w-[18px] h-[18px] rounded bg-red-500/85 text-white border-none text-[10px] font-bold cursor-pointer flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {(salon?.images || []).length < 5 && (
                  <label htmlFor="salon-image-upload" className="h-[68px] border border-dashed border-white/15 rounded-lg flex flex-col items-center justify-center text-white/30 cursor-pointer hover:border-violet-500/50 hover:text-white transition-colors">
                    <Plus size={16} />
                    <span className="text-[9px] font-bold uppercase mt-0.5">Add</span>
                    <input id="salon-image-upload" name="salonImageUpload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" aria-label="Upload Salon Image" />
                  </label>
                )}
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="flex flex-col gap-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl p-[18px] mb-2">
              <div>
                <Label>Salon Name</Label>
                <div className="text-sm font-semibold text-white">{salon?.name}</div>
              </div>
              
              <div>
                <Label>Owner Name</Label>
                <div className="text-sm font-semibold text-white">{salon?.ownerName}</div>
              </div>

              <div>
                <Label>Email Address</Label>
                <div className="text-sm font-semibold text-white font-mono">{salon?.email}</div>
              </div>

              <div>
                <Label>Salon Listed Date</Label>
                <div className="text-sm font-semibold text-white">
                  {salon?.createdAt ? new Date(salon.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
