import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { MessageCircle, Users, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunityLinksTab() {
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'community_links'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data?.length > 0) {
        setLink(data[0]);
      } else {
        setLink({ whatsapp_url: 'https://chat.whatsapp.com/CsElU5rhsXVDMjjuFHFvgI', discord_url: 'https://discord.gg/EuwhvXXfJC', popup_enabled: true });
      }
    } catch (e) {
      console.error(e);
      setLink({ whatsapp_url: 'https://chat.whatsapp.com/CsElU5rhsXVDMjjuFHFvgI', discord_url: 'https://discord.gg/EuwhvXXfJC', popup_enabled: true });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        whatsapp_url: link.whatsapp_url,
        discord_url: link.discord_url,
        popup_enabled: link.popup_enabled !== false,
      };
      if (link.id) {
        await updateDoc(doc(db, 'community_links', link.id), payload);
      } else {
        await addDoc(collection(db, 'community_links'), payload);
      }
      toast.success('Community links saved!');
      load();
    } catch {
      toast.error('Failed to save links');
    }
    setSaving(false);
  };

  if (loading || !link) return <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-primary tracking-wider">COMMUNITY LINKS</p>
        <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* WhatsApp */}
      <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)' }}>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" style={{ color: '#25d366' }} />
          <span className="font-orbitron font-bold text-xs" style={{ color: '#25d366' }}>WHATSAPP GROUP</span>
        </div>
        <input value={link.whatsapp_url || ''} onChange={e => setLink(prev => ({ ...prev, whatsapp_url: e.target.value }))}
          placeholder="https://chat.whatsapp.com/..."
          className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
          style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
      </div>

      {/* Discord */}
      <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(88,101,242,0.06)', border: '1px solid rgba(88,101,242,0.2)' }}>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: '#5865f2' }} />
          <span className="font-orbitron font-bold text-xs" style={{ color: '#5865f2' }}>DISCORD SERVER</span>
        </div>
        <input value={link.discord_url || ''} onChange={e => setLink(prev => ({ ...prev, discord_url: e.target.value }))}
          placeholder="https://discord.gg/..."
          className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
          style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
      </div>

      {/* Popup toggle */}
      <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="flex items-center gap-2">
          {link.popup_enabled ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
          <div>
            <p className="font-orbitron font-bold text-xs text-foreground">POPUP VISIBLE</p>
            <p className="font-inter text-xs text-muted-foreground">Show community popup to visitors</p>
          </div>
        </div>
        <button onClick={() => setLink(prev => ({ ...prev, popup_enabled: !prev.popup_enabled }))}
          className="relative w-11 h-6 rounded-full transition-all"
          style={{ background: link.popup_enabled ? 'rgba(0,212,255,0.4)' : 'rgba(100,100,100,0.3)' }}>
          <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
            style={{ left: link.popup_enabled ? '22px' : '2px' }} />
        </button>
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-wider disabled:opacity-50 transition-all"
        style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Links'}
      </button>
    </div>
  );
}