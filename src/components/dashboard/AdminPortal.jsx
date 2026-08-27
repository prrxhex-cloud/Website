import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, setDoc, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, X, User, Trash2, RefreshCw, LogOut, Shield, ShieldAlert, AlertTriangle, Activity, UserPlus, Clock, Store, Key, CreditCard, DollarSign, Tag, Link2, Users, Gift, Bell, MessageCircle, Megaphone, Image as ImageIcon } from 'lucide-react';
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
import StorePricesTab from './StorePricesTab';
import ResellerPlansTab from './ResellerPlansTab';
import PricePlansTab from './PricePlansTab';
import DownloadLinksTab from './DownloadLinksTab';
import AdminOverviewTab from './AdminOverviewTab';
import AdminMessagesTab from './AdminMessagesTab';
import AdminAnnouncementsTab from './AdminAnnouncementsTab';
import PanelImagesTab from './PanelImagesTab';
import FunctionsScreenshotsTab from './FunctionsScreenshotsTab';
import ReceiptsTab from './ReceiptsTab';
import DiscordBotManagement from './DiscordBotManagement';
import MaintenanceTab from './MaintenanceTab';

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
    <div className="rounded-[32px] overflow-hidden bg-black/40 border border-white/10">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#00d4ff]" />
          </div>
          <p className="font-orbitron font-bold text-sm text-white tracking-widest">USER DATABASE <span className="text-[#00d4ff] ml-1">({users.length})</span></p>
        </div>
        <button onClick={load} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {loading ? <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin glow-cyan" /></div> : (
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden" 
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : <User className="w-5 h-5 text-[#00d4ff]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-orbitron font-bold text-sm text-white truncate">{u.display_name || u.full_name || 'UNNAMED_USER'}</p>
                <p className="font-inter text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="font-orbitron font-bold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase"
                  style={{ background: u.role === 'admin' ? 'rgba(255,170,0,0.1)' : (u.role === 'reseller' ? 'rgba(170,68,255,0.1)' : 'rgba(0,212,255,0.1)'), color: u.role === 'admin' ? '#ffaa00' : (u.role === 'reseller' ? '#aa44ff' : '#00d4ff'), border: u.role === 'admin' ? '1px solid rgba(255,170,0,0.3)' : (u.role === 'reseller' ? '1px solid rgba(170,68,255,0.3)' : '1px solid rgba(0,212,255,0.3)') }}>
                  {u.role || 'user'}
                </span>
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="p-12 text-center font-orbitron text-sm tracking-widest text-gray-500">NO USERS FOUND</div>}
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
    if(!window.confirm('WARNING: Deleting this admin will revoke their access. Proceed?')) return;
    try {
      await deleteDoc(doc(db, 'system_admins', id));
      toast.success('Admin deleted');
      load();
    } catch(e) {
      toast.error('Error deleting admin');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] p-8 liquid-glass border border-[#00d4ff]/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/5 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <ShieldAlert className="w-6 h-6 text-[#00d4ff]" />
          <h3 className="font-orbitron font-black text-lg text-white tracking-widest">GRANT ADMIN ACCESS</h3>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1 relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00d4ff] transition-colors" />
            <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="New Admin ID"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl font-inter text-sm text-white outline-none transition-all placeholder:text-gray-500"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div className="flex-1 relative group">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00d4ff] transition-colors" />
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Initial Password"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl font-inter text-sm text-white outline-none transition-all placeholder:text-gray-500"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <button onClick={addAdmin} className="px-8 py-3.5 rounded-xl font-orbitron font-bold text-xs tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,153,204,0.2))', border: '1px solid rgba(0,212,255,0.5)', color: '#00d4ff' }}>
            <UserPlus className="w-4 h-4" /> AUTHORIZE
          </button>
        </div>
      </div>

      <div className="rounded-[32px] overflow-hidden bg-black/40 border border-white/10">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/5">
          <p className="font-orbitron font-bold text-sm tracking-widest text-gray-300">AUTHORIZED PERSONNEL</p>
          <button onClick={load} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        {loading ? <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin glow-cyan" /></div> : (
          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between px-6 py-4 bg-yellow-500/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-orbitron font-bold text-sm text-yellow-400">Sayuru</p>
                  <p className="font-inter text-[10px] tracking-widest text-gray-500 uppercase">System Architect / Root</p>
                </div>
              </div>
              <Shield className="w-5 h-5 text-yellow-500/30" />
            </div>
            
            {admins.map(a => (
              <div key={a.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#00d4ff]" />
                  </div>
                  <div>
                    <p className="font-orbitron font-bold text-sm text-white">{a.username}</p>
                    <p className="font-inter text-[10px] tracking-widest text-gray-500 uppercase">System Admin</p>
                  </div>
                </div>
                <button onClick={() => delAdmin(a.id)} className="p-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100">
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
        toast.error('Invalid credentials or unauthorized access attempt.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Secure connection error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 w-full">
      <div className="w-full max-w-md rounded-3xl p-8 space-y-6 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl relative overflow-hidden text-left">
        
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-[var(--text-heading)]">PRRX ADMIN</h2>
          <p className="font-inter text-xs text-rose-500 font-bold uppercase tracking-wider mt-1">Strictly Confidential Access</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase">Admin ID</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
                className="w-full pl-10 pr-4 py-3 rounded-xl font-inter text-sm text-[var(--text-heading)] bg-[var(--bg-subtle)] border border-[var(--border-color)] outline-none focus:border-[#06b6d4] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase">Authorization Key</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl font-inter text-sm text-[var(--text-heading)] bg-[var(--bg-subtle)] border border-[var(--border-color)] outline-none focus:border-[#06b6d4] transition-colors" />
            </div>
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading}
          className="btn-primary-cyan btn-glow w-full py-3.5 rounded-xl font-inter font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-md">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Shield className="w-4 h-4 text-white" />}
          <span>DECRYPT PORTAL</span>
        </button>

        <div className="text-center pt-2">
          <p className="font-inter text-[11px] text-[var(--text-muted)]">IP logged and monitored for unauthorized access attempts.</p>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ adminUser, onLogout }) {
  const [mode, setMode] = useState('website'); // 'website' | 'bot'
  const [tab, setTab] = useState('overview');
  const [visitedTabs, setVisitedTabs] = useState(new Set(['overview']));

  const handleTabChange = (key) => {
    setTab(key);
    setVisitedTabs(prev => new Set(prev).add(key));
  };

  const tabs = [
    { key: 'overview',   label: 'Overview',   icon: Activity },
    { key: 'maintenance', label: 'Kill Switch', icon: ShieldAlert },
    { key: 'accrequests', label: 'Acc Requests', icon: UserPlus },
    { key: 'receipts',   label: 'Receipts',   icon: Clock },
    { key: 'resellers',  label: 'Resellers',  icon: Store },
    { key: 'keys',       label: 'Key Bank',   icon: Key },
    { key: 'beneficiaries', label: 'Beneficiaries', icon: CreditCard },
    { key: 'prices',         label: 'Store Prices',      icon: DollarSign },
    { key: 'reseller_plans', label: 'Reseller Packages', icon: Store },
    { key: 'discounts',      label: 'Discounts',         icon: Tag },
    { key: 'status',         label: 'Status',            icon: Activity },
    { key: 'links',          label: 'DL Links',          icon: Link2 },
    { key: 'community',      label: 'Community',         icon: Users },
    { key: 'freebies',       label: 'Freebies',          icon: Gift },
    { key: 'admins',         label: 'Admins',            icon: Shield },
    { key: 'discord',        label: 'Discord',           icon: Bell },
    { key: 'users',          label: 'Users',             icon: Users },
    { key: 'messages',       label: 'Messages',          icon: MessageCircle },
    { key: 'announcements',  label: 'Posts',             icon: Megaphone },
    { key: 'panel_images',   label: 'Panel Imgs',        icon: ImageIcon },
    { key: 'functions_screenshots', label: 'Func Screenshots', icon: ImageIcon },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="font-outfit font-extrabold text-lg text-[var(--text-heading)] block">ADMINISTRATOR CONTROL</span>
            <span className="font-inter text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30 inline-block mt-0.5">
              Active ID: {adminUser}
            </span>
          </div>
        </div>
        <button onClick={onLogout}
          className="px-4 py-2 rounded-xl text-rose-500 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 font-inter font-bold text-xs flex items-center gap-2 transition-all">
          <LogOut className="w-4 h-4" /> <span>Disconnect</span>
        </button>
      </div>

      {/* Top Level Mode Selector */}
      <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-4 mb-4 w-full">
        <button 
          onClick={() => setMode('website')}
          className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-xl font-outfit font-bold text-xs sm:text-sm tracking-wider transition-all justify-center flex items-center ${
            mode === 'website' 
              ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
              : 'text-slate-400 bg-slate-900 border border-slate-800 hover:text-white'
          }`}>
          WEBSITE MANAGEMENT
        </button>
        <button 
          onClick={() => setMode('bot')}
          className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-xl font-outfit font-bold text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
            mode === 'bot' 
              ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
              : 'text-slate-400 bg-slate-900 border border-slate-800 hover:text-white'
          }`}>
          <Bell className="w-4 h-4 shrink-0" /> DISCORD BOT MANAGEMENT
        </button>
      </div>

      {mode === 'website' ? (
        <>
          {/* Tabs - Touch Scrollable with Snap */}
          <div className="overflow-x-auto pb-2 custom-scrollbar touch-scroll max-w-full">
            <div className="flex gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] min-w-max shadow-sm">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => handleTabChange(t.key)}
                className={`touch-scroll-item flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-3.5 rounded-xl font-outfit text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap min-h-[38px] ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]'
                }`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                {t.label.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content - Instant Keep-Alive rendering with responsive padding */}
      <div className="rounded-2xl sm:rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl p-3 sm:p-8 overflow-x-auto" style={{ minHeight: '550px' }}>
        {visitedTabs.has('overview') && <div style={{ display: tab === 'overview' ? 'block' : 'none' }}><AdminOverviewTab /></div>}
        {visitedTabs.has('maintenance') && <div style={{ display: tab === 'maintenance' ? 'block' : 'none' }}><MaintenanceTab adminUser={adminUser} /></div>}
        {visitedTabs.has('accrequests') && <div style={{ display: tab === 'accrequests' ? 'block' : 'none' }}><AccountRequestsTab adminUser={adminUser} /></div>}
        {visitedTabs.has('receipts') && <div style={{ display: tab === 'receipts' ? 'block' : 'none' }}><ReceiptsTab /></div>}
        {visitedTabs.has('resellers') && <div style={{ display: tab === 'resellers' ? 'block' : 'none' }}><ResellersTab /></div>}
        {visitedTabs.has('keys') && <div style={{ display: tab === 'keys' ? 'block' : 'none' }}><KeyBankTab /></div>}
        {visitedTabs.has('beneficiaries') && <div style={{ display: tab === 'beneficiaries' ? 'block' : 'none' }}><BeneficiaryAccountsTab /></div>}
        {visitedTabs.has('prices') && <div style={{ display: tab === 'prices' ? 'block' : 'none' }}><StorePricesTab /></div>}
        {visitedTabs.has('reseller_plans') && <div style={{ display: tab === 'reseller_plans' ? 'block' : 'none' }}><ResellerPlansTab /></div>}
        {visitedTabs.has('discounts') && <div style={{ display: tab === 'discounts' ? 'block' : 'none' }}><DiscountsTab /></div>}
        {visitedTabs.has('status') && <div style={{ display: tab === 'status' ? 'block' : 'none' }}><StatusTab /></div>}
        {visitedTabs.has('links') && <div style={{ display: tab === 'links' ? 'block' : 'none' }}><DownloadLinksTab /></div>}
        {visitedTabs.has('community') && <div style={{ display: tab === 'community' ? 'block' : 'none' }}><CommunityLinksTab /></div>}
        {visitedTabs.has('freebies') && <div style={{ display: tab === 'freebies' ? 'block' : 'none' }}><FreebiesTab /></div>}
        {visitedTabs.has('admins') && <div style={{ display: tab === 'admins' ? 'block' : 'none' }}><AdminsTab /></div>}
        {visitedTabs.has('discord') && <div style={{ display: tab === 'discord' ? 'block' : 'none' }}><DiscordSettingsTab /></div>}
        {visitedTabs.has('users') && <div style={{ display: tab === 'users' ? 'block' : 'none' }}><UsersTab /></div>}
        {visitedTabs.has('messages') && <div style={{ display: tab === 'messages' ? 'block' : 'none' }}><AdminMessagesTab /></div>}
        {visitedTabs.has('announcements') && <div style={{ display: tab === 'announcements' ? 'block' : 'none' }}><AdminAnnouncementsTab /></div>}
        {visitedTabs.has('panel_images') && <div style={{ display: tab === 'panel_images' ? 'block' : 'none' }}><PanelImagesTab /></div>}
        {visitedTabs.has('functions_screenshots') && <div style={{ display: tab === 'functions_screenshots' ? 'block' : 'none' }}><FunctionsScreenshotsTab /></div>}
      </div>
    </>
      ) : (
        <div className="rounded-2xl sm:rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl p-3 sm:p-8 overflow-x-auto" style={{ minHeight: '650px' }}>
          <DiscordBotManagement />
        </div>
      )}
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
    <div className="w-full">
      <AnimatePresence mode="wait">
        {adminUser ? (
          <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminPanel adminUser={adminUser} onLogout={handleLogout} />
          </motion.div>
        ) : (
          <motion.div key="login" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
            <LoginForm onSuccess={(u) => { sessionStorage.setItem('prrx_admin_logged_in', u); setAdminUser(u); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
