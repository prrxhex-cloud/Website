import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DollarSign, Plus, Trash2, Check, Percent, TrendingUp, ShieldCheck, Zap, Store, Layers, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function PricePlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const DEFAULT_DB_PLANS = [
    { panel_type: 'external', label: '1 Week',   days: '7 Days Access',   lkr: 400,  reseller_keys_count: 10, jit_rate: 25, reseller_rate: 35, popular: true,  crown: false, sort_order: 0 },
    { panel_type: 'external', label: '2 Weeks',  days: '14 Days Access',  lkr: 650,  reseller_keys_count: 10, jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 1 },
    { panel_type: 'external', label: '1 Month',  days: '30 Days Access',  lkr: 1250, reseller_keys_count: 10, jit_rate: 30, reseller_rate: 40, popular: true,  crown: false, sort_order: 2 },
    { panel_type: 'external', label: '2 Months', days: '60 Days Access',  lkr: 1800, reseller_keys_count: 5,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 3 },
    { panel_type: 'external', label: '1 Year',   days: '365 Days Access', lkr: 2499, reseller_keys_count: 5,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 4 },
    { panel_type: 'external', label: '2 Years',  days: '730 Days Access', lkr: 3400, reseller_keys_count: 3,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 5 },
    { panel_type: 'external', label: 'Until We Developing', days: 'Forever Access', lkr: 5000, reseller_keys_count: 2, jit_rate: 30, reseller_rate: 40, popular: false, crown: true, sort_order: 6 },

    { panel_type: 'internal', label: '1 Week',   days: '7 Days Access',   lkr: 500,  reseller_keys_count: 10, jit_rate: 25, reseller_rate: 35, popular: true,  crown: false, sort_order: 0 },
    { panel_type: 'internal', label: '2 Weeks',  days: '14 Days Access',  lkr: 800,  reseller_keys_count: 10, jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 1 },
    { panel_type: 'internal', label: '1 Month',  days: '30 Days Access',  lkr: 1600, reseller_keys_count: 10, jit_rate: 30, reseller_rate: 40, popular: true,  crown: false, sort_order: 2 },
    { panel_type: 'internal', label: '2 Months', days: '60 Days Access',  lkr: 2400, reseller_keys_count: 5,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 3 },
    { panel_type: 'internal', label: '1 Year',   days: '365 Days Access', lkr: 3500, reseller_keys_count: 5,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 4 },
    { panel_type: 'internal', label: '2 Years',  days: '730 Days Access', lkr: 4800, reseller_keys_count: 3,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 5 },
    { panel_type: 'internal', label: 'Until We Developing', days: 'Forever Access', lkr: 7000, reseller_keys_count: 2, jit_rate: 30, reseller_rate: 40, popular: false, crown: true, sort_order: 6 },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'price_plans'), orderBy('sort_order', 'asc'), limit(100));
      let snap = await getDocs(q);
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (!data || data.length === 0) {
        const batch = writeBatch(db);
        DEFAULT_DB_PLANS.forEach(plan => {
          const newId = crypto.randomUUID();
          const docRef = doc(db, 'price_plans', newId);
          batch.set(docRef, {
            ...plan,
            created_date: new Date().toISOString()
          });
        });
        await batch.commit();
        
        snap = await getDocs(q);
        data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        toast.success('Default plans with Just In Time & Reseller rates seeded!');
      }
      setPlans(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load price plans');
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

      // Allow custom pay to owner if specified, or auto-calculate
      const jitProfit = Math.round(lkrNum * (jitRateNum / 100));
      const jitPayNum = form.jit_pay !== undefined && form.jit_pay !== '' ? Number(form.jit_pay) : (lkrNum - jitProfit);

      const resellerProfit = Math.round(lkrNum * (resellerRateNum / 100));
      const resellerPayNum = form.reseller_pay !== undefined && form.reseller_pay !== '' ? Number(form.reseller_pay) : (lkrNum - resellerProfit);

      const payload = {
        panel_type: form.panel_type,
        label: form.label, // Time Period (e.g. 1 Week, 1 Month)
        days: form.days || `${form.label} Access`,
        lkr: lkrNum,
        reseller_keys_count: keysCountNum, // Bundle key count (e.g. 5, 10)
        reseller_title: form.reseller_title || `${keysCountNum} Keys`, // Main Title
        jit_rate: jitRateNum,
        jit_pay: jitPayNum,
        reseller_rate: resellerRateNum,
        commission_rate: resellerRateNum, // compatibility
        reseller_pay: resellerPayNum,
        popular: !!form.popular,
        crown: !!form.crown,
        sort_order: Number(form.sort_order || 0),
        updated_date: new Date().toISOString()
      };

      if (form.id) {
        await updateDoc(doc(db, 'price_plans', form.id), payload);
        toast.success('Plan, Key Bundle Quantity & Rates updated!');
      } else {
        const newId = crypto.randomUUID();
        await setDoc(doc(db, 'price_plans', newId), {
          ...payload,
          created_date: new Date().toISOString()
        });
        toast.success('New plan added!');
      }
      setForm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteDoc(doc(db, 'price_plans', id));
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plan removed');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete plan');
    }
  };

  const external = plans.filter(p => p.panel_type === 'external').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const internal = plans.filter(p => p.panel_type === 'internal').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const PlanRow = ({ p }) => {
    const price = Number(p.lkr) || 0;
    const keysCount = Number(p.reseller_keys_count) || (p.label?.includes('1 Week') ? 10 : p.label?.includes('2 Weeks') ? 10 : p.label?.includes('1 Month') ? 10 : 5);
    
    // Just In Time
    const jitRate = Number(p.jit_rate) || 25;
    const jitProfit = Math.round(price * (jitRate / 100));
    const jitPay = p.jit_pay !== undefined ? Number(p.jit_pay) : (price - jitProfit);

    // Reseller
    const resellerRate = Number(p.reseller_rate ?? p.commission_rate) || 40;
    const resellerProfit = Math.round(price * (resellerRate / 100));
    const resellerPay = p.reseller_pay !== undefined ? Number(p.reseller_pay) : (price - resellerProfit);

    // Reseller Bundle Math
    const totalBundlePay = resellerPay * keysCount;
    const totalBundleRetail = price * keysCount;
    const totalBundleProfit = resellerProfit * keysCount;

    return (
      <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3 transition-all">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-outfit font-black text-sm text-[var(--text-heading)]">{p.label}</span>
            <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
              📦 Bundle: {keysCount} Keys
            </span>
            {p.popular && <span className="font-inter text-[10px] px-2 py-0.5 rounded-full bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30 font-bold">⭐ Popular</span>}
            {p.crown && <span className="font-inter text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold">👑 Best Value</span>}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
              Per Key: Rs. {price.toLocaleString()}
            </span>
            <button
              onClick={() => setForm({ ...p, reseller_keys_count: keysCount, jit_rate: jitRate, reseller_rate: resellerRate, jit_pay: jitPay, reseller_pay: resellerPay })}
              className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400 text-[var(--text-muted)] hover:text-cyan-400 text-xs font-bold font-inter flex items-center gap-1 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => remove(p.id)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors"
              title="Delete Plan"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Group Comparison Cards (Just In Time & Reseller) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {/* Just In Time */}
          <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
            <div className="text-[10px] font-outfit font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> JUST IN TIME (1 Key)
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-slate-400">Commission:</span>
              <span className="font-bold text-amber-300">{jitRate}% Rate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-slate-400">Profit/Item:</span>
              <span className="font-bold text-emerald-400">Rs. {jitProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-amber-500/10 pt-0.5">
              <span className="text-[10px] text-slate-400">Pay to Owner:</span>
              <span className="font-bold text-rose-300">Rs. {jitPay.toLocaleString()}</span>
            </div>
          </div>

          {/* Reseller Wholesale Bundle */}
          <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-1">
            <div className="text-[10px] font-outfit font-black text-cyan-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1"><Store className="w-3 h-3 text-cyan-400" /> RESELLER ({keysCount} KEYS)</span>
              <span className="text-cyan-300">{resellerRate}% Rate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-slate-400">Bundle Price:</span>
              <span className="font-bold text-cyan-300">Rs. {totalBundlePay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-slate-400">Total Profit:</span>
              <span className="font-bold text-emerald-400">+Rs. {totalBundleProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-cyan-500/10 pt-0.5">
              <span className="text-[10px] text-slate-400">Retail Value:</span>
              <span className="font-bold text-slate-300">Rs. {totalBundleRetail.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-outfit font-extrabold text-base text-[var(--text-heading)]">
            PRICE PLANS, KEY BUNDLES & RESELLER COMMISSION RATES
          </h3>
          <p className="font-inter text-xs text-[var(--text-muted)]">
            Configure Time Period (e.g. 1 Week), Reseller Key Bundle Quantity (e.g. 10 Keys, 5 Keys), and auto-calculated wholesale prices!
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setForm({ panel_type: 'external', label: '', days: '', lkr: '', reseller_keys_count: 10, jit_rate: 25, reseller_rate: 40, popular: false, crown: false, sort_order: plans.length + 1 })}
            className="flex items-center gap-1.5 font-outfit font-bold text-xs px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New External Plan
          </button>
          <button
            onClick={() => setForm({ panel_type: 'internal', label: '', days: '', lkr: '', reseller_keys_count: 10, jit_rate: 25, reseller_rate: 40, popular: false, crown: false, sort_order: plans.length + 1 })}
            className="flex items-center gap-1.5 font-outfit font-bold text-xs px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Internal Plan
          </button>
        </div>
      </div>

      {form && (
        <div className="rounded-3xl p-6 space-y-5 bg-[var(--bg-card)] border border-cyan-500/30 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <span className="font-outfit font-black text-sm text-cyan-400 tracking-wider">
              {form.id ? 'EDIT' : 'NEW'} {form.panel_type?.toUpperCase()} PLAN & KEY BUNDLE SETTINGS
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] font-inter text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* 2. Reseller Key Bundle Quantity */}
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-cyan-500/40 font-mono text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Card Main Title will show: <strong>{form.reseller_keys_count || 10} Keys</strong>
              </span>
            </div>

            {/* 3. Retail Selling Price Per Key */}
            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                Single Key Retail Price (LKR)
              </label>
              <input
                value={form.lkr}
                onChange={e => setForm(p => ({ ...p, lkr: e.target.value }))}
                placeholder="400"
                type="number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] font-inter text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 font-mono font-bold text-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* JUST IN TIME SECTION */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
              <div className="font-outfit font-black text-xs text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> JUST IN TIME SETTINGS (Instant 1 Key)
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

          <div className="flex gap-4 flex-wrap pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-inter">
              <input type="checkbox" checked={form.popular || false} onChange={e => setForm(p => ({ ...p, popular: e.target.checked }))} className="accent-cyan-400" />
              <span>⭐ Highlight as Most Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-inter">
              <input type="checkbox" checked={form.crown || false} onChange={e => setForm(p => ({ ...p, crown: e.target.checked }))} className="accent-amber-400" />
              <span>👑 Best Value (VIP)</span>
            </label>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setForm(null)}
              className="px-4 py-2 rounded-xl text-xs font-outfit font-bold text-[var(--text-muted)] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !form.label || !form.lkr}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-outfit font-extrabold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 transition-all shadow-md disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Save Plan, Bundle & Rates
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="font-outfit font-extrabold text-xs tracking-wider text-cyan-400 flex items-center gap-1.5">
              ⚡ EXTERNAL PANEL PACKAGES ({external.length})
            </p>
            <div className="space-y-3">{external.map(p => <PlanRow key={p.id} p={p} />)}</div>
          </div>

          <div className="space-y-3">
            <p className="font-outfit font-extrabold text-xs tracking-wider text-purple-400 flex items-center gap-1.5">
              🔥 INTERNAL PANEL PACKAGES ({internal.length})
            </p>
            <div className="space-y-3">{internal.map(p => <PlanRow key={p.id} p={p} />)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
