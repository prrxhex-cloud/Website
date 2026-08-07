import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Plus, Edit2, Trash2, Megaphone, Newspaper, Zap, AlertTriangle, Pin, X, Loader2 } from 'lucide-react';

const TYPE_CONFIG = {
  announcement: { label: 'Announcement', color: '#00d4ff', icon: Megaphone },
  news: { label: 'News', color: '#00ff88', icon: Newspaper },
  update: { label: 'Update', color: '#a855f7', icon: Zap },
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
      className="rounded-2xl p-5 relative group"
      style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${cfg.color}20` }}
    >
      {item.pinned && (
        <div className="absolute top-3 right-3">
          <Pin className="w-3.5 h-3.5" style={{ color: cfg.color, opacity: 0.6 }} />
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-inter text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
              {cfg.label}
            </span>
            <span className="font-inter text-xs text-muted-foreground">
              {new Date(item.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h3 className="font-orbitron font-bold text-sm text-foreground mb-1">{item.title}</h3>
          <p className="font-inter text-sm text-muted-foreground leading-relaxed">{item.content}</p>
          {item.author_name && (
            <p className="font-inter text-xs text-muted-foreground mt-2 opacity-60">— {item.author_name}</p>
          )}
        </div>
      </div>
      {isAdmin && (
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'rgba(2,8,20,0.98)', border: '1px solid rgba(0,212,255,0.2)' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
          <h2 className="font-orbitron font-bold text-sm text-primary">{item ? 'Edit' : 'New'} Announcement</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Type</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setForm(f => ({ ...f, type: key }))}
                  className="px-3 py-1.5 rounded-lg font-inter text-xs font-semibold transition-all"
                  style={{ background: form.type === key ? `${cfg.color}20` : 'rgba(255,255,255,0.03)', border: `1px solid ${form.type === key ? cfg.color + '50' : 'rgba(255,255,255,0.08)'}`, color: form.type === key ? cfg.color : '#888' }}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl font-inter text-sm text-foreground outline-none transition-all"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
              placeholder="Announcement title..." />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Content</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4}
              className="w-full px-4 py-2.5 rounded-xl font-inter text-sm text-foreground outline-none transition-all resize-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
              placeholder="Write your message..." />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} className="accent-primary" />
              <span className="font-inter text-xs text-muted-foreground">Pin this announcement</span>
            </label>
          </div>
          <button onClick={handleSave} disabled={loading}
            className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,150,255,0.1))', border: '1px solid rgba(0,212,255,0.5)', color: '#00d4ff' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Saving...' : item ? 'Save Changes' : 'Post Announcement'}
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
    <section id="announcements" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal variant="fadeUp" className="flex items-center justify-between mb-10">
          <div>
            <p className="font-inter text-xs text-primary tracking-widest uppercase mb-2">Latest</p>
            <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-foreground tracking-wide">
              News & <span style={{ color: '#00d4ff' }}>Announcements</span>
            </h2>
          </div>
          {isAdmin && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setEditTarget(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-orbitron font-bold text-xs tracking-wider"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
              <Plus className="w-4 h-4" /> Post
            </motion.button>
          )}
        </ScrollReveal>

        {items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-inter text-sm">No announcements yet.</div>
        ) : (
          <div className="space-y-4">
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