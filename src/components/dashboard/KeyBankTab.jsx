import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Key, Plus, Trash2, Check, Shield, CheckCircle2, XCircle, Clock, RefreshCw, LayoutGrid, Settings } from 'lucide-react';
import { toast } from 'sonner';

export function normalizeDurationKey(str) {
  if (!str) return '';
  const s = String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s.includes('1day') || s === '1d') return '1day';
  if (s.includes('3day') || s === '3d') return '3days';
  if (s.includes('1week') || s.includes('7day') || s.includes('7d') || s === '1w') return '1week';
  if (s.includes('2week') || s.includes('14day') || s.includes('14d') || s === '2w') return '2weeks';
  if (s.includes('1month') || s.includes('30day') || s.includes('30d') || s === '1m') return '1month';
  if (s.includes('2month') || s.includes('60day') || s.includes('60d') || s === '2m') return '2months';
  if (s.includes('1year') || s.includes('365day') || s === '1y') return '1year';
  if (s.includes('2year') || s.includes('730day') || s === '2y') return '2years';
  if (s.includes('developing') || s.includes('lifetime') || s.includes('forever') || s.includes('perm')) return 'lifetime';
  return s;
}

export default function KeyBankTab() {
  const [keys, setKeys] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterPanel, setFilterPanel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const [keySnap, planSnap] = await Promise.allSettled([
        getDocs(query(collection(db, 'license_keys'), orderBy('created_date', 'desc'), limit(300))),
        getDocs(query(collection(db, 'price_plans'), orderBy('sort_order', 'asc'), limit(100)))
      ]);

      if (keySnap.status === 'fulfilled' && keySnap.value) {
        setKeys(keySnap.value.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      if (planSnap.status === 'fulfilled' && planSnap.value) {
        setPlans(planSnap.value.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load keys or plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const rawKeys = (form.key || '').split('\n').map(k => k.trim()).filter(Boolean);
    if (rawKeys.length === 0) return;
    const keysToAdd = rawKeys.slice(0, 100);
    if (rawKeys.length > 100) toast.warning(`Only first 100 keys added (you entered ${rawKeys.length}).`);
    setSaving(true);
    try {
      const batch = writeBatch(db);
      keysToAdd.forEach(k => {
        const newId = crypto.randomUUID();
        const docRef = doc(db, 'license_keys', newId);
        batch.set(docRef, {
          key: k,
          product_type: form.product_type || 'external',
          duration: form.duration || '1 Month',
          duration_normalized: normalizeDurationKey(form.duration || '1 Month'),
          status: 'available',
          notes: form.notes || '',
          created_date: new Date().toISOString()
        });
      });
      await batch.commit();
      toast.success(`${keysToAdd.length} key${keysToAdd.length > 1 ? 's' : ''} added to stock!`);
      setForm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save keys');
    } finally {
      setSaving(false);
    }
  };

  const toggleUsed = async (k) => {
    const newStatus = k.status === 'available' ? 'used' : 'available';
    try {
      await updateDoc(doc(db, 'license_keys', k.id), {
        status: newStatus,
        used_at: newStatus === 'used' ? new Date().toISOString() : null,
      });
      setKeys(prev => prev.map(item => item.id === k.id ? { ...item, status: newStatus } : item));
      toast.success(`Key marked as ${newStatus.toUpperCase()}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update key status');
    }
  };

  const remove = async (id) => {
    try {
      await deleteDoc(doc(db, 'license_keys', id));
      setKeys(prev => prev.filter(k => k.id !== id));
      toast.success('Key permanently removed');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete key');
    }
  };

  // Available unique duration options from price plans or defaults
  const availableDurations = plans.length > 0 
    ? Array.from(new Set(plans.map(p => p.label))).filter(Boolean)
    : ['1 Week', '2 Weeks', '1 Month', '2 Months', '1 Year', '2 Years', 'Until We Developing'];

  const filteredKeys = keys.filter(k => {
    const matchPanel = filterPanel === 'all' || k.product_type === filterPanel || k.product_type === 'both';
    const matchStatus = filterStatus === 'all' || k.status === filterStatus;
    return matchPanel && matchStatus;
  });

  return (
    <div className="space-y-6 text-left font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-outfit font-black text-xl text-[var(--text-heading)] tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            LICENSE KEY BANK & STOCK INVENTORY
          </h2>
          <p className="font-inter text-xs text-[var(--text-muted)] mt-1">
            Keys added here automatically sync stock counts to both the <strong className="text-cyan-400">Prices Page</strong> and <strong className="text-purple-400">Resellers Page</strong>!
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white transition-colors"
            title="Refresh Key Bank"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setForm({ key: '', product_type: 'external', duration: availableDurations[0] || '1 Month', status: 'available', notes: '' })}
            className="flex items-center gap-2 font-outfit font-extrabold text-xs px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-md hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> ADD LICENSE KEYS
          </button>
        </div>
      </div>

      {/* Live Stock Counts per Duration Plan */}
      {!loading && (
        <div className="space-y-2">
          <p className="text-[11px] font-outfit font-extrabold text-slate-400 uppercase tracking-wider">
            Live Available Stock on Website:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {['external', 'internal'].flatMap(pt =>
              availableDurations.map(dur => {
                const normDur = normalizeDurationKey(dur);
                const count = keys.filter(k => k.status === 'available' && (k.product_type === pt || k.product_type === 'both') && normalizeDurationKey(k.duration) === normDur).length;
                return (
                  <div
                    key={`${pt}_${dur}`}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      count > 0 
                        ? 'bg-emerald-950/20 border-emerald-500/30' 
                        : 'bg-rose-950/10 border-rose-500/20 opacity-60'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold uppercase block text-slate-400 truncate">
                      {pt === 'external' ? 'Ext' : 'Int'} · {dur}
                    </span>
                    <span className={`font-outfit font-black text-xl block mt-0.5 ${
                      count > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {count} {count === 1 ? 'Key' : 'Keys'}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${
                      count > 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {count > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Key Creation Form Modal / Card */}
      {form && (
        <div className="rounded-3xl p-6 space-y-4 bg-[var(--bg-card)] border border-cyan-500/30 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
            <Key className="w-5 h-5 text-cyan-400" />
            <span className="font-outfit font-black text-sm text-[var(--text-heading)] uppercase">
              ADD KEYS TO STOCK INVENTORY
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-outfit font-bold text-xs text-[var(--text-heading)] block mb-1">
                Paste License Keys (One per line, Max 100)
              </label>
              <textarea
                value={form.key}
                onChange={e => setForm(p => ({ ...p, key: e.target.value }))}
                placeholder="PRRX-VIP-XXXX-YYYY&#10;PRRX-VIP-AAAA-BBBB"
                className="w-full px-4 py-3 rounded-xl font-mono text-xs text-[var(--text-primary)] placeholder-slate-500 outline-none resize-none h-28 bg-[var(--bg-subtle)] border border-[var(--border-color)] focus:border-cyan-400"
              />
              <p className="font-mono text-[10px] text-cyan-400 mt-1">
                Keys Detected: {(form.key || '').split('\n').filter(l => l.trim()).length}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-outfit font-bold text-xs text-[var(--text-heading)] block mb-1">
                  Panel Platform
                </label>
                <select
                  value={form.product_type}
                  onChange={e => setForm(p => ({ ...p, product_type: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl font-inter text-xs text-[var(--text-primary)] bg-[var(--bg-subtle)] border border-[var(--border-color)] outline-none focus:border-cyan-400"
                >
                  <option value="external">External Panel (Free Fire)</option>
                  <option value="internal">Internal Panel (V7A)</option>
                  <option value="both">Both Panels (Universal Key)</option>
                </select>
              </div>

              <div>
                <label className="font-outfit font-bold text-xs text-[var(--text-heading)] block mb-1">
                  Synced License Duration Plan
                </label>
                <select
                  value={form.duration}
                  onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl font-inter text-xs text-[var(--text-primary)] bg-[var(--bg-subtle)] border border-[var(--border-color)] outline-none focus:border-cyan-400 font-bold"
                >
                  {availableDurations.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setForm(null)}
              className="px-4 py-2 rounded-xl text-xs font-outfit font-bold text-[var(--text-muted)] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !(form.key || '').trim()}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-outfit font-extrabold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-md disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Commit to Stock
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-outfit font-bold text-[var(--text-muted)]">Filters:</span>
          <select
            value={filterPanel}
            onChange={e => setFilterPanel(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-inter text-[var(--text-primary)] outline-none"
          >
            <option value="all">All Panels</option>
            <option value="external">External Only</option>
            <option value="internal">Internal Only</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-inter text-[var(--text-primary)] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available in Stock</option>
            <option value="used">Used / Sold</option>
          </select>
        </div>

        <span className="text-xs font-mono text-cyan-400 font-bold">
          Showing {filteredKeys.length} of {keys.length} keys
        </span>
      </div>

      {/* Keys Ledger Table with Instant "Used" Toggle Checkbox */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl">
          <div className="max-h-[520px] overflow-y-auto custom-scrollbar divide-y divide-[var(--border-color)]">
            {filteredKeys.map(k => {
              const isAvailable = k.status === 'available';
              return (
                <div
                  key={k.id}
                  className={`flex items-center justify-between gap-4 px-5 py-3.5 transition-colors ${
                    isAvailable ? 'hover:bg-cyan-500/[0.03]' : 'opacity-60 bg-slate-950/20'
                  }`}
                >
                  {/* Left: Key & Duration */}
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleUsed(k)}
                      title={isAvailable ? 'Click to mark as SOLD/USED' : 'Click to restore to AVAILABLE'}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                        isAvailable
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:scale-110 hover:bg-emerald-500/25'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:scale-110 hover:bg-amber-500/25'
                      }`}
                    >
                      {isAvailable ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <p className={`font-mono font-bold text-xs truncate ${
                        isAvailable ? 'text-white' : 'text-slate-400 line-through'
                      }`}>
                        {k.key}
                      </p>
                      <p className="font-inter text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">
                        <span className="uppercase text-cyan-400">{k.product_type}</span> · <span className="text-slate-300">{k.duration}</span>
                        {k.used_at && <span className="ml-2 text-amber-400 font-normal">Sold {new Date(k.used_at).toLocaleDateString()}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status Pill & Actions */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleUsed(k)}
                      className={`px-3 py-1 rounded-full font-mono text-[10px] font-extrabold uppercase border cursor-pointer transition-all ${
                        isAvailable
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:border-emerald-400'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:border-amber-400'
                      }`}
                    >
                      {isAvailable ? '✓ In Stock' : '✕ Used / Sold'}
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(k.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Key Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredKeys.length === 0 && (
              <div className="p-12 text-center text-xs font-mono text-[var(--text-muted)]">
                No keys found in inventory matching this filter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
