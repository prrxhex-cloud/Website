import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, RefreshCw, User } from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { icon: Clock,         color: '#ffaa00', label: 'Pending' },
  approved: { icon: CheckCircle,   color: '#00ff64', label: 'Approved' },
  rejected: { icon: XCircle,       color: '#ff4444', label: 'Rejected' },
};

const PRODUCT_LABELS = { external: '⚡ External', internal: '🔥 Internal', both: '✨ Both' };
const DURATION_LABELS = { '1_day': '1 Day', '7_days': '7 Days', '30_days': '30 Days', lifetime: 'Lifetime' };

export default function ResellerStatus({ account }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!account?.email) {
      setReceipts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reseller_receipts')
        .select('*')
        .eq('reseller_email', account.email)
        .order('created_at', { ascending: false })
        .limit(30);

      if (data && !error) {
        setReceipts(data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [account?.email]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-primary tracking-wider">MY RECEIPTS ({receipts.length})</p>
        <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-16 font-inter text-sm text-muted-foreground">No receipts submitted yet.</div>
      ) : (
        <div className="space-y-3">
          {receipts.map((r) => {
            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
                <div className="flex items-start gap-4">
                  {r.receipt_image_url && (
                    <img src={r.receipt_image_url} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" style={{ border: '1px solid rgba(0,212,255,0.15)' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="flex items-center gap-1 font-orbitron font-bold text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}40`, color: cfg.color }}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                      <span className="font-inter text-xs text-muted-foreground">{PRODUCT_LABELS[r.product_type]} · {DURATION_LABELS[r.duration]}</span>
                      {r.auto_verified && (
                        <span className="font-inter text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>Auto-verified</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div><span className="text-muted-foreground">Amount: </span><span className="text-foreground">{r.extracted_amount ?? '—'}</span></div>
                      <div><span className="text-muted-foreground">Date: </span><span className="text-foreground">{r.extracted_date || '—'}</span></div>
                      <div><span className="text-muted-foreground">Ref: </span><span className="text-foreground truncate">{r.extracted_reference || '—'}</span></div>
                    </div>
                    {r.admin_note && (
                      <p className="font-inter text-xs text-yellow-400 mt-1">Note: {r.admin_note}</p>
                    )}
                    {r.customer_email && (
                      <div className="flex items-center gap-2 mt-2 p-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span className="font-inter text-xs text-primary">Target: <strong className="font-bold">{r.customer_email}</strong></span>
                      </div>
                    )}
                  </div>
                  <p className="font-inter text-xs text-muted-foreground flex-shrink-0">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}