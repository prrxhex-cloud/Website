import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Key, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function KeyBankTab() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'license_keys'), orderBy('created_date', 'desc'), limit(100));
      const snap = await getDocs(q);
      setKeys(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const rawKeys = (form.key || '').split('\n').map(k => k.trim()).filter(Boolean);
    if (rawKeys.length === 0) return;
    const keysToAdd = rawKeys.slice(0, 50);
    if (rawKeys.length > 50) toast.warning(`Only first 50 keys added (you entered ${rawKeys.length}).`);
    setSaving(true);
    try {
      const batch = writeBatch(db);
      keysToAdd.forEach(k => {
        const newId = crypto.randomUUID();
        const docRef = doc(db, 'license_keys', newId);
        batch.set(docRef, {
          key: k,
          product_type: form.product_type,
          duration: form.duration,
          status: 'available',
          notes: '',
          created_date: new Date().toISOString()
        });
      });
      await batch.commit();
      toast.success(`${keysToAdd.length} key${keysToAdd.length > 1 ? 's' : ''} added to bank`);
      setForm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save keys');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteDoc(doc(db, 'license_keys', id));
      setKeys(prev => prev.filter(k => k.id !== id));
      toast.success('Key removed');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete key');
    }
  };

  const STATUS_COLOR = { available: '#00ff64', used: '#ffaa00', expired: '#ff4444' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-primary tracking-wider">LICENSE KEY BANK ({keys.filter(k => k.status === 'available').length} available)</p>
        <button onClick={() => setForm({ key: '', product_type: 'external', duration: '30_days', status: 'available', notes: '' })}
          className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
          <Plus className="w-3.5 h-3.5" /> Add Keys
        </button>
      </div>

      {/* Stock level summary */}
      {!loading && keys.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['external', 'internal', 'both'].flatMap(pt =>
            ['1_day', '7_days', '30_days', 'lifetime'].map(dur => {
              const count = keys.filter(k => k.status === 'available' && k.product_type === pt && k.duration === dur).length;
              if (count === 0) return null;
              const low = count <= 10;
              return (
                <div key={`${pt}_${dur}`} className="rounded-lg p-2 text-center"
                  style={{ background: low ? 'rgba(255,170,0,0.08)' : 'rgba(0,15,35,0.6)', border: `1px solid ${low ? 'rgba(255,170,0,0.3)' : 'rgba(0,212,255,0.1)'}` }}>
                  <p className="font-inter text-xs text-muted-foreground capitalize">{pt} · {dur.replace('_', ' ')}</p>
                  <p className="font-orbitron font-bold text-sm" style={{ color: low ? '#ffaa00' : '#00d4ff' }}>{count}</p>
                  {low && <p className="font-inter" style={{ color: '#ffaa00', fontSize: '9px' }}>⚠️ LOW</p>}
                </div>
              );
            })
          )}
        </div>
      )}

      {form && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,8,28,0.9)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <p className="font-orbitron text-xs text-primary tracking-wider">NEW LICENSE KEY</p>
          <textarea value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} placeholder="License Keys * — paste one key per line (max 50)"
            className="w-full px-3 py-2 rounded-lg font-orbitron text-sm text-foreground placeholder-muted-foreground outline-none resize-none h-24"
            style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
          <p className="font-inter text-xs text-muted-foreground">{(form.key || '').split('\n').filter(l => l.trim()).length} key(s) detected</p>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.product_type} onChange={e => setForm(p => ({ ...p, product_type: e.target.value }))}
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }}>
              <option value="external">External</option>
              <option value="internal">Internal</option>
              <option value="both">Both</option>
            </select>
            <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }}>
              <option value="1_day">1 Day</option>
              <option value="7_days">7 Days</option>
              <option value="30_days">30 Days</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={save} disabled={saving || !(form.key || '').trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
              {saving ? <><div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Saving...</> : <><Check className="w-3.5 h-3.5" /> Add</>}
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {keys.map(k => (
            <div key={k.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${STATUS_COLOR[k.status]}15` }}>
              <Key className="w-4 h-4 flex-shrink-0" style={{ color: STATUS_COLOR[k.status] }} />
              <p className="font-orbitron text-xs flex-1 truncate" style={{ color: STATUS_COLOR[k.status] }}>{k.key}</p>
              <span className="font-inter text-xs text-muted-foreground capitalize">{k.product_type} · {k.duration?.replace('_', ' ')}</span>
              <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${STATUS_COLOR[k.status]}10`, color: STATUS_COLOR[k.status], border: `1px solid ${STATUS_COLOR[k.status]}30` }}>{k.status}</span>
              {k.status === 'available' && (
                <button onClick={() => remove(k.id)} className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {keys.length === 0 && <p className="text-center font-inter text-xs text-muted-foreground py-6">No keys in bank yet.</p>}
        </div>
      )}
    </div>
  );
}
