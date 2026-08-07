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
    <div className="rounded-[32px] overflow-hidden h-full liquid-glass border border-white/10 relative flex flex-col"
      style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

      <div className="px-6 py-5 border-b flex items-center justify-between relative z-10" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center relative group"
            style={{ background: 'rgba(170,68,255,0.1)', border: '1px solid rgba(170,68,255,0.3)' }}>
            <div className="absolute inset-0 rounded-xl bg-[#aa44ff] blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <Megaphone className="w-5 h-5 text-[#aa44ff] relative z-10" />
          </div>
          <h2 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase">ANNOUNCEMENTS</h2>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:rotate-180 duration-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center font-inter text-sm text-gray-500">No announcements yet</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {announcements.map(a => {
              const color = TYPE_COLOR[a.type] || '#00d4ff';
              return (
                <div key={a.id} className="px-6 py-5 hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {a.pinned && <Pin className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
                    <span className="font-orbitron text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}40`, boxShadow: `0 0 10px ${color}20` }}>{a.type}</span>
                    <p className="font-inter text-xs text-gray-500 ml-auto tracking-wider">{new Date(a.created_date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-inter text-base font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">{a.title}</p>
                  <p className="font-inter text-sm text-gray-400 line-clamp-3 leading-relaxed">{a.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}