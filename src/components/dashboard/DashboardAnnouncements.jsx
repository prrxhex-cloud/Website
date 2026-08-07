import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, RefreshCw } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

const TYPE_COLOR = {
  news: '#00d4ff',
  announcement: '#aa44ff',
  update: '#00ff88',
  warning: '#ffaa00',
};

export default function DashboardAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'announcements'), orderBy('created_date', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = [...data].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setAnnouncements(sorted);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="rounded-2xl overflow-hidden h-full"
      style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          <h2 className="font-orbitron font-bold text-sm text-primary tracking-wider">ANNOUNCEMENTS</h2>
        </div>
        <button onClick={load} className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-8 text-center font-inter text-xs text-muted-foreground">No announcements yet</div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'rgba(0,212,255,0.06)' }}>
          {announcements.map(a => {
            const color = TYPE_COLOR[a.type] || '#00d4ff';
            return (
              <div key={a.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {a.pinned && <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                  <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>{a.type}</span>
                  <p className="font-inter text-xs text-muted-foreground ml-auto">{new Date(a.created_date).toLocaleDateString()}</p>
                </div>
                <p className="font-inter text-sm font-semibold text-foreground mb-1">{a.title}</p>
                <p className="font-inter text-xs text-muted-foreground line-clamp-2 leading-relaxed">{a.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}