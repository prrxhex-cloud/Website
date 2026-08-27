import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ScrollReveal from '@/components/effects/ScrollReveal';
import BuyModal from '@/components/pricing/BuyModal';
import { getFormattedPrices } from '@/lib/currency';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { normalizeDurationKey } from '@/components/dashboard/KeyBankTab';
import { Crown, Zap, Star, MessageCircle, Tag, Check, LayoutGrid, Settings, Sparkles, Copy, Clock, Flame, LogIn, UserCheck, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

// Helper to check if a discount is currently active and not expired
export function isDiscountActive(d) {
  if (!d || !d.active) return false;
  if (!d.expires_at) return true;
  let expiryDate = new Date(d.expires_at);
  if (typeof d.expires_at === 'string' && d.expires_at.length === 10) {
    expiryDate = new Date(`${d.expires_at}T23:59:59`);
  }
  return !isNaN(expiryDate.getTime()) && expiryDate.getTime() > Date.now();
}

export function getDiscountExpiryDate(d) {
  if (!d?.expires_at) return null;
  if (typeof d.expires_at === 'string' && d.expires_at.length === 10) {
    return new Date(`${d.expires_at}T23:59:59`);
  }
  const date = new Date(d.expires_at);
  return isNaN(date.getTime()) ? null : date;
}

function applyDiscount(plan, discounts, panelType) {
  if (!plan) return { label: 'VIP Plan', lkr: 0, days: 'Access', popular: false, crown: false };
  const discList = Array.isArray(discounts) ? discounts : [];
  const match = discList.find(d => {
    if (!isDiscountActive(d)) return false;
    const panelMatch = !d.panel_type || d.panel_type === 'both' || d.panel_type === panelType;
    const labelMatch = !d.plan_label || d.plan_label.toLowerCase() === plan.label?.toLowerCase();
    return panelMatch && labelMatch;
  });
  if (!match) return { ...plan, discount: null };
  const originalLkr = Number(plan.lkr) || 0;
  const val = Number(match.discount_value) || 0;
  const discountedLkr = match.discount_type === 'percentage'
    ? Math.round(originalLkr * (1 - val / 100))
    : Math.max(0, originalLkr - val);
  return { ...plan, originalLkr, lkr: discountedLkr, discount: match };
}

const DEFAULT_PLANS = {
  external: [
    { label: '1 Day',    lkr: 150,  days: '1 Day Access',     popular: false, crown: false, sort_order: 0 },
    { label: '1 Week',   lkr: 400,  days: '7 Days Access',   popular: true,  crown: false, sort_order: 1 },
    { label: '2 Weeks',  lkr: 650,  days: '14 Days Access',  popular: false, crown: false, sort_order: 2 },
    { label: '1 Month',  lkr: 1250, days: '30 Days Access',  popular: true,  crown: false, sort_order: 3 },
    { label: '2 Months', lkr: 1800, days: '60 Days Access',  popular: false, crown: false, sort_order: 4 },
    { label: '1 Year',   lkr: 2499, days: '365 Days Access', popular: false, crown: false, sort_order: 5 },
    { label: '2 Years',  lkr: 3400, days: '730 Days Access', popular: false, crown: false, sort_order: 6 },
    { label: 'Lifetime', lkr: 5000, days: 'Forever Access',  popular: false, crown: true,  sort_order: 7 },
  ],
  internal: [
    { label: '1 Day',    lkr: 200,  days: '1 Day Access',     popular: false, crown: false, sort_order: 0 },
    { label: '1 Week',   lkr: 500,  days: '7 Days Access',   popular: true,  crown: false, sort_order: 1 },
    { label: '2 Weeks',  lkr: 800,  days: '14 Days Access',  popular: false, crown: false, sort_order: 2 },
    { label: '1 Month',  lkr: 1600, days: '30 Days Access',  popular: true,  crown: false, sort_order: 3 },
    { label: '2 Months', lkr: 2400, days: '60 Days Access',  popular: false, crown: false, sort_order: 4 },
    { label: '1 Year',   lkr: 3500, days: '365 Days Access', popular: false, crown: false, sort_order: 5 },
    { label: '2 Years',  lkr: 4800, days: '730 Days Access', popular: false, crown: false, sort_order: 6 },
    { label: 'Lifetime', lkr: 7000, days: 'Forever Access',  popular: false, crown: true,  sort_order: 7 },
  ],
};

function PlanCard({ plan, index, onBuy }) {
  const prices = getFormattedPrices(plan?.lkr);
  const originalPrices = plan?.originalLkr ? getFormattedPrices(plan.originalLkr) : null;
  const hasDiscount = !!plan?.discount || !!originalPrices;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`clean-card p-6 flex flex-col justify-between relative bg-[var(--bg-card)] border transition-all duration-300 rounded-3xl ${
        plan?.crown 
          ? 'border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:border-amber-400' 
          : hasDiscount
          ? 'border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.2)] hover:border-cyan-400'
          : plan?.popular 
          ? 'border-[#06b6d4] shadow-[0_0_25px_rgba(6,182,212,0.2)]' 
          : 'border-[var(--border-color)] hover:border-cyan-500/40'
      } text-left shadow-xl`}
    >
      <div>
        {/* Badges */}
        {plan?.crown && (
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-outfit font-extrabold text-[11px] tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" /> BEST VALUE
          </div>
        )}
        {plan?.popular && !plan?.crown && (
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white font-outfit font-extrabold text-[11px] tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Star className="w-3.5 h-3.5" /> MOST POPULAR
          </div>
        )}

        {/* Plan Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-outfit font-extrabold text-xl text-[var(--text-heading)] tracking-tight">
              {plan?.label}
            </h3>
            {hasDiscount && (
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-outfit font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3 text-emerald-400" /> SALE
              </span>
            )}
          </div>
          <p className="font-inter text-xs text-[var(--text-muted)] font-medium mt-1">
            {plan?.days}
          </p>
        </div>

        {/* Discount Pill */}
        {plan?.discount && (
          <div className="mb-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {plan.discount.badge_text || (plan.discount.discount_type === 'percentage' ? `${plan.discount.discount_value}% OFF` : `LKR ${plan.discount.discount_value} OFF`)}
            </span>
          </div>
        )}

        {/* Price Box */}
        <div className="my-4">
          <div className="flex items-baseline gap-1">
            <span className="font-outfit font-black text-4xl text-[#06b6d4]">
              {prices.usd}
            </span>
          </div>

          <div className="font-inter text-xs font-bold text-[var(--text-muted)] mt-0.5">
            LKR {prices.lkr}
          </div>

          {originalPrices && (
            <div className="font-inter text-xs line-through text-rose-400 font-semibold mt-1 flex items-center gap-1">
              <span>{originalPrices.usd} (LKR {originalPrices.lkr})</span>
            </div>
          )}

          {/* Live Key Inventory Stock Pill */}
          <div className="mt-3">
            {plan?.stockCount !== undefined && plan.stockCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {plan.stockCount} {plan.stockCount === 1 ? 'Key' : 'Keys'} in Stock
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
        <div className="space-y-3 mb-6">
          {[
            '100% Undetected Anti-Cheat Bypass',
            'All Functions Included',
            'Instant Auto-Key Delivery',
            'Main Account Safe (HWID Spoof)',
            '24/7 Priority Support',
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs font-inter text-[var(--text-primary)]">
              <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onBuy(plan)}
        className={`w-full py-3.5 px-4 rounded-xl font-inter font-bold text-xs tracking-wide text-center flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 ${
          plan?.crown 
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md' 
            : 'btn-primary-cyan btn-glow shadow-md'
        }`}
      >
        <Zap className="w-4 h-4" /> BUY VIP KEY NOW
      </button>
    </motion.div>
  );
}

export default function Prices() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [panel, setPanel] = useState('external');
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
    return DEFAULT_PLANS;
  });
  const [discounts, setDiscounts] = useState([]);
  const [keysStock, setKeysStock] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [activePromoCode, setActivePromoCode] = useState(() => location.state?.promoCode || '');
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto-set promo code if arriving from Lucky Wheel
  useEffect(() => {
    if (location.state?.promoCode) {
      setActivePromoCode(location.state.promoCode);
      toast.success(`🎟️ Lucky Spin promo code "${location.state.promoCode}" activated!`);
    }
  }, [location.state]);

  // Live real-time countdown timer state based on database expires_at
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, hasExpiry: false, isExpired: false });

  // 1. Fetch live plans, discounts, and available key stock from Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchPlansAndDiscounts = async () => {
      try {
        const planQuery = query(collection(db, 'price_plans'), orderBy('sort_order', 'asc'));
        const discountQuery = query(collection(db, 'discounts'), orderBy('created_date', 'desc'));
        const keyQuery = query(collection(db, 'license_keys'));
        
        const [planSnap, discountSnap, keySnap] = await Promise.allSettled([
          getDocs(planQuery),
          getDocs(discountQuery),
          getDocs(keyQuery)
        ]);

        if (!isMounted) return;

        if (planSnap.status === 'fulfilled' && planSnap.value && !planSnap.value.empty) {
          const planData = planSnap.value.docs.map(d => ({ id: d.id, ...d.data() }));
          if (planData.length > 0) {
            const newPlans = {
              external: planData.filter(p => p.panel_type === 'external').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
              internal: planData.filter(p => p.panel_type === 'internal').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
            };
            if (newPlans.external.length > 0 || newPlans.internal.length > 0) {
              setPlans(newPlans);
              localStorage.setItem('prrx_cached_plans', JSON.stringify(newPlans));
            }
          }
        }

        if (discountSnap.status === 'fulfilled' && discountSnap.value && !discountSnap.value.empty) {
          const discountData = discountSnap.value.docs.map(d => ({ id: d.id, ...d.data() }));
          if (Array.isArray(discountData) && discountData.length > 0) {
            setDiscounts(discountData);
            // Find a public flash sale (ignore personal wheel codes)
            const featured = discountData.find(d => isDiscountActive(d) && d.promo_code && !d.is_personal);
            // Only set featured if we don't already have an active code (like one from the wheel)
            setActivePromoCode(prev => prev || featured?.promo_code || '');
          }
        }

        if (keySnap.status === 'fulfilled' && keySnap.value) {
          setKeysStock(keySnap.value.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.warn('Pricing fallback to defaults:', err);
      }
    };

    fetchPlansAndDiscounts();
    return () => { isMounted = false; };
  }, []);

  // 2. Active unexpired discount resolution
  const activeDiscountObj = Array.isArray(discounts) 
    ? (
        discounts.find(d => isDiscountActive(d) && d.promo_code === activePromoCode) 
        || discounts.find(d => isDiscountActive(d) && !d.is_personal) 
        || null
      )
    : null;

  // 3. Real-Time Expiration Countdown Clock
  useEffect(() => {
    const updateCountdown = () => {
      if (!activeDiscountObj) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, hasExpiry: false, isExpired: true });
        return;
      }

      const expiryDate = getDiscountExpiryDate(activeDiscountObj);
      if (!expiryDate) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, hasExpiry: false, isExpired: false });
        return;
      }

      const diff = expiryDate.getTime() - Date.now();
      if (diff > 0) {
        const totalHours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ hours: totalHours, minutes, seconds, hasExpiry: true, isExpired: false });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, hasExpiry: true, isExpired: true });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeDiscountObj]);

  const handleOpenBuyModal = (plan, promoCode = '') => {
    if (!isAuthenticated) {
      toast.info('Please sign in to claim VIP discounts and automated key delivery!');
    }
    setSelectedPlan(plan);
    setActivePromoCode(promoCode || activePromoCode);
    setIsBuyModalOpen(true);
  };

  const handleCopyCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast.success(`Promo Code "${code}" copied to clipboard!`);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch (e) {
      toast.info(`Promo Code: ${code}`);
    }
  };

  const rawPlans = Array.isArray(plans?.[panel]) && plans[panel].length > 0 ? plans[panel] : (DEFAULT_PLANS[panel] || []);

  // Compute live available keys count for each plan
  const current = rawPlans.map(p => {
    const norm = normalizeDurationKey(p.label || p.days);
    const count = keysStock.filter(k => 
      k.status === 'available' && 
      (k.product_type === panel || k.product_type === 'both') && 
      normalizeDurationKey(k.duration) === norm
    ).length;
    return { ...p, stockCount: count };
  });

  const displayDiscountText = activeDiscountObj?.discount_value
    ? (activeDiscountObj.badge_text || (activeDiscountObj.discount_type === 'percentage' ? `${activeDiscountObj.discount_value}% OFF` : `LKR ${activeDiscountObj.discount_value} OFF`))
    : 'VIP SPECIAL';

  const hasActiveDiscount = !!activeDiscountObj && !timeLeft.isExpired;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter transition-colors duration-300">
      <Navbar />

      {/* Header */}
      <section className="pt-14 pb-10 text-center bg-[var(--bg-glass-card)] backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-4">
          <div className="sub-heading">PRICING BUNDLES & SPECIAL OFFERS</div>
          <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl text-[var(--text-heading)] tracking-tight">
            VIP CHEATS CATALOG & <span className="text-[#06b6d4]">DISCOUNTS</span>
          </h1>
          <p className="font-inter text-[var(--text-muted)] text-base max-w-2xl mx-auto">
            Choose your preferred panel version. Sign in to apply promo codes for instant discounts & 24/7 key delivery.
          </p>

          {/* Dynamic Flash Discount Hero Banner */}
          {hasActiveDiscount && (
            <div className="mt-6 max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-purple-950/70 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4 text-left animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-outfit font-black text-[10px] tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400 animate-pulse" /> FLASH PROMO
                  </span>
                  {timeLeft.hasExpiry && (
                    <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> Ends in:
                      <span className="font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                        {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                      </span>
                    </span>
                  )}
                </div>
                <p className="font-outfit font-bold text-sm sm:text-base text-white">
                  {isAuthenticated ? (
                    <span>
                      🎉 Welcome, <span className="text-emerald-400">{user?.displayName || user?.email}</span>! <span className="text-cyan-400 font-black">{displayDiscountText}</span> VIP discount unlocked!
                    </span>
                  ) : (
                    <span>
                      Sign in to claim <span className="text-cyan-400 font-black">{displayDiscountText}</span> VIP discount & instant keys!
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                {activeDiscountObj?.promo_code && (
                  <div className="bg-slate-950/80 border border-cyan-500/30 px-3 py-2 rounded-xl flex items-center justify-between gap-3 w-full sm:w-auto">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Coupon Code</div>
                      <div className="font-mono font-black text-sm text-cyan-400 tracking-wider">{activeDiscountObj.promo_code}</div>
                    </div>
                    <button
                      onClick={() => handleCopyCode(activeDiscountObj.promo_code)}
                      className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-colors"
                      title="Copy coupon code"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {!isAuthenticated && (
                  <button
                    onClick={() => navigate('/login?redirect=/prices')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-outfit font-extrabold text-xs flex items-center gap-1.5 shadow-md shrink-0 w-full sm:w-auto justify-center"
                  >
                    <LogIn className="w-4 h-4" /> Sign In to Claim
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Panel Selector Toggle */}
          <div className="flex justify-center pt-4 w-full">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 w-full max-w-xl mx-auto">
              <button
                onClick={() => setPanel('external')}
                className={`w-full sm:w-1/2 px-3 sm:px-6 py-2.5 rounded-xl font-outfit font-bold text-[11px] sm:text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                  panel === 'external'
                    ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-md'
                    : 'text-[var(--text-primary)] hover:text-[var(--text-heading)]'
                }`}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" /> 
                <span className="truncate">External Panel (Free Fire)</span>
              </button>

              <button
                onClick={() => setPanel('internal')}
                className={`w-full sm:w-1/2 px-3 sm:px-6 py-2.5 rounded-xl font-outfit font-bold text-[11px] sm:text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                  panel === 'internal'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-[var(--text-primary)] hover:text-[var(--text-heading)]'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" /> 
                <span className="truncate">Internal Panel (V7A)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Plans Grid */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {current.map((p, i) => {
            const planWithDiscount = applyDiscount(p, discounts, panel);
            return (
              <PlanCard 
                key={p?.id || p?.label || i} 
                plan={planWithDiscount} 
                index={i} 
                onBuy={(plan) => handleOpenBuyModal(plan, planWithDiscount.discount?.promo_code || (hasActiveDiscount ? activePromoCode : ''))}
              />
            );
          })}
        </div>

        {/* Support CTA */}
        <ScrollReveal variant="fadeUp">
          <div className="clean-card p-8 sm:p-12 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl text-center text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <span className="sub-heading bg-cyan-500/15 border-cyan-500/30 text-cyan-400">INSTANT SUPPORT</span>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl tracking-tight">
                TALK TO OUR ADMIN TEAM ON WHATSAPP
              </h2>
              <p className="font-inter text-slate-300 text-sm">
                Get custom discount vouchers, bulk team packages, and instant key activation assistance.
              </p>
              <div className="pt-2 flex justify-center gap-4 flex-wrap">
                <a
                  href="https://wa.me/94761386077"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-inter font-bold px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5 fill-current" /> Chat on WhatsApp (+94 761 386 077)
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>

      {/* Interactive Buy Modal with coupon support */}
      <BuyModal
        plan={selectedPlan}
        panelType={panel}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        discounts={discounts}
        initialPromoCode={activePromoCode}
      />

      <Footer />
    </div>
  );
}