import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Key, Plus, Trash2, Check, Shield } from 'lucide-react';
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
      toast.success(`${keysToAdd.length} key${keysToAdd.length > 1 ? 's' : ''} securely added to vault`);
      setForm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to encrypt and save keys');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteDoc(doc(db, 'license_keys', id));
      setKeys(prev => prev.filter(k => k.id !== id));
      toast.success('Key permanently destroyed');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete key');
    }
  };

  const STATUS_COLOR = { available: '#00ff64', used: '#ffaa00', expired: '#ff4444' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-orbitron font-black text-xl text-white tracking-widest flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#00d4ff] animate-pulse" />
            LICENSE KEY VAULT
          </h2>
          <p className="font-inter text-sm text-[#00d4ff] mt-1 tracking-wider uppercase">
            {keys.filter(k => k.status === 'available').length} secure keys available
          </p>
        </div>
        <button onClick={() => setForm({ key: '', product_type: 'external', duration: '30_days', status: 'available', notes: '' })}
          className="flex items-center gap-2 font-orbitron font-bold text-xs px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] group relative overflow-hidden"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/0 via-[#00d4ff]/20 to-[#00d4ff]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> GENERATE NEW KEYS
        </button>
      </div>

      {/* Stock level summary */}
      {!loading && keys.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['external', 'internal', 'both'].flatMap(pt =>
            ['1_day', '7_days', '30_days', 'lifetime'].map(dur => {
              const count = keys.filter(k => k.status === 'available' && k.product_type === pt && k.duration === dur).length;
              if (count === 0) return null;
              const low = count <= 10;
              return (
                <div key={`${pt}_${dur}`} className="rounded-[20px] p-4 text-center liquid-glass relative overflow-hidden group hover:scale-[1.02] transition-transform"
                  style={{ border: `1px solid ${low ? 'rgba(255,170,0,0.4)' : 'rgba(0,212,255,0.2)'}` }}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${low ? 'from-[#ffaa00]/10 to-transparent' : 'from-white/5 to-transparent'}`}></div>
                  <p className="font-inter text-[10px] text-gray-400 font-bold uppercase tracking-widest relative z-10">{pt} <span className="opacity-50">/</span> {dur.replace('_', ' ')}</p>
                  <p className="font-orbitron font-black text-2xl mt-1 relative z-10" style={{ color: low ? '#ffaa00' : '#00d4ff', textShadow: `0 0 10px ${low ? '#ffaa00' : '#00d4ff'}50` }}>{count}</p>
                  {low && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ffaa00] shadow-[0_0_10px_#ffaa00] animate-pulse"></div>}
                </div>
              );
            })
          )}
        </div>
      )}

      {form && (
        <div className="rounded-[32px] p-6 space-y-4 liquid-glass animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden" 
          style={{ border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,212,255,0.05)' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00d4ff]/0 via-[#00d4ff] to-[#00d4ff]/0"></div>
          
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Key className="w-5 h-5 text-[#00d4ff]" />
            <p className="font-orbitron font-bold text-sm text-white tracking-widest uppercase">INITIALIZE NEW KEYS</p>
          </div>
          
          <div className="space-y-4 pt-2">
            <div>
              <p className="font-inter text-xs text-gray-400 mb-2 uppercase tracking-wider">SECURE KEY INPUT (MAX 50)</p>
              <textarea value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} placeholder="Paste one key per line..."
                className="w-full px-4 py-3 rounded-2xl font-orbitron text-sm text-white placeholder-gray-600 outline-none resize-none h-32 focus:border-[#00d4ff] focus:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all bg-black/50 border border-white/10" />
              <p className="font-inter text-[10px] text-[#00d4ff] mt-2 font-bold tracking-wider">SYSTEM DETECTED: {(form.key || '').split('\n').filter(l => l.trim()).length} KEYS</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-inter text-xs text-gray-400 mb-2 uppercase tracking-wider">PRODUCT DESIGNATION</p>
                <select value={form.product_type} onChange={e => setForm(p => ({ ...p, product_type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl font-inter text-sm text-white outline-none focus:border-[#00d4ff] transition-all bg-black/50 border border-white/10 appearance-none">
                  <option value="external">EXTERNAL SUITE</option>
                  <option value="internal">INTERNAL SUITE</option>
                  <option value="both">UNRESTRICTED (BOTH)</option>
                </select>
              </div>
              <div>
                <p className="font-inter text-xs text-gray-400 mb-2 uppercase tracking-wider">LICENSE DURATION</p>
                <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl font-inter text-sm text-white outline-none focus:border-[#00d4ff] transition-all bg-black/50 border border-white/10 appearance-none">
                  <option value="1_day">1 DAY ACCESS</option>
                  <option value="7_days">7 DAY ACCESS</option>
                  <option value="30_days">30 DAY ACCESS</option>
                  <option value="lifetime">LIFETIME ACCESS</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
            <button onClick={() => setForm(null)} className="px-6 py-2.5 rounded-full font-orbitron font-bold text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all tracking-wider">CANCEL</button>
            <button onClick={save} disabled={saving || !(form.key || '').trim()}
              className="flex items-center gap-2 px-8 py-2.5 rounded-full font-orbitron text-xs font-black tracking-widest disabled:opacity-50 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] relative overflow-hidden group"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.5)', color: '#00d4ff' }}>
              <div className="absolute inset-0 bg-[#00d4ff]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {saving ? <><div className="w-4 h-4 border-2 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin relative z-10" /> <span className="relative z-10">ENCRYPTING...</span></> : <><Check className="w-4 h-4 relative z-10" /> <span className="relative z-10">COMMIT TO VAULT</span></>}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin glow-cyan" />
        </div>
      ) : (
        <div className="rounded-[32px] overflow-hidden bg-black/40 border border-white/10">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 bg-white/5">
            <Key className="w-5 h-5 text-white/50" />
            <p className="font-orbitron font-bold text-sm tracking-widest text-white/70">VAULT LEDGER</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
            {keys.map(k => (
              <div key={k.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${STATUS_COLOR[k.status]}15`, border: `1px solid ${STATUS_COLOR[k.status]}30` }}>
                  <Key className="w-5 h-5" style={{ color: STATUS_COLOR[k.status] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-orbitron font-bold text-sm truncate" style={{ color: STATUS_COLOR[k.status], textShadow: `0 0 10px ${STATUS_COLOR[k.status]}50` }}>{k.key}</p>
                  <p className="font-inter text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    {k.product_type} <span className="mx-1 text-gray-700">|</span> {k.duration?.replace('_', ' ')}
                  </p>
                </div>
                <span className="font-orbitron font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest flex-shrink-0" 
                  style={{ background: `${STATUS_COLOR[k.status]}10`, color: STATUS_COLOR[k.status], border: `1px solid ${STATUS_COLOR[k.status]}30` }}>
                  {k.status}
                </span>
                {k.status === 'available' && (
                  <button onClick={() => remove(k.id)} 
                    className="p-2.5 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20 opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {keys.length === 0 && <div className="p-12 text-center font-orbitron font-bold text-sm tracking-widest text-gray-600">VAULT IS EMPTY</div>}
          </div>
        </div>
      )}
    </div>
  );
}
