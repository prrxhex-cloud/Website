import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { RefreshCw, Plus, Trash2, Globe, Cpu } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'online',      label: '● ONLINE',      color: '#22c55e' },
  { value: 'offline',     label: '● OFFLINE',      color: '#ef4444' },
  { value: 'maintaining', label: '● MAINTAINING', color: '#eab308' },
];

export default function StatusTab() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'online', category: 'panel', uptime_elapsed: '', sort_order: 0 });

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ServiceStatus.list('sort_order', 50);
    setServices(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id, field, value) => {
    await base44.entities.ServiceStatus.update(id, { [field]: value });
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await base44.entities.ServiceStatus.create(form);
    toast.success('Service added');
    setForm({ name: '', description: '', status: 'online', category: 'panel', uptime_elapsed: '', sort_order: 0 });
    setAdding(false);
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.ServiceStatus.delete(id);
    toast.success('Service removed');
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const renderCard = (s) => (
    <motion.div key={s.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 space-y-3"
      style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {s.category === 'website' ? <Globe className="w-4 h-4 text-cyan-400" /> : <Cpu className="w-4 h-4 text-purple-400" />}
          <input value={s.name} onChange={e => update(s.id, 'name', e.target.value)}
            className="font-orbitron font-bold text-xs bg-transparent text-foreground outline-none flex-1" />
        </div>
        <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:bg-red-500/10 p-1 rounded transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <input value={s.description || ''} onChange={e => update(s.id, 'description', e.target.value)}
        placeholder="Description"
        className="w-full font-inter text-xs bg-transparent text-muted-foreground outline-none border-b border-white/5 pb-1" />

      <input value={s.uptime_elapsed || ''} onChange={e => update(s.id, 'uptime_elapsed', e.target.value)}
        placeholder="Uptime elapsed e.g. 14d 2h"
        className="w-full font-inter text-xs bg-transparent text-muted-foreground outline-none border-b border-white/5 pb-1" />

      <div className="flex items-center gap-1.5">
        {STATUS_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => update(s.id, 'status', opt.value)}
            className="font-orbitron text-xs px-2 py-1 rounded-md transition-all"
            style={{
              background: s.status === opt.value ? `${opt.color}18` : 'transparent',
              border: `1px solid ${s.status === opt.value ? opt.color + '50' : 'rgba(255,255,255,0.06)'}`,
              color: s.status === opt.value ? opt.color : 'rgba(180,200,220,0.4)',
            }}>
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        {['website', 'panel'].map(cat => (
          <button key={cat} onClick={() => update(s.id, 'category', cat)}
            className="font-inter text-xs px-2 py-0.5 rounded capitalize transition-all"
            style={{
              background: s.category === cat ? 'rgba(0,212,255,0.12)' : 'transparent',
              border: `1px solid ${s.category === cat ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
              color: s.category === cat ? '#00d4ff' : 'rgba(180,200,220,0.4)',
            }}>
            {cat}
          </button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-primary tracking-wider">SERVICE STATUS ({services.length})</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setAdding(!adding)} className="flex items-center gap-1 font-orbitron text-xs px-2.5 py-1 rounded-lg transition-all"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {adding && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAdd} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,15,35,0.9)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Service name" required
              className="px-3 py-2 rounded-lg font-inter text-sm bg-transparent text-foreground outline-none" style={{ border: '1px solid rgba(0,212,255,0.15)' }} />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 rounded-lg font-inter text-sm bg-[#0f2338] text-foreground outline-none" style={{ border: '1px solid rgba(0,212,255,0.15)' }}>
              <option value="panel">Panel</option>
              <option value="website">Website</option>
            </select>
          </div>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
            className="w-full px-3 py-2 rounded-lg font-inter text-sm bg-transparent text-foreground outline-none" style={{ border: '1px solid rgba(0,212,255,0.15)' }} />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.uptime_elapsed} onChange={e => setForm({ ...form, uptime_elapsed: e.target.value })} placeholder="e.g. 14d 2h"
              className="px-3 py-2 rounded-lg font-inter text-sm bg-transparent text-foreground outline-none" style={{ border: '1px solid rgba(0,212,255,0.15)' }} />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="px-3 py-2 rounded-lg font-inter text-sm bg-[#0f2338] text-foreground outline-none" style={{ border: '1px solid rgba(0,212,255,0.15)' }}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full py-2 rounded-lg font-orbitron font-bold text-xs tracking-widest"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #0070aa)', color: '#020810' }}>
            CREATE SERVICE
          </button>
        </motion.form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {services.filter(s => s.category === 'website').length > 0 && (
            <div>
              <p className="font-orbitron text-xs text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> WEBSITE STATUS
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.filter(s => s.category === 'website').map(renderCard)}
              </div>
            </div>
          )}
          {services.filter(s => s.category === 'panel').length > 0 && (
            <div>
              <p className="font-orbitron text-xs text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> PANEL STATUS
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.filter(s => s.category === 'panel').map(renderCard)}
              </div>
            </div>
          )}
          {services.length === 0 && (
            <p className="text-center font-inter text-xs text-muted-foreground py-10">No services yet. Add one above.</p>
          )}
        </div>
      )}
    </div>
  );
}