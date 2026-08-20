import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { normalizeDurationKey } from '@/components/dashboard/KeyBankTab';
import { LayoutGrid, Settings, DollarSign, TrendingUp, ShieldCheck, Sparkles, MessageCircle, Zap, Store, Flame, Crown, Clock, CheckCircle2 } from 'lucide-react';

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

export default function ResellerProfitTable({ onApplyWhatsApp, panel: propPanel, onPanelChange }) {
  const [internalPanel, setInternalPanel] = useState('external');
  const panel = propPanel || internalPanel;
  const setPanel = onPanelChange || setInternalPanel;
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

  // Deduplicate plans so each unique duration time period appears EXACTLY ONCE
  const uniquePlansMap = new Map();
  for (const p of currentRawPlans) {
    const norm = normalizeDurationKey(p.label || p.days || '');
    if (!norm) continue;
    // Prefer plans with explicit reseller rates or keep the first unique
    if (!uniquePlansMap.has(norm)) {
      uniquePlansMap.set(norm, p);
    } else {
      const existing = uniquePlansMap.get(norm);
      // Merge best rates if one has updated rates
      uniquePlansMap.set(norm, {
        ...existing,
        ...p,
        lkr: p.lkr || existing.lkr,
        reseller_rate: p.reseller_rate ?? existing.reseller_rate,
        jit_rate: p.jit_rate ?? existing.jit_rate,
      });
    }
  }

  const uniquePlansList = Array.from(uniquePlansMap.values());

  // Compute live Auto-Calculated profit breakdown for each unique package item
  const rows = uniquePlansList.map((p, idx) => {
    let cleanLabel = p.label || 'VIP Plan';
    if (!cleanLabel.toLowerCase().includes('key')) {
      cleanLabel = `${cleanLabel} Key`;
    }
    const price = Number(p.lkr) || 0;
    
    // Just In Time
    const jitRate = Number(p.jit_rate) || (cleanLabel.includes('1 Day') ? 20 : cleanLabel.includes('1 Week') ? 25 : 30);
    const jitProfit = Math.round(price * (jitRate / 100));
    const jitPay = p.jit_pay !== undefined && p.jit_pay !== '' ? Number(p.jit_pay) : (price - jitProfit);

    // Reseller
    const resellerRate = Number(p.reseller_rate ?? p.commission_rate) || (cleanLabel.includes('1 Day') ? 30 : cleanLabel.includes('1 Week') ? 35 : 40);
    const resellerProfit = Math.round(price * (resellerRate / 100));
    const resellerPay = p.reseller_pay !== undefined && p.reseller_pay !== '' ? Number(p.reseller_pay) : (price - resellerProfit);

    return {
      id: p.id || `${panel}-${idx}`,
      item: cleanLabel,
      days: p.days || cleanLabel,
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
      {/* Header Info & Live Sync Status */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-7 bg-gradient-to-b from-cyan-400 via-teal-400 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
            <div>
              <h2 className="font-outfit font-black text-2xl sm:text-3xl text-[var(--text-heading)] tracking-tight flex items-center gap-2">
                Reseller Wholesale & Profit Breakdown
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE SYNCED WITH STORE PRICES</span>
          </div>
        </div>

        <p className="font-inter text-xs sm:text-sm text-[var(--text-muted)] max-w-3xl">
          Compare wholesale pricing between <strong className="text-amber-400">Just In Time</strong> and <strong className="text-cyan-400">Reseller</strong> tiers. All commission margins, profits, and owner payouts are calculated automatically in real time!
        </p>
      </div>

      {/* Cyber Panel Switcher & Fast Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Toggle (External vs Internal) */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-xl flex items-center gap-2 max-w-md w-full sm:w-auto">
          <button
            onClick={() => setPanel('external')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-outfit font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
              panel === 'external'
                ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-100'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>External Panel</span>
          </button>

          <button
            onClick={() => setPanel('internal')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-outfit font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
              panel === 'internal'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-100'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Internal Panel (V7A)</span>
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Up to <strong className="text-emerald-400">40% Profit</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Key Delivery</span>
          </div>
        </div>
      </div>

      {/* Cyberpunk Glowing Table Container */}
      <div className="relative rounded-[28px] p-0.5 bg-gradient-to-b from-cyan-500/30 via-slate-800/40 to-purple-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="rounded-[26px] bg-[var(--bg-card)] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[860px]">
              {/* Header Tier */}
              <thead>
                {/* Level 1: Category Groups */}
                <tr className="border-b border-[var(--border-color)] bg-slate-950/70 text-xs font-outfit font-black tracking-wider uppercase">
                  <th rowSpan={2} className="py-4 px-5 sm:px-6 text-[var(--text-heading)] align-middle border-r border-[var(--border-color)] min-w-[170px]">
                    <div className="flex items-center gap-1.5">
                      <span>PER-ITEM</span>
                    </div>
                  </th>
                  <th rowSpan={2} className="py-4 px-4 sm:px-5 text-cyan-400 align-middle border-r border-[var(--border-color)] min-w-[130px]">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>SELLING PRICE</span>
                    </div>
                  </th>
                  <th colSpan={3} className="py-3 px-4 text-center border-r border-[var(--border-color)] bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40">
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-outfit font-black text-xs tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>⚡ JUST IN TIME</span>
                    </div>
                  </th>
                  <th colSpan={3} className="py-3 px-4 text-center bg-gradient-to-r from-cyan-950/40 via-cyan-900/30 to-cyan-950/40">
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-outfit font-black text-xs tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                      <Store className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                      <span>🏬 RESELLER</span>
                    </div>
                  </th>
                </tr>

                {/* Level 2: Sub-Columns */}
                <tr className="border-b border-[var(--border-color)] bg-slate-950/40 text-[10px] font-mono font-bold tracking-wider uppercase">
                  {/* JIT */}
                  <th className="py-2.5 px-3 bg-amber-950/15 text-amber-400/90 text-center">COMMISSION</th>
                  <th className="py-2.5 px-3 bg-amber-950/15 text-emerald-400 text-center">PROFIT / ITEM</th>
                  <th className="py-2.5 px-4 bg-amber-950/15 text-rose-300 border-r border-[var(--border-color)] text-right">PAY TO OWNER</th>

                  {/* Reseller */}
                  <th className="py-2.5 px-3 bg-cyan-950/15 text-cyan-400/90 text-center">COMMISSION</th>
                  <th className="py-2.5 px-3 bg-cyan-950/15 text-emerald-400 text-center">PROFIT / ITEM</th>
                  <th className="py-2.5 px-4 sm:px-6 bg-cyan-950/15 text-rose-300 text-right">PAY TO OWNER</th>
                </tr>
              </thead>

              {/* Rows */}
              <tbody className="divide-y divide-[var(--border-color)] font-inter text-xs">
                <AnimatePresence mode="wait">
                  {rows.map((row, idx) => (
                    <motion.tr
                      key={row.id + panel}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.035 }}
                      className="hover:bg-gradient-to-r hover:from-cyan-500/5 hover:via-white/[0.02] hover:to-purple-500/5 transition-all duration-200 group"
                    >
                      {/* Item Name */}
                      <td className="py-4 px-5 sm:px-6 font-outfit font-extrabold text-[var(--text-heading)] border-r border-[var(--border-color)] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm tracking-tight">{row.item}</span>
                          {row.popular && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)] flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 text-cyan-400" /> HOT
                            </span>
                          )}
                          {row.crown && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)] flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5 text-amber-400" /> VIP
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Selling Price */}
                      <td className="py-4 px-4 sm:px-5 font-outfit font-black text-cyan-400 text-sm border-r border-[var(--border-color)] whitespace-nowrap">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-mono font-medium text-slate-400">Rs.</span>
                          <span>{row.price.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* === JUST IN TIME COLUMNS === */}
                      <td className="py-4 px-3 text-center whitespace-nowrap bg-amber-950/[0.08]">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs shadow-sm">
                          {row.jitRate}% Rate
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center whitespace-nowrap bg-amber-950/[0.08]">
                        <span className="font-outfit font-black text-emerald-400 text-sm tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]">
                          Rs. {row.jitProfit.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right border-r border-[var(--border-color)] whitespace-nowrap bg-amber-950/[0.08]">
                        <span className="font-mono font-bold text-rose-300/90 text-xs">
                          Rs. {row.jitPay.toLocaleString()}
                        </span>
                      </td>

                      {/* === RESELLER COLUMNS === */}
                      <td className="py-4 px-3 text-center whitespace-nowrap bg-cyan-950/[0.08]">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs shadow-sm">
                          {row.resellerRate}% Rate
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center whitespace-nowrap bg-cyan-950/[0.08]">
                        <span className="font-outfit font-black text-emerald-400 text-sm tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]">
                          Rs. {row.resellerProfit.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap bg-cyan-950/[0.08]">
                        <span className="font-mono font-bold text-rose-300/90 text-xs">
                          Rs. {row.resellerPay.toLocaleString()}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cyberpunk Call to Action Card */}
      <div className="p-6 sm:p-7 rounded-[28px] bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="font-outfit font-black text-base sm:text-lg text-white flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>Ready to start selling PRRX VIP Panels?</span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Instant automated key generator access, zero-ban guarantee, and 24/7 dedicated admin WhatsApp backing.
          </p>
        </div>

        <button
          onClick={onApplyWhatsApp}
          className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-outfit font-extrabold text-xs tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:scale-105 transition-all shrink-0 w-full sm:w-auto justify-center"
        >
          <MessageCircle className="w-4 h-4 fill-slate-950" />
          <span>APPLY ON WHATSAPP (+94 761 386 077)</span>
        </button>
      </div>
    </div>
  );
}
