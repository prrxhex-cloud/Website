import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Plus, Trash2, Check, User, Lock, X } from 'lucide-react';
import { toast } from 'sonner';

const HARDCODED_ADMINS = ['admin', 'Sayuru'];

export default function AdminsTab({ adminUser }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AdminAccount.list('-created_date', 50);
      setAdmins(data);
    } catch (e) {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.AdminAccount.create({
        username: form.username.trim(),
        password: form.password,
        display_name: form.display_name || form.username,
        added_by: adminUser,
      });
      toast.success(`Admin "${form.username}" added`);
      setForm(null);
      load();
    } catch (e) {
      toast.error('Failed to add admin');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id, username) => {
    try {
      await base44.entities.AdminAccount.delete(id);
      setAdmins(prev => prev.filter(a => a.id !== id));
      toast.success(`Admin "${username}" removed`);
    } catch (e) {
      toast.error('Failed to remove admin');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-primary tracking-wider">ADMIN ACCOUNTS ({admins.length + HARDCODED_ADMINS.length})</p>
        <button onClick={() => setForm({ username: '', password: '', display_name: '' })}
          className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
          <Plus className="w-3.5 h-3.5" /> Add Admin
        </button>
      </div>

      {form && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,8,28,0.9)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <p className="font-orbitron text-xs text-primary tracking-wider">NEW ADMIN</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="Username *"
                className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Password *"
                className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            </div>
            <input value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))}
              placeholder="Display Name"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={save} disabled={saving || !form.username || !form.password}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
              {saving ? <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />} Add Admin
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
        <div className="space-y-2">
          {HARDCODED_ADMINS.map(username => (
            <div key={username} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(255,170,0,0.15)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron font-black text-sm"
                style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.2)', color: '#ffaa00' }}>
                {username[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm font-semibold text-foreground">{username}</p>
                <p className="font-inter text-xs text-muted-foreground">System Admin</p>
              </div>
              <span className="font-inter text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,170,0,0.1)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.3)' }}>
                BUILT-IN
              </span>
            </div>
          ))}
          {admins.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.08)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron font-black text-sm"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
                {(a.display_name || a.username)[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm font-semibold text-foreground">{a.display_name || a.username}</p>
                <p className="font-inter text-xs text-muted-foreground">@{a.username} · Added by {a.added_by || '—'}</p>
              </div>
              <button onClick={() => remove(a.id, a.username)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {admins.length === 0 && HARDCODED_ADMINS.length === 0 && (
            <p className="text-center font-inter text-xs text-muted-foreground py-6">No admins found.</p>
          )}
        </div>
      )}
    </div>
  );
}