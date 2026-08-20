import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Search, Eye, Download, Trash2, RefreshCw, Copy, Check, Sparkles, Building, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function ReceiptsTab() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'receipts'), orderBy('created_date', 'desc'), limit(100));
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

  const removeReceipt = async (id) => {
    try {
      await deleteDoc(doc(db, 'receipts', id));
      setReceipts(prev => prev.filter(r => r.id !== id));
      if (selectedReceipt?.id === id) setSelectedReceipt(null);
      toast.success('Receipt log removed');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete receipt');
    }
  };

  const handleCopyKey = (key, id) => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    toast.success('License Key copied to clipboard!');
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const filteredReceipts = receipts.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      (r.customer_email || '').toLowerCase().includes(term) ||
      (r.customer_name || '').toLowerCase().includes(term) ||
      (r.transaction_number || '').toLowerCase().includes(term) ||
      (r.plan_title || '').toLowerCase().includes(term) ||
      (r.bank_name || '').toLowerCase().includes(term) ||
      (r.license_key || '').toLowerCase().includes(term)
    );
  });

  // Calculate statistics
  const totalVerifiedRevenue = receipts
    .filter(r => r.verified)
    .reduce((acc, r) => acc + (Number(r.amount_paid || r.expected_amount) || 0), 0);

  const verifiedCount = receipts.filter(r => r.verified).length;

  return (
    <div className="space-y-6 text-left font-inter">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-outfit font-black text-xl text-[var(--text-heading)] tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            AI BANK SLIP VERIFICATION & RECEIPTS LOGS
          </h2>
          <p className="font-inter text-xs text-[var(--text-muted)] mt-1">
            Real-time logs of customer bank transfer slips, Gemini AI OCR extraction, and auto-dispensed VIP keys.
          </p>
        </div>

        <button
          onClick={load}
          className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white transition-colors"
          title="Refresh Receipts"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
          <span className="text-[11px] font-bold text-cyan-400 block uppercase">Total Verified AI Sales</span>
          <span className="font-outfit font-black text-2xl text-white mt-1 block">
            Rs. {totalVerifiedRevenue.toLocaleString()} LKR
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
          <span className="text-[11px] font-bold text-emerald-400 block uppercase">Verified Slips</span>
          <span className="font-outfit font-black text-2xl text-emerald-300 mt-1 block">
            {verifiedCount} / {receipts.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
          <span className="text-[11px] font-bold text-purple-400 block uppercase">Anti-Duplicate Protection</span>
          <span className="font-outfit font-black text-2xl text-purple-300 mt-1 block flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" /> 100% ACTIVE
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Transaction ID, Email, Customer, Plan, or Key..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-400 shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Receipts Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : filteredReceipts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-slate-400 text-xs">
          No bank receipts found. Once customers upload slips in checkout, they will appear here automatically!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-muted)] font-outfit uppercase text-[10px] tracking-wider">
                <th className="p-3">Status</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Plan / Item</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Bank & TXN Ref</th>
                <th className="p-3">Delivered Key</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReceipts.map((r) => {
                const isVerified = r.verified === true;
                return (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 whitespace-nowrap">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400">
                          <XCircle className="w-3 h-3" /> FLAGGED
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-white">{r.customer_name || 'VIP Customer'}</div>
                      <div className="text-[11px] text-slate-400">{r.customer_email || 'No email'}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-cyan-300">{r.plan_title}</div>
                      <div className="text-[10px] text-slate-400">{r.duration} · {r.product_type}</div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-white">
                        Rs. {(r.amount_paid || r.expected_amount)?.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {r.date || new Date(r.created_date).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-medium text-slate-200">{r.bank_name || 'Bank Transfer'}</div>
                      <div className="font-mono text-[10px] text-cyan-400 font-bold">
                        {r.transaction_number || 'N/A'}
                      </div>
                    </td>

                    <td className="p-3">
                      {r.license_key ? (
                        <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-950 px-2 py-1 rounded-lg border border-cyan-500/30 text-cyan-300 w-fit">
                          <span>{r.license_key}</span>
                          <button
                            onClick={() => handleCopyKey(r.license_key, r.id)}
                            className="p-0.5 hover:text-white"
                            title="Copy Key"
                          >
                            {copiedKeyId === r.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-bold">Pending Manual Dispatch</span>
                      )}
                    </td>

                    <td className="p-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedReceipt(r)}
                        className="p-1.5 rounded-lg bg-[var(--bg-subtle)] text-slate-300 hover:text-cyan-400 hover:border-cyan-400 border border-transparent transition-colors"
                        title="View Full Slip & Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => removeReceipt(r.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Slip Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <span className="font-outfit font-black text-sm text-cyan-400 uppercase">
                RECEIPT INSPECTION · {selectedReceipt.transaction_number || selectedReceipt.id}
              </span>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Slip Image */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Uploaded Bank Slip:</span>
                {selectedReceipt.receipt_image_url ? (
                  <a href={selectedReceipt.receipt_image_url} target="_blank" rel="noreferrer">
                    <img
                      src={selectedReceipt.receipt_image_url}
                      alt="Bank Slip"
                      className="w-full rounded-2xl border border-[var(--border-color)] object-contain max-h-72 bg-slate-950 shadow-md"
                    />
                  </a>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-2xl">
                    Image not stored or base64 preview expired
                  </div>
                )}
              </div>

              {/* Extraction Details */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-[var(--border-color)] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plan:</span>
                    <span className="font-bold text-white">{selectedReceipt.plan_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="font-bold text-emerald-400">Rs. {selectedReceipt.amount_paid || selectedReceipt.expected_amount} LKR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank:</span>
                    <span className="font-bold text-slate-200">{selectedReceipt.bank_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destination Acc:</span>
                    <span className="font-mono text-cyan-300">{selectedReceipt.beneficiary_account || 'Verified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="font-mono font-bold text-cyan-400">{selectedReceipt.transaction_number || 'N/A'}</span>
                  </div>
                </div>

                {selectedReceipt.license_key && (
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-1">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase block">Dispensed VIP License Key:</span>
                    <div className="flex items-center justify-between font-mono text-xs text-white">
                      <span>{selectedReceipt.license_key}</span>
                      <button
                        onClick={() => handleCopyKey(selectedReceipt.license_key, 'modal-key')}
                        className="p-1 rounded bg-cyan-500/20 text-cyan-300"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {selectedReceipt.verification_reason && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-[11px] text-slate-300">
                    <strong>AI Notes:</strong> {selectedReceipt.verification_reason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
