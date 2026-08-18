import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DollarSign, Plus, Trash2, Check, Percent, TrendingUp, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function PricePlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const DEFAULT_DB_PLANS = [
    { panel_type: 'external', label: '1 Day',    lkr: 150,  days: '1 Day',     commission_rate: 30, popular: false, crown: false, sort_order: 0 },
    { panel_type: 'external', label: '3 Days',   lkr: 350,  days: '3 Days',    commission_rate: 35, popular: false, crown: false, sort_order: 1 },
    { panel_type: 'external', label: '1 Week',   lkr: 700,  days: '7+ Days',   commission_rate: 35, popular: false, crown: false, sort_order: 2 },
    { panel_type: 'external', label: '1 Month',  lkr: 2000, days: '30+ Days',  commission_rate: 40, popular: true,  crown: false, sort_order: 3 },
    { panel_type: 'external', label: '2 Months', lkr: 3000, days: '60+ Days',  commission_rate: 40, popular: false, crown: false, sort_order: 4 },
    { panel_type: 'external', label: 'Lifetime', lkr: 5000, days: 'Forever ∞', commission_rate: 40, popular: false, crown: true,  sort_order: 5 },

    { panel_type: 'internal', label: '1 Day',    lkr: 200,  days: '1 Day',     commission_rate: 30, popular: false, crown: false, sort_order: 0 },
    { panel_type: 'internal', label: '3 Days',   lkr: 450,  days: '3 Days',    commission_rate: 35, popular: false, crown: false, sort_order: 1 },
    { panel_type: 'internal', label: '1 Week',   lkr: 900,  days: '7+ Days',   commission_rate: 35, popular: false, crown: false, sort_order: 2 },
    { panel_type: 'internal', label: '1 Month',  lkr: 2500, days: '30+ Days',  commission_rate: 40, popular: true,  crown: false, sort_order: 3 },
    { panel_type: 'internal', label: '2 Months', lkr: 4000, days: '60+ Days',  commission_rate: 40, popular: false, crown: false, sort_order: 4 },
    { panel_type: 'internal', label: 'Lifetime', lkr: 7000, days: 'Forever ∞', commission_rate: 40, popular: false, crown: true,  sort_order: 5 },
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
        toast.success('Default price & reseller plans seeded!');
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
      const rateNum = Number(form.commission_rate) || 35;
      const lkrNum = Number(form.lkr) || 0;

      if (form.id) {
        await updateDoc(doc(db, 'price_plans', form.id), {
          panel_type: form.panel_type,
          label: form.label,
          lkr: lkrNum,
          days: form.days || form.label,
          commission_rate: rateNum,
          popular: !!form.popular,
          crown: !!form.crown,
          sort_order: Number(form.sort_order || 0)
        });
        toast.success('Plan & reseller rates updated!');
      } else {
        const newId = crypto.randomUUID();
        await setDoc(doc(db, 'price_plans', newId), {
          panel_type: form.panel_type,
          label: form.label,
          lkr: lkrNum,
          days: form.days || form.label,
          commission_rate: rateNum,
          popular: form.popular || false,
          crown: form.crown || false,
          sort_order: Number(form.sort_order || 0),
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
    const rate = Number(p.commission_rate) || (p.label?.includes('1 Day') ? 30 : p.label?.includes('Month') || p.label?.includes('Lifetime') ? 40 : 35);
    const price = Number(p.lkr) || 0;
    const profit = Math.round(price * (rate / 100));
    const pay = price - profit;

    return (
      <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2.5 transition-all">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-outfit font-black text-sm text-[var(--text-heading)]">{p.label}</span>
            {p.popular && <span className="font-inter text-[10px] px-2 py-0.5 rounded-full bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30 font-bold">⭐ Popular</span>}
            {p.crown && <span className="font-inter text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold">👑 Best Value</span>}
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => setForm({ ...p, commission_rate: rate })}
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

        {/* Pricing & Reseller Breakdown Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border-color)] text-xs font-mono">
          <div>
            <span className="text-[10px] text-[var(--text-muted)] block">Selling Price</span>
            <span className="font-bold text-cyan-400">Rs. {price.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] block">Commission Rate</span>
            <span className="font-bold text-purple-400">{rate}% Rate</span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] block">Profit Per Item</span>
            <span className="font-bold text-emerald-400">Rs. {profit.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] block">Pay to Owner</span>
            <span className="font-bold text-rose-400">Rs. {pay.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  // Form Live Calculations
  const formPrice = Number(form?.lkr) || 0;
  const formRate = Number(form?.commission_rate) || 35;
  const formProfit = Math.round(formPrice * (formRate / 100));
  const formPay = formPrice - formProfit;

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-outfit font-extrabold text-base text-[var(--text-heading)]">
            PRICE PLANS & RESELLER COMMISSION RATES
          </h3>
          <p className="font-inter text-xs text-[var(--text-muted)]">
            Changes here automatically sync with both the Prices Page and Resellers Profit Table.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setForm({ panel_type: 'external', label: '', lkr: '', days: '', commission_rate: 35, popular: false, crown: false, sort_order: plans.length + 1 })}
            className="flex items-center gap-1.5 font-outfit font-bold text-xs px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New External Plan
          </button>
          <button
            onClick={() => setForm({ panel_type: 'internal', label: '', lkr: '', days: '', commission_rate: 35, popular: false, crown: false, sort_order: plans.length + 1 })}
            className="flex items-center gap-1.5 font-outfit font-bold text-xs px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Internal Plan
          </button>
        </div>
      </div>

      {form && (
        <div className="rounded-3xl p-6 space-y-4 bg-[var(--bg-card)] border border-cyan-500/30 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-outfit font-black text-sm text-cyan-400 tracking-wider">
              {form.id ? 'EDIT' : 'NEW'} {form.panel_type?.toUpperCase()} PLAN & RESELLER COMMISSION
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">Plan Label (e.g. 1 Month Key)</label>
              <input
                value={form.label}
                onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                placeholder="1 Month Key"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] font-inter text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">Selling Price in LKR (Synced to Prices Page)</label>
              <input
                value={form.lkr}
                onChange={e => setForm(p => ({ ...p, lkr: e.target.value }))}
                placeholder="2000"
                type="number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] font-inter text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">Reseller Commission Rate (%)</label>
              <input
                value={form.commission_rate}
                onChange={e => setForm(p => ({ ...p, commission_rate: e.target.value }))}
                placeholder="30, 35, 40"
                type="number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] font-inter text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 font-mono font-bold text-purple-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">Duration Tag (e.g. 30 Days Access)</label>
              <input
                value={form.days}
                onChange={e => setForm(p => ({ ...p, days: e.target.value }))}
                placeholder="30 Days Access"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] font-inter text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Auto-Calculated Reseller Profit Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-purple-950/40 border border-cyan-500/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Selling Price</span>
              <span className="font-bold text-cyan-300">Rs. {formPrice.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Commission</span>
              <span className="font-bold text-purple-300">{formRate}% Rate</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Profit Per Item (Auto)</span>
              <span className="font-bold text-emerald-400">Rs. {formProfit.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Pay to Owner (Auto)</span>
              <span className="font-bold text-rose-400">Rs. {formPay.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-inter">
              <input type="checkbox" checked={form.popular || false} onChange={e => setForm(p => ({ ...p, popular: e.target.checked }))} className="accent-cyan-400" />
              <span>⭐ Highlight as Most Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-inter">
              <input type="checkbox" checked={form.crown || false} onChange={e => setForm(p => ({ ...p, crown: e.target.checked }))} className="accent-amber-400" />
              <span>👑 Best Value (Lifetime VIP)</span>
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
              <Check className="w-3.5 h-3.5" /> Save Plan & Rates
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
