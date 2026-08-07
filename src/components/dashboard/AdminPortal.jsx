import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Eye, EyeOff, Lock, User, LogOut, Users, MessageCircle, Megaphone, Trash2, Crown, RefreshCw, AlertTriangle, CheckCircle, Clock, Activity, Link2, Store, Key, Plus, X, Check, DollarSign, Star, Tag, UserPlus, Ticket, ArrowRight, Gift, Bell, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SessionWatcher from '@/components/security/SessionWatcher';
import { isLocked, getRemainingLockout, recordFailedAttempt, recordSuccess, formatMs } from '@/components/security/SecurityGuard';
import DiscountsTab from '@/components/dashboard/DiscountsTab';
import AccountRequestsTab from '@/components/dashboard/AccountRequestsTab';
import StatusTab from '@/components/dashboard/StatusTab';
import CommunityLinksTab from '@/components/dashboard/CommunityLinksTab';
import FreebiesTab from '@/components/dashboard/FreebiesTab';
import AdminsTab from '@/components/dashboard/AdminsTab';
import DiscordSettingsTab from '@/components/dashboard/DiscordSettingsTab';
import BeneficiaryAccountsTab from '@/components/dashboard/BeneficiaryAccountsTab';
import { checkAndWarnLowStock } from '@/utils/discordNotifier';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Admin credentials
const ADMIN_ACCOUNTS = [
  { username: 'admin', password: '1' },
  { username: 'Sayuru', password: 'Jayani' },
];

const ADMIN_KEY = 'admin';

function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const tick = () => {
      if (isLocked(ADMIN_KEY)) {
        setLocked(true);
        setLockRemaining(getRemainingLockout(ADMIN_KEY));
      } else {
        setLocked(false);
        setLockRemaining(0);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked(ADMIN_KEY)) return;
    setChecking(true);
    setError('');
    try {
      const match = ADMIN_ACCOUNTS.find(a => a.username === username && a.password === password);
      if (match) {
        recordSuccess(ADMIN_KEY, username);
        sessionStorage.setItem('prrx_admin_logged_in', username);
        onSuccess(username);
        return;
      }
      const dbAdmins = await base44.entities.AdminAccount.filter({ username, password });
      if (dbAdmins.length > 0) {
        recordSuccess(ADMIN_KEY, username);
        sessionStorage.setItem('prrx_admin_logged_in', username);
        onSuccess(username);
        return;
      }
      const { attempts, lockedUntil } = recordFailedAttempt(ADMIN_KEY, username);
      if (lockedUntil) {
        setError('Too many failed attempts. Admin portal locked for 15 minutes.');
        setLocked(true);
      } else {
        setError(`Invalid username or password. (${5 - attempts} attempts remaining)`);
      }
    } catch (e) {
      setError('Login error. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: locked ? 'rgba(255,68,68,0.1)' : 'rgba(0,212,255,0.1)', border: `1px solid ${locked ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,255,0.3)'}` }}>
          {locked ? <AlertTriangle className="w-7 h-7 text-red-400" /> : <Shield className="w-7 h-7 text-primary" />}
        </div>
        <p className="font-orbitron font-bold text-sm tracking-wider" style={{ color: locked ? '#ff4444' : '#00d4ff' }}>
          {locked ? 'ACCESS LOCKED' : 'ADMIN ACCESS'}
        </p>
        <p className="font-inter text-xs text-muted-foreground mt-1">
          {locked ? `Try again in ${formatMs(lockRemaining)}` : 'Enter your admin credentials'}
        </p>
      </div>

      {locked && (
        <div className="rounded-xl p-3 flex items-center gap-2"
          style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)' }}>
          <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="font-inter text-xs text-red-400">
            Portal locked for {formatMs(lockRemaining)} due to too many failed attempts.
          </p>
        </div>
      )}

      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required
          disabled={locked}
          className="w-full pl-10 pr-4 py-3 rounded-xl font-inter text-sm text-foreground placeholder-muted-foreground outline-none transition-all disabled:opacity-40"
          style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'} />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
          disabled={locked}
          className="w-full pl-10 pr-10 py-3 rounded-xl font-inter text-sm text-foreground placeholder-muted-foreground outline-none transition-all disabled:opacity-40"
          style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'} />
        <button type="button" onClick={() => setShowPass(!showPass)} disabled={locked}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-40">
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)' }}>
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="font-inter text-xs text-red-400">{error}</p>
        </div>
      )}
      <button type="submit" disabled={locked || checking}
        className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,150,255,0.1))', border: '1px solid rgba(0,212,255,0.5)', color: '#00d4ff', boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}>
        {checking ? <><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Checking...</> : <><Shield className="w-4 h-4" /> Login</>}
      </button>
    </form>
  );
}

function StatBadge({ icon: Icon, label, value, color = '#00d4ff' }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-3"
      style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${color}20` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="font-inter text-xs text-muted-foreground">{label}</p>
        <p className="font-orbitron font-black text-xl" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

// ── Download Links Manager ──
function DownloadLinksTab() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { id?, type, label, url, version }
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.DownloadLink.list('-created_date', 20);
      setLinks(data);
    } catch (e) { toast.error('Failed to load links'); } finally {
    setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (link) => setEditing({ ...link });
  const startNew = (type) => setEditing({ type, label: type === 'external' ? '⚡ External Panel' : '🔥 Internal Panel', url: '', version: 'V7A BETA', active: true });

  const save = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        await base44.entities.DownloadLink.update(editing.id, { type: editing.type, label: editing.label, url: editing.url, version: editing.version, active: editing.active });
        toast.success('Link updated');
      } else {
        await base44.entities.DownloadLink.create({ type: editing.type, label: editing.label, url: editing.url, version: editing.version, active: true });
        toast.success('Link added');
      }
      setEditing(null);
      load();
    } catch (e) { toast.error('Failed to save link'); } finally {
    setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.DownloadLink.delete(id);
    setLinks(prev => prev.filter(l => l.id !== id));
    toast.success('Link removed');
  };

  const typeColor = (t) => t === 'external' ? '#00d4ff' : '#aa44ff';

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

// ── Receipts Manager ──
function ReceiptsTab() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [keys, setKeys] = useState([]);
  const [noteModal, setNoteModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [r, k] = await Promise.all([
        base44.entities.ResellerReceipt.list('-created_date', 50),
        base44.entities.LicenseKey.filter({ status: 'available' }),
      ]);
      setReceipts(r);
      setKeys(k);
    } catch (e) { toast.error('Failed to load receipts'); } finally {
    setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (receipt) => {
    // Find a matching key
    const key = keys.find(k => k.product_type === receipt.product_type && k.duration === receipt.duration);
    if (!key) {
      toast.error('No available key found for this product/duration. Add keys to the Key Bank first.');
      return;
    }
    await base44.entities.LicenseKey.update(key.id, { status: 'used', assigned_to: receipt.reseller_username, receipt_id: receipt.id });
    await base44.entities.ResellerReceipt.update(receipt.id, { status: 'approved', generated_key: key.key });
    toast.success('Approved & key assigned!');
    checkAndWarnLowStock(receipt.product_type, receipt.duration);
    load();
  };

  const reject = async (receipt, note) => {
    await base44.entities.ResellerReceipt.update(receipt.id, { status: 'rejected', admin_note: note });
    toast.success('Receipt rejected');
    setNoteModal(null);
    load();
  };

  const displayed = receipts.filter(r => filter === 'all' || r.status === filter);

  const STATUS_COLOR = { pending: '#ffaa00', approved: '#00ff64', rejected: '#ff4444' };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="font-inter text-xs px-3 py-1.5 rounded-lg capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(0,212,255,0.12)' : 'rgba(0,15,35,0.5)',
              border: `1px solid ${filter === f ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.08)'}`,
              color: filter === f ? '#00d4ff' : 'rgba(180,200,220,0.5)',
            }}>{f}</button>
        ))}
        <button onClick={load} className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {displayed.map(r => (
            <div key={r.id} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${STATUS_COLOR[r.status]}20` }}>
              <div className="flex items-start gap-3">
                {r.receipt_image_url && (
                  <a href={r.receipt_image_url} target="_blank" rel="noopener noreferrer">
                    <img src={r.receipt_image_url} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid rgba(0,212,255,0.15)' }} />
                  </a>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-orbitron font-bold text-xs" style={{ color: '#00d4ff' }}>{r.reseller_display_name || r.reseller_username}</span>
                    <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${STATUS_COLOR[r.status]}15`, color: STATUS_COLOR[r.status], border: `1px solid ${STATUS_COLOR[r.status]}35` }}>{r.status}</span>
                    {r.auto_verified && <span className="font-inter text-xs text-muted-foreground">auto-verified</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                    <div><span className="text-muted-foreground">Amount: </span><span>{r.extracted_amount ?? '—'}</span></div>
                    <div><span className="text-muted-foreground">Ref: </span><span className="truncate">{r.extracted_reference || '—'}</span></div>
                    <div><span className="text-muted-foreground">Product: </span><span className="capitalize">{r.product_type}</span></div>
                    <div><span className="text-muted-foreground">Duration: </span><span>{r.duration?.replace('_', ' ')}</span></div>
                  </div>
                  {r.generated_key && <p className="font-orbitron text-xs font-bold" style={{ color: '#00ff64' }}>Key: {r.generated_key}</p>}
                  {r.admin_note && <p className="font-inter text-xs text-yellow-400">Note: {r.admin_note}</p>}
                </div>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => approve(r)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-orbitron text-xs font-bold transition-all"
                    style={{ background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)', color: '#00ff64' }}>
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => setNoteModal(r)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-orbitron text-xs font-bold transition-all"
                    style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff4444' }}>
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {displayed.length === 0 && <p className="text-center font-inter text-xs text-muted-foreground py-8">No receipts found.</p>}
        </div>
      )}

      {/* Reject note modal */}
      <AnimatePresence>
        {noteModal && <RejectModal receipt={noteModal} onConfirm={reject} onCancel={() => setNoteModal(null)} />}
      </AnimatePresence>
    </div>
  );
}

function RejectModal({ receipt, onConfirm, onCancel }) {
  const [note, setNote] = useState('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="rounded-2xl p-6 w-full max-w-sm space-y-4"
        style={{ background: 'rgba(0,8,28,0.95)', border: '1px solid rgba(255,68,68,0.3)' }}>
        <p className="font-orbitron font-bold text-sm" style={{ color: '#ff4444' }}>REJECT RECEIPT</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Reason for rejection (optional)"
          className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none resize-none h-24"
          style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(255,68,68,0.2)' }} />
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg font-inter text-xs text-muted-foreground hover:text-foreground transition-colors border border-white/10">Cancel</button>
          <button onClick={() => onConfirm(receipt, note)} className="flex-1 py-2 rounded-lg font-orbitron text-xs font-bold"
            style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)', color: '#ff4444' }}>Confirm Reject</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Resellers Manager ──
function ResellersTab() {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ResellerAccount.list('-created_date', 50);
      setResellers(data);
    } catch (e) { toast.error('Failed to load resellers'); } finally {
    setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (form.id) {
        await base44.entities.ResellerAccount.update(form.id, form);
        toast.success('Reseller updated');
      } else {
        await base44.entities.ResellerAccount.create(form);
        toast.success('Reseller added');
      }
      setForm(null);
      load();
    } catch (e) { toast.error('Failed to save reseller'); } finally {
    setSaving(false);
    }
  };

  const toggleStatus = async (r) => {
    const newStatus = r.status === 'active' ? 'suspended' : 'active';
    await base44.entities.ResellerAccount.update(r.id, { status: newStatus });
    toast.success(`Reseller ${newStatus}`);
    load();
  };

  const remove = async (id) => {
    await base44.entities.ResellerAccount.delete(id);
    setResellers(prev => prev.filter(r => r.id !== id));
    toast.success('Reseller removed');
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

// ── Key Bank ──
function KeyBankTab() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.LicenseKey.list('-created_date', 100);
      setKeys(data);
    } catch (e) { toast.error('Failed to load keys'); } finally {
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
      await base44.entities.LicenseKey.bulkCreate(
        keysToAdd.map(k => ({ key: k, product_type: form.product_type, duration: form.duration, status: 'available', notes: '' }))
      );
      toast.success(`${keysToAdd.length} key${keysToAdd.length > 1 ? 's' : ''} added to bank`);
      setForm(null);
      load();
    } catch (e) {
      toast.error('Failed to save keys');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.LicenseKey.delete(id);
    setKeys(prev => prev.filter(k => k.id !== id));
    toast.success('Key removed');
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

// ── Price Plans Manager ──
function PricePlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const DEFAULT_DB_PLANS = [
    { panel_type: 'external', label: '1 Day',    lkr: 150,  days: '1 Day',     popular: false, crown: false, sort_order: 0 },
    { panel_type: 'external', label: '1 Week',   lkr: 500,  days: '7+ Days',   popular: false, crown: false, sort_order: 1 },
    { panel_type: 'external', label: '1 Month',  lkr: 1500, days: '30+ Days',  popular: true,  crown: false, sort_order: 2 },
    { panel_type: 'external', label: 'Lifetime', lkr: 5000, days: 'Forever ∞', popular: false, crown: true,  sort_order: 3 },
    { panel_type: 'internal', label: '1 Day',    lkr: 200,  days: '1 Day',     popular: false, crown: false, sort_order: 0 },
    { panel_type: 'internal', label: '1 Week',   lkr: 700,  days: '7+ Days',   popular: false, crown: false, sort_order: 1 },
    { panel_type: 'internal', label: '1 Month',  lkr: 2000, days: '30+ Days',  popular: true,  crown: false, sort_order: 2 },
    { panel_type: 'internal', label: 'Lifetime', lkr: 7000, days: 'Forever ∞', popular: false, crown: true,  sort_order: 3 },
  ];

  const load = async () => {
    setLoading(true);
    try {
      let data = await base44.entities.PricePlan.list('sort_order', 100);
      if (!data || data.length === 0) {
        await base44.entities.PricePlan.bulkCreate(DEFAULT_DB_PLANS);
        data = await base44.entities.PricePlan.list('sort_order', 100);
        toast.success('Default plans seeded!');
      }
      setPlans(data);
    } catch (e) { toast.error('Failed to load price plans'); } finally {
    setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    if (form.id) {
      await base44.entities.PricePlan.update(form.id, { panel_type: form.panel_type, label: form.label, lkr: Number(form.lkr), days: form.days, popular: form.popular, crown: form.crown, sort_order: Number(form.sort_order || 0) });
      toast.success('Plan updated');
    } else {
      await base44.entities.PricePlan.create({ panel_type: form.panel_type, label: form.label, lkr: Number(form.lkr), days: form.days, popular: form.popular || false, crown: form.crown || false, sort_order: Number(form.sort_order || 0) });
      toast.success('Plan added');
    }
    setForm(null);
    load();
    setSaving(false);
  };

  const remove = async (id) => {
    await base44.entities.PricePlan.delete(id);
    setPlans(prev => prev.filter(p => p.id !== id));
    toast.success('Plan removed');
  };

  const external = plans.filter(p => p.panel_type === 'external').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const internal = plans.filter(p => p.panel_type === 'internal').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const PlanRow = ({ p }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${p.panel_type === 'external' ? 'rgba(0,212,255,0.1)' : 'rgba(255,180,0,0.1)'}` }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-orbitron font-bold text-xs" style={{ color: p.panel_type === 'external' ? '#00d4ff' : '#ffb400' }}>{p.label}</span>
          {p.popular && <span className="font-inter text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)', fontSize: '10px' }}>⭐ Popular</span>}
          {p.crown && <span className="font-inter text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,180,0,0.1)', color: '#ffb400', border: '1px solid rgba(255,180,0,0.2)', fontSize: '10px' }}>👑 Best Value</span>}
        </div>
        <p className="font-inter text-xs text-muted-foreground">LKR {(p.lkr || 0).toLocaleString()} · {p.days}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => setForm({ ...p })} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
          <DollarSign className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="font-orbitron text-xs text-primary tracking-wider">PRICE PLANS</p>
        <div className="flex gap-2">
          <button onClick={() => setForm({ panel_type: 'external', label: '', lkr: '', days: '', popular: false, crown: false, sort_order: plans.length + 1 })}
            className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
            <Plus className="w-3.5 h-3.5" /> External Plan
          </button>
          <button onClick={() => setForm({ panel_type: 'internal', label: '', lkr: '', days: '', popular: false, crown: false, sort_order: plans.length + 1 })}
            className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.3)', color: '#ffb400' }}>
            <Plus className="w-3.5 h-3.5" /> Internal Plan
          </button>
        </div>
      </div>

      {form && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,8,28,0.9)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <p className="font-orbitron text-xs text-primary tracking-wider">{form.id ? 'EDIT' : 'NEW'} {form.panel_type?.toUpperCase()} PLAN</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Label (e.g. 1 Month) *"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            <input value={form.lkr} onChange={e => setForm(p => ({ ...p, lkr: e.target.value }))} placeholder="Price LKR *" type="number"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            <input value={form.days} onChange={e => setForm(p => ({ ...p, days: e.target.value }))} placeholder="Days text (e.g. 30+ Days)"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            <input value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} placeholder="Sort order (1,2,3...)" type="number"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.popular || false} onChange={e => setForm(p => ({ ...p, popular: e.target.checked }))} className="accent-primary" />
              <span className="font-inter text-xs text-muted-foreground">⭐ Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.crown || false} onChange={e => setForm(p => ({ ...p, crown: e.target.checked }))} className="accent-primary" />
              <span className="font-inter text-xs text-muted-foreground">👑 Best Value (Lifetime)</span>
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={save} disabled={saving || !form.label || !form.lkr}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="font-orbitron text-xs mb-3 tracking-wider" style={{ color: '#00d4ff' }}>⚡ EXTERNAL PLANS</p>
            <div className="space-y-2">{external.map(p => <PlanRow key={p.id} p={p} />)}</div>
            {external.length === 0 && <p className="font-inter text-xs text-muted-foreground">No external plans. Using defaults.</p>}
          </div>
          <div>
            <p className="font-orbitron text-xs mb-3 tracking-wider" style={{ color: '#ffb400' }}>🔥 INTERNAL PLANS</p>
            <div className="space-y-2">{internal.map(p => <PlanRow key={p.id} p={p} />)}</div>
            {internal.length === 0 && <p className="font-inter text-xs text-muted-foreground">No internal plans. Using defaults.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main admin panel ──
function AdminPanel({ adminUser, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, messages: 0, announcements: 0, conversations: 0, openTickets: 0 });
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, msgs, ann, convs] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.WorldMessage.list('-created_date', 50),
        base44.entities.Announcement.list('-created_date', 20),
        base44.entities.ChatConversation.list('-last_message_time', 20),
      ]);
      setUsers(u); setMessages(msgs); setAnnouncements(ann);
      const openTickets = convs.filter(c => c.is_support && c.ticket_status === 'open').length;
      setStats({ users: u.length, messages: msgs.length, announcements: ann.length, conversations: convs.length, openTickets });
    } catch (e) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const deleteMessage = async (id) => {
    await base44.entities.WorldMessage.delete(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    toast.success('Message deleted');
  };

  const deleteAnnouncement = async (id) => {
    await base44.entities.Announcement.delete(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success('Announcement deleted');
  };

  const tabs = [
    { key: 'overview',   label: 'Overview',   icon: Activity },
    { key: 'accrequests', label: 'Acc Requests', icon: UserPlus },
    { key: 'receipts',   label: 'Receipts',   icon: Clock },
    { key: 'resellers',  label: 'Resellers',  icon: Store },
    { key: 'keys',       label: 'Key Bank',   icon: Key },
    { key: 'beneficiaries', label: 'Beneficiaries', icon: CreditCard },
    { key: 'prices',     label: 'Prices',     icon: DollarSign },
    { key: 'discounts',  label: 'Discounts',  icon: Tag },
    { key: 'status',     label: 'Status',     icon: Activity },
    { key: 'links',      label: 'DL Links',   icon: Link2 },
    { key: 'community',  label: 'Community',  icon: Users },
    { key: 'freebies',   label: 'Freebies',   icon: Gift },
    { key: 'admins',     label: 'Admins',     icon: Shield },
    { key: 'discord',    label: 'Discord',    icon: Bell },
    { key: 'users',      label: 'Users',      icon: Users },
    { key: 'messages',   label: 'Messages',   icon: MessageCircle },
    { key: 'announcements', label: 'Posts',   icon: Megaphone },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4" style={{ color: '#ffaa00' }} />
          <span className="font-orbitron font-bold text-sm text-primary tracking-wider">ADMIN PANEL</span>
          <span className="font-inter text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)', color: '#00ff64' }}>
            ● {adminUser}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-primary">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 font-inter text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.05)' }}>
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Tabs - scrollable */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 p-1 rounded-xl min-w-max" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-inter text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: tab === t.key ? 'rgba(0,212,255,0.15)' : 'transparent',
                  color: tab === t.key ? '#00d4ff' : 'rgba(180,200,220,0.5)',
                  border: tab === t.key ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                }}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

          {tab === 'overview' && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBadge icon={Users} label="Total Users" value={stats.users} color="#00d4ff" />
                <StatBadge icon={MessageCircle} label="World Messages" value={stats.messages} color="#00ff88" />
                <StatBadge icon={Megaphone} label="Announcements" value={stats.announcements} color="#a855f7" />
                <StatBadge icon={Activity} label="Conversations" value={stats.conversations} color="#ffaa00" />
              </div>

              {/* Support Tickets quick-link */}
              <button onClick={() => navigate('/chat')}
                className="w-full flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.01] text-left"
                style={{ background: stats.openTickets > 0 ? 'rgba(255,170,0,0.08)' : 'rgba(0,15,35,0.8)', border: `1px solid ${stats.openTickets > 0 ? 'rgba(255,170,0,0.35)' : 'rgba(0,212,255,0.1)'}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: stats.openTickets > 0 ? 'rgba(255,170,0,0.15)' : 'rgba(0,212,255,0.1)', border: `1px solid ${stats.openTickets > 0 ? 'rgba(255,170,0,0.3)' : 'rgba(0,212,255,0.2)'}` }}>
                  <Ticket className="w-5 h-5" style={{ color: stats.openTickets > 0 ? '#ffaa00' : '#00d4ff' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-orbitron font-bold text-xs" style={{ color: stats.openTickets > 0 ? '#ffaa00' : '#00d4ff' }}>SUPPORT TICKETS</p>
                  <p className="font-inter text-xs text-muted-foreground">
                    {stats.openTickets > 0 ? `${stats.openTickets} open ticket${stats.openTickets > 1 ? 's' : ''} waiting — claim now` : 'No open tickets right now'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
                <p className="font-orbitron text-xs text-primary tracking-wider mb-3">RECENT USERS</p>
                {users.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'rgba(0,212,255,0.06)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : <User className="w-4 h-4 text-primary opacity-60" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm text-foreground truncate">{u.display_name || u.full_name || u.email}</p>
                      <p className="font-inter text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background: u.role === 'admin' ? 'rgba(255,170,0,0.1)' : 'rgba(0,212,255,0.08)', color: u.role === 'admin' ? '#ffaa00' : '#00d4ff', border: `1px solid ${u.role === 'admin' ? 'rgba(255,170,0,0.3)' : 'rgba(0,212,255,0.2)'}` }}>
                      {u.role || 'user'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'accrequests' && <AccountRequestsTab adminUser={adminUser} />}
          {tab === 'receipts' && <ReceiptsTab />}
          {tab === 'resellers' && <ResellersTab />}
          {tab === 'keys' && <KeyBankTab />}
          {tab === 'beneficiaries' && <BeneficiaryAccountsTab />}
          {tab === 'prices' && <PricePlansTab />}
          {tab === 'discounts' && <DiscountsTab />}
          {tab === 'status' && <StatusTab />}
          {tab === 'links' && <DownloadLinksTab />}
          {tab === 'community' && <CommunityLinksTab />}
          {tab === 'freebies' && <FreebiesTab />}
          {tab === 'admins' && <AdminsTab adminUser={adminUser} />}
          {tab === 'discord' && <DiscordSettingsTab />}

          {tab === 'users' && (
            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
                <p className="font-orbitron text-xs text-primary tracking-wider">ALL USERS ({users.length})</p>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(0,212,255,0.06)' }}>
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : <User className="w-4 h-4 text-primary opacity-60" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-medium text-foreground truncate">{u.display_name || u.full_name || '—'}</p>
                      <p className="font-inter text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background: u.role === 'admin' ? 'rgba(255,170,0,0.1)' : 'rgba(0,212,255,0.08)', color: u.role === 'admin' ? '#ffaa00' : '#00d4ff', border: `1px solid ${u.role === 'admin' ? 'rgba(255,170,0,0.3)' : 'rgba(0,212,255,0.2)'}` }}>
                      {u.role || 'user'}
                    </span>
                  </div>
                ))}
                {users.length === 0 && <div className="p-8 text-center font-inter text-xs text-muted-foreground">No users found</div>}
              </div>
            </div>
          )}

          {tab === 'messages' && (
            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
                <p className="font-orbitron text-xs text-primary tracking-wider">WORLD CHAT ({messages.length})</p>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: 'rgba(0,212,255,0.06)' }}>
                {messages.map(m => (
                  <div key={m.id} className="flex items-start gap-3 px-4 py-3 group">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                      {m.sender_avatar ? <img src={m.sender_avatar} className="w-full h-full rounded-full object-cover" alt="" /> : <User className="w-3.5 h-3.5 text-primary opacity-50" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-inter text-xs font-semibold text-primary">{m.sender_name || m.sender_email}</p>
                        <p className="font-inter text-xs text-muted-foreground">{new Date(m.created_date).toLocaleString()}</p>
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
            </div>
          )}

          {tab === 'announcements' && (
            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
                <p className="font-orbitron text-xs text-primary tracking-wider">ANNOUNCEMENTS ({announcements.length})</p>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(0,212,255,0.06)' }}>
                {announcements.map(a => (
                  <div key={a.id} className="flex items-start gap-3 px-4 py-3 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>{a.type}</span>
                        {a.pinned && <span className="font-inter text-xs text-yellow-400">📌 Pinned</span>}
                        <p className="font-inter text-xs text-muted-foreground">{new Date(a.created_date).toLocaleDateString()}</p>
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
            </div>
          )}

          {loading && tab === 'overview' && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminPortal() {
  const [adminUser, setAdminUser] = useState(() => sessionStorage.getItem('prrx_admin_logged_in') || null);

  const handleLogout = () => {
    sessionStorage.removeItem('prrx_admin_logged_in');
    setAdminUser(null);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
        <div>
          <h2 className="font-orbitron font-bold text-sm text-primary tracking-wider">PRRX ADMIN PORTAL</h2>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">Manage your platform</p>
        </div>
        {adminUser && (
          <span className="font-inter text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', color: '#ffaa00' }}>
            <Crown className="w-3 h-3 inline mr-1" />Admin
          </span>
        )}
      </div>
      <div className="p-6">
        <AnimatePresence mode="wait">
          {adminUser ? (
            <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SessionWatcher onTimeout={handleLogout} label="Admin Portal">
                <AdminPanel adminUser={adminUser} onLogout={handleLogout} />
              </SessionWatcher>
            </motion.div>
          ) : (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoginForm onSuccess={setAdminUser} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}