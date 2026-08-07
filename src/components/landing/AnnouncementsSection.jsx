import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Plus, Edit2, Trash2, Megaphone, Newspaper, Zap, AlertTriangle, Pin } from 'lucide-react';

const TYPE_CONFIG = {
  announcement: { label: 'Announcement', color: '#06b6d4', icon: Megaphone },
  news: { label: 'News', color: '#10b981', icon: Newspaper },
  update: { label: 'Update', color: '#8b5cf6', icon: Zap },
  warning: { label: 'Warning', color: '#f97316', icon: AlertTriangle },
};

function AnnouncementCard({ item, isAdmin, onEdit, onDelete }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.announcement;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="clean-card p-6 bg-white border border-slate-200 relative group"
    >
      {item.pinned && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          <Pin className="w-3.5 h-3.5" /> PINNED
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 border border-slate-200" style={{ color: cfg.color }}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-inter text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
              {cfg.label}
            </span>
            <span className="font-inter text-xs text-slate-400 font-medium">
              {new Date(item.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h3 className="font-outfit font-extrabold text-xl text-slate-900 mb-2">{item.title}</h3>
          <p className="font-inter text-sm text-slate-600 leading-relaxed">{item.content}</p>
          {item.author_name && (
            <p className="font-inter text-xs text-[#06b6d4] font-bold mt-3 uppercase tracking-wider">— {item.author_name}</p>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="flex gap-2 pt-4 border-t border-slate-100 mt-4 justify-end">
          <button onClick={() => onEdit(item)} className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
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

  return (
    <section id="announcements" className="py-16 px-4 bg-slate-50 border-b border-slate-200">
      <div className="max-w-[1240px] mx-auto">
        <ScrollReveal variant="fadeUp" className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-10 gap-6">
          <div className="text-center sm:text-left space-y-2">
            <div className="sub-heading">LATEST NEWS</div>
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              News & <span className="text-gradient">Updates</span>
            </h2>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditTarget(null); setShowModal(true); }}
              className="btn-primary-cyan btn-glow px-5 py-2.5 font-inter font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" /> Post New Update
            </button>
          )}
        </ScrollReveal>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <Newspaper className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="font-outfit text-slate-600 font-bold text-base">No announcements posted yet.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {items.map(item => (
              <AnnouncementCard key={item.id} item={item} isAdmin={isAdmin}
                onEdit={(i) => { setEditTarget(i); setShowModal(true); }}
                onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}