import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DollarSign, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function PricePlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const DEFAULT_DB_PLANS = [
    { panel_type: 'external', label: '1 Day',    lkr: 150,  days: '1 Day',     popular: false, crown: false, sort_order: 0 },
    { panel_type: 'external', label: '1 Week',   lkr: 500,  days: '7+ Days',   popular: false, crown: false, sort_order: 1 },
    { panel_type: 'external', label: '1 Month',  lkr: 1500, days: '30+ Days',  popular: true,  crown: false, sort_order: 2 },
    { panel_type: 'external', label: 'Lifetime', lkr: 5000, days: 'Forever ∞', popular: false, crown: true,  sort_order: 3 },
    { panel_type: 'internal', label: '1 Day',    lkr: 200,  days: '1 Day',     popular: false, crown: false, sort_order: 0 },
    { panel_type: 'internal', label: '1 Week',   lkr: 700,  days: '7+ Days',   popular: false, crown: false, sort_order: 1 },
    { panel_type: 'internal', label: '1 Month',  lkr: 2000, days: '30+ Days',  popular: true,  crown: false, sort_order: 2 },
    { panel_type: 'internal', label: 'Lifetime', lkr: 7000, days: 'Forever ∞', popular: false, crown: true,  sort_order: 3 },
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
        toast.success('Default plans seeded!');
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
      if (form.id) {
        await updateDoc(doc(db, 'price_plans', form.id), {
          panel_type: form.panel_type,
          label: form.label,
          lkr: Number(form.lkr),
          days: form.days,
          popular: form.popular,
          crown: form.crown,
          sort_order: Number(form.sort_order || 0)
        });
        toast.success('Plan updated');
      } else {
        const newId = crypto.randomUUID();
        await setDoc(doc(db, 'price_plans', newId), {
          panel_type: form.panel_type,
          label: form.label,
          lkr: Number(form.lkr),
          days: form.days,
          popular: form.popular || false,
          crown: form.crown || false,
          sort_order: Number(form.sort_order || 0),
          created_date: new Date().toISOString()
        });
        toast.success('Plan added');
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

  const PlanRow = ({ p }) => (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-outfit font-extrabold text-sm text-[var(--text-heading)]">{p.label}</span>
          {p.popular && <span className="font-inter text-xs px-2 py-0.5 rounded-full bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30 font-bold text-[10px]">⭐ Popular</span>}
          {p.crown && <span className="font-inter text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold text-[10px]">👑 Best Value</span>}
        </div>
        <p className="font-inter text-xs text-[var(--text-muted)] font-medium mt-0.5">LKR {(p.lkr || 0).toLocaleString()} · {p.days}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => setForm({ ...p })} className="p-2 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[#06b6d4] transition-colors">
          <DollarSign className="w-4 h-4" />
        </button>
        <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="font-orbitron text-xs text-primary tracking-wider">PRICE PLANS</p>
        <div className="flex gap-2">
          <button onClick={() => setForm({ panel_type: 'external', label: '', lkr: '', days: '', popular: false, crown: false, sort_order: plans.length + 1 })}
            className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
            <Plus className="w-3.5 h-3.5" /> External Plan
          </button>
          <button onClick={() => setForm({ panel_type: 'internal', label: '', lkr: '', days: '', popular: false, crown: false, sort_order: plans.length + 1 })}
            className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.3)', color: '#ffb400' }}>
            <Plus className="w-3.5 h-3.5" /> Internal Plan
          </button>
        </div>
      </div>

      {form && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,8,28,0.9)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <p className="font-orbitron text-xs text-primary tracking-wider">{form.id ? 'EDIT' : 'NEW'} {form.panel_type?.toUpperCase()} PLAN</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Label (e.g. 1 Month) *"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            <input value={form.lkr} onChange={e => setForm(p => ({ ...p, lkr: e.target.value }))} placeholder="Price LKR *" type="number"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            <input value={form.days} onChange={e => setForm(p => ({ ...p, days: e.target.value }))} placeholder="Days text (e.g. 30+ Days)"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
            <input value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} placeholder="Sort order (1,2,3...)" type="number"
              className="px-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.popular || false} onChange={e => setForm(p => ({ ...p, popular: e.target.checked }))} className="accent-primary" />
              <span className="font-inter text-xs text-muted-foreground">⭐ Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.crown || false} onChange={e => setForm(p => ({ ...p, crown: e.target.checked }))} className="accent-primary" />
              <span className="font-inter text-xs text-muted-foreground">👑 Best Value (Lifetime)</span>
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={save} disabled={saving || !form.label || !form.lkr}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="font-orbitron text-xs mb-3 tracking-wider" style={{ color: '#00d4ff' }}>⚡ EXTERNAL PLANS</p>
            <div className="space-y-2">{external.map(p => <PlanRow key={p.id} p={p} />)}</div>
            {external.length === 0 && <p className="font-inter text-xs text-muted-foreground">No external plans. Using defaults.</p>}
          </div>
          <div>
            <p className="font-orbitron text-xs mb-3 tracking-wider" style={{ color: '#ffb400' }}>🔥 INTERNAL PLANS</p>
            <div className="space-y-2">{internal.map(p => <PlanRow key={p.id} p={p} />)}</div>
            {internal.length === 0 && <p className="font-inter text-xs text-muted-foreground">No internal plans. Using defaults.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
