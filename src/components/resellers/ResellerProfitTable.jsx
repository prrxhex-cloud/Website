import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LayoutGrid, Settings, DollarSign, TrendingUp, ShieldCheck, Sparkles, MessageCircle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

const DEFAULT_PROFIT_PLANS = {
  external: [
    { label: '1 Day Key', days: '24 Hours', lkr: 150, commission_rate: 30, color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { label: '3 Days Key', days: '72 Hours', lkr: 350, commission_rate: 35, color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
    { label: '7 Days Key (1 Wk)', days: '7 Days', lkr: 700, commission_rate: 35, color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
    { label: '1 Month Key (30 Days)', days: '30 Days', lkr: 2000, commission_rate: 40, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30', popular: true },
    { label: '2 Months Key (60 Days)', days: '60 Days', lkr: 3000, commission_rate: 40, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
    { label: 'Lifetime Key (VIP)', days: 'Permanent', lkr: 5000, commission_rate: 40, color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30', crown: true },
  ],
  internal: [
    { label: '1 Day Key', days: '24 Hours', lkr: 200, commission_rate: 30, color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { label: '3 Days Key', days: '72 Hours', lkr: 450, commission_rate: 35, color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
    { label: '7 Days Key (1 Wk)', days: '7 Days', lkr: 900, commission_rate: 35, color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
    { label: '1 Month Key (30 Days)', days: '30 Days', lkr: 2500, commission_rate: 40, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30', popular: true },
    { label: '2 Months Key (60 Days)', days: '60 Days', lkr: 4000, commission_rate: 40, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
    { label: 'Lifetime Key (VIP)', days: 'Permanent', lkr: 7000, commission_rate: 40, color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30', crown: true },
  ]
};

export default function ResellerProfitTable({ onApplyWhatsApp }) {
  const [panel, setPanel] = useState('external');
  const [syncedPlans, setSyncedPlans] = useState(() => {
    try {
      const cached = localStorage.getItem('prrx_cached_plans');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.external) && Array.isArray(parsed.internal)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached plans', e);
    }
    return DEFAULT_PROFIT_PLANS;
  });

  // Auto-sync real price plans from Firestore database in real-time
  useEffect(() => {
    let isMounted = true;
    const fetchLivePlans = async () => {
      try {
        const q = query(collection(db, 'price_plans'), orderBy('sort_order', 'asc'));
        const snap = await getDocs(q);
        if (isMounted && !snap.empty) {
          const planData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const externalPlans = planData.filter(p => p.panel_type === 'external');
          const internalPlans = planData.filter(p => p.panel_type === 'internal');

          if (externalPlans.length > 0 || internalPlans.length > 0) {
            const formatted = {
              external: externalPlans.length > 0 ? externalPlans : DEFAULT_PROFIT_PLANS.external,
              internal: internalPlans.length > 0 ? internalPlans : DEFAULT_PROFIT_PLANS.internal,
            };
            setSyncedPlans(formatted);
            localStorage.setItem('prrx_cached_plans', JSON.stringify(formatted));
          }
        }
      } catch (err) {
        console.warn('Reseller table fallback to cached plans:', err);
      }
    };

    fetchLivePlans();
    return () => { isMounted = false; };
  }, []);

  const currentRawPlans = Array.isArray(syncedPlans?.[panel]) && syncedPlans[panel].length > 0
    ? syncedPlans[panel]
    : (DEFAULT_PROFIT_PLANS[panel] || []);

  // Compute live Auto-Calculated profit breakdown for each package item
  const rows = currentRawPlans.map((p, idx) => {
    const label = p.label?.includes('Key') ? p.label : `${p.label} Key`;
    const price = Number(p.lkr) || 0;
    
    // Determine commission rate (from DB or default tiered: 30% for 1d, 35% for 3/7d, 40% for month/lifetime)
    const rate = Number(p.commission_rate) || (
      label.includes('1 Day') ? 30 :
      label.includes('3 Day') || label.includes('1 Week') || label.includes('7 Day') ? 35 :
      40
    );

    // Auto-calculate Profit per Item and Pay to Owner with 100% precision
    const profitPerItem = Math.round(price * (rate / 100));
    const payToOwner = price - profitPerItem;

    const color = rate >= 40 
      ? 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
      : rate >= 35 
      ? 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30'
      : 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30';

    return {
      id: p.id || `${panel}-${idx}`,
      item: label,
      days: p.days || label,
      price,
      rate,
      profit: profitPerItem,
      pay: payToOwner,
      popular: !!p.popular,
      crown: !!p.crown,
      color,
    };
  });

  return (
    <div className="space-y-6 text-left font-inter">
      {/* Title & Live Sync Badge */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-gradient-to-b from-rose-500 to-red-600 rounded-sm" />
            <h2 className="font-outfit font-black text-xl sm:text-2xl text-[var(--text-heading)] tracking-tight flex items-center gap-2">
              Per-Item Reseller Profit Breakdown{' '}
              <span className="text-rose-400 font-extrabold text-base sm:text-lg">(30% - 40%)</span>
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>PRICES AUTO-SYNCED WITH STORE</span>
          </div>
        </div>

        <p className="font-inter text-xs sm:text-sm text-[var(--text-muted)]">
          Selling prices and reseller commission rates are auto-synced with store catalogs. Wholesale owner prices and profit margins are calculated automatically in real time!
        </p>
      </div>

      {/* Panel Toggle (Matching Prices Page) */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-md flex items-center gap-2 max-w-md">
        <button
          onClick={() => setPanel('external')}
          className={`flex-1 px-4 py-2.5 rounded-xl font-outfit font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
            panel === 'external'
              ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-md'
              : 'text-[var(--text-primary)] hover:text-[var(--text-heading)]'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>External Panel</span>
        </button>

        <button
          onClick={() => setPanel('internal')}
          className={`flex-1 px-4 py-2.5 rounded-xl font-outfit font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
            panel === 'internal'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-[var(--text-primary)] hover:text-[var(--text-heading)]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Internal Panel (V7A)</span>
        </button>
      </div>

      {/* Modern Reseller Table */}
      <div className="clean-card rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl bg-[var(--bg-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-subtle)] text-[11px] font-outfit font-black tracking-wider text-[var(--text-heading)] uppercase">
                <th className="py-4 px-4 sm:px-6">PER-ITEM</th>
                <th className="py-4 px-3 sm:px-4">SELLING PRICE</th>
                <th className="py-4 px-3 sm:px-4">COMMISSION</th>
                <th className="py-4 px-3 sm:px-4 text-emerald-400">PROFIT PER ITEM (AUTO)</th>
                <th className="py-4 px-4 sm:px-6 text-right text-rose-400">PAY TO OWNER (AUTO)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-inter text-xs sm:text-sm">
              <AnimatePresence mode="wait">
                {rows.map((row, idx) => (
                  <motion.tr
                    key={row.id + panel}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Item Name */}
                    <td className="py-4 px-4 sm:px-6 font-outfit font-bold text-[var(--text-heading)]">
                      <div className="flex items-center gap-2">
                        <span>{row.item}</span>
                        {row.popular && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            HOT
                          </span>
                        )}
                        {row.crown && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            VIP
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Selling Price (Auto Synced with Prices Page) */}
                    <td className="py-4 px-3 sm:px-4 font-mono font-bold text-cyan-400">
                      Rs. {row.price.toLocaleString()}
                    </td>

                    {/* Commission Rate Badge */}
                    <td className="py-4 px-3 sm:px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg font-outfit font-black text-xs border bg-gradient-to-r ${row.color}`}>
                        {row.rate}% Rate
                      </span>
                    </td>

                    {/* Profit per Item (Auto Calculated) */}
                    <td className="py-4 px-3 sm:px-4 font-mono font-black text-emerald-400">
                      <div className="flex items-center gap-1">
                        <span>Rs. {row.profit.toLocaleString()}</span>
                        <span className="text-[10px] text-emerald-500/80 font-normal">/ item</span>
                      </div>
                    </td>

                    {/* Pay to Owner (Auto Calculated) */}
                    <td className="py-4 px-4 sm:px-6 text-right font-mono font-bold text-rose-300">
                      Rs. {row.pay.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Reseller Perks Banner & WhatsApp Action */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-950/90 via-cyan-950/30 to-slate-950/90 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-outfit font-extrabold text-sm sm:text-base text-white flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Ready to start selling PRRX VIP Panels?</span>
          </div>
          <p className="text-xs text-slate-400">
            Instant authorization, bulk key generator access, and 24/7 direct admin support.
          </p>
        </div>

        <button
          onClick={onApplyWhatsApp}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-outfit font-extrabold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0 w-full sm:w-auto justify-center"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>APPLY ON WHATSAPP (+94 761 386 077)</span>
        </button>
      </div>
    </div>
  );
}
