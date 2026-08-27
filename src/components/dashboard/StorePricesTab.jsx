import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getFormattedPrices } from '@/lib/currency';
import { DollarSign, Plus, Trash2, Check, LayoutGrid, Settings, Star, Crown, Flame } from 'lucide-react';
import { toast } from 'sonner';

export default function StorePricesTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [panelFilter, setPanelFilter] = useState('external'); // 'external' | 'internal'

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
      toast.error('Failed to load prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const lkrNum = Number(form.lkr) || 0;
      const payload = {
        panel_type: form.panel_type || 'external',
        label: form.label,
        days: form.days || `${form.label} Access`,
        lkr: lkrNum,
        popular: !!form.popular,
        crown: !!form.crown,
        sort_order: Number(form.sort_order || 0),
        updated_at: new Date().toISOString()
      };

      if (form.id) {
        const { error } = await supabase.from('price_plans').update(payload).eq('id', form.id);
        if (error) throw error;
        toast.success('Prices page plan updated!');
      } else {
        const { error } = await supabase.from('price_plans').insert({
          ...payload,
          jit_rate: 25,
          reseller_rate: 40,
          reseller_keys_count: 10,
          created_at: new Date().toISOString()
        });
        if (error) throw error;
        toast.success('New store plan added!');
      }
      setForm(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save store plan');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      const { error } = await supabase.from('price_plans').delete().eq('id', id);
      if (error) throw error;
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plan deleted from store');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete plan');
    }
  };

  const displayedPlans = plans
    .filter(p => p.panel_type === panelFilter)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="space-y-6 text-left font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-outfit font-black text-xl text-[var(--text-heading)] tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            PRICES PAGE CATALOG MANAGER
          </h2>
          <p className="font-inter text-xs text-[var(--text-muted)] mt-1">
            Manage public retail prices, durations, and promo badges shown on your customer <strong className="text-cyan-400">Prices Page (#/prices)</strong>.
          </p>
        </div>

        <button
          onClick={() => setForm({ panel_type: panelFilter, label: '', days: '', lkr: '', popular: false, crown: false, sort_order: displayedPlans.length + 1 })}
          className="flex items-center gap-1.5 font-outfit font-extrabold text-xs px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-md hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Store Plan
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
            <span>External Panel (Free Fire) ({plans.filter(p => p.panel_type === 'external').length})</span>
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
            <span>Internal Panel (V7A) ({plans.filter(p => p.panel_type === 'internal').length})</span>
          </button>
        </div>
      </div>

      {/* Edit Form Modal */}
      {form && (
        <div className="rounded-3xl p-6 space-y-4 bg-[var(--bg-card)] border border-cyan-500/30 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <span className="font-outfit font-black text-sm text-cyan-400 uppercase">
              {form.id ? 'EDIT STORE PLAN' : 'NEW STORE PLAN'} · {form.panel_type?.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                Plan Name / Label (e.g. 1 Month)
              </label>
              <input
                value={form.label}
                onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                placeholder="1 Month"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                Duration Subtitle (e.g. 30 Days Access)
              </label>
              <input
                value={form.days}
                onChange={e => setForm(p => ({ ...p, days: e.target.value }))}
                placeholder="30 Days Access"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-cyan-400 block mb-1">
                Retail Price in LKR (e.g. 1250)
              </label>
              <input
                value={form.lkr}
                onChange={e => setForm(p => ({ ...p, lkr: e.target.value }))}
                placeholder="1250"
                type="number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-cyan-500/40 text-xs font-mono font-bold text-cyan-400 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex gap-4 flex-wrap pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-inter">
              <input type="checkbox" checked={form.popular || false} onChange={e => setForm(p => ({ ...p, popular: e.target.checked }))} className="accent-cyan-400" />
              <span>⭐ Highlight as Most Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-inter">
              <input type="checkbox" checked={form.crown || false} onChange={e => setForm(p => ({ ...p, crown: e.target.checked }))} className="accent-amber-400" />
              <span>👑 Best Value (VIP Plan)</span>
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
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-outfit font-extrabold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-md disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Save Store Price
            </button>
          </div>
        </div>
      )}

      {/* Plans List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedPlans.map(p => {
            const prices = getFormattedPrices(p.lkr);
            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-500/40 transition-all shadow-md flex flex-col justify-between space-y-4 relative"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-outfit font-black text-lg text-[var(--text-heading)]">
                      {p.label}
                    </h3>
                    <div className="flex items-center gap-1">
                      {p.popular && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">⭐ Popular</span>}
                      {p.crown && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">👑 Best Value</span>}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                    {p.days || 'Duration Access'}
                  </p>

                  <div className="mt-4">
                    <div className="font-outfit font-black text-3xl text-cyan-400">
                      {prices.usd}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                      LKR {prices.lkr}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    Panel: <strong className="text-cyan-400">{p.panel_type}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setForm(p)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-colors"
                    >
                      Edit Price
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Plan"
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
