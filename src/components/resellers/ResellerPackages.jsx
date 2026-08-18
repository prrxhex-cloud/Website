import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFormattedPrices } from '@/lib/currency';
import { LayoutGrid, Settings, Zap, Store, Crown, Star, Check, Sparkles, MessageCircle, Flame, ArrowRight } from 'lucide-react';

const WHATSAPP_NUMBER = '94761386077';

const DEFAULT_PROFIT_PLANS = {
  external: [
    { label: '1 Week',   days: '7+ Days',   lkr: 400,  jit_rate: 25, reseller_rate: 35, popular: true,  crown: false, sort_order: 0 },
    { label: '2 Weeks',  days: '14+ Days',  lkr: 650,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 1 },
    { label: '1 Month',  days: '30+ Days',  lkr: 1250, jit_rate: 30, reseller_rate: 40, popular: true,  crown: false, sort_order: 2 },
    { label: '2 Months', days: '60+ Days',  lkr: 1800, jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 3 },
    { label: '1 Year',   days: '365 Days',  lkr: 2499, jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 4 },
    { label: '2 Years',  days: '730 Days',  lkr: 3400, jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 5 },
    { label: 'Until We Developing', days: 'Forever ∞', lkr: 5000, jit_rate: 30, reseller_rate: 40, popular: false, crown: true, sort_order: 6 },
  ],
  internal: [
    { label: '1 Week',   days: '7+ Days',   lkr: 500,  jit_rate: 25, reseller_rate: 35, popular: true,  crown: false, sort_order: 0 },
    { label: '2 Weeks',  days: '14+ Days',  lkr: 800,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 1 },
    { label: '1 Month',  days: '30+ Days',  lkr: 1600, jit_rate: 30, reseller_rate: 40, popular: true,  crown: false, sort_order: 2 },
    { label: '2 Months', days: '60+ Days',  lkr: 2400, jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 3 },
    { label: '1 Year',   days: '365 Days',  lkr: 3500, jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 4 },
    { label: '2 Years',  days: '730 Days',  lkr: 4800, jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 5 },
    { label: 'Until We Developing', days: 'Forever ∞', lkr: 7000, jit_rate: 30, reseller_rate: 40, popular: false, crown: true, sort_order: 6 },
  ]
};

export default function ResellerPackages({ panel, onPanelChange }) {
  const [packageType, setPackageType] = useState('reseller'); // 'reseller' or 'jit'
  const [plans, setPlans] = useState(() => {
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
            setPlans(formatted);
            localStorage.setItem('prrx_cached_plans', JSON.stringify(formatted));
          }
        }
      } catch (err) {
        console.warn('Fallback to defaults:', err);
      }
    };
    fetchLivePlans();
    return () => { isMounted = false; };
  }, []);

  const currentPlans = Array.isArray(plans?.[panel]) && plans[panel].length > 0
    ? plans[panel]
    : (DEFAULT_PROFIT_PLANS[panel] || []);

  const handleOrderWhatsApp = (p, ownerPrice, profitAmount, commissionRate) => {
    const typeLabel = packageType === 'reseller' ? 'Reseller Wholesale Package' : 'Just In Time Package';
    const panelLabel = panel === 'internal' ? 'Internal Panel (V7A)' : 'External Panel (Free Fire)';

    const message = `Hello PRRX HEX Admin! 👋
I want to order this Reseller Package:

📦 Package: ${p.label} Key (${p.days || 'Access'})
💻 Panel Version: ${panelLabel}
🏷️ Model: ${typeLabel}
💵 Owner Wholesale Price: LKR ${ownerPrice.toLocaleString()}
📈 Commission Rate: ${commissionRate}% Rate
🎉 Profit Per Key: LKR ${profitAmount.toLocaleString()}

Please provide bank transfer details & activate my keys!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-8 text-left font-inter">
      {/* Section Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WHOLESALE KEY BUNDLES</span>
        </div>
        <h2 className="font-outfit font-black text-3xl sm:text-4xl text-[var(--text-heading)] tracking-tight">
          PACKAGES
        </h2>
        <p className="font-inter text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl mx-auto">
          Choose between <strong>Reseller Wholesale Packages</strong> (Maximum Margins) and <strong>Just In Time Packages</strong> (Fast Turnaround).
        </p>
      </div>

      {/* 2 Package Model Tabs (Reseller Wholesale vs Just In Time) */}
      <div className="flex justify-center">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-2 max-w-xl w-full">
          <button
            onClick={() => setPackageType('reseller')}
            className={`w-full sm:w-1/2 px-5 py-3 rounded-xl font-outfit font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
              packageType === 'reseller'
                ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Reseller Wholesale Packages</span>
          </button>

          <button
            onClick={() => setPackageType('jit')}
            className={`w-full sm:w-1/2 px-5 py-3 rounded-xl font-outfit font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
              packageType === 'jit'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Just In Time Packages</span>
          </button>
        </div>
      </div>

      {/* Panel Switcher (External vs Internal) */}
      <div className="flex justify-center">
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-color)] p-1 rounded-xl flex items-center gap-1.5">
          <button
            onClick={() => onPanelChange('external')}
            className={`px-4 py-2 rounded-lg font-outfit font-bold text-xs transition-all flex items-center gap-1.5 ${
              panel === 'external'
                ? 'bg-[var(--bg-card)] text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>External Panel</span>
          </button>

          <button
            onClick={() => onPanelChange('internal')}
            className={`px-4 py-2 rounded-lg font-outfit font-bold text-xs transition-all flex items-center gap-1.5 ${
              panel === 'internal'
                ? 'bg-[var(--bg-card)] text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Internal Panel (V7A)</span>
          </button>
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentPlans.map((p, i) => {
          const sellingPrice = Number(p.lkr) || 0;

          // Determine rate & owner wholesale price
          let rate = 40;
          let ownerPrice = 0;
          let profitAmount = 0;

          if (packageType === 'reseller') {
            rate = Number(p.reseller_rate ?? p.commission_rate) || (p.label?.includes('1 Day') ? 30 : p.label?.includes('1 Week') ? 35 : 40);
            profitAmount = Math.round(sellingPrice * (rate / 100));
            ownerPrice = p.reseller_pay !== undefined ? Number(p.reseller_pay) : (sellingPrice - profitAmount);
          } else {
            rate = Number(p.jit_rate) || (p.label?.includes('1 Day') ? 20 : p.label?.includes('1 Week') ? 25 : 30);
            profitAmount = Math.round(sellingPrice * (rate / 100));
            ownerPrice = p.jit_pay !== undefined ? Number(p.jit_pay) : (sellingPrice - profitAmount);
          }

          const prices = getFormattedPrices(ownerPrice);
          const sellingPrices = getFormattedPrices(sellingPrice);

          const isCrown = p.crown;
          const isPopular = p.popular;

          return (
            <motion.div
              key={p.id || `${p.label}-${panel}-${packageType}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`clean-card p-6 flex flex-col justify-between relative bg-[var(--bg-card)] border transition-all duration-300 rounded-3xl ${
                isCrown
                  ? 'border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:border-amber-400'
                  : isPopular
                  ? 'border-[#06b6d4] shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                  : 'border-[var(--border-color)] hover:border-cyan-500/40'
              } text-left shadow-xl`}
            >
              <div>
                {/* Badges */}
                {isCrown && (
                  <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-outfit font-extrabold text-[11px] tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> BEST VALUE
                  </div>
                )}
                {isPopular && !isCrown && (
                  <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white font-outfit font-extrabold text-[11px] tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" /> MOST POPULAR
                  </div>
                )}

                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-outfit font-black text-2xl text-[var(--text-heading)] tracking-tight">
                      {p.label}
                    </h3>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      packageType === 'reseller'
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    }`}>
                      {rate}% MARGIN
                    </span>
                  </div>
                  <p className="font-inter text-xs text-[var(--text-muted)] font-medium mt-1">
                    {p.days || 'Duration Access'}
                  </p>
                </div>

                {/* Price Box */}
                <div className="my-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`font-outfit font-black text-4xl ${
                      packageType === 'reseller' ? 'text-[#06b6d4]' : 'text-amber-400'
                    }`}>
                      {prices.usd}
                    </span>
                  </div>

                  <div className="font-inter text-xs font-bold text-[var(--text-heading)] mt-0.5">
                    LKR {prices.lkr} <span className="text-[10px] text-[var(--text-muted)] font-normal">(Wholesale Price)</span>
                  </div>

                  {/* Reseller Profit Gain Pill */}
                  <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                    <span>Your Profit:</span>
                    <span>+Rs. {profitAmount.toLocaleString()} / key</span>
                  </div>

                  <div className="font-inter text-[11px] text-[var(--text-muted)] mt-1.5 flex justify-between">
                    <span>Retail Selling Price:</span>
                    <span className="font-bold text-[var(--text-primary)]">LKR {sellingPrices.lkr}</span>
                  </div>
                </div>

                <div className="border-t border-[var(--border-color)] my-4" />

                {/* Features checklist */}
                <div className="space-y-2.5 mb-6 text-xs font-inter text-[var(--text-primary)]">
                  {[
                    '100% Undetected Anti-Cheat Bypass',
                    'All Functions Included',
                    'Instant Auto-Key Delivery',
                    'Main Account Safe (HWID Spoof)',
                    '24/7 Priority Reseller Support',
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order CTA */}
              <button
                onClick={() => handleOrderWhatsApp(p, ownerPrice, profitAmount, rate)}
                className={`w-full py-3.5 px-4 rounded-xl font-outfit font-extrabold text-xs tracking-wider text-center flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 shadow-md ${
                  isCrown
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                    : packageType === 'reseller'
                    ? 'btn-primary-cyan btn-glow'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>ORDER PACKAGE NOW</span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
