import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Plus, Edit2, Trash2, Megaphone, Newspaper, Zap, AlertTriangle, Pin, X, Loader2 } from 'lucide-react';

const TYPE_CONFIG = {
  announcement: { label: 'Announcement', color: '#00d4ff', icon: Megaphone },
  news: { label: 'News', color: '#00ff88', icon: Newspaper },
  update: { label: 'Update', color: '#ff00ff', icon: Zap },
  warning: { label: 'Warning', color: '#ffaa00', icon: AlertTriangle },
};

function AnnouncementCard({ item, isAdmin, onEdit, onDelete }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.announcement;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-[24px] p-6 relative group liquid-glass border hover:-translate-y-1 hover:bg-white/10 transition-all duration-300"
      style={{ borderColor: `${cfg.color}30`, boxShadow: `0 0 20px ${cfg.color}10` }}
    >
      <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {item.pinned && (
        <div className="absolute top-4 right-4">
          <Pin className="w-4 h-4 animate-pulse" style={{ color: cfg.color, filter: `drop-shadow(0 0 5px ${cfg.color})` }} />
        </div>
      )}
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 bg-white/5 border group-hover:scale-110 transition-transform duration-300"
          style={{ borderColor: `${cfg.color}40`, boxShadow: `0 0 15px ${cfg.color}20 inset` }}>
          <Icon className="w-6 h-6" style={{ color: cfg.color, filter: `drop-shadow(0 0 5px ${cfg.color})` }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-inter text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border"
              style={{ background: `${cfg.color}15`, color: cfg.color, borderColor: `${cfg.color}40`, boxShadow: `0 0 10px ${cfg.color}20` }}>
              {cfg.label}
            </span>
            <span className="font-inter text-xs text-gray-400">
              {new Date(item.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h3 className="font-orbitron font-bold text-lg text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all" style={{ '--tw-gradient-from': cfg.color, '--tw-gradient-to': '#ffffff' }}>{item.title}</h3>
          <p className="font-inter text-sm text-gray-300 leading-relaxed">{item.content}</p>
          {item.author_name && (
            <p className="font-inter text-[11px] text-[#00d4ff] uppercase tracking-wider mt-3 font-bold opacity-80">— {item.author_name}</p>
          )}
        </div>
      </div>
      {isAdmin && (
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button onClick={() => onEdit(item)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/20 transition-all">
            <Edit2 className="w-4 h-4 text-gray-300 hover:text-[#00d4ff]" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/20 transition-all">
            <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-400" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function EditModal({ item, onClose, onSave, authorName }) {
  const [form, setForm] = useState(item || { title: '', content: '', type: 'announcement', pinned: false, author_name: authorName || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setLoading(true);
    try {
      if (item?.id) {
        const { id, ...dataToUpdate } = form;
        await updateDoc(doc(db, 'announcements', item.id), dataToUpdate);
        onSave(form);
      } else {
        const newDoc = await addDoc(collection(db, 'announcements'), { ...form, created_date: Date.now() });
        onSave({ id: newDoc.id, ...form, created_date: Date.now() });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,4,14,0.85)', backdropFilter: 'blur(12px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg rounded-[30px] overflow-hidden liquid-glass border border-white/10 shadow-[0_0_50px_rgba(0,212,255,0.15)] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between relative z-10 bg-black/20">
          <h2 className="font-orbitron font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#ff00ff]">{item ? 'EDIT' : 'NEW'} ANNOUNCEMENT</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
        </div>
        <div className="p-8 space-y-6 relative z-10">
          <div>
            <label className="font-orbitron font-bold text-[10px] tracking-widest text-[#00d4ff] mb-3 block">TYPE</label>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setForm(f => ({ ...f, type: key }))}
                  className="px-4 py-2 rounded-xl font-inter text-xs font-bold tracking-wide transition-all border"
                  style={{ 
                    background: form.type === key ? `${cfg.color}15` : 'rgba(255,255,255,0.03)', 
                    borderColor: form.type === key ? `${cfg.color}50` : 'rgba(255,255,255,0.1)', 
                    color: form.type === key ? cfg.color : '#888',
                    boxShadow: form.type === key ? `0 0 15px ${cfg.color}20` : 'none'
                  }}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-orbitron font-bold text-[10px] tracking-widest text-[#00d4ff] mb-2 block">TITLE</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-5 py-3.5 rounded-[16px] font-inter text-sm text-white outline-none transition-all bg-black/40 border border-white/10 focus:border-[#00d4ff] focus:shadow-[0_0_20px_rgba(0,212,255,0.2)]"
              placeholder="Announcement title..." />
          </div>
          <div>
            <label className="font-orbitron font-bold text-[10px] tracking-widest text-[#00d4ff] mb-2 block">CONTENT</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5}
              className="w-full px-5 py-3.5 rounded-[16px] font-inter text-sm text-white outline-none transition-all bg-black/40 border border-white/10 focus:border-[#00d4ff] focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] resize-none"
              placeholder="Write your message..." />
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-[16px] border border-white/5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} className="w-4 h-4 accent-[#ff00ff] rounded" />
              <span className="font-inter text-sm font-bold text-gray-300">Pin to top</span>
            </label>
          </div>
          <button onClick={handleSave} disabled={loading}
            className="w-full py-4 rounded-[16px] font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-3 disabled:opacity-60 transition-all text-black hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(90deg, #00d4ff, #ff00ff)', boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? 'SAVING...' : item ? 'SAVE CHANGES' : 'POST ANNOUNCEMENT'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AnnouncementsSection({ isAdmin, currentUser }) {
  const [items, setItems] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('created_date', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setEditTarget(null);
  };

  return (
    <section id="announcements" className="py-24 px-4 relative liquid-bg">
      {/* Background Blobs */}
      <div className="absolute top-20 left-10 w-[30vw] h-[30vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <ScrollReveal variant="fadeUp" className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-16 gap-6">
          <div className="text-center sm:text-left">
            <span className="px-4 py-1.5 rounded-full text-[10px] tracking-widest font-bold bg-white/10 border border-white/20 text-white uppercase font-orbitron mb-4 inline-block shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              LATEST
            </span>
            <h2 className="font-orbitron font-black text-4xl sm:text-5xl text-white tracking-wider glow-cyan">
              News & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#ff00ff]">Updates</span>
            </h2>
          </div>
          {isAdmin && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setEditTarget(null); setShowModal(true); }}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl font-orbitron font-bold text-xs tracking-widest text-black shadow-[0_0_20px_rgba(0,212,255,0.4)]"
              style={{ background: 'linear-gradient(90deg, #00d4ff, #ff00ff)' }}>
              <Plus className="w-4 h-4" /> POST NEW
            </motion.button>
          )}
        </ScrollReveal>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[30px] border border-white/10 backdrop-blur-md">
            <Newspaper className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="font-orbitron text-gray-400 tracking-wider">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map(item => (
              <AnnouncementCard key={item.id} item={item} isAdmin={isAdmin}
                onEdit={(i) => { setEditTarget(i); setShowModal(true); }}
                onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <EditModal
            item={editTarget}
            onClose={() => { setShowModal(false); setEditTarget(null); }}
            onSave={handleSave}
            authorName={currentUser?.display_name || currentUser?.full_name || currentUser?.email}
          />
        )}
      </AnimatePresence>
    </section>
  );
}