import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Settings, DollarSign, TrendingUp, ShieldCheck, Sparkles, MessageCircle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

const PROFIT_DATA = {
  external: [
    { item: '1 Day Key', days: '24 Hours', price: 150, rate: 30, profit: 45, pay: 105, color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { item: '3 Days Key', days: '72 Hours', price: 350, rate: 35, profit: 122.5, pay: 227.5, color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
    { item: '7 Days Key (1 Wk)', days: '7 Days', price: 700, rate: 35, profit: 245, pay: 455, color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
    { item: '1 Month Key (30 Days)', days: '30 Days', price: 2000, rate: 40, profit: 800, pay: 1200, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30', popular: true },
    { item: '2 Months Key (60 Days)', days: '60 Days', price: 3000, rate: 40, profit: 1200, pay: 1800, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
    { item: 'Lifetime Key (VIP)', days: 'Permanent', price: 5000, rate: 40, profit: 2000, pay: 3000, color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30', crown: true },
  ],
  internal: [
    { item: '1 Day Key', days: '24 Hours', price: 200, rate: 30, profit: 60, pay: 140, color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { item: '3 Days Key', days: '72 Hours', price: 450, rate: 35, profit: 157.5, pay: 292.5, color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
    { item: '7 Days Key (1 Wk)', days: '7 Days', price: 900, rate: 35, profit: 315, pay: 585, color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
    { item: '1 Month Key (30 Days)', days: '30 Days', price: 2500, rate: 40, profit: 1000, pay: 1500, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30', popular: true },
    { item: '2 Months Key (60 Days)', days: '60 Days', price: 4000, rate: 40, profit: 1600, pay: 2400, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
    { item: 'Lifetime Key (VIP)', days: 'Permanent', price: 7000, rate: 40, profit: 2800, pay: 4200, color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30', crown: true },
  ]
};

export default function ResellerProfitTable({ onApplyWhatsApp }) {
  const [panel, setPanel] = useState('external');

  const rows = PROFIT_DATA[panel] || PROFIT_DATA.external;

  return (
    <div className="space-y-6 text-left">
      {/* Title & Commission Rate Badge */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-gradient-to-b from-rose-500 to-red-600 rounded-sm" />
            <h2 className="font-outfit font-black text-xl sm:text-2xl text-[var(--text-heading)] tracking-tight flex items-center gap-2">
              Per-Item Reseller Profit Breakdown{' '}
              <span className="text-rose-400 font-extrabold text-base sm:text-lg">(30% - 40%)</span>
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> High Margins Guaranteed
          </div>
        </div>

        <p className="font-inter text-xs sm:text-sm text-[var(--text-muted)]">
          Earn instant profits on every single key sold. No minimum threshold — pay only wholesale owner price and keep all margin profits!
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

      {/* Modern Table Container */}
      <div className="clean-card rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl bg-[var(--bg-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-subtle)] text-[11px] font-outfit font-black tracking-wider text-[var(--text-heading)] uppercase">
                <th className="py-4 px-4 sm:px-6">PACKAGE ITEM</th>
                <th className="py-4 px-3 sm:px-4">SELLING PRICE</th>
                <th className="py-4 px-3 sm:px-4">COMMISSION</th>
                <th className="py-4 px-3 sm:px-4 text-emerald-400">PROFIT PER ITEM</th>
                <th className="py-4 px-4 sm:px-6 text-right">PAY TO OWNER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-inter text-xs sm:text-sm">
              <AnimatePresence mode="wait">
                {rows.map((row, idx) => (
                  <motion.tr
                    key={row.item + panel}
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

                    {/* Selling Price */}
                    <td className="py-4 px-3 sm:px-4 font-mono font-bold text-slate-300">
                      Rs. {row.price.toLocaleString()}
                    </td>

                    {/* Commission Rate Badge */}
                    <td className="py-4 px-3 sm:px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg font-outfit font-black text-xs border bg-gradient-to-r ${row.color}`}>
                        {row.rate}% Rate
                      </span>
                    </td>

                    {/* Profit per Item (Green highlight) */}
                    <td className="py-4 px-3 sm:px-4 font-mono font-black text-emerald-400">
                      <div className="flex items-center gap-1">
                        <span>Rs. {row.profit.toLocaleString()}</span>
                        <span className="text-[10px] text-emerald-500/80 font-normal">/ item</span>
                      </div>
                    </td>

                    {/* Pay to Owner */}
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
            <span>Want to start selling PRRX VIP Panels today?</span>
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
