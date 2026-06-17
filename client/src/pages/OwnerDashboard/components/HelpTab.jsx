import React from 'react';
import { Info } from 'lucide-react';
import { Card, SectionTitle } from './Shared';

export default function HelpTab() {
  return (
    <div className="flex flex-col gap-6 max-w-[640px] animate-[fadeUp_0.3s_ease]">
      <div>
        <h1 className="text-[22px] font-bold text-white m-0">Help & Support</h1>
        <p className="text-xs text-white/35 mt-1 m-0">Get support and learn how to manage your salon queue.</p>
      </div>

      <Card className="flex flex-col gap-5">
        <SectionTitle icon={Info}>FAQ & Support Center</SectionTitle>
        
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1.5">How do clients book appointments?</h3>
            <p className="text-xs text-white/40 leading-[1.5] m-0">
              Clients visit the main marketplace homepage, select your salon, choose their requested services and date/time, and book. The slot immediately appears in your live queue dashboard.
            </p>
          </div>
          <div className="h-[1px] bg-white/[0.06]" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1.5">What is the "Live Queue" feature?</h3>
            <p className="text-xs text-white/40 leading-[1.5] m-0">
              The live queue shows active scheduled clients for the day. You can click "Complete Early" if a service finishes ahead of schedule, which automatically shifts subsequent clients forward to eliminate gaps.
            </p>
          </div>
          <div className="h-[1px] bg-white/[0.06]" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Need further assistance?</h3>
            <p className="text-xs text-white/40 leading-[1.5] m-0 mb-2.5">
              Contact our global TrimSync support team at:
            </p>
            <div className="flex items-center gap-2 text-xs text-violet-300 font-semibold font-mono">
              support@trimsync.com | +1 (555) 123-4567
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
