import React from 'react';
import { MessageCircle, Phone, ExternalLink } from 'lucide-react';

export default function ResellerSupport({ account }) {
  return (
    <div className="rounded-2xl p-6 space-y-6" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <p className="font-orbitron text-xs text-primary tracking-wider">SUPPORT CHANNELS</p>

      <div className="space-y-4">
        <a href="https://discord.com/users/prrx2021" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-2xl group transition-all"
          style={{ background: 'rgba(88,101,242,0.08)', border: '1px solid rgba(88,101,242,0.2)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(88,101,242,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(88,101,242,0.2)'}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.3)' }}>
            <MessageCircle className="w-5 h-5" style={{ color: '#5865f2' }} />
          </div>
          <div className="flex-1">
            <p className="font-orbitron font-bold text-xs" style={{ color: '#5865f2' }}>DISCORD</p>
            <p className="font-inter text-sm mt-0.5" style={{ color: 'rgba(180,200,230,0.9)' }}>sayuru2011</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </a>

        <a href="https://wa.me/94761386077" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-2xl group transition-all"
          style={{ background: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.2)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(37,211,102,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(37,211,102,0.2)'}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)' }}>
            <Phone className="w-5 h-5" style={{ color: '#25d366' }} />
          </div>
          <div className="flex-1">
            <p className="font-orbitron font-bold text-xs" style={{ color: '#25d366' }}>WHATSAPP</p>
            <p className="font-inter text-sm mt-0.5" style={{ color: 'rgba(180,200,230,0.9)' }}>+94 761 386 077</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </a>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.15)' }}>
        <p className="font-inter text-xs text-yellow-400 font-semibold mb-1">⚠️ Support Hours</p>
        <p className="font-inter text-xs text-muted-foreground">Admin typically responds within 1–6 hours. For urgent issues, use WhatsApp.</p>
      </div>
    </div>
  );
}