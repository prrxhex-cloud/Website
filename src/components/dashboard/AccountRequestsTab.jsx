import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { RefreshCw, Check, X, User, Clock, CheckCircle, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLOR = {
  pending:  '#ffaa00',
  claimed:  '#00d4ff',
  created:  '#00ff64',
  rejected: '#ff4444',
};

const PRODUCT_LABELS = {
  external: '⚡ External',
  internal: '🔥 Internal',
  both:     '✨ Both',
};

const DURATION_LABELS = {
  '1_day':    '1 Day',
  '7_days':   '7 Days',
  '30_days':  '30 Days',
  'lifetime': 'Lifetime',
};

export default function AccountRequestsTab({ adminUser }) {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('pending');
  const [processing, setProcessing] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ResellerAccountRequest.list('-created_date', 100);
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Claim a request (mark as claimed by this admin)
  const claim = async (req) => {
    setProcessing(req.id);
    await base44.entities.ResellerAccountRequest.update(req.id, {
      status: 'claimed',
      claimed_by: adminUser,
    });
    toast.success(`Claimed by ${adminUser}`);
    load();
    setProcessing(null);
  };

  // Create account: make a ResellerAccount + mark request as created
  const createAccount = async (req) => {
    setProcessing(req.id);
    // Check if username already exists
    const existing = await base44.entities.ResellerAccount.filter({ username: req.requested_username });
    if (existing.length > 0) {
      toast.error('Username already exists! Choose a different one.');
      setProcessing(null);
      return;
    }
    await base44.entities.ResellerAccount.create({
      username:     req.requested_username,
      password:     req.requested_password,
      display_name: req.requested_username,
      status:       'active',
      notes:        `Created by admin ${adminUser} from custom request. Product: ${req.product_type} · ${req.duration}`,
    });
    await base44.entities.ResellerAccountRequest.update(req.id, { status: 'created' });
    toast.success(`✅ Account "${req.requested_username}" created!`);
    load();
    setProcessing(null);
  };

  const reject = async (req) => {
    setProcessing(req.id);
    await base44.entities.ResellerAccountRequest.update(req.id, { status: 'rejected' });
    toast.success('Request rejected');
    load();
    setProcessing(null);
  };

  const displayed = requests.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap items-center">
        {['pending', 'claimed', 'created', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="font-inter text-xs px-3 py-1.5 rounded-lg capitalize transition-all relative"
            style={{
              background: filter === f ? 'rgba(170,68,255,0.15)' : 'rgba(0,15,35,0.5)',
              border: `1px solid ${filter === f ? 'rgba(170,68,255,0.45)' : 'rgba(0,212,255,0.08)'}`,
              color: filter === f ? '#aa44ff' : 'rgba(180,200,220,0.5)',
            }}>
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 font-bold text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,170,0,0.2)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.4)' }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
        <button onClick={load} className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {displayed.map(req => (
            <motion.div
              key={req.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 space-y-3"
              style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${STATUS_COLOR[req.status]}22` }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${STATUS_COLOR[req.status]}15`, border: `1px solid ${STATUS_COLOR[req.status]}35` }}>
                    <User className="w-4 h-4" style={{ color: STATUS_COLOR[req.status] }} />
                  </div>
                  <div>
                    <p className="font-orbitron font-bold text-xs" style={{ color: '#00d4ff' }}>
                      {req.requested_by}
                    </p>
                    <p className="font-inter text-xs text-muted-foreground">
                      {new Date(req.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize font-bold"
                  style={{ background: `${STATUS_COLOR[req.status]}15`, color: STATUS_COLOR[req.status], border: `1px solid ${STATUS_COLOR[req.status]}35` }}>
                  {req.status === 'created' ? '✅ ' : req.status === 'claimed' ? '🔧 ' : req.status === 'pending' ? '⏳ ' : '❌ '}
                  {req.status}
                </span>
              </div>

              {/* Credentials & details */}
              <div className="grid grid-cols-2 gap-2 text-xs font-inter">
                <div className="rounded-lg p-2.5 space-y-1"
                  style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  <p className="text-muted-foreground text-xs">Username</p>
                  <p className="font-orbitron font-bold text-sm" style={{ color: '#00d4ff' }}>{req.requested_username}</p>
                </div>
                <div className="rounded-lg p-2.5 space-y-1"
                  style={{ background: 'rgba(170,68,255,0.04)', border: '1px solid rgba(170,68,255,0.1)' }}>
                  <p className="text-muted-foreground text-xs">Password</p>
                  <p className="font-orbitron font-bold text-sm" style={{ color: '#aa44ff' }}>{req.requested_password}</p>
                </div>
                <div className="rounded-lg p-2 flex items-center gap-1.5"
                  style={{ background: 'rgba(0,15,35,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Zap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-medium">{PRODUCT_LABELS[req.product_type] || req.product_type}</span>
                </div>
                <div className="rounded-lg p-2 flex items-center gap-1.5"
                  style={{ background: 'rgba(0,15,35,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{DURATION_LABELS[req.duration] || req.duration}</span>
                </div>
              </div>

              {req.claimed_by && req.status !== 'created' && (
                <p className="font-inter text-xs" style={{ color: '#00d4ff' }}>
                  🔧 Claimed by: <span className="font-bold">{req.claimed_by}</span>
                </p>
              )}

              {/* Action buttons */}
              {req.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => claim(req)}
                    disabled={processing === req.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50 transition-all"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.35)', color: '#00d4ff' }}>
                    {processing === req.id
                      ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      : <><Shield className="w-3.5 h-3.5" /> Claim</>
                    }
                  </button>
                  <button
                    onClick={() => reject(req)}
                    disabled={processing === req.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50 transition-all"
                    style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}>
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}

              {req.status === 'claimed' && req.claimed_by === adminUser && (
                <div className="flex gap-2">
                  <button
                    onClick={() => createAccount(req)}
                    disabled={processing === req.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50 transition-all"
                    style={{ background: 'rgba(0,255,100,0.12)', border: '1px solid rgba(0,255,100,0.4)', color: '#00ff64', boxShadow: '0 0 16px rgba(0,255,100,0.1)' }}>
                    {processing === req.id
                      ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      : <><CheckCircle className="w-3.5 h-3.5" /> ✅ CREATE ACCOUNT</>
                    }
                  </button>
                  <button
                    onClick={() => reject(req)}
                    disabled={processing === req.id}
                    className="px-4 py-2.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50 transition-all"
                    style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff4444' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {req.status === 'claimed' && req.claimed_by !== adminUser && (
                <p className="font-inter text-xs text-center text-muted-foreground py-1">
                  🔒 Claimed by another admin
                </p>
              )}
            </motion.div>
          ))}
          {displayed.length === 0 && (
            <p className="text-center font-inter text-xs text-muted-foreground py-10">
              No {filter === 'all' ? '' : filter} requests found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}