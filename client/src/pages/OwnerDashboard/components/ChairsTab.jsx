import React from 'react';
import { Users, Trash2, Plus } from 'lucide-react';
import { Card, SectionTitle, IconBtn, InputField, PrimaryBtn } from './Shared';

export default function ChairsTab({ salon, cfg, setCfg, addChair, delChair }) {
  return (
    <div className="max-w-[560px]">
      <Card>
        <SectionTitle icon={Users} badge={`${salon?.chairs?.length || 0} total`}>Barbers & Chairs</SectionTitle>
        <div className="flex flex-col gap-2 mb-[18px]">
          {salon?.chairs?.map((chair, i) => (
            <div key={chair._id} className="flex items-center gap-[14px] p-[12px_16px] bg-white/5 border border-white/10 rounded-[11px]">
              <div
                className="w-[34px] h-[34px] shrink-0 rounded-lg flex items-center justify-center text-[13px] font-bold text-violet-300"
                style={{ background: `hsl(${260 + i * 22}, 55%, 22%)` }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white/85 overflow-hidden text-ellipsis whitespace-nowrap">{chair.name}</div>
                <div className="text-[11px] text-white/25 mt-0.5">Chair #{i + 1}</div>
              </div>
              <IconBtn danger onClick={() => delChair(chair._id)}>
                <Trash2 size={15} />
              </IconBtn>
            </div>
          ))}
        </div>
        {/* add row */}
        <div className="flex gap-2.5 p-3.5 bg-white/[0.02] border border-white/5 rounded-[11px]">
          <label htmlFor="new-barber-name-input" className="sr-only">New barber name</label>
          <InputField
            id="new-barber-name-input"
            name="newChairName"
            placeholder="New barber name…"
            value={cfg.newChairName}
            onChange={e => setCfg(c => ({ ...c, newChairName: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addChair()}
            className="flex-1"
          />
          <PrimaryBtn onClick={addChair} className="!px-[18px] !py-[10px] shrink-0">
            <Plus size={15} /> Add
          </PrimaryBtn>
        </div>
      </Card>
    </div>
  );
}
