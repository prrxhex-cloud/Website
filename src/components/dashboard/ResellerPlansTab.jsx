import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getFormattedPrices } from '@/lib/currency';
import { Store, Plus, Trash2, Check, Zap, Package, LayoutGrid, Settings, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ResellerPlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resellerSection, setResellerSection] = useState('wholesale'); // 'wholesale' | 'jit'
  const [panelFilter, setPanelFilter] = useState('external'); // 'external' | 'internal'
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('price_plans')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(100);

      if (error) throw error;
      setPlans(data || []);
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
      const category = form.category || resellerSection;

      // Calculations based on category
      const jitRateNum = Number(form.jit_rate) || 25;
      const jitProfit = Math.round(lkrNum * (jitRateNum / 100));
      const jitPayNum = form.jit_pay !== undefined && form.jit_pay !== '' ? Number(form.jit_pay) : (lkrNum - jitProfit);

      const resellerRateNum = Number(form.reseller_rate ?? form.commission_rate) || 40;
      const resellerProfit = Math.round(lkrNum * (resellerRateNum / 100));
      const resellerPayNum = form.reseller_pay !== undefined && form.reseller_pay !== '' ? Number(form.reseller_pay) : (lkrNum - resellerProfit);

      const keysCountNum = Number(form.reseller_keys_count) || (category === 'wholesale' ? 10 : 1);

      const payload = {
        panel_type: form.panel_type || panelFilter,
        category: category, // 'wholesale' or 'jit'
        label: form.label, // Time Period (e.g. 1 Week, 1 Month)
        days: form.days || `${form.label} Access`,
        lkr: lkrNum,
        reseller_keys_count: keysCountNum,
        reseller_title: form.reseller_title || (category === 'wholesale' ? `${keysCountNum} Keys` : `${form.label} Key`),
        jit_rate: jitRateNum,
        jit_pay: jitPayNum,
        reseller_rate: resellerRateNum,
        commission_rate: resellerRateNum,
        reseller_pay: resellerPayNum,
        popular: !!form.popular,
        crown: !!form.crown,
        sort_order: Number(form.sort_order || 0),
        updated_at: new Date().toISOString()
      };

      if (form.id) {
        const { error } = await supabase.from('price_plans').update(payload).eq('id', form.id);
        if (error) throw error;
        toast.success(`${category === 'wholesale' ? 'Wholesale' : 'Just In Time'} Package updated!`);
      } else {
        const { error } = await supabase.from('price_plans').insert({
          ...payload,
          created_at: new Date().toISOString()
        });
        if (error) throw error;
        toast.success(`New ${category === 'wholesale' ? 'Wholesale' : 'Just In Time'} Package created!`);
      }
      setForm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      const { error } = await supabase.from('price_plans').delete().eq('id', id);
      if (error) throw error;
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Package deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete package');
    }
  };

  // Filter plans based on Category (Wholesale vs Just In Time) and Panel (External vs Internal)
  const displayedPlans = plans
    .filter(p => {
      const matchPanel = p.panel_type === panelFilter;
      if (resellerSection === 'wholesale') {
        const matchCategory = p.category === 'wholesale' || (!p.category && p.category !== 'jit');
        return matchPanel && matchCategory;
      } else {
        const matchCategory = p.category === 'jit' || (!p.category && p.category !== 'wholesale');
        return matchPanel && matchCategory;
      }
    })
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Form Live Calculations
  const formPrice = Number(form?.lkr) || 0;
  const formKeysCount = Number(form?.reseller_keys_count) || (resellerSection === 'wholesale' ? 10 : 1);

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
      {/* 1. Main Navigation Mode Tabs (Wholesale Packages vs Just In Time Packages) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
        <div>
          <h2 className="font-outfit font-black text-lg text-[var(--text-heading)] tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5 text-cyan-400" />
            RESELLER PACKAGES & JUST IN TIME MANAGER
          </h2>
          <p className="font-inter text-xs text-[var(--text-muted)] mt-0.5">
            Manage <strong>Wholesale Packages</strong> and <strong>Just In Time Packages</strong> separately with dedicated pricing and commission rates!
          </p>
        </div>

        {/* Category Mode Switcher */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-1 rounded-xl flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => { setResellerSection('wholesale'); setForm(null); }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-outfit font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              resellerSection === 'wholesale'
                ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Wholesale Packages</span>
          </button>

          <button
            onClick={() => { setResellerSection('jit'); setForm(null); }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-outfit font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              resellerSection === 'jit'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Just In Time Packages</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Header: Panel Switcher & Create Package Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Panel Switcher */}
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-color)] p-1 rounded-xl flex items-center gap-1.5 w-fit">
          <button
            onClick={() => setPanelFilter('external')}
            className={`px-3.5 py-1.5 rounded-lg font-outfit font-bold text-xs transition-all flex items-center gap-1.5 ${
              panelFilter === 'external'
                ? 'bg-[var(--bg-card)] text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>External Panel</span>
          </button>

          <button
            onClick={() => setPanelFilter('internal')}
            className={`px-3.5 py-1.5 rounded-lg font-outfit font-bold text-xs transition-all flex items-center gap-1.5 ${
              panelFilter === 'internal'
                ? 'bg-[var(--bg-card)] text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Internal Panel (V7A)</span>
          </button>
        </div>

        {/* Add Button depending on active section */}
        {resellerSection === 'wholesale' ? (
          <button
            onClick={() => setForm({ panel_type: panelFilter, category: 'wholesale', label: '', days: '', lkr: 400, reseller_keys_count: 10, reseller_rate: 40, popular: false, crown: false, sort_order: displayedPlans.length + 1 })}
            className="flex items-center justify-center gap-1.5 font-outfit font-extrabold text-xs px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-md hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Wholesale Package
          </button>
        ) : (
          <button
            onClick={() => setForm({ panel_type: panelFilter, category: 'jit', label: '', days: '', lkr: 400, reseller_keys_count: 1, jit_rate: 25, popular: false, crown: false, sort_order: displayedPlans.length + 1 })}
            className="flex items-center justify-center gap-1.5 font-outfit font-extrabold text-xs px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Just In Time Package
          </button>
        )}
      </div>

      {/* 3. Form Modal / Panel */}
      {form && (
        <div className={`rounded-3xl p-6 space-y-5 bg-[var(--bg-card)] border shadow-2xl animate-in fade-in duration-300 ${
          form.category === 'wholesale' ? 'border-cyan-500/30' : 'border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <span className={`font-outfit font-black text-sm uppercase ${
              form.category === 'wholesale' ? 'text-cyan-400' : 'text-amber-400'
            }`}>
              {form.id ? 'EDIT' : 'NEW'} {form.category === 'wholesale' ? 'WHOLESALE BUNDLE PACKAGE' : 'JUST IN TIME PACKAGE'} · {form.panel_type?.toUpperCase()}
            </span>
          </div>

          {/* Form Fields for Wholesale Packages */}
          {form.category === 'wholesale' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                <div>
                  <label className="text-xs font-bold text-cyan-400 block mb-1">
                    📦 Bundle Keys Count (e.g. 10, 5, 20)
                  </label>
                  <input
                    value={form.reseller_keys_count !== undefined ? form.reseller_keys_count : 10}
                    onChange={e => setForm(p => ({ ...p, reseller_keys_count: e.target.value }))}
                    placeholder="10"
                    type="number"
                    min="1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-400"
                  />
                </div>

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

              {/* Wholesale Rates */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="font-outfit font-black text-xs text-cyan-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Store className="w-4 h-4 text-cyan-400" /> WHOLESALE COMMISSION & PAYOUT</span>
                  <span className="text-[11px] font-bold text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded-md">
                    {formKeysCount} Keys Bundle
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Wholesale Commission Rate (%)</label>
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

                {/* Bundle Math Preview */}
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-cyan-500/20 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Total Bundle Wholesale Price:</span>
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
          ) : (
            /* Form Fields for Just In Time Packages */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                    Time Period / Label (e.g. 1 Week Key, 1 Month Key)
                  </label>
                  <input
                    value={form.label}
                    onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                    placeholder="1 Week Key"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-400 block mb-1">
                    Single Key Retail Price (LKR)
                  </label>
                  <input
                    value={form.lkr}
                    onChange={e => setForm(p => ({ ...p, lkr: e.target.value }))}
                    placeholder="400"
                    type="number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-amber-500/40 text-xs font-mono font-bold text-amber-300 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* JIT Rates */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="font-outfit font-black text-xs text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> JUST IN TIME COMMISSION & PAYOUT (1 Key)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">JIT Commission Rate (%)</label>
                    <input
                      value={form.jit_rate}
                      onChange={e => setForm(p => ({ ...p, jit_rate: e.target.value }))}
                      placeholder="25"
                      type="number"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-amber-500/30 text-xs font-mono font-bold text-amber-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Single Pay to Owner (LKR)</label>
                    <input
                      value={form.jit_pay !== undefined ? form.jit_pay : formJitPay}
                      onChange={e => setForm(p => ({ ...p, jit_pay: e.target.value }))}
                      placeholder="Auto or Custom"
                      type="number"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-amber-500/30 text-xs font-mono font-bold text-rose-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-amber-500/20 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Wholesale Pay to Owner:</span>
                    <span className="font-bold text-rose-300">Rs. {formJitPay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Reseller Profit per Key:</span>
                    <span className="font-bold text-emerald-400">+Rs. {formJitProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              className="px-4 py-2 rounded-xl text-xs font-outfit font-bold text-[var(--text-muted)] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !form.label || !form.lkr}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-outfit font-extrabold text-xs text-slate-950 shadow-md disabled:opacity-50 ${
                form.category === 'wholesale'
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300'
              }`}
            >
              <Check className="w-3.5 h-3.5" /> Save {form.category === 'wholesale' ? 'Wholesale Package' : 'JIT Package'}
            </button>
          </div>
        </div>
      )}

      {/* 4. Packages Grid for Active Section */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedPlans.map(p => {
            const price = Number(p.lkr) || 0;

            if (resellerSection === 'wholesale') {
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
                        onClick={() => setForm({ ...p, category: 'wholesale', reseller_keys_count: keysCount, reseller_rate: resellerRate, reseller_pay: resellerPay })}
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
            } else {
              // Just In Time Card
              const jitRate = Number(p.jit_rate) || 25;
              const jitProfit = Math.round(price * (jitRate / 100));
              const jitPay = p.jit_pay !== undefined && p.jit_pay !== '' ? Number(p.jit_pay) : (price - jitProfit);
              const prices = getFormattedPrices(jitPay);

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-500/40 transition-all shadow-md flex flex-col justify-between space-y-4 relative"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-outfit font-black text-xl text-[var(--text-heading)]">
                        {p.label}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        {jitRate}% JIT MARGIN
                      </span>
                    </div>

                    <p className="text-xs text-amber-400 font-bold mt-0.5">
                      Single Key Instant Access
                    </p>

                    <div className="mt-4">
                      <div className="font-outfit font-black text-3xl text-amber-400">
                        {prices.usd}
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                        LKR {prices.lkr} <span className="text-[10px] text-slate-400 font-normal">(Wholesale 1 Key)</span>
                      </div>

                      <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-400 font-bold flex justify-between">
                        <span>Profit / Key:</span>
                        <span>+Rs. {jitProfit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3">
                    <span className="text-[10px] font-mono text-slate-400">
                      Retail: <strong className="text-slate-300">Rs. {price.toLocaleString()}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setForm({ ...p, category: 'jit', jit_rate: jitRate, jit_pay: jitPay })}
                        className="px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-amber-400 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors"
                      >
                        Edit JIT
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
            }
          })}
        </div>
      )}
    </div>
  );
}
