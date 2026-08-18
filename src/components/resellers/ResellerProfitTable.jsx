import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LayoutGrid, Settings, DollarSign, TrendingUp, ShieldCheck, Sparkles, MessageCircle, Zap, Store } from 'lucide-react';

const DEFAULT_PROFIT_PLANS = {
  external: [
    { label: '1 Week',   days: '7+ Days',   lkr: 400,  jit_rate: 25, reseller_rate: 35, popular: true,  crown: false },
    { label: '2 Weeks',  days: '14+ Days',  lkr: 650,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false },
    { label: '1 Month',  days: '30+ Days',  lkr: 1250, jit_rate: 30, reseller_rate: 40, popular: true,  crown: false },
    { label: '2 Months', days: '60+ Days',  lkr: 1800, jit_rate: 30, reseller_rate: 40, popular: false, crown: false },
    { label: '1 Year',   days: '365 Days',  lkr: 2499, jit_rate: 30, reseller_rate: 40, popular: false, crown: false },
    { label: '2 Years',  days: '730 Days',  lkr: 3400, jit_rate: 30, reseller_rate: 40, popular: false, crown: false },
    { label: 'Until We Developing', days: 'Forever ∞', lkr: 5000, jit_rate: 30, reseller_rate: 40, popular: false, crown: true },
  ],
  internal: [
    { label: '1 Week',   days: '7+ Days',   lkr: 500,  jit_rate: 25, reseller_rate: 35, popular: true,  crown: false },
    { label: '2 Weeks',  days: '14+ Days',  lkr: 800,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false },
    { label: '1 Month',  days: '30+ Days',  lkr: 1600, jit_rate: 30, reseller_rate: 40, popular: true,  crown: false },
    { label: '2 Months', days: '60+ Days',  lkr: 2400, jit_rate: 30, reseller_rate: 40, popular: false, crown: false },
    { label: '1 Year',   days: '365 Days',  lkr: 3500, jit_rate: 30, reseller_rate: 40, popular: false, crown: false },
    { label: '2 Years',  days: '730 Days',  lkr: 4800, jit_rate: 30, reseller_rate: 40, popular: false, crown: false },
    { label: 'Until We Developing', days: 'Forever ∞', lkr: 7000, jit_rate: 30, reseller_rate: 40, popular: false, crown: true },
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
    
    // Just In Time
    const jitRate = Number(p.jit_rate) || (label.includes('1 Day') ? 20 : label.includes('1 Week') ? 25 : 30);
    const jitProfit = Math.round(price * (jitRate / 100));
    const jitPay = p.jit_pay !== undefined ? Number(p.jit_pay) : (price - jitProfit);

    // Reseller
    const resellerRate = Number(p.reseller_rate ?? p.commission_rate) || (label.includes('1 Day') ? 30 : label.includes('1 Week') ? 35 : 40);
    const resellerProfit = Math.round(price * (resellerRate / 100));
    const resellerPay = p.reseller_pay !== undefined ? Number(p.reseller_pay) : (price - resellerProfit);

    return {
      id: p.id || `${panel}-${idx}`,
      item: label,
      days: p.days || label,
      price,
      // JIT
      jitRate,
      jitProfit,
      jitPay,
      // Reseller
      resellerRate,
      resellerProfit,
      resellerPay,
      popular: !!p.popular,
      crown: !!p.crown,
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
              <span className="text-rose-400 font-extrabold text-base sm:text-lg">(Just In Time & Reseller)</span>
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>PRICES AUTO-SYNCED WITH STORE</span>
          </div>
        </div>

        <p className="font-inter text-xs sm:text-sm text-[var(--text-muted)]">
          Compare wholesale pricing between <strong>Just In Time</strong> and <strong>Reseller</strong> tiers. All commission margins, profits, and owner payouts are calculated live in real time!
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

      {/* Modern Multi-Tier Reseller Table */}
      <div className="clean-card rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl bg-[var(--bg-card)]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              {/* Group Tier Level 1 */}
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-subtle)] text-[11px] font-outfit font-black tracking-wider uppercase">
                <th rowSpan={2} className="py-3 px-4 sm:px-6 text-[var(--text-heading)] align-middle border-r border-[var(--border-color)]">
                  PER-ITEM
                </th>
                <th rowSpan={2} className="py-3 px-3 sm:px-4 text-cyan-400 align-middle border-r border-[var(--border-color)]">
                  SELLING PRICE
                </th>
                <th colSpan={3} className="py-2.5 px-3 text-center bg-amber-500/10 text-amber-400 border-r border-[var(--border-color)] font-bold">
                  <div className="flex items-center justify-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>JUST IN TIME</span>
                  </div>
                </th>
                <th colSpan={3} className="py-2.5 px-3 text-center bg-cyan-500/10 text-cyan-400 font-bold">
                  <div className="flex items-center justify-center gap-1.5">
                    <Store className="w-3.5 h-3.5" />
                    <span>RESELLER</span>
                  </div>
                </th>
              </tr>

              {/* Group Tier Level 2 (Sub-columns) */}
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)] text-[10px] font-outfit font-extrabold tracking-wider text-[var(--text-muted)] uppercase">
                {/* JIT Sub-Columns */}
                <th className="py-2.5 px-3 bg-amber-950/10 text-amber-300/90">COMMISSION</th>
                <th className="py-2.5 px-3 bg-amber-950/10 text-emerald-400">PROFIT / ITEM</th>
                <th className="py-2.5 px-3 bg-amber-950/10 text-rose-300 border-r border-[var(--border-color)] text-right">PAY TO OWNER</th>

                {/* Reseller Sub-Columns */}
                <th className="py-2.5 px-3 bg-cyan-950/10 text-cyan-300/90">COMMISSION</th>
                <th className="py-2.5 px-3 bg-cyan-950/10 text-emerald-400">PROFIT / ITEM</th>
                <th className="py-2.5 px-3 bg-cyan-950/10 text-rose-300 text-right pr-4 sm:pr-6">PAY TO OWNER</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-color)] font-inter text-xs">
              <AnimatePresence mode="wait">
                {rows.map((row, idx) => (
                  <motion.tr
                    key={row.id + panel}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Item Name */}
                    <td className="py-3.5 px-4 sm:px-6 font-outfit font-bold text-[var(--text-heading)] border-r border-[var(--border-color)] whitespace-nowrap">
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

                    {/* Selling Price */}
                    <td className="py-3.5 px-3 sm:px-4 font-mono font-bold text-cyan-400 border-r border-[var(--border-color)] whitespace-nowrap">
                      Rs. {row.price.toLocaleString()}
                    </td>

                    {/* === JUST IN TIME COLUMNS === */}
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300/90 whitespace-nowrap bg-amber-950/5">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px]">
                        {row.jitRate}% Rate
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-black text-emerald-400 whitespace-nowrap bg-amber-950/5">
                      Rs. {row.jitProfit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-rose-300 border-r border-[var(--border-color)] text-right whitespace-nowrap bg-amber-950/5">
                      Rs. {row.jitPay.toLocaleString()}
                    </td>

                    {/* === RESELLER COLUMNS === */}
                    <td className="py-3.5 px-3 font-mono font-bold text-cyan-300/90 whitespace-nowrap bg-cyan-950/5">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px]">
                        {row.resellerRate}% Rate
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-black text-emerald-400 whitespace-nowrap bg-cyan-950/5">
                      Rs. {row.resellerProfit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 pr-4 sm:pr-6 font-mono font-bold text-rose-300 text-right whitespace-nowrap bg-cyan-950/5">
                      Rs. {row.resellerPay.toLocaleString()}
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
