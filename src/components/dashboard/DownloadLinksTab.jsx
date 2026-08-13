import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Link2, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function DownloadLinksTab() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { id?, type, label, url, version }
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'download_links'), orderBy('created_date', 'desc'), limit(20));
      const snap = await getDocs(q);
      setLinks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (link) => setEditing({ ...link });
  const startNew = (type) => setEditing({ type, label: type === 'external' ? '⚡ External Panel' : type === 'internal' ? '🔥 Internal Panel' : '🚀 PRRX Launcher', url: '', version: type === 'launcher' ? 'v1.0.0' : 'V7A BETA', active: true });

  const save = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        await updateDoc(doc(db, 'download_links', editing.id), {
          type: editing.type,
          label: editing.label,
          url: editing.url,
          version: editing.version,
          active: editing.active
        });
        toast.success('Link updated');
      } else {
        const newId = crypto.randomUUID();
        await setDoc(doc(db, 'download_links', newId), {
          type: editing.type,
          label: editing.label,
          url: editing.url,
          version: editing.version,
          active: true,
          created_date: new Date().toISOString()
        });
        toast.success('Link added');
      }
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save link');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteDoc(doc(db, 'download_links', id));
      setLinks(prev => prev.filter(l => l.id !== id));
      toast.success('Link removed');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete link');
    }
  };

  const typeColor = (t) => t === 'external' ? '#00d4ff' : t === 'internal' ? '#aa44ff' : '#f59e0b';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="font-orbitron text-xs text-primary tracking-wider">DOWNLOAD LINKS</p>
        <div className="flex gap-2">
          <button onClick={() => startNew('external')} className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
            <Plus className="w-3.5 h-3.5" /> External
          </button>
          <button onClick={() => startNew('internal')} className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(170,68,255,0.1)', border: '1px solid rgba(170,68,255,0.3)', color: '#aa44ff' }}>
            <Plus className="w-3.5 h-3.5" /> Internal
          </button>
          <button onClick={() => startNew('launcher')} className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
            <Plus className="w-3.5 h-3.5" /> Launcher
          </button>
        </div>
      </div>

      {editing && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,8,28,0.9)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <p className="font-orbitron text-xs tracking-wider" style={{ color: typeColor(editing.type) }}>
            {editing.id ? 'EDIT' : 'NEW'} {editing.type?.toUpperCase()} LINK
          </p>
          {[
            { key: 'label', placeholder: 'Button label' },
            { key: 'url', placeholder: 'Download URL' },
            { key: 'version', placeholder: 'Version (e.g. V7A BETA)' },
          ].map(f => (
            <input key={f.key} value={editing[f.key] || ''} onChange={e => setEditing(prev => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }} />
          ))}
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={save} disabled={saving || !editing.url}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
        <div className="space-y-2">
          {links.map(l => (
            <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${typeColor(l.type)}18` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${typeColor(l.type)}10`, border: `1px solid ${typeColor(l.type)}30` }}>
                <Link2 className="w-3.5 h-3.5" style={{ color: typeColor(l.type) }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-orbitron font-bold text-xs" style={{ color: typeColor(l.type) }}>{l.label || l.type}</p>
                <p className="font-inter text-xs text-muted-foreground truncate">{l.url}</p>
                {l.version && <p className="font-inter text-xs" style={{ color: 'rgba(0,212,255,0.5)' }}>{l.version}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(l)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(l.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {links.length === 0 && <p className="text-center font-inter text-xs text-muted-foreground py-6">No links added yet.</p>}
        </div>
      )}
    </div>
  );
}
