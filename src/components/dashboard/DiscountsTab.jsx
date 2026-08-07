import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Check, X, Tag } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FORM = {
  panel_type: 'external',
  plan_label: '',
  discount_type: 'percentage',
  discount_value: '',
  promo_code: '',
  badge_text: 'SALE',
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
    const data = await base44.entities.Discount.list('-created_date', 50);
    setDiscounts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.discount_value) return;
    setSaving(true);
    const payload = {
      ...form,
      discount_value: Number(form.discount_value),
      plan_label: form.plan_label || null,
      promo_code: form.promo_code || null,
      badge_text: form.badge_text || null,
      expires_at: form.expires_at || null,
    };
    if (form.id) {
      await base44.entities.Discount.update(form.id, payload);
      toast.success('Discount updated');
    } else {
      await base44.entities.Discount.create(payload);
      toast.success('Discount created');
    }
    setForm(null);
    load();
    setSaving(false);
  };

  const remove = async (id) => {
    await base44.entities.Discount.delete(id);
    setDiscounts(prev => prev.filter(d => d.id !== id));
    toast.success('Discount removed');
  };

  const toggle = async (d) => {
    await base44.entities.Discount.update(d.id, { active: !d.active });
    toast.success(d.active ? 'Discount paused' : 'Discount activated');
    load();
  };

  const panelColor = (t) => t === 'external' ? '#00d4ff' : t === 'internal' ? '#aa44ff' : '#ffaa00';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="font-orbitron text-xs text-primary tracking-wider">DISCOUNTS & PROMO CODES</p>
        <button onClick={() => setForm({ ...EMPTY_FORM })}
          className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
          <Plus className="w-3.5 h-3.5" /> New Discount
        </button>
      </div>

      {form && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,8,28,0.9)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <p className="font-orbitron text-xs text-primary tracking-wider">{form.id ? 'EDIT' : 'NEW'} DISCOUNT</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Panel type */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Panel</p>
              <select value={form.panel_type} onChange={e => setForm(p => ({ ...p, panel_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }}>
                <option value="external">External</option>
                <option value="internal">Internal</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Discount type */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Type</p>
              <select value={form.discount_type} onChange={e => setForm(p => ({ ...p, discount_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (LKR)</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Value ({form.discount_type === 'percentage' ? '%' : 'LKR'})</p>
              <input value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))}
                type="number" placeholder={form.discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            </div>

            {/* Plan label (optional) */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Plan (optional, blank = all)</p>
              <input value={form.plan_label} onChange={e => setForm(p => ({ ...p, plan_label: e.target.value }))}
                placeholder="e.g. 1 Month"
                className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            </div>

            {/* Promo code */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Promo Code (display only)</p>
              <input value={form.promo_code} onChange={e => setForm(p => ({ ...p, promo_code: e.target.value }))}
                placeholder="e.g. SUMMER25"
                className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            </div>

            {/* Badge text */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Badge Text</p>
              <input value={form.badge_text} onChange={e => setForm(p => ({ ...p, badge_text: e.target.value }))}
                placeholder="e.g. SALE, LIMITED, HOT"
                className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            </div>

            {/* Expires */}
            <div>
              <p className="font-inter text-xs text-muted-foreground mb-1">Expires (optional)</p>
              <input value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                type="date"
                className="w-full px-3 py-2 rounded-lg font-inter text-sm text-foreground outline-none"
                style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={save} disabled={saving || !form.discount_value}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {discounts.map(d => {
            const expired = d.expires_at && new Date(d.expires_at) < new Date();
            return (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${d.active && !expired ? panelColor(d.panel_type) + '25' : 'rgba(255,255,255,0.05)'}`, opacity: d.active && !expired ? 1 : 0.5 }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${panelColor(d.panel_type)}12`, border: `1px solid ${panelColor(d.panel_type)}30` }}>
                  <Tag className="w-4 h-4" style={{ color: panelColor(d.panel_type) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-orbitron font-bold text-xs" style={{ color: panelColor(d.panel_type) }}>
                      {d.discount_type === 'percentage' ? `${d.discount_value}% OFF` : `LKR ${d.discount_value} OFF`}
                    </span>
                    <span className="font-inter text-xs text-muted-foreground capitalize">{d.panel_type} panel</span>
                    {d.plan_label && <span className="font-inter text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(200,220,240,0.6)' }}>{d.plan_label}</span>}
                    {d.promo_code && <span className="font-orbitron text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>{d.promo_code}</span>}
                    {d.badge_text && <span className="font-orbitron font-bold text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,80,80,0.12)', color: '#ff6060', border: '1px solid rgba(255,80,80,0.25)' }}>{d.badge_text}</span>}
                    {expired && <span className="font-inter text-xs text-red-400">EXPIRED</span>}
                    {d.expires_at && !expired && <span className="font-inter text-xs text-muted-foreground">Exp: {d.expires_at}</span>}
                  </div>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5">{d.active ? '● Active' : '○ Paused'}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setForm({ ...d })} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
                    <Tag className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggle(d)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors">
                    {d.active ? <X className="w-3.5 h-3.5 text-yellow-400" /> : <Check className="w-3.5 h-3.5 text-green-400" />}
                  </button>
                  <button onClick={() => remove(d.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {discounts.length === 0 && <p className="text-center font-inter text-xs text-muted-foreground py-6">No discounts yet. Create one to show on pricing page.</p>}
        </div>
      )}
    </div>
  );
}