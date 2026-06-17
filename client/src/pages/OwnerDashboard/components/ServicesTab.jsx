import React from 'react';
import { Scissors, Trash2, Plus } from 'lucide-react';
import { Card, SectionTitle, Badge, IconBtn, Label, InputField, PrimaryBtn } from './Shared';

export default function ServicesTab({ salon, cfg, setCfg, addService, delService }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-5 items-start">
      {/* list */}
      <Card>
        <SectionTitle icon={Scissors} badge={`${salon?.services?.length || 0}`}>Service Menu</SectionTitle>
        <div className="flex flex-col gap-2">
          {salon?.services?.map(s => (
            <div key={s._id} className="flex items-center gap-[14px] p-[12px_16px] bg-white/5 border border-white/5 rounded-[11px]">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white/85 mb-1.5 overflow-hidden text-ellipsis whitespace-nowrap">{s.name}</div>
                <div className="flex items-center gap-2">
                  <Badge color="green">₹{s.price}</Badge>
                  <Badge color="blue">{s.duration} min</Badge>
                </div>
              </div>
              <IconBtn danger onClick={() => delService(s._id)}><Trash2 size={15} /></IconBtn>
            </div>
          ))}
          {(!salon?.services || salon.services.length === 0) && (
            <div className="py-8 text-center text-white/20 text-[13px]">No services yet.</div>
          )}
        </div>
      </Card>

      {/* add form */}
      <Card className="border-violet-500/20 bg-gradient-to-br from-[#13131f] to-[#120f20]">
        <SectionTitle icon={Plus}>Add Service</SectionTitle>
        <div className="flex flex-col gap-[14px]">
          <div>
            <Label htmlFor="new-service-name">Service name</Label>
            <InputField id="new-service-name" name="newServiceName" placeholder="e.g. Skin Fade" value={cfg.newServiceName} onChange={e => setCfg(c => ({ ...c, newServiceName: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="new-service-price">Price (₹)</Label>
              <InputField id="new-service-price" name="newServicePrice" type="number" placeholder="500" value={cfg.newServicePrice} onChange={e => setCfg(c => ({ ...c, newServicePrice: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="new-service-duration">Duration (min)</Label>
              <InputField id="new-service-duration" name="newServiceDuration" type="number" placeholder="30" value={cfg.newServiceDuration} onChange={e => setCfg(c => ({ ...c, newServiceDuration: e.target.value }))} />
            </div>
          </div>
          <PrimaryBtn onClick={addService} className="w-full mt-1 !p-[11px]">
            <Plus size={15} /> Add to Catalog
          </PrimaryBtn>
        </div>
      </Card>
    </div>
  );
}
