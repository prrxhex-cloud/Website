import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Check, X, Tag, Copy, Sparkles, Flame, Eye, Percent } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FORM = {
  panel_type: 'both',
  plan_label: '',
  discount_type: 'percentage',
  discount_value: '20',
  promo_code: 'PRRX20',
  badge_text: '20% OFF FLASH SALE',
  active: true,
  expires_at: '',
};

export default function DiscountsTab() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load discounts');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.discount_value) return;
    setSaving(true);
    const payload = {
      ...form,
      id: form.id || form.promo_code?.toUpperCase().trim() || `DISC-${Date.now()}`,
      discount_value: Number(form.discount_value),
      promo_code: form.promo_code ? form.promo_code.toUpperCase().trim() : null,
      plan_label: form.plan_label || null,
      badge_text: form.badge_text || null,
      expires_at: form.expires_at || null,
      created_date: form.created_date || new Date().toISOString(),
    };
    try {
      if (form.id) {
        const { error } = await supabase.from('discounts').update(payload).eq('id', form.id);
        if (error) throw error;
        toast.success('Discount updated successfully');
      } else {
        const { error } = await supabase.from('discounts').insert(payload);
        if (error) throw error;
        toast.success('Discount created and live on website');
      }
      setForm(null);
      load();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save discount');
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this discount code?')) return;
    try {
      const { error } = await supabase.from('discounts').delete().eq('id', id);
      if (error) throw error;
      setDiscounts(prev => prev.filter(d => d.id !== id));
      toast.success('Discount removed successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove discount');
    }
  };

  const toggle = async (d) => {
    try {
      const { error } = await supabase.from('discounts').update({ active: !d.active }).eq('id', d.id);
      if (error) throw error;
      toast.success(d.active ? 'Discount paused' : 'Discount activated');
      load();
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle discount');
    }
  };

  const copyPromoInfo = (d) => {
    const text = `🔥 PRRX HEX SPECIAL DISCOUNT! Use code "${d.promo_code || 'VIP'}" for ${d.discount_type === 'percentage' ? `${d.discount_value}% OFF` : `LKR ${d.discount_value} OFF`} on https://prrxhex.com/#/prices`;
    navigator.clipboard.writeText(text);
    toast.success('Promo message copied to clipboard!');
  };

  const applyPreset = (type, val, code, badge) => {
    setForm(p => ({
      ...p,
      discount_type: type,
      discount_value: String(val),
      promo_code: code,
      badge_text: badge
    }));
  };

  const panelColor = (t) => t === 'external' ? '#00d4ff' : t === 'internal' ? '#aa44ff' : '#10b981';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="font-orbitron text-xs text-primary tracking-wider">DISCOUNTS & PROMO CODES</p>
          <p className="font-inter text-[11px] text-muted-foreground mt-0.5">Manage live discounts, coupon codes, and pricing countdown banners</p>
        </div>
        <button onClick={() => setForm({ ...EMPTY_FORM })}
          className="flex items-center gap-1.5 font-inter text-xs px-3.5 py-2 rounded-xl font-bold shadow-md transition-transform hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(6,182,212,0.4)', color: '#00d4ff' }}>
          <Plus className="w-3.5 h-3.5" /> New Promo / Discount
        </button>
      </div>

      {form && (
        <div className="rounded-2xl p-5 space-y-4 shadow-xl" style={{ background: 'rgba(0,8,28,0.95)', border: '1px solid rgba(6,182,212,0.3)' }}>
          <div className="flex items-center justify-between">
            <p className="font-orbitron text-xs text-primary tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {form.id ? 'EDIT' : 'CREATE'} DISCOUNT OR PROMO CODE
            </p>
            <span className="text-[10px] text-muted-foreground font-mono">LIVE SYNCED TO /PRICES</span>
          </div>

          {/* Quick Presets */}
          <div>
            <p className="font-inter text-[11px] text-muted-foreground mb-1.5 font-semibold">Quick Presets:</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => applyPreset('percentage', 10, 'VIP10', '10% OFF VIP')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60">
                10% OFF (VIP10)
              </button>
              <button type="button" onClick={() => applyPreset('percentage', 20, 'PRRX20', '20% OFF SALE')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60">
                20% OFF (PRRX20)
              </button>
              <button type="button" onClick={() => applyPreset('percentage', 50, 'HEX50', '50% OFF MEGA SALE')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60">
                50% OFF (HEX50)
              </button>
              <button type="button" onClick={() => applyPreset('fixed', 500, 'SAVE500', 'LKR 500 OFF')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 hover:bg-amber-900/60">
                LKR 500 OFF (SAVE500)
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Panel type */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Target Panel</p>
              <select value={form.panel_type} onChange={e => setForm(p => ({ ...p, panel_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl font-inter text-sm text-foreground outline-none bg-slate-900/90 border border-cyan-500/20">
                <option value="both">Both (External & Internal)</option>
                <option value="external">External Panel Only</option>
                <option value="internal">Internal Panel Only</option>
              </select>
            </div>

            {/* Discount type */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Discount Type</p>
              <select value={form.discount_type} onChange={e => setForm(p => ({ ...p, discount_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl font-inter text-sm text-foreground outline-none bg-slate-900/90 border border-cyan-500/20">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (LKR)</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Discount Value ({form.discount_type === 'percentage' ? '%' : 'LKR'})</p>
              <input value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))}
                type="number" placeholder={form.discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                className="w-full px-3 py-2 rounded-xl font-inter text-sm text-foreground outline-none bg-slate-900/90 border border-cyan-500/20" />
            </div>

            {/* Promo code */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Coupon / Promo Code (Uppercase)</p>
              <input value={form.promo_code} onChange={e => setForm(p => ({ ...p, promo_code: e.target.value.toUpperCase() }))}
                placeholder="e.g. PRRX20"
                className="w-full px-3 py-2 rounded-xl font-mono text-sm text-cyan-300 font-bold outline-none bg-slate-900/90 border border-cyan-500/20" />
            </div>

            {/* Plan label */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Specific Plan (optional, blank = all plans)</p>
              <input value={form.plan_label} onChange={e => setForm(p => ({ ...p, plan_label: e.target.value }))}
                placeholder="e.g. 1 Month, Lifetime (or leave blank)"
                className="w-full px-3 py-2 rounded-xl font-inter text-sm text-foreground outline-none bg-slate-900/90 border border-cyan-500/20" />
            </div>

            {/* Badge text */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Badge Text Banner</p>
              <input value={form.badge_text} onChange={e => setForm(p => ({ ...p, badge_text: e.target.value }))}
                placeholder="e.g. 20% OFF FLASH SALE, LIMITED TIME"
                className="w-full px-3 py-2 rounded-xl font-inter text-sm text-foreground outline-none bg-slate-900/90 border border-cyan-500/20" />
            </div>

            {/* Expires */}
            <div className="sm:col-span-2">
              <p className="font-inter text-xs text-muted-foreground mb-1">Expiration Date (optional)</p>
              <input value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                type="date"
                className="w-full px-3 py-2 rounded-xl font-inter text-sm text-foreground outline-none bg-slate-900/90 border border-cyan-500/20" />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold">
              <Eye className="w-3.5 h-3.5" /> Live Preview on Pricing Page:
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold px-2.5 py-1 rounded-md">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                {form.badge_text || `${form.discount_value || 0}${form.discount_type === 'percentage' ? '%' : ' LKR'} OFF`}
              </span>
              {form.promo_code && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  CODE: {form.promo_code}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setForm(null)} className="px-4 py-2 rounded-xl font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button onClick={save} disabled={saving || !form.discount_value}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-orbitron text-xs font-bold disabled:opacity-50 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: '#000' }}>
              <Check className="w-3.5 h-3.5" /> {form.id ? 'Update Discount' : 'Publish Discount'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2.5">
          {discounts.map(d => {
            const expired = d.expires_at && new Date(d.expires_at) < new Date();
            return (
              <div key={d.id} className="flex items-center gap-3 p-3.5 rounded-2xl transition-all"
                style={{ background: 'rgba(0,15,35,0.85)', border: `1px solid ${d.active && !expired ? panelColor(d.panel_type) + '35' : 'rgba(255,255,255,0.06)'}`, opacity: d.active && !expired ? 1 : 0.6 }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${panelColor(d.panel_type)}15`, border: `1px solid ${panelColor(d.panel_type)}35` }}>
                  <Tag className="w-4 h-4" style={{ color: panelColor(d.panel_type) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-orbitron font-extrabold text-sm" style={{ color: panelColor(d.panel_type) }}>
                      {d.discount_type === 'percentage' ? `${d.discount_value}% OFF` : `LKR ${d.discount_value} OFF`}
                    </span>
                    <span className="font-inter text-xs text-muted-foreground capitalize px-2 py-0.5 rounded-md bg-white/5">{d.panel_type} panel</span>
                    {d.plan_label && <span className="font-inter text-xs px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/20 text-cyan-300">{d.plan_label}</span>}
                    {d.promo_code && <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">CODE: {d.promo_code}</span>}
                    {d.badge_text && <span className="font-orbitron font-bold text-xs px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/30">{d.badge_text}</span>}
                    {expired && <span className="font-inter text-xs text-red-400 font-bold">EXPIRED</span>}
                    {d.expires_at && !expired && <span className="font-inter text-xs text-muted-foreground">Exp: {d.expires_at}</span>}
                  </div>
                  <p className="font-inter text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${d.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    {d.active ? 'Active on Storefront' : 'Paused / Inactive'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => copyPromoInfo(d)} title="Copy shareable promo text"
                    className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-muted-foreground hover:text-cyan-300 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setForm({ ...d })} title="Edit discount"
                    className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-muted-foreground hover:text-cyan-300 transition-colors">
                    <Tag className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggle(d)} title={d.active ? 'Pause discount' : 'Activate discount'}
                    className="p-2 rounded-xl bg-white/5 hover:bg-yellow-500/20 text-muted-foreground hover:text-yellow-400 transition-colors">
                    {d.active ? <X className="w-3.5 h-3.5 text-yellow-400" /> : <Check className="w-3.5 h-3.5 text-green-400" />}
                  </button>
                  <button onClick={() => remove(d.id)} title="Delete discount"
                    className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {discounts.length === 0 && <p className="text-center font-inter text-xs text-muted-foreground py-8">No discounts active yet. Click "New Promo / Discount" to create one!</p>}
        </div>
      )}
    </div>
  );
}