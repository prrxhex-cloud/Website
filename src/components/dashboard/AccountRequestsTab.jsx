import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { RefreshCw, X, User, Clock, CheckCircle, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLOR = {
  pending:  '#ffaa00',
  claimed:  '#00d4ff',
  created:  '#00ff64',
  rejected: '#ff4444',
};

const PRODUCT_LABELS = {
  external: '⚡ EXTERNAL',
  internal: '🔥 INTERNAL',
  both:     '✨ UNRESTRICTED',
};

const DURATION_LABELS = {
  '1_day':    '1 DAY',
  '7_days':   '7 DAYS',
  '30_days':  '30 DAYS',
  'lifetime': 'LIFETIME',
};

export default function AccountRequestsTab({ adminUser }) {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('pending');
  const [processing, setProcessing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reseller_account_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setRequests(data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const claim = async (req) => {
    setProcessing(req.id);
    try {
      const { error } = await supabase
        .from('reseller_account_requests')
        .update({
          status: 'claimed',
          claimed_by: adminUser,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.id);

      if (error) throw error;
      toast.success(`Request secured by ${adminUser}`);
      load();
    } catch (e) {
      toast.error('Failed to claim request: ' + e.message);
    } finally {
      setProcessing(null);
    }
  };

  const createAccount = async (req) => {
    setProcessing(req.id);
    try {
      // Check if user already exists in resellers
      const { data: existing } = await supabase
        .from('resellers')
        .select('*')
        .eq('username', req.requested_username);
      
      if (existing && existing.length > 0) {
        toast.error('Username already exists! Choose a different one.');
        setProcessing(null);
        return;
      }

      // Create a reseller in Supabase
      const { error: insErr } = await supabase.from('resellers').insert({
        username: req.requested_username,
        password: req.requested_password,
        display_name: req.requested_username,
        status: 'active',
        notes: `Created by admin ${adminUser} from custom request. Product: ${req.product_type} · ${req.duration}`,
        created_at: new Date().toISOString()
      });

      if (insErr) throw insErr;

      await supabase.from('reseller_account_requests').update({
        status: 'created',
        updated_at: new Date().toISOString()
      }).eq('id', req.id);

      toast.success(`ACCOUNT ESTABLISHED: "${req.requested_username}"`);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to provision account: ' + e.message);
    } finally {
      setProcessing(null);
    }
  };

  const reject = async (req) => {
    setProcessing(req.id);
    try {
      const { error } = await supabase.from('reseller_account_requests').update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      }).eq('id', req.id);

      if (error) throw error;
      toast.success('Request successfully marked rejected');
      load();
    } catch (e) {
      toast.error('Failed to reject request: ' + e.message);
    } finally {
      setProcessing(null);
    }
  };

  const displayed = requests.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-3 flex-wrap items-center bg-black/40 p-2 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/5 to-[#aa44ff]/5 pointer-events-none"></div>
        {['pending', 'claimed', 'created', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="font-orbitron text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-widest transition-all duration-300 relative z-10 overflow-hidden group"
            style={{
              background: filter === f ? 'rgba(170,68,255,0.2)' : 'transparent',
              border: `1px solid ${filter === f ? 'rgba(170,68,255,0.5)' : 'transparent'}`,
              color: filter === f ? '#fff' : 'rgba(255,255,255,0.5)',
              textShadow: filter === f ? '0 0 10px rgba(170,68,255,0.8)' : 'none',
              boxShadow: filter === f ? '0 0 20px rgba(170,68,255,0.2)' : 'none',
            }}>
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full ${filter !== f && 'group-hover:translate-x-full'} transition-transform duration-700`}></div>
            <span className="relative z-10 flex items-center gap-2">
              {f}
              {f === 'pending' && pendingCount > 0 && (
                <span className="font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse"
                  style={{ background: 'rgba(255,170,0,0.2)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.5)', boxShadow: '0 0 10px rgba(255,170,0,0.5)' }}>
                  {pendingCount}
                </span>
              )}
            </span>
          </button>
        ))}
        <button onClick={load} className="ml-auto p-3 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white transition-all hover:rotate-180 duration-500 relative z-10">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#aa44ff]/30 border-t-[#aa44ff] rounded-full animate-spin glow-purple" />
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          <AnimatePresence>
            {displayed.map((req, index) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-[24px] p-6 space-y-5 liquid-glass relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300"
                style={{ border: `1px solid ${STATUS_COLOR[req.status]}40`, boxShadow: `0 10px 30px ${STATUS_COLOR[req.status]}10, inset 0 0 20px ${STATUS_COLOR[req.status]}05` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${STATUS_COLOR[req.status]}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden"
                      style={{ background: `${STATUS_COLOR[req.status]}15`, border: `1px solid ${STATUS_COLOR[req.status]}40` }}>
                      <div className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(circle at center, ${STATUS_COLOR[req.status]}, transparent 70%)` }}></div>
                      <User className="w-6 h-6 relative z-10" style={{ color: STATUS_COLOR[req.status] }} />
                    </div>
                    <div>
                      <p className="font-orbitron font-black text-sm tracking-widest text-white">
                        {req.requested_by}
                      </p>
                      <p className="font-inter text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                        REQUEST INITIATED: {req.created_date ? new Date(req.created_date).toLocaleString() : 'UNKNOWN TIME'}
                      </p>
                    </div>
                  </div>
                  <span className="font-orbitron text-[10px] px-4 py-2 rounded-full uppercase font-black tracking-widest shadow-lg"
                    style={{ background: `${STATUS_COLOR[req.status]}15`, color: STATUS_COLOR[req.status], border: `1px solid ${STATUS_COLOR[req.status]}50`, boxShadow: `0 0 15px ${STATUS_COLOR[req.status]}30` }}>
                    {req.status === 'created' ? '✅ ' : req.status === 'claimed' ? '🔧 ' : req.status === 'pending' ? '⏳ ' : '❌ '}
                    {req.status}
                  </span>
                </div>

                {/* Credentials & details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                  <div className="rounded-[16px] p-4 flex flex-col justify-center"
                    style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
                    <p className="font-inter font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">TARGET USERNAME</p>
                    <p className="font-orbitron font-black text-lg text-[#00d4ff] truncate glow-cyan">{req.requested_username}</p>
                  </div>
                  <div className="rounded-[16px] p-4 flex flex-col justify-center"
                    style={{ background: 'rgba(170,68,255,0.05)', border: '1px solid rgba(170,68,255,0.2)' }}>
                    <p className="font-inter font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">AUTH TOKEN / PASS</p>
                    <p className="font-orbitron font-black text-lg text-[#aa44ff] truncate glow-purple">{req.requested_password}</p>
                  </div>
                  <div className="rounded-[16px] p-3 flex items-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Zap className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-inter font-bold text-[9px] text-gray-500 uppercase tracking-widest">PRODUCT ASSIGNMENT</p>
                      <p className="font-orbitron font-bold text-xs text-white tracking-wider mt-0.5">{PRODUCT_LABELS[req.product_type] || req.product_type}</p>
                    </div>
                  </div>
                  <div className="rounded-[16px] p-3 flex items-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-inter font-bold text-[9px] text-gray-500 uppercase tracking-widest">LIFESPAN</p>
                      <p className="font-orbitron font-bold text-xs text-white tracking-wider mt-0.5">{DURATION_LABELS[req.duration] || req.duration}</p>
                    </div>
                  </div>
                </div>

                {req.claimed_by && req.status !== 'created' && (
                  <div className="rounded-xl p-3 bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center gap-2 relative z-10">
                    <Shield className="w-4 h-4 text-[#00d4ff]" />
                    <p className="font-orbitron text-xs font-bold text-[#00d4ff] tracking-widest">
                      SYSTEM LOCKED BY: <span className="text-white">{req.claimed_by}</span>
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                {req.status === 'pending' && (
                  <div className="flex gap-3 pt-2 relative z-10">
                    <button
                      onClick={() => claim(req)}
                      disabled={processing === req.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-orbitron text-xs font-black tracking-widest disabled:opacity-50 transition-all hover:scale-105"
                      style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff', boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}>
                      {processing === req.id
                        ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        : <><Shield className="w-4 h-4" /> INITIATE CLAIM</>
                      }
                    </button>
                    <button
                      onClick={() => reject(req)}
                      disabled={processing === req.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-orbitron text-xs font-black tracking-widest disabled:opacity-50 transition-all hover:scale-105"
                      style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.4)', color: '#ff4444' }}>
                      <X className="w-4 h-4" /> PURGE REQUEST
                    </button>
                  </div>
                )}

                {req.status === 'claimed' && req.claimed_by === adminUser && (
                  <div className="flex gap-3 pt-2 relative z-10">
                    <button
                      onClick={() => createAccount(req)}
                      disabled={processing === req.id}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-orbitron text-sm font-black tracking-widest disabled:opacity-50 transition-all hover:scale-105"
                      style={{ background: 'rgba(0,255,100,0.15)', border: '1px solid rgba(0,255,100,0.5)', color: '#00ff64', boxShadow: '0 0 30px rgba(0,255,100,0.2)' }}>
                      {processing === req.id
                        ? <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        : <><CheckCircle className="w-5 h-5" /> PROVISION SECURE ACCOUNT</>
                      }
                    </button>
                    <button
                      onClick={() => reject(req)}
                      disabled={processing === req.id}
                      className="px-6 py-4 rounded-full font-orbitron text-xs font-black disabled:opacity-50 transition-all hover:scale-105"
                      style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.4)', color: '#ff4444' }}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {displayed.length === 0 && (
            <div className="text-center py-20 bg-black/20 rounded-[32px] border border-white/5">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
              <p className="font-orbitron font-bold text-sm tracking-widest text-gray-500 uppercase">
                NO {filter === 'all' ? 'ACTIVE' : filter} OPERATIONS FOUND IN SYSTEM
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
