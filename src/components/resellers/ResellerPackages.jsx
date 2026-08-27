import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { getFormattedPrices } from '@/lib/currency';
import BuyModal from '@/components/pricing/BuyModal';
import { normalizeDurationKey } from '@/components/dashboard/KeyBankTab';
import { LayoutGrid, Settings, Zap, Store, Crown, Star, Check, Sparkles, MessageCircle, Flame, AlertTriangle, ShieldCheck, Lock, Package } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_PROFIT_PLANS = {
  external: [
    { label: '1 Week',   days: '7 Days Access',   lkr: 400,  reseller_keys_count: 10, jit_rate: 25, reseller_rate: 35, popular: true,  crown: false, sort_order: 0 },
    { label: '2 Weeks',  days: '14 Days Access',  lkr: 650,  reseller_keys_count: 10, jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 1 },
    { label: '1 Month',  days: '30 Days Access',  lkr: 1250, reseller_keys_count: 10, jit_rate: 30, reseller_rate: 40, popular: true,  crown: false, sort_order: 2 },
    { label: '2 Months', days: '60 Days Access',  lkr: 1800, reseller_keys_count: 5,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 3 },
    { label: '1 Year',   days: '365 Days Access', lkr: 2499, reseller_keys_count: 5,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 4 },
    { label: '2 Years',  days: '730 Days Access', lkr: 3400, reseller_keys_count: 3,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 5 },
    { label: 'Until We Developing', days: 'Forever Access', lkr: 5000, reseller_keys_count: 2, jit_rate: 30, reseller_rate: 40, popular: false, crown: true, sort_order: 6 },
  ],
  internal: [
    { label: '1 Week',   days: '7 Days Access',   lkr: 500,  reseller_keys_count: 10, jit_rate: 25, reseller_rate: 35, popular: true,  crown: false, sort_order: 0 },
    { label: '2 Weeks',  days: '14 Days Access',  lkr: 800,  reseller_keys_count: 10, jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 1 },
    { label: '1 Month',  days: '30 Days Access',  lkr: 1600, reseller_keys_count: 10, jit_rate: 30, reseller_rate: 40, popular: true,  crown: false, sort_order: 2 },
    { label: '2 Months', days: '60 Days Access',  lkr: 2400, reseller_keys_count: 5,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 3 },
    { label: '1 Year',   days: '365 Days Access', lkr: 3500, reseller_keys_count: 5,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 4 },
    { label: '2 Years',  days: '730 Days Access', lkr: 4800, reseller_keys_count: 3,  jit_rate: 30, reseller_rate: 40, popular: false, crown: false, sort_order: 5 },
    { label: 'Until We Developing', days: 'Forever Access', lkr: 7000, reseller_keys_count: 2, jit_rate: 30, reseller_rate: 40, popular: false, crown: true, sort_order: 6 },
  ]
};

export default function ResellerPackages({ panel, onPanelChange }) {
  const [packageType, setPackageType] = useState('reseller'); // 'reseller' or 'jit'
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [keysStock, setKeysStock] = useState([]);

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
    const fetchLivePlansAndStock = async () => {
      try {
        const [planRes, keyRes] = await Promise.allSettled([
          supabase.from('price_plans').select('*').order('sort_order', { ascending: true }),
          supabase.from('license_keys').select('*')
        ]);

        if (!isMounted) return;

        if (planRes.status === 'fulfilled' && planRes.value?.data && planRes.value.data.length > 0) {
          const planData = planRes.value.data;
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

        if (keyRes.status === 'fulfilled' && keyRes.value?.data) {
          setKeysStock(keyRes.value.data);
        }
      } catch (err) {
        console.warn('Fallback to defaults:', err);
      }
    };

    fetchLivePlansAndStock();
    return () => { isMounted = false; };
  }, []);

  const handleSelectPackageType = (type) => {
    setPackageType(type);
    if (type === 'jit') {
      toast.warning('⚠️ Restricted Access: Only Our Verified Paid Members Can Buy Just In Time Packages!');
    }
  };

  const rawPlans = Array.isArray(plans?.[panel]) && plans[panel].length > 0
    ? plans[panel]
    : (DEFAULT_PROFIT_PLANS[panel] || []);

  const filteredPlans = rawPlans.filter(p => {
    if (packageType === 'reseller') {
      return p.category === 'wholesale' || (!p.category && p.category !== 'jit');
    } else {
      return p.category === 'jit' || (!p.category && p.category !== 'wholesale');
    }
  });

  const currentPlans = filteredPlans.map(p => {
    const norm = normalizeDurationKey(p.label || p.days);
    const count = keysStock.filter(k => 
      k.status === 'available' && 
      (k.product_type === panel || k.product_type === 'both') && 
      normalizeDurationKey(k.duration) === norm
    ).length;
    return { ...p, stockCount: count };
  });

  const handleOpenCheckout = (p, cardData) => {
    const typeLabel = packageType === 'reseller' ? 'Reseller Wholesale Package' : 'Just In Time Package';

    const checkoutPlanObj = {
      ...p,
      customTitle: `PRRX ${panel === 'internal' ? 'Internal' : 'External'} ${typeLabel} — ${cardData.mainTitle} (${cardData.timePeriod})`,
      label: `${cardData.mainTitle} · ${cardData.timePeriod}`,
      lkr: cardData.wholesalePrice,
      originalLkr: cardData.retailPrice,
      days: `${cardData.timePeriod} (${cardData.keyCount} Keys Delivered)`,
      badgeLabel: packageType === 'reseller' ? `${cardData.keyCount} KEYS WHOLESALE` : 'JUST IN TIME VIP',
      discount: {
        badge_text: `${cardData.rate}% RESELLER MARGIN`,
        discount_value: cardData.rate,
        discount_type: 'percentage',
        promo_code: packageType === 'reseller' ? 'WHOLESALE' : 'JUSTINTIME'
      }
    };

    setSelectedPlanForCheckout(checkoutPlanObj);
    setIsCheckoutOpen(true);
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
          Choose between <strong>Reseller Wholesale Key Bundles</strong> (e.g. 10 Keys / 5 Keys) and <strong>Just In Time Packages</strong> (Single Instant Keys).
        </p>
      </div>

      {/* 2 Package Model Tabs (Reseller Wholesale vs Just In Time) */}
      <div className="flex justify-center">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-2 max-w-xl w-full">
          <button
            onClick={() => handleSelectPackageType('reseller')}
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
            onClick={() => handleSelectPackageType('jit')}
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

      {/* Just In Time Warning Message Notice */}
      <AnimatePresence>
        {packageType === 'jit' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-amber-900/50 to-amber-950/80 border border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] flex items-center gap-3 text-amber-300 text-xs sm:text-sm font-outfit font-bold"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <span className="text-amber-200 uppercase tracking-wide block font-black text-xs">⚠️ RESTRICTED ACCESS NOTICE:</span>
              <span>Only Our Verified Paid Members Can Buy This Packages. Unauthorized orders will require verification before key issuance.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          const unitSellingPrice = Number(p.lkr) || 0;
          const timePeriod = p.label || '1 Week';

          // Bundle Key Count from Admin or default
          const keyCount = packageType === 'reseller'
            ? (Number(p.reseller_keys_count) || (p.label?.includes('1 Week') ? 10 : p.label?.includes('2 Weeks') ? 10 : p.label?.includes('1 Month') ? 10 : 5))
            : 1;

          // Main Title & Subtitle
          const mainTitle = packageType === 'reseller'
            ? (p.reseller_title || `${keyCount} Keys`)
            : `${p.label} Key`;

          const subTimePeriod = packageType === 'reseller'
            ? `${timePeriod} Access`
            : `${timePeriod} Access (Instant)`;

          // Rates & Calculations
          let rate = 40;
          let unitOwnerPrice = 0;
          let unitProfit = 0;

          if (packageType === 'reseller') {
            rate = Number(p.reseller_rate ?? p.commission_rate) || (p.label?.includes('1 Day') ? 30 : p.label?.includes('1 Week') ? 35 : 40);
            unitProfit = Math.round(unitSellingPrice * (rate / 100));
            unitOwnerPrice = p.reseller_pay !== undefined && p.reseller_pay !== '' ? Number(p.reseller_pay) : (unitSellingPrice - unitProfit);
          } else {
            rate = Number(p.jit_rate) || (p.label?.includes('1 Day') ? 20 : p.label?.includes('1 Week') ? 25 : 30);
            unitProfit = Math.round(unitSellingPrice * (rate / 100));
            unitOwnerPrice = p.jit_pay !== undefined && p.jit_pay !== '' ? Number(p.jit_pay) : (unitSellingPrice - unitProfit);
          }

          // Total Bundle Numbers (Auto-Math)
          const totalWholesaleLkr = unitOwnerPrice * keyCount;
          const totalRetailLkr = unitSellingPrice * keyCount;
          const totalProfitLkr = unitProfit * keyCount;

          const prices = getFormattedPrices(totalWholesaleLkr);
          const retailPrices = getFormattedPrices(totalRetailLkr);

          const isCrown = p.crown;
          const isPopular = p.popular;

          const cardData = {
            mainTitle,
            timePeriod: subTimePeriod,
            keyCount,
            rate,
            wholesalePrice: totalWholesaleLkr,
            retailPrice: totalRetailLkr,
            profit: totalProfitLkr,
            unitProfit,
            unitOwnerPrice
          };

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

                {/* Header (Main Title: e.g. 10 Keys | Subtitle: e.g. 1 Week Access) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-outfit font-black text-2xl text-[var(--text-heading)] tracking-tight">
                      {mainTitle}
                    </h3>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      packageType === 'reseller'
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    }`}>
                      {rate}% MARGIN
                    </span>
                  </div>
                  <p className="font-inter text-xs text-cyan-400 font-bold mt-1">
                    {subTimePeriod}
                  </p>
                </div>

                {/* Price Box with Auto-Math Total Bundle Price */}
                <div className="my-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`font-outfit font-black text-4xl ${
                      packageType === 'reseller' ? 'text-[#06b6d4]' : 'text-amber-400'
                    }`}>
                      {prices.usd}
                    </span>
                  </div>

                  <div className="font-inter text-xs font-bold text-[var(--text-heading)] mt-0.5">
                    LKR {prices.lkr} <span className="text-[10px] text-[var(--text-muted)] font-normal">({packageType === 'reseller' ? `${keyCount} Keys Bundle` : 'Wholesale Price'})</span>
                  </div>

                  {/* Reseller Profit Gain Pill */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Your Total Profit:</span>
                      <span>+Rs. {totalProfitLkr.toLocaleString()}</span>
                    </div>
                    {packageType === 'reseller' && keyCount > 1 && (
                      <div className="text-[10px] text-emerald-400/80 font-normal text-right">
                        (Rs. {unitProfit.toLocaleString()} profit / key)
                      </div>
                    )}
                  </div>

                  <div className="font-inter text-[11px] text-[var(--text-muted)] mt-2 flex justify-between">
                    <span>Retail Value ({keyCount} Keys):</span>
                    <span className="font-bold text-[var(--text-primary)]">LKR {retailPrices.lkr}</span>
                  </div>

                  {/* Live Stock Count Badge */}
                  <div className="mt-2.5">
                    {p.stockCount !== undefined && p.stockCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {p.stockCount} {p.stockCount === 1 ? 'Key' : 'Keys'} in Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 font-mono text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        Instant Auto-Key Gen
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-[var(--border-color)] my-4" />

                {/* Features checklist */}
                <div className="space-y-2.5 mb-6 text-xs font-inter text-[var(--text-primary)]">
                  {[
                    `${keyCount}x ${timePeriod} VIP Keys Delivered`,
                    '100% Undetected Anti-Cheat Bypass',
                    'All Functions Included',
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

              {/* Order CTA (Opens Interactive Checkout Modal) */}
              <button
                onClick={() => handleOpenCheckout(p, cardData)}
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

      {/* Interactive Checkout Modal */}
      <BuyModal
        plan={selectedPlanForCheckout}
        panelType={panel}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        discounts={[]}
      />
    </div>
  );
}
