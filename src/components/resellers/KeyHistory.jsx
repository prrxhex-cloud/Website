import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Key, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

const PRODUCT_COLOR = { external: '#00d4ff', internal: '#aa44ff', both: '#ffaa00' };
const DURATION_LABEL = { '1_day': '1 Day', '7_days': '7 Days', '30_days': '30 Days', lifetime: 'Lifetime' };

export default function KeyHistory({ account }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ResellerReceipt.filter(
      { reseller_username: account.username, status: 'approved' },
      '-created_date',
      100
    );
    setReceipts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const copy = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('Key copied!');
  };

  return (
    <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-primary tracking-wider">LICENSE KEY HISTORY</p>
        <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : receipts.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <Key className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
          <p className="font-inter text-sm text-muted-foreground">No approved keys yet.</p>
          <p className="font-inter text-xs text-muted-foreground/60">Approved receipts with keys will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-inter text-xs text-muted-foreground">{receipts.length} approved key{receipts.length !== 1 ? 's' : ''}</p>
          {receipts.map(r => {
            const color = PRODUCT_COLOR[r.product_type] || '#00d4ff';
            return (
              <div key={r.id} className="rounded-xl p-4 space-y-3"
                style={{ background: 'rgba(0,8,28,0.8)', border: `1px solid ${color}18` }}>
                {/* Top row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                    <Key className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-orbitron font-bold text-xs capitalize" style={{ color }}>
                        {r.product_type} Panel
                      </span>
                      <span className="font-inter text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${color}10`, color, border: `1px solid ${color}25` }}>
                        {DURATION_LABEL[r.duration] || r.duration}
                      </span>
                      {r.auto_verified && (
                        <span className="font-inter text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(0,255,100,0.08)', color: '#00ff64', border: '1px solid rgba(0,255,100,0.2)' }}>
                          ✓ Auto-verified
                        </span>
                      )}
                    </div>
                    <p className="font-inter text-xs text-muted-foreground mt-0.5">
                      {new Date(r.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Key display */}
                {r.generated_key ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg"
                    style={{ background: 'rgba(0,255,100,0.05)', border: '1px solid rgba(0,255,100,0.18)' }}>
                    <p className="font-orbitron font-bold text-sm flex-1 break-all" style={{ color: '#00ff64' }}>
                      {r.generated_key}
                    </p>
                    <button onClick={() => copy(r.generated_key)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-green-400 transition-colors flex-shrink-0">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="font-inter text-xs text-muted-foreground italic">Key not yet assigned by admin.</p>
                )}

                {/* OCR details */}
                {(r.extracted_amount || r.extracted_reference) && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {r.extracted_amount && (
                      <div><span className="text-muted-foreground">Amount: </span><span className="text-foreground">{r.extracted_amount}</span></div>
                    )}
                    {r.extracted_reference && (
                      <div><span className="text-muted-foreground">Ref: </span><span className="text-foreground truncate block">{r.extracted_reference}</span></div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}