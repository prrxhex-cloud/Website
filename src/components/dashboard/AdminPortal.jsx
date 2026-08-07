import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, setDoc, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, X, User, Trash2, RefreshCw, LogOut, Shield, Activity, UserPlus, Clock, Store, Key, CreditCard, DollarSign, Tag, Link2, Users, Gift, Bell, MessageCircle, Megaphone, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import CommunityLinksTab from './CommunityLinksTab';
import DiscordSettingsTab from './DiscordSettingsTab';
import DiscountsTab from './DiscountsTab';
import FreebiesTab from './FreebiesTab';
import StatusTab from './StatusTab';
import AccountRequestsTab from './AccountRequestsTab';
import BeneficiaryAccountsTab from './BeneficiaryAccountsTab';
import ResellersTab from './ResellersTab';
import KeyBankTab from './KeyBankTab';
import PricePlansTab from './PricePlansTab';
import DownloadLinksTab from './DownloadLinksTab';
import AdminOverviewTab from './AdminOverviewTab';
import AdminMessagesTab from './AdminMessagesTab';
import AdminAnnouncementsTab from './AdminAnnouncementsTab';
import PanelImagesTab from './PanelImagesTab';

function ReceiptsTab() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [noteModal, setNoteModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reseller_receipts'), orderBy('created_date', 'desc'), limit(50));
      const snap = await getDocs(q);
      setReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (receipt) => {
    try {
      // 1. Mark receipt as approved
      await updateDoc(doc(db, 'reseller_receipts', receipt.id), {
        status: 'approved',
        admin_note: 'Approved and subscription granted',
        approved_at: new Date().toISOString()
      });

      // 2. Grant subscription to user (customer_email)
      const usersRef = collection(db, 'users');
      const uq = query(usersRef, where('email', '==', receipt.customer_email?.toLowerCase()));
      const snap = await getDocs(uq);
      
      const subData = {
        subscription: receipt.product_type,
        duration: receipt.duration,
        expiry: Math.floor(Date.now() / 1000) + (parseInt(receipt.duration.split('_')[0]) * 24 * 60 * 60)
      };

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          subscriptions: [subData]
        });
      } else {
        // Create user doc if it doesn't exist
        await setDoc(doc(db, 'users', receipt.customer_email.toLowerCase()), {
          email: receipt.customer_email.toLowerCase(),
          role: 'user',
          subscriptions: [subData],
          created_at: new Date().toISOString()
        });
      }

      toast.success('Approved & subscription assigned!');
      load();
    } catch(err) {
      console.error(err);
      toast.error('Error approving receipt');
    }
  };

  const reject = async (receipt, note) => {
    try {
      await updateDoc(doc(db, 'reseller_receipts', receipt.id), {
        status: 'rejected',
        admin_note: note
      });
      toast.success('Receipt rejected');
      setNoteModal(null);
      load();
    } catch(err) {
      console.error(err);
      toast.error('Error rejecting receipt');
    }
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
              border: filter === f ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
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
            <div key={r.id} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-start gap-3">
                {r.receipt_image_url && (
                  <a href={r.receipt_image_url} target="_blank" rel="noopener noreferrer">
                    <img src={r.receipt_image_url} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid rgba(0,212,255,0.15)' }} />
                  </a>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-orbitron font-bold text-xs" style={{ color: '#00d4ff' }}>{r.reseller_display_name || r.reseller_username || r.reseller_email}</span>
                    <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${STATUS_COLOR[r.status]}15`, color: STATUS_COLOR[r.status], border: `1px solid ${STATUS_COLOR[r.status]}35` }}>{r.status}</span>
                    {r.auto_verified && <span className="font-inter text-xs text-muted-foreground">auto-verified</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                    <div><span className="text-muted-foreground">Customer: </span><span className="text-white">{r.customer_email || '—'}</span></div>
                    <div><span className="text-muted-foreground">Amount: </span><span>{r.extracted_amount ?? '—'}</span></div>
                    <div><span className="text-muted-foreground">Ref: </span><span className="truncate">{r.extracted_reference || '—'}</span></div>
                    <div><span className="text-muted-foreground">Product: </span><span className="capitalize">{r.product_type}</span></div>
                    <div><span className="text-muted-foreground">Duration: </span><span>{r.duration?.replace('_', ' ')}</span></div>
                  </div>
                  {r.admin_note && <p className="font-inter text-xs text-yellow-400">Note: {r.admin_note}</p>}
                </div>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => approve(r)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-orbitron text-xs font-bold transition-all"
                    style={{ background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)', color: '#00ff64' }}>
                    <Check className="w-3.5 h-3.5" /> Approve & Grant
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

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), limit(100)));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="px-4 py-3 border-b flex justify-between" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
        <p className="font-orbitron text-xs text-primary tracking-wider">ALL USERS ({users.length})</p>
        <button onClick={load} className="text-muted-foreground hover:text-primary"><RefreshCw className="w-4 h-4" /></button>
      </div>
      {loading ? <div className="p-8 text-center"><div className="w-5 h-5 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
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
                style={{ background: u.role === 'admin' ? 'rgba(255,170,0,0.1)' : (u.role === 'reseller' ? 'rgba(170,68,255,0.1)' : 'rgba(0,212,255,0.08)'), color: u.role === 'admin' ? '#ffaa00' : (u.role === 'reseller' ? '#aa44ff' : '#00d4ff'), border: '1px solid rgba(255,255,255,0.05)' }}>
                {u.role || 'user'}
              </span>
            </div>
          ))}
          {users.length === 0 && <div className="p-8 text-center font-inter text-xs text-muted-foreground">No users found</div>}
        </div>
      )}
    </div>
  );
}

function AdminsTab() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'system_admins')));
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addAdmin = async () => {
    if (!newUsername || !newPassword) return toast.error('Fill both fields');
    try {
      await setDoc(doc(db, 'system_admins', newUsername.toLowerCase()), {
        username: newUsername,
        password: newPassword,
        created_at: new Date().toISOString()
      });
      toast.success('Admin added!');
      setNewUsername('');
      setNewPassword('');
      load();
    } catch(e) {
      toast.error('Failed to add admin');
    }
  };

  const delAdmin = async (id) => {
    if(!window.confirm('Delete this admin?')) return;
    try {
      await deleteDoc(doc(db, 'system_admins', id));
      toast.success('Admin deleted');
      load();
    } catch(e) {
      toast.error('Error deleting admin');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-5" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <h3 className="font-orbitron text-sm font-bold text-primary tracking-wider mb-4">ADD NEW ADMIN</h3>
        <div className="flex gap-3 flex-wrap">
          <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Username"
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg font-inter text-sm outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password"
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg font-inter text-sm outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          <button onClick={addAdmin} className="px-6 py-2 rounded-lg font-orbitron font-bold text-xs"
            style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
            ADD ADMIN
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="px-4 py-3 border-b flex justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <p className="font-orbitron text-xs text-muted-foreground tracking-wider">SYSTEM ADMINS</p>
          <button onClick={load} className="text-muted-foreground hover:text-white"><RefreshCw className="w-4 h-4" /></button>
        </div>
        {loading ? <div className="p-8 flex justify-center"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Crown className="w-4 h-4 text-yellow-400" />
                <p className="font-inter text-sm font-medium text-white">Sayuru <span className="text-xs text-muted-foreground ml-2">(Default System Admin)</span></p>
              </div>
            </div>
            {admins.map(a => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-primary" />
                  <p className="font-inter text-sm font-medium text-white">{a.username}</p>
                </div>
                <button onClick={() => delAdmin(a.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return toast.error('Enter username and password');
    
    if (username === 'Sayuru' && password === 'Jayani') {
      onSuccess(username);
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'system_admins'), where('username', '==', username), where('password', '==', password));
      const snap = await getDocs(q);
      if (!snap.empty) {
        onSuccess(username);
      } else {
        toast.error('Invalid username or password');
      }
    } catch (e) {
      console.error(e);
      toast.error('Connection error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 w-full">
      <div className="w-full max-w-md rounded-2xl p-8 space-y-6" style={{ background: 'rgba(0,10,25,0.95)', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Shield className="w-8 h-8" style={{ color: '#00d4ff' }} />
          </div>
          <h2 className="font-orbitron font-black text-2xl tracking-widest mb-1" style={{ color: '#00d4ff' }}>PRRX ADMIN</h2>
          <p className="font-inter text-xs text-muted-foreground">Secure portal — authorized personnel only</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
              className="w-full pl-10 pr-4 py-3 rounded-xl font-inter text-sm text-foreground outline-none transition-all"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
              className="w-full pl-10 pr-4 py-3 rounded-xl font-inter text-sm text-foreground outline-none transition-all"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading}
          className="w-full py-3 rounded-xl font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:brightness-110 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #0099cc)', color: '#020810', boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}>
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          ENTER PORTAL
        </button>

        <div className="text-center mt-6 flex items-center justify-center gap-1.5 opacity-60">
          <Shield className="w-3 h-3 text-yellow-500" />
          <p className="font-inter text-[10px] text-muted-foreground">Protected by PRRX Security — Session monitored</p>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ adminUser, onLogout }) {
  const [tab, setTab] = useState('overview');

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
    { key: 'panel_images', label: 'Panel Imgs', icon: ImageIcon },
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
          <button onClick={onLogout}
            className="flex items-center gap-1.5 font-inter text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.05)' }}>
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Tabs - scrollable */}
      <div className="overflow-x-auto pb-2 -mb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
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
          {tab === 'overview' && <AdminOverviewTab />}
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
          {tab === 'admins' && <AdminsTab />}
          {tab === 'discord' && <DiscordSettingsTab />}
          { tab === 'users' && <UsersTab /> }
          { tab === 'messages' && <AdminMessagesTab /> }
          { tab === 'announcements' && <AdminAnnouncementsTab /> }
          { tab === 'panel_images' && <PanelImagesTab /> }
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
              <AdminPanel adminUser={adminUser} onLogout={handleLogout} />
            </motion.div>
          ) : (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoginForm onSuccess={(u) => { sessionStorage.setItem('prrx_admin_logged_in', u); setAdminUser(u); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
