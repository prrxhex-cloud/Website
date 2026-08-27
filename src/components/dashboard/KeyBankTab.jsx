import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Key, Plus, Trash2, Check, Shield, CheckCircle2, XCircle, Clock, RefreshCw, Search, Filter, AlertTriangle, ChevronDown, CheckSquare, Square, Copy } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterPanel, setFilterPanel] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Debounce search query input to prevent unnecessary re-computations
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Checkbox multi-selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showPurgeModal, setShowPurgeModal] = useState(null); // 'used' | 'all' | 'duration' | null
  const [purgeDurationTarget, setPurgeDurationTarget] = useState('1 Week');
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const copyKey = (keyValue, keyId) => {
    if (!keyValue) return;
    navigator.clipboard.writeText(keyValue);
    setCopiedId(keyId);
    toast.success('Key copied to clipboard!');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const copySelectedKeys = () => {
    const selectedKeyDocs = keys.filter(k => selectedIds.has(k.id));
    if (selectedKeyDocs.length === 0) return;
    const textToCopy = selectedKeyDocs.map(k => k.key).join('\n');
    navigator.clipboard.writeText(textToCopy);
    toast.success(`Copied ${selectedKeyDocs.length} keys to clipboard!`);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [keySnap, planSnap] = await Promise.allSettled([
        getDocs(query(collection(db, 'license_keys'), orderBy('created_date', 'desc'), limit(10000))),
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

  // Multi-batch saving to support adding hundreds/thousands of keys at once
  const save = async () => {
    const rawKeys = (form.key || '').split('\n').map(k => k.trim()).filter(Boolean);
    if (rawKeys.length === 0) return;

    setSaving(true);
    try {
      const chunkSize = 450;
      const batches = [];

      for (let i = 0; i < rawKeys.length; i += chunkSize) {
        const chunk = rawKeys.slice(i, i + chunkSize);
        const batch = writeBatch(db);

        chunk.forEach(k => {
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

        batches.push(batch.commit());
      }

      await Promise.all(batches);
      toast.success(`🎉 All ${rawKeys.length} key${rawKeys.length > 1 ? 's' : ''} permanently added to stock!`);
      setForm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save keys');
    } finally {
      setSaving(false);
    }
  };

  // Toggle single key used/available
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

  // Single key removal
  const remove = async (id) => {
    try {
      await deleteDoc(doc(db, 'license_keys', id));
      setKeys(prev => prev.filter(k => k.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Key permanently removed');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete key');
    }
  };

  // Master Bulk Delete Engine (Chunked for Firestore limits)
  const executeBatchDelete = async (targetDocIds, successMessage) => {
    if (!targetDocIds || targetDocIds.length === 0) return;
    setIsDeletingBatch(true);
    try {
      const chunkSize = 450;
      const batches = [];

      for (let i = 0; i < targetDocIds.length; i += chunkSize) {
        const chunk = targetDocIds.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(id => {
          batch.delete(doc(db, 'license_keys', id));
        });
        batches.push(batch.commit());
      }

      await Promise.all(batches);
      const deletedSet = new Set(targetDocIds);
      setKeys(prev => prev.filter(k => !deletedSet.has(k.id)));
      setSelectedIds(new Set());
      setShowPurgeModal(null);
      toast.success(successMessage || `Deleted ${targetDocIds.length} keys permanently.`);
    } catch (e) {
      console.error('Batch delete error:', e);
      toast.error('Failed to delete keys in batch');
    } finally {
      setIsDeletingBatch(false);
    }
  };

  // Batch status updater (Mark selected as used or available)
  const executeBatchStatusUpdate = async (targetDocIds, newStatus) => {
    if (!targetDocIds || targetDocIds.length === 0) return;
    setIsDeletingBatch(true);
    try {
      const chunkSize = 450;
      const batches = [];
      const nowIso = new Date().toISOString();

      for (let i = 0; i < targetDocIds.length; i += chunkSize) {
        const chunk = targetDocIds.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(id => {
          batch.update(doc(db, 'license_keys', id), {
            status: newStatus,
            used_at: newStatus === 'used' ? nowIso : null
          });
        });
        batches.push(batch.commit());
      }

      await Promise.all(batches);
      const updatedSet = new Set(targetDocIds);
      setKeys(prev => prev.map(k => updatedSet.has(k.id) ? { ...k, status: newStatus, used_at: newStatus === 'used' ? nowIso : null } : k));
      setSelectedIds(new Set());
      toast.success(`Marked ${targetDocIds.length} keys as ${newStatus.toUpperCase()}!`);
    } catch (e) {
      console.error('Batch update status error:', e);
      toast.error('Failed to update status in batch');
    } finally {
      setIsDeletingBatch(false);
    }
  };

  // Available unique duration options
  const availableDurations = plans.length > 0 
    ? Array.from(new Set(plans.map(p => p.label))).filter(Boolean)
    : ['1 Week', '2 Weeks', '1 Month', '2 Months', '1 Year', '2 Years', 'Until We Developing'];

  const filteredKeys = React.useMemo(() => {
    const trimmed = debouncedSearchQuery.toLowerCase().trim();
    return keys.filter(k => {
      const matchSearch = !trimmed || (k.key || '').toLowerCase().includes(trimmed);
      const matchPanel = filterPanel === 'all' || k.product_type === filterPanel || k.product_type === 'both';
      const matchDuration = filterDuration === 'all' || normalizeDurationKey(k.duration) === normalizeDurationKey(filterDuration);
      const matchStatus = filterStatus === 'all' || k.status === filterStatus;
      return matchSearch && matchPanel && matchDuration && matchStatus;
    });
  }, [keys, debouncedSearchQuery, filterPanel, filterDuration, filterStatus]);

  // Select all / Deselect all
  const allFilteredSelected = filteredKeys.length > 0 && filteredKeys.every(k => selectedIds.has(k.id));
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      filteredKeys.forEach(k => next.add(k.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={load}
            className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white transition-colors"
            title="Refresh Key Bank"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Mass Purge Menu Trigger */}
          <div className="relative group">
            <button
              className="flex items-center gap-1.5 font-outfit font-bold text-xs px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>CLEAN / PURGE KEYS</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-1 z-50 hidden group-hover:block animate-in fade-in duration-200">
              <button
                onClick={() => setShowPurgeModal('used')}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-amber-300 hover:bg-amber-500/15 flex items-center gap-2 transition-colors"
              >
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Delete All Used / Sold Keys</span>
              </button>

              <button
                onClick={() => setShowPurgeModal('duration')}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-cyan-300 hover:bg-cyan-500/15 flex items-center gap-2 transition-colors"
              >
                <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Delete Whole Time Period Keys</span>
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => setShowPurgeModal('all')}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-500/15 flex items-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Delete ALL Keys in Inventory</span>
              </button>
            </div>
          </div>

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

      {/* FLOATING BATCH ACTIONS BAR (Appears when 1+ keys are selected) */}
      {selectedIds.size > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-purple-950/90 border border-cyan-400 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="font-outfit font-bold text-xs text-white">
              Keys Selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => copySelectedKeys()}
              disabled={isDeletingBatch}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Copy all selected keys to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copy Selected ({selectedIds.size})</span>
            </button>

            <button
              onClick={() => executeBatchStatusUpdate(Array.from(selectedIds), 'available')}
              disabled={isDeletingBatch}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark as In-Stock</span>
            </button>

            <button
              onClick={() => executeBatchStatusUpdate(Array.from(selectedIds), 'used')}
              disabled={isDeletingBatch}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Mark as Used/Sold</span>
            </button>

            <button
              onClick={() => executeBatchDelete(Array.from(selectedIds), `Permanently deleted ${selectedIds.size} selected keys.`)}
              disabled={isDeletingBatch}
              className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-outfit font-black text-xs transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeletingBatch ? 'DELETING...' : `Delete Selected (${selectedIds.size})`}</span>
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Key Creation Form Modal */}
      {form && (
        <div className="rounded-3xl p-6 space-y-4 bg-[var(--bg-card)] border border-cyan-500/30 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
            <Key className="w-5 h-5 text-cyan-400" />
            <span className="font-outfit font-black text-sm text-[var(--text-heading)] uppercase">
              ADD KEYS TO STOCK INVENTORY (UNLIMITED BULK PASTE)
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-outfit font-bold text-xs text-[var(--text-heading)] block mb-1">
                Paste License Keys (One per line — supports 1,000+ keys at once)
              </label>
              <textarea
                value={form.key}
                onChange={e => setForm(p => ({ ...p, key: e.target.value }))}
                placeholder="PRRX-VIP-XXXX-YYYY&#10;PRRX-VIP-AAAA-BBBB"
                className="w-full px-4 py-3 rounded-xl font-mono text-xs text-[var(--text-primary)] placeholder-slate-500 outline-none resize-none h-36 bg-[var(--bg-subtle)] border border-[var(--border-color)] focus:border-cyan-400"
              />
              <p className="font-mono text-[11px] text-cyan-400 font-bold mt-1">
                Total Keys Detected: {(form.key || '').split('\n').filter(l => l.trim()).length}
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
                  className="w-full px-3.5 py-2.5 rounded-xl font-inter text-xs text-[var(--text-primary)] bg-[var(--bg-subtle)] border border-[var(--border-color)] outline-none focus:border-cyan-400 font-bold"
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
              <Check className="w-3.5 h-3.5" /> {saving ? 'SAVING ALL KEYS...' : 'Commit All Keys to Stock'}
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION PURGE MODALS */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-950 border border-rose-500/40 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-outfit font-black text-lg text-white">
                {showPurgeModal === 'all' && 'DELETE ALL KEYS IN INVENTORY?'}
                {showPurgeModal === 'used' && 'DELETE ALL USED / SOLD KEYS?'}
                {showPurgeModal === 'duration' && 'DELETE WHOLE TIME PERIOD KEYS?'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {showPurgeModal === 'all' && (
                <>This will permanently delete <strong>ALL {keys.length} keys</strong> across all plans and panels from your database. This action cannot be undone!</>
              )}
              {showPurgeModal === 'used' && (
                <>This will permanently delete all <strong>{keys.filter(k => k.status === 'used').length} used/sold keys</strong> to clean up your database.</>
              )}
              {showPurgeModal === 'duration' && (
                <>Select the duration period to delete all matching keys permanently:</>
              )}
            </p>

            {showPurgeModal === 'duration' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Select Time Period to Delete:</label>
                <select
                  value={purgeDurationTarget}
                  onChange={e => setPurgeDurationTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white outline-none"
                >
                  {availableDurations.map(d => {
                    const norm = normalizeDurationKey(d);
                    const count = keys.filter(k => normalizeDurationKey(k.duration) === norm).length;
                    return (
                      <option key={d} value={d}>{d} ({count} Total Keys)</option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowPurgeModal(null)}
                disabled={isDeletingBatch}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={isDeletingBatch}
                onClick={() => {
                  if (showPurgeModal === 'all') {
                    executeBatchDelete(keys.map(k => k.id), `Permanently deleted all ${keys.length} keys.`);
                  } else if (showPurgeModal === 'used') {
                    const usedIds = keys.filter(k => k.status === 'used').map(k => k.id);
                    executeBatchDelete(usedIds, `Deleted ${usedIds.length} used keys.`);
                  } else if (showPurgeModal === 'duration') {
                    const norm = normalizeDurationKey(purgeDurationTarget);
                    const durationIds = keys.filter(k => normalizeDurationKey(k.duration) === norm).map(k => k.id);
                    executeBatchDelete(durationIds, `Deleted all ${durationIds.length} keys for ${purgeDurationTarget}.`);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-outfit font-black text-xs flex items-center gap-1.5 shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingBatch ? 'PURGING DATABASE...' : 'YES, PERMANENTLY DELETE'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[280px]">
          {/* Select All Checkbox */}
          <button
            onClick={toggleSelectAll}
            title={allFilteredSelected ? "Deselect All" : "Select All Filtered"}
            className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-cyan-400 hover:text-cyan-300"
          >
            {allFilteredSelected ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search key code..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] outline-none focus:border-cyan-400"
            />
          </div>

          {/* Panel Filter */}
          <select
            value={filterPanel}
            onChange={e => setFilterPanel(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-inter text-[var(--text-primary)] outline-none"
          >
            <option value="all">All Panels</option>
            <option value="external">External Only</option>
            <option value="internal">Internal Only</option>
            <option value="both">Universal Only</option>
          </select>

          {/* Duration Filter */}
          <select
            value={filterDuration}
            onChange={e => setFilterDuration(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-inter text-[var(--text-primary)] outline-none font-bold"
          >
            <option value="all">All Durations</option>
            {availableDurations.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Status Filter */}
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

        <span className="text-xs font-mono text-cyan-400 font-bold shrink-0">
          Showing {filteredKeys.length} of {keys.length} total keys
        </span>
      </div>

      {/* Keys Ledger Table with Multi-Checkboxes & Instant Status Toggle */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl">
          <div className="max-h-[580px] overflow-y-auto custom-scrollbar divide-y divide-[var(--border-color)]">
            {filteredKeys.map(k => {
              const isAvailable = k.status === 'available';
              const isSelected = selectedIds.has(k.id);

              return (
                <div
                  key={k.id}
                  className={`flex items-center justify-between gap-4 px-5 py-3.5 transition-colors ${
                    isSelected ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400' : isAvailable ? 'hover:bg-cyan-500/[0.03]' : 'opacity-60 bg-slate-950/20'
                  }`}
                >
                  {/* Left: Checkbox + Status Toggle + Key & Duration */}
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(k.id)}
                      className="text-slate-400 hover:text-cyan-400 shrink-0"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleUsed(k)}
                      title={isAvailable ? 'Click to mark as SOLD/USED' : 'Click to restore to AVAILABLE'}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                        isAvailable
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:scale-110 hover:bg-emerald-500/25'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:scale-110 hover:bg-amber-500/25'
                      }`}
                    >
                      {isAvailable ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p 
                          onClick={() => copyKey(k.key, k.id)}
                          title="Click to copy key"
                          className={`font-mono font-bold text-xs truncate cursor-pointer transition-colors ${
                            isAvailable ? 'text-white hover:text-cyan-300' : 'text-slate-400 line-through hover:text-slate-200'
                          }`}
                        >
                          {k.key}
                        </p>
                        <button
                          type="button"
                          onClick={() => copyKey(k.key, k.id)}
                          className={`p-1 rounded-md transition-all shrink-0 ${
                            copiedId === k.id
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10'
                          }`}
                          title="Copy Key to Clipboard"
                        >
                          {copiedId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="font-inter text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">
                        <span className="uppercase text-cyan-400 font-bold">{k.product_type}</span> · <span className="text-slate-300 font-bold">{k.duration}</span>
                        {k.used_at && <span className="ml-2 text-amber-400 font-normal">Sold {new Date(k.used_at).toLocaleDateString()}</span>}
                        {k.created_date && <span className="ml-2 text-slate-500 font-normal">Added {new Date(k.created_date).toLocaleDateString()}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status Pill & Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => copyKey(k.key, k.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-outfit font-bold border transition-all ${
                        copiedId === k.id
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm'
                          : 'bg-[var(--bg-subtle)] border-[var(--border-color)] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/10'
                      }`}
                      title="Copy Key to Clipboard"
                    >
                      {copiedId === k.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

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
