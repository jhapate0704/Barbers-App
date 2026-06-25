import React, { useState } from 'react';
import { Settings, MapPin, Save, Map } from 'lucide-react';
import { Card, Label, InputField, SelectField, PrimaryBtn } from './Shared';
import LocationPickerModal from '../../../components/LocationPickerModal';

export default function ConfigTab({
  salon,
  cfg,
  setCfg,
  saveSettings,
  handleUpdateLocation,
  handleDeleteLocation,
  handleMapLocationUpdate
}) {
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-[520px] flex flex-col gap-6">
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-[38px] h-[38px] shrink-0 bg-white/5 rounded-[10px] flex items-center justify-center">
            <Settings size={18} className="text-white/55" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-white leading-[1.2]">Salon Configuration</h2>
            <p className="text-[11px] text-white/30 mt-0.5">Manage hours & availability</p>
          </div>
        </div>

        <form onSubmit={saveSettings} className="flex flex-col gap-[18px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="salon-config-opentime">Opening hour</Label>
              <InputField id="salon-config-opentime" name="openTime" type="time" value={cfg.openTime} onChange={e => setCfg(c => ({ ...c, openTime: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="salon-config-closetime">Closing hour</Label>
              <InputField id="salon-config-closetime" name="closeTime" type="time" value={cfg.closeTime} onChange={e => setCfg(c => ({ ...c, closeTime: e.target.value }))} />
            </div>
          </div>

          <div>
            <Label htmlFor="salon-config-weeklyoff">Weekly day off</Label>
            <SelectField id="salon-config-weeklyoff" name="weeklyOffDay" value={cfg.weeklyOffDay} onChange={e => setCfg(c => ({ ...c, weeklyOffDay: e.target.value }))}>
              <option value="-1">No regular holiday</option>
              {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </SelectField>
          </div>

          {/* Emergency toggle */}
          <div className="flex items-start gap-4 p-[16px_18px] bg-red-500/10 border border-red-500/20 rounded-xl">
            <label className="relative inline-block w-[42px] h-[23px] shrink-0 mt-[1px] cursor-pointer" htmlFor="salon-config-offtoday">
              <input id="salon-config-offtoday" name="isOffToday" type="checkbox" className="opacity-0 w-0 h-0 absolute peer" checked={cfg.isOffToday} onChange={e => setCfg(c => ({ ...c, isOffToday: e.target.checked }))} aria-label="Emergency closure today" />
              <span className="absolute inset-0 bg-white/10 rounded-full transition-colors duration-250 peer-checked:bg-violet-500/65 before:content-[''] before:absolute before:w-[17px] before:h-[17px] before:left-[3px] before:top-[3px] before:bg-white/50 before:rounded-full before:transition-transform before:duration-250 peer-checked:before:translate-x-[19px] peer-checked:before:bg-violet-300" />
            </label>
            <div>
              <div className="text-[13px] font-bold text-red-300 mb-1 leading-[1.2]">Emergency Closure</div>
              <div className="text-xs text-red-300/45 leading-[1.6]">Disables all bookings and marks your salon closed in the marketplace for today.</div>
            </div>
          </div>

          <PrimaryBtn type="submit" className="w-full !p-3 mt-0.5">
            <Save size={15} /> Save Configuration
          </PrimaryBtn>
        </form>
      </Card>

      {/* Location Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-[38px] h-[38px] shrink-0 bg-white/5 rounded-[10px] flex items-center justify-center">
            <MapPin size={18} className="text-white/55" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-white leading-[1.2]">Location Settings</h2>
            <p className="text-[11px] text-white/30 mt-0.5">Manage geographic coordinates</p>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-white/35 m-0 mb-4 leading-relaxed">
            This controls where your business appears on the map and in proximity searches.
          </p>
          
          {salon?.latitude && salon?.longitude ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-[10px] bg-green-500/10 flex items-center justify-center">
                  <MapPin size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white m-0">Location Active</p>
                  <p className="text-[11px] text-white/40 mt-0.5 font-mono">
                    {salon.latitude.toFixed(6)}, {salon.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={handleUpdateLocation} className="flex-1 py-2 px-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-300 text-[11px] font-bold uppercase cursor-pointer transition-all duration-150 hover:bg-violet-500/20">
                  Update via GPS
                </button>
                <button onClick={() => setIsMapPickerOpen(true)} className="flex-1 py-2 px-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-[11px] font-bold uppercase cursor-pointer transition-all duration-150 hover:bg-blue-500/20">
                  Pick on Map
                </button>
                <button onClick={handleDeleteLocation} className="flex-1 py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-[11px] font-bold uppercase cursor-pointer transition-all duration-150 hover:bg-red-500/20">
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-dashed border-white/15 rounded-xl p-6 text-center">
              <MapPin size={28} className="text-white/20 mx-auto mb-3" />
              <p className="text-[13px] font-bold text-white m-0 mb-1">No Location Set</p>
              <p className="text-[11px] text-white/40 m-0 mb-4">Your salon won't appear accurately on maps.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={handleUpdateLocation} className="py-2 px-4 bg-white border-none rounded-lg text-black text-xs font-bold cursor-pointer hover:bg-gray-200 transition-colors">
                  Use GPS
                </button>
                <button onClick={() => setIsMapPickerOpen(true)} className="py-2 px-4 bg-indigo-600 border-none rounded-lg text-white text-xs font-bold cursor-pointer hover:bg-indigo-700 transition-colors">
                  Pick on Map
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <LocationPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onLocationSelect={({ latitude, longitude, address }) => {
          handleMapLocationUpdate(latitude, longitude, address);
        }}
        initialLat={salon?.latitude}
        initialLng={salon?.longitude}
      />
    </div>
  );
}
