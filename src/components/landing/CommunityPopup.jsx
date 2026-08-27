import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Users, Zap } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const DEFAULT_WHATSAPP = 'https://chat.whatsapp.com/CsElU5rhsXVDMjjuFHFvgI';
const DEFAULT_DISCORD = 'https://discord.gg/EuwhvXXfJC';

export default function CommunityPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('prrx_community_dismissed') === 'true');
  const [links, setLinks] = useState({ whatsapp_url: DEFAULT_WHATSAPP, discord_url: DEFAULT_DISCORD, popup_enabled: true });

  useEffect(() => {
    getDocs(collection(db, 'community_links')).then(snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data?.length > 0) setLinks(data[0]);
    }).catch(() => {});

    if (dismissed) return;
    const timer = setTimeout(() => setShow(true), 3500);
    return () => clearTimeout(timer);
  }, [dismissed]);

  const close = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('prrx_community_dismissed', 'true');
  };

  if (!show || !links.popup_enabled) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-xs w-[calc(100vw-2rem)] sm:w-auto">
      <div className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(2,10,28,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,212,255,0.25)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 0 24px rgba(0,212,255,0.1)',
          animation: 'slideUp 0.4s ease-out',
        }}>
        <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3"
          style={{ background: 'linear-gradient(90deg, rgba(0,212,255,0.12), rgba(170,68,255,0.12))', borderBottom: '1px solid rgba(0,212,255,0.15)' }}>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="font-orbitron font-bold text-xs tracking-wider text-primary">JOIN THE COMMUNITY</span>
          </div>
          <button onClick={close} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-2.5">
          <p className="font-inter text-xs text-muted-foreground mb-3">Get instant updates, support, and exclusive offers!</p>

          {/* WhatsApp */}
          <a href={links.whatsapp_url} target="_blank" rel="noopener noreferrer" onClick={close}
            className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.35)' }}>
              <MessageCircle className="w-4.5 h-4.5" style={{ color: '#25d366' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-orbitron font-bold text-xs text-foreground">WhatsApp Group</p>
              <p className="font-inter text-xs text-muted-foreground">Join the official group</p>
            </div>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#25d366', boxShadow: '0 0 6px #25d366' }} />
          </a>

          {/* Discord */}
          <a href={links.discord_url} target="_blank" rel="noopener noreferrer" onClick={close}
            className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.3)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.35)' }}>
              <Users className="w-4.5 h-4.5" style={{ color: '#5865f2' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-orbitron font-bold text-xs text-foreground">Discord Server</p>
              <p className="font-inter text-xs text-muted-foreground">Join the official server</p>
            </div>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#5865f2', boxShadow: '0 0 6px #5865f2' }} />
          </a>
        </div>
      </div>
    </div>
  );
}