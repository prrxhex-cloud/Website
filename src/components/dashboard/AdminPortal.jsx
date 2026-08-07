import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, setDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, X, User, Trash2, RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'sonner';

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
                    <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: ${STATUS_COLOR[r.status]}15, color: STATUS_COLOR[r.status], border: 1px solid 35 }}>{r.status}</span>
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
                style={{ background: u.role === 'admin' ? 'rgba(255,170,0,0.1)' : (u.role === 'reseller' ? 'rgba(170,68,255,0.1)' : 'rgba(0,212,255,0.08)'), color: u.role === 'admin' ? '#ffaa00' : (u.role === 'reseller' ? '#aa44ff' : '#00d4ff'), border: 1px solid  }}>
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

function LoginForm({ onSuccess }) {
  const [password, setPassword] = useState('');
  return (
    <div className="p-8 text-center space-y-4">
      <Crown className="w-12 h-12 text-primary mx-auto opacity-80" />
      <h2 className="font-orbitron font-bold text-lg text-foreground">Admin Access Required</h2>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin Password"
        className="w-full max-w-xs mx-auto px-4 py-2 rounded-xl text-center bg-white/5 border border-white/10 outline-none focus:border-primary/50 transition-all block" />
      <button onClick={() => {
        if(password === 'admin123') onSuccess('Admin User');
        else toast.error('Invalid password');
      }} className="px-6 py-2 rounded-xl font-orbitron font-bold text-xs bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all">
        LOGIN
      </button>
    </div>
  );
}

function AdminPanel({ adminUser, onLogout }) {
  const [tab, setTab] = useState('receipts');
  
  const TABS = [
    { id: 'receipts', label: 'Receipts' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-56 space-y-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="w-full text-left px-4 py-2.5 rounded-xl font-inter text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: tab === t.id ? '#00d4ff' : 'rgba(255,255,255,0.5)'
            }}>
            {t.label}
          </button>
        ))}
        <button onClick={onLogout} className="w-full text-left px-4 py-2.5 rounded-xl font-inter text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-4 flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            {tab === 'receipts' && <ReceiptsTab />}
            {tab === 'users' && <UsersTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
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
