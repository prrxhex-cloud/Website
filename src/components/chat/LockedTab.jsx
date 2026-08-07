import React from 'react';
import { Lock } from 'lucide-react';

export default function LockedTab({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-10 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
        style={{ background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.2)' }}>
        {icon || <Lock className="w-10 h-10" style={{ color: '#ffaa00' }} />}
      </div>
      <div>
        <p className="font-orbitron font-bold text-base tracking-wide mb-2" style={{ color: '#ffaa00' }}>{title}</p>
        <p className="font-inter text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
    </div>
  );
}