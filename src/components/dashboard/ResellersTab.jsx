import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash2, Check, X, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ResellersTab() {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('created_date', 'desc'), limit(50));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'reseller');
      setResellers(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load resellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (form.id) {
        await updateDoc(doc(db, 'users', form.id), {
          username: form.username,
          password: form.password, // Security issue to store plain password, but matching original UI
          display_name: form.display_name,
          email: form.email,
          notes: form.notes || ''
        });
        toast.success('Reseller updated');
      } else {
        const newId = crypto.randomUUID();
        await setDoc(doc(db, 'users', newId), {
          username: form.username,
          password: form.password,
          display_name: form.display_name,
          email: form.email,
          status: form.status || 'active',
          role: 'reseller',
          notes: form.notes || '',
          created_date: new Date().toISOString()
        });
        toast.success('Reseller added');
      }
      setForm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save reseller');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (r) => {
    const newStatus = r.status === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'users', r.id), { status: newStatus });
      toast.success(`Reseller ${newStatus}`);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
    }
  };

  const remove = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      setResellers(prev => prev.filter(r => r.id !== id));
      toast.success('Reseller removed');
    } catch (e) {
      console.error(e);
      toast.error('Failed to remove reseller');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-primary tracking-wider">RESELLER ACCOUNTS ({resellers.length})</p>
        <button onClick={() => setForm({ username: '', password: '', display_name: '', email: '', status: 'active', notes: '' })}
          className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
          <Plus className="w-3.5 h-3.5" /> Add Reseller
        </button>
      </div>

      {form && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,8,28,0.9)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <p className="font-orbitron text-xs text-primary tracking-wider">{form.id ? 'EDIT' : 'NEW'} RESELLER</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'username', placeholder: 'Username *' },
              { key: 'password', placeholder: 'Password *' },
              { key: 'display_name', placeholder: 'Display Name' },
              { key: 'email', placeholder: 'Email' },
            ].map(f => (
              <input key={f.key} value={form[f.key] || ''} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            ))}
          </div>
          <input value={form.notes || ''} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes (optional)"
            className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
            style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={save} disabled={saving || !form.username || !form.password}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
        <div className="space-y-2">
          {resellers.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.08)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron font-black text-sm"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
                {(r.display_name || r.username)[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm font-semibold text-foreground">{r.display_name || r.username}</p>
                <p className="font-inter text-xs text-muted-foreground">@{r.username} · {r.email || 'no email'}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{ background: r.status === 'active' ? 'rgba(0,255,100,0.1)' : 'rgba(255,80,80,0.1)', color: r.status === 'active' ? '#00ff64' : '#ff4444', border: `1px solid ${r.status === 'active' ? 'rgba(0,255,100,0.25)' : 'rgba(255,80,80,0.25)'}` }}>
                  {r.status}
                </span>
                <button onClick={() => setForm({ ...r })} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
                  <User className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => toggleStatus(r)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors">
                  {r.status === 'active' ? <X className="w-3.5 h-3.5 text-yellow-400" /> : <Check className="w-3.5 h-3.5 text-green-400" />}
                </button>
                <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {resellers.length === 0 && <p className="text-center font-inter text-xs text-muted-foreground py-6">No resellers added yet.</p>}
        </div>
      )}
    </div>
  );
}
