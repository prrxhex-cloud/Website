import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFormattedPrices } from '@/lib/currency';
import { Store, Plus, Trash2, Check, Zap, Package, LayoutGrid, Settings, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ResellerPlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [panelFilter, setPanelFilter] = useState('external'); // 'external' | 'internal'

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'price_plans'), orderBy('sort_order', 'asc'), limit(100));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlans(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load reseller plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const lkrNum = Number(form.lkr) || 0;
      const jitRateNum = Number(form.jit_rate) || 25;
      const resellerRateNum = Number(form.reseller_rate ?? form.commission_rate) || 40;
      const keysCountNum = Number(form.reseller_keys_count) || 10;

      // Calculate payouts
      const jitProfit = Math.round(lkrNum * (jitRateNum / 100));
      const jitPayNum = form.jit_pay !== undefined && form.jit_pay !== '' ? Number(form.jit_pay) : (lkrNum - jitProfit);

      const resellerProfit = Math.round(lkrNum * (resellerRateNum / 100));
      const resellerPayNum = form.reseller_pay !== undefined && form.reseller_pay !== '' ? Number(form.reseller_pay) : (lkrNum - resellerProfit);

      const payload = {
        panel_type: form.panel_type || 'external',
        label: form.label, // Time Period (e.g. 1 Week, 1 Month)
        days: form.days || `${form.label} Access`,
        lkr: lkrNum,
        reseller_keys_count: keysCountNum, // Bundle key count (e.g. 10, 5)
        reseller_title: form.reseller_title || `${keysCountNum} Keys`, // Main Title
        jit_rate: jitRateNum,
        jit_pay: jitPayNum,
        reseller_rate: resellerRateNum,
        commission_rate: resellerRateNum,
        reseller_pay: resellerPayNum,
        popular: !!form.popular,
        crown: !!form.crown,
        sort_order: Number(form.sort_order || 0),
        updated_date: new Date().toISOString()
      };

      if (form.id) {
        await updateDoc(doc(db, 'price_plans', form.id), payload);
        toast.success('Reseller Package & Bundle rates updated!');
      } else {
        const newId = crypto.randomUUID();
        await setDoc(doc(db, 'price_plans', newId), {
          ...payload,
          created_date: new Date().toISOString()
        });
        toast.success('New Reseller Wholesale Package added!');
      }
      setForm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save reseller package');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteDoc(doc(db, 'price_plans', id));
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Package deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete package');
    }
  };

  const displayedPlans = plans
    .filter(p => p.panel_type === panelFilter)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Form Live Calculations
  const formPrice = Number(form?.lkr) || 0;
  const formKeysCount = Number(form?.reseller_keys_count) || 10;

  const formJitRate = Number(form?.jit_rate) || 25;
  const formJitProfit = Math.round(formPrice * (formJitRate / 100));
  const formJitPay = form?.jit_pay !== undefined && form.jit_pay !== '' ? Number(form.jit_pay) : (formPrice - formJitProfit);

  const formResellerRate = Number(form?.reseller_rate ?? form?.commission_rate) || 40;
  const formResellerProfit = Math.round(formPrice * (formResellerRate / 100));
  const formResellerPay = form?.reseller_pay !== undefined && form.reseller_pay !== '' ? Number(form.reseller_pay) : (formPrice - formResellerProfit);

  const formBundleWholesalePay = formResellerPay * formKeysCount;
  const formBundleRetailValue = formPrice * formKeysCount;
  const formBundleTotalProfit = formResellerProfit * formKeysCount;

  return (
    <div className="space-y-6 text-left font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-outfit font-black text-xl text-[var(--text-heading)] tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5 text-cyan-400" />
            RESELLER PACKAGES & COMMISSION RATES
          </h2>
          <p className="font-inter text-xs text-[var(--text-muted)] mt-1">
            Configure key bundle counts (e.g. 10 Keys, 5 Keys), commission rates, and wholesale owner prices shown on <strong className="text-cyan-400">Reseller Page (#/resellers)</strong>!
          </p>
        </div>

        <button
          onClick={() => setForm({ panel_type: panelFilter, label: '', days: '', lkr: 400, reseller_keys_count: 10, jit_rate: 25, reseller_rate: 40, popular: false, crown: false, sort_order: displayedPlans.length + 1 })}
          className="flex items-center gap-1.5 font-outfit font-extrabold text-xs px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Reseller Package
        </button>
      </div>

      {/* Panel Filter Toggle */}
      <div className="flex justify-start">
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-color)] p-1 rounded-xl flex items-center gap-1.5">
          <button
            onClick={() => setPanelFilter('external')}
            className={`px-4 py-2 rounded-lg font-outfit font-bold text-xs transition-all flex items-center gap-1.5 ${
              panelFilter === 'external'
                ? 'bg-[var(--bg-card)] text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>External Panel Bundles ({plans.filter(p => p.panel_type === 'external').length})</span>
          </button>

          <button
            onClick={() => setPanelFilter('internal')}
            className={`px-4 py-2 rounded-lg font-outfit font-bold text-xs transition-all flex items-center gap-1.5 ${
              panelFilter === 'internal'
                ? 'bg-[var(--bg-card)] text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Internal Panel Bundles ({plans.filter(p => p.panel_type === 'internal').length})</span>
          </button>
        </div>
      </div>

      {/* Edit Form Modal */}
      {form && (
        <div className="rounded-3xl p-6 space-y-5 bg-[var(--bg-card)] border border-cyan-500/30 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <span className="font-outfit font-black text-sm text-cyan-400 uppercase">
              {form.id ? 'EDIT RESELLER PACKAGE' : 'NEW RESELLER PACKAGE'} · {form.panel_type?.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Time Period */}
            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                Time Period (e.g. 1 Week, 1 Month)
              </label>
              <input
                value={form.label}
                onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                placeholder="1 Week"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-400"
              />
            </div>

            {/* 2. Bundle Keys Count */}
            <div>
              <label className="text-xs font-bold text-cyan-400 block mb-1">
                📦 Reseller Bundle Keys Count (e.g. 10, 5)
              </label>
              <input
                value={form.reseller_keys_count !== undefined ? form.reseller_keys_count : 10}
                onChange={e => setForm(p => ({ ...p, reseller_keys_count: e.target.value }))}
                placeholder="10"
                type="number"
                min="1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Card Title will display: <strong>{form.reseller_keys_count || 10} Keys</strong>
              </span>
            </div>

            {/* 3. Retail Price per Key */}
            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                Single Key Retail Price (LKR)
              </label>
              <input
                value={form.lkr}
                onChange={e => setForm(p => ({ ...p, lkr: e.target.value }))}
                placeholder="400"
                type="number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs font-mono font-bold text-cyan-400 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* JUST IN TIME SECTION */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
              <div className="font-outfit font-black text-xs text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> JUST IN TIME SETTINGS (1 Key)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Commission Rate (%)</label>
                  <input
                    value={form.jit_rate}
                    onChange={e => setForm(p => ({ ...p, jit_rate: e.target.value }))}
                    placeholder="25"
                    type="number"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-amber-500/30 text-xs font-mono font-bold text-amber-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Pay to Owner (LKR)</label>
                  <input
                    value={form.jit_pay !== undefined ? form.jit_pay : formJitPay}
                    onChange={e => setForm(p => ({ ...p, jit_pay: e.target.value }))}
                    placeholder="Auto or Custom"
                    type="number"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-amber-500/30 text-xs font-mono font-bold text-rose-300 focus:outline-none"
                  />
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex justify-between pt-1 border-t border-amber-500/20">
                <span>Profit per Key:</span>
                <span className="text-emerald-400 font-bold">Rs. {formJitProfit.toLocaleString()}</span>
              </div>
            </div>

            {/* RESELLER WHOLESALE BUNDLE SECTION */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div className="font-outfit font-black text-xs text-cyan-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Store className="w-4 h-4 text-cyan-400" /> RESELLER WHOLESALE BUNDLE</span>
                <span className="text-[11px] font-bold text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded-md">
                  {formKeysCount} Keys Pack
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Commission Rate (%)</label>
                  <input
                    value={form.reseller_rate ?? form.commission_rate}
                    onChange={e => setForm(p => ({ ...p, reseller_rate: e.target.value, commission_rate: e.target.value }))}
                    placeholder="40"
                    type="number"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Single Pay to Owner (LKR)</label>
                  <input
                    value={form.reseller_pay !== undefined ? form.reseller_pay : formResellerPay}
                    onChange={e => setForm(p => ({ ...p, reseller_pay: e.target.value }))}
                    placeholder="Auto or Custom"
                    type="number"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-cyan-500/30 text-xs font-mono font-bold text-rose-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Bundle Math Preview */}
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-cyan-500/20 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Total Bundle Wholesale:</span>
                  <span className="font-bold text-cyan-300">Rs. {formBundleWholesalePay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Reseller Profit:</span>
                  <span className="font-bold text-emerald-400">+Rs. {formBundleTotalProfit.toLocaleString()} (Rs. {formResellerProfit}/key)</span>
                </div>
                <div className="flex justify-between text-slate-400 border-t border-white/5 pt-1">
                  <span>Total Retail Value:</span>
                  <span className="font-bold text-slate-300">Rs. {formBundleRetailValue.toLocaleString()}</span>
                </div>
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
              disabled={saving || !form.label || !form.lkr}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-outfit font-extrabold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Save Reseller Package
            </button>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedPlans.map(p => {
            const price = Number(p.lkr) || 0;
            const keysCount = Number(p.reseller_keys_count) || (p.label?.includes('1 Week') ? 10 : p.label?.includes('2 Weeks') ? 10 : p.label?.includes('1 Month') ? 10 : 5);

            const resellerRate = Number(p.reseller_rate ?? p.commission_rate) || 40;
            const resellerProfit = Math.round(price * (resellerRate / 100));
            const resellerPay = p.reseller_pay !== undefined && p.reseller_pay !== '' ? Number(p.reseller_pay) : (price - resellerProfit);

            const totalBundlePay = resellerPay * keysCount;
            const totalBundleProfit = resellerProfit * keysCount;
            const prices = getFormattedPrices(totalBundlePay);

            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-500/40 transition-all shadow-md flex flex-col justify-between space-y-4 relative"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-outfit font-black text-xl text-[var(--text-heading)]">
                      {keysCount} Keys Pack
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {resellerRate}% MARGIN
                    </span>
                  </div>

                  <p className="text-xs text-cyan-400 font-bold mt-0.5">
                    {p.label} Access
                  </p>

                  <div className="mt-4">
                    <div className="font-outfit font-black text-3xl text-cyan-400">
                      {prices.usd}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                      LKR {prices.lkr} <span className="text-[10px] text-slate-400 font-normal">({keysCount} Keys Wholesale)</span>
                    </div>

                    <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-400 font-bold flex justify-between">
                      <span>Total Profit:</span>
                      <span>+Rs. {totalBundleProfit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3">
                  <span className="text-[10px] font-mono text-slate-400">
                    Retail/Key: <strong className="text-slate-300">Rs. {price.toLocaleString()}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setForm({ ...p, reseller_keys_count: keysCount, reseller_rate: resellerRate, reseller_pay: resellerPay })}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-colors"
                    >
                      Edit Bundle
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
