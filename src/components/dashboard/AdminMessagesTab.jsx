import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'world_messages'), orderBy('created_date', 'desc'), limit(50));
      const snap = await getDocs(q);
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteMessage = async (id) => {
    try {
      await deleteDoc(doc(db, 'world_messages', id));
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Message deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete message');
    }
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
        <p className="font-orbitron text-xs text-primary tracking-wider">WORLD CHAT ({messages.length})</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: 'rgba(0,212,255,0.06)' }}>
          {messages.map(m => (
            <div key={m.id} className="flex items-start gap-3 px-4 py-3 group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                {m.sender_avatar ? <img src={m.sender_avatar} className="w-full h-full rounded-full object-cover" alt="" /> : <User className="w-3.5 h-3.5 text-primary opacity-50" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-inter text-xs font-semibold text-primary">{m.sender_name || m.sender_email || 'Unknown User'}</p>
                  <p className="font-inter text-xs text-muted-foreground">
                    {m.created_date ? new Date(m.created_date).toLocaleString() : 'Unknown Time'}
                  </p>
                </div>
                <p className="font-inter text-sm text-foreground/80">{m.content}</p>
              </div>
              <button onClick={() => deleteMessage(m.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all text-red-400 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {messages.length === 0 && <div className="p-8 text-center font-inter text-xs text-muted-foreground">No messages yet</div>}
        </div>
      )}
    </div>
  );
}
