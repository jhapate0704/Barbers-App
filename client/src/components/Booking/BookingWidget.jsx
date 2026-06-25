import React from 'react';
import { Scissors } from 'lucide-react';
import DrumColumn from '../DrumColumn';
import { formatTo12Hr } from '../../utils/formatTo12Hr';

const BookingWidget = ({
  selectedSalon,
  selectedServices,
  totalDuration,
  totalPrice,
  appointmentDate,
  setAppointmentDate,
  startTime,
  bookingStep,
  setBookingStep,
  showCustomDatePicker,
  setShowCustomDatePicker,
  next7Days,
  getLocalDateString,
  chosenBarberId,
  setChosenBarberId,
  chairsList,
  timeAvailability,
  HOURS,
  MINUTES,
  AMPMS,
  drumHour,
  setDrumHour,
  drumMinute,
  setDrumMinute,
  drumAmpm,
  setDrumAmpm,
  onSubmit,
  message,
  getFormattedConfirmDate,
  selectedChairObj,
  todayStr
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl relative max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
      <div className="h-1.5 bg-linear-to-r from-indigo-500 to-fuchsia-500" />
      
      {/* Step Indicators */}
      <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking Stage</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bookingStep === 'services' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>Services</span>
          <span className="text-xs text-gray-300">➔</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bookingStep === 'time' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>Time</span>
          <span className="text-xs text-gray-300">➔</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bookingStep === 'confirm' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>Confirm</span>
        </div>
      </div>

      <div className="p-6">
        {/* STEP 1: SERVICES SUMMARY */}
        {bookingStep === 'services' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Select Services</h3>
              <p className="text-xs text-gray-400">Choose the treatments you want to book.</p>
            </div>

            {selectedServices.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 px-4">
                <Scissors size={28} className="mx-auto text-gray-300 mb-2.5" />
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Select one or more services from the list on the left to start booking.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-40 overflow-y-auto pr-1 space-y-2">
                  {selectedServices.map(name => {
                    const svc = selectedSalon.services.find(s => s.name === name);
                    return (
                      <div key={name} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <div className="font-medium text-gray-700 truncate mr-2">{name}</div>
                        <div className="font-bold text-gray-900 shrink-0">₹{svc?.price}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Duration</span>
                    <span className="text-sm font-bold text-gray-700">{totalDuration} mins</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Price</span>
                    <span className="text-lg font-extrabold text-indigo-600">₹{totalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!appointmentDate) {
                      setAppointmentDate(todayStr);
                    }
                    setBookingStep('time');
                  }}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-lg"
                >
                  Choose Date & Time ➔
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: TIME & BARBER SELECTION */}
        {bookingStep === 'time' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-0.5">Select Professional & Time</h3>
                <p className="text-[10px] text-gray-400 font-semibold">Customize your appointment scheduling.</p>
              </div>
              <button 
                onClick={() => setBookingStep('services')} 
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500"
              >
                Change Services
              </button>
            </div>

            {/* Visual 7-day selector */}
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">1. Choose Date</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                {next7Days.map((date, idx) => {
                  const dateStr = getLocalDateString(date);
                  const isSelected = appointmentDate === dateStr;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setAppointmentDate(dateStr);
                      }}
                      className={`flex flex-col items-center py-2.5 px-3 rounded-xl border cursor-pointer min-w-14 text-center select-none transition-all active:scale-95 ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                          : 'border-gray-200 bg-white hover:border-indigo-400 text-gray-700'
                      }`}
                    >
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-base font-extrabold leading-tight mt-0.5">
                        {date.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center mt-1.5">
                <button 
                  onClick={() => setShowCustomDatePicker(!showCustomDatePicker)} 
                  className="text-[10px] font-bold text-slate-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                >
                  📅 {showCustomDatePicker ? "Hide custom picker" : "Pick another date..."}
                </button>
              </div>

              {showCustomDatePicker && (
                <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl mt-2">
                  <label htmlFor="appointment-date-picker" className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Select Specific Date</label>
                  <input 
                    id="appointment-date-picker"
                    name="appointmentDate"
                    type="date" 
                    min={todayStr} 
                    value={appointmentDate} 
                    onChange={e => {
                      setAppointmentDate(e.target.value);
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-indigo-500" 
                  />
                </div>
              )}
            </div>

            {/* 2. Choose Professional / Chair */}
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">2. Select Professional</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {/* Any Barber */}
                <div
                  onClick={() => setChosenBarberId('any')}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer min-w-30 select-none transition-all active:scale-95 shrink-0 ${
                    chosenBarberId === 'any'
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-bold'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    chosenBarberId === 'any' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Scissors size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold leading-none">Any Barber</p>
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Auto-assigns free</p>
                  </div>
                </div>

                {/* Specific Chairs */}
                {chairsList.map(chair => {
                  const isSelected = chosenBarberId === chair._id;
                  return (
                    <div
                      key={chair._id}
                      onClick={() => setChosenBarberId(chair._id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer min-w-30 select-none transition-all active:scale-95 shrink-0 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-bold'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {chair.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold leading-none truncate">{chair.name}</p>
                        <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Barber / Stylist</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Choose Time (Scrollable Drum Picker) */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">3. Choose Time</span>
              
              {/* Visual iOS/Android Drum Picker */}
              <div className="relative flex justify-center items-center gap-2 bg-gray-50 border border-gray-150 rounded-2xl p-4 overflow-hidden h-33.75">
                {/* Highlight Selection Indicator */}
                <div className="absolute left-4 right-4 h-10 border-t border-b border-indigo-500/20 bg-indigo-500/5 rounded-xl pointer-events-none" />
                
                <DrumColumn options={HOURS} value={drumHour} onChange={setDrumHour} />
                <span className="text-indigo-400 font-extrabold text-sm shrink-0 leading-none pb-1">:</span>
                <DrumColumn options={MINUTES} value={drumMinute} onChange={setDrumMinute} />
                <div className="w-1" />
                <DrumColumn options={AMPMS} value={drumAmpm} onChange={setDrumAmpm} />
                
                {/* Translucent fade gradients */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-linear-to-b from-gray-50 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-gray-50 to-transparent pointer-events-none" />
              </div>

              {/* Live Validation Alert feedback */}
              <div className={`p-3 rounded-xl border text-xs font-bold text-center leading-relaxed transition-all ${
                timeAvailability.available 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {timeAvailability.message}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex gap-2.5">
              <button
                onClick={() => setBookingStep('services')}
                className="w-1/3 border border-gray-300 hover:border-black text-gray-800 font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98]"
              >
                Back
              </button>
              <button
                onClick={() => setBookingStep('confirm')}
                disabled={!timeAvailability.available}
                className="w-2/3 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                Proceed to Confirm ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM & BOOK */}
        {bookingStep === 'confirm' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">Confirm Booking</h3>
              <button 
                onClick={() => setBookingStep('time')} 
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500"
              >
                Change Date/Time
              </button>
            </div>

            {/* Booking Receipt Summary */}
            <div className="bg-gray-50 border border-gray-150 p-4 rounded-2xl space-y-3">
              {/* Salon address */}
              <div className="text-xs">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Venue</span>
                <span className="font-bold text-gray-800 block">{selectedSalon.name}</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">{selectedSalon.address}</span>
              </div>

              {/* Appt date & time */}
              <div className="text-xs border-t border-gray-200/60 pt-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Appointment Date & Time</span>
                <span className="font-extrabold text-gray-900 block mt-0.5">
                  {getFormattedConfirmDate()}
                </span>
                <span className="text-indigo-600 font-extrabold block text-sm mt-0.5">
                  at {formatTo12Hr(startTime)}
                </span>
              </div>

              {/* Professional */}
              <div className="text-xs border-t border-gray-200/60 pt-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Professional</span>
                <span className="font-bold text-gray-800 block mt-0.5">
                  {selectedChairObj ? selectedChairObj.name : 'Any Barber (Auto-assigned)'}
                </span>
              </div>

              {/* Services list */}
              <div className="text-xs border-t border-gray-200/60 pt-3 space-y-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Chosen Treatments</span>
                {selectedServices.map(name => {
                  const svc = selectedSalon.services.find(s => s.name === name);
                  return (
                    <div key={name} className="flex justify-between items-center font-medium text-slate-600">
                      <span className="truncate mr-2">{name}</span>
                      <span className="text-gray-900 font-bold shrink-0">₹{svc?.price}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total summary */}
              <div className="text-xs border-t border-gray-200 pt-3 flex justify-between items-end">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Total Duration</span>
                  <span className="font-bold text-slate-700 text-xs">{totalDuration} mins</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Total Investment</span>
                  <span className="font-extrabold text-indigo-600 text-lg">₹{totalPrice}</span>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 pt-1">
              <button 
                type="submit" 
                className="w-full bg-linear-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-extrabold py-3.5 rounded-xl text-base transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
              >
                Book Appointment Now
              </button>
              <button
                type="button"
                onClick={() => setBookingStep('time')}
                className="w-full text-slate-500 hover:text-slate-800 text-xs font-bold text-center"
              >
                ➔ Back to Date & Time
              </button>
            </form>

            {message && message.text && (
              <div className={`p-3.5 rounded-xl border mt-3 text-xs font-medium text-center ${
                message.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : message.type === 'loading'
                    ? 'bg-blue-50 border-blue-200 text-blue-800 animate-pulse'
                    : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWidget;
