import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'announcements'), orderBy('created_date', 'desc'), limit(50));
      const snap = await getDocs(q);
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteAnnouncement = async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success('Announcement deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
        <p className="font-orbitron text-xs text-primary tracking-wider">ANNOUNCEMENTS ({announcements.length})</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'rgba(0,212,255,0.06)' }}>
          {announcements.map(a => (
            <div key={a.id} className="flex items-start gap-3 px-4 py-3 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>{a.type}</span>
                  {a.pinned && <span className="font-inter text-xs text-yellow-400">📌 Pinned</span>}
                  <p className="font-inter text-xs text-muted-foreground">
                    {a.created_date ? new Date(a.created_date).toLocaleDateString() : 'Unknown Date'}
                  </p>
                </div>
                <p className="font-inter text-sm font-semibold text-foreground">{a.title}</p>
                <p className="font-inter text-xs text-muted-foreground mt-0.5 truncate">{a.content}</p>
              </div>
              <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all text-red-400 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {announcements.length === 0 && <div className="p-8 text-center font-inter text-xs text-muted-foreground">No announcements yet</div>}
        </div>
      )}
    </div>
  );
}
