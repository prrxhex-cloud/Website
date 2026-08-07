import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Crown, Zap, Star, MessageCircle, Tag, Check, LayoutGrid, Settings } from 'lucide-react';

function applyDiscount(plan, discounts, panelType) {
  const now = new Date();
  const match = discounts.find(d => {
    if (!d.active) return false;
    if (d.expires_at && new Date(d.expires_at) < now) return false;
    const panelMatch = d.panel_type === 'both' || d.panel_type === panelType;
    const labelMatch = !d.plan_label || d.plan_label.toLowerCase() === plan.label?.toLowerCase();
    return panelMatch && labelMatch;
  });
  if (!match) return { ...plan, discount: null };
  const originalLkr = plan.lkr || 0;
  const discountedLkr = match.discount_type === 'percentage'
    ? Math.round(originalLkr * (1 - match.discount_value / 100))
    : Math.max(0, originalLkr - match.discount_value);
  return { ...plan, originalLkr, lkr: discountedLkr, discount: match };
}

const DEFAULT_PLANS = {
  external: [
    { label: '1 Day',    lkr: 150,  days: '1 Day Access',     popular: false, crown: false, sort_order: 0 },
    { label: '1 Week',   lkr: 500,  days: '7 Days Access',   popular: false, crown: false, sort_order: 1 },
    { label: '1 Month',  lkr: 1500, days: '30 Days Access',  popular: true,  crown: false, sort_order: 2 },
    { label: 'Lifetime', lkr: 5000, days: 'Forever Access', popular: false, crown: true,  sort_order: 3 },
  ],
  internal: [
    { label: '1 Day',    lkr: 200,  days: '1 Day Access',     popular: false, crown: false, sort_order: 0 },
    { label: '1 Week',   lkr: 700,  days: '7 Days Access',   popular: false, crown: false, sort_order: 1 },
    { label: '1 Month',  lkr: 2000, days: '30 Days Access',  popular: true,  crown: false, sort_order: 2 },
    { label: 'Lifetime', lkr: 7000, days: 'Forever Access', popular: false, crown: true,  sort_order: 3 },
  ],
};

function PlanCard({ plan, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`clean-card p-6 flex flex-col relative bg-[var(--bg-card)] border ${
        plan.crown 
          ? 'border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.2)]' 
          : plan.popular 
          ? 'border-[#06b6d4] shadow-[0_0_25px_rgba(6,182,212,0.2)]' 
          : 'border-[var(--border-color)]'
      } text-left shadow-md`}
    >
      {/* Badges */}
      {plan.crown && (
        <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-outfit font-extrabold text-[11px] tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Crown className="w-3.5 h-3.5" /> BEST VALUE
        </div>
      )}
      {plan.popular && !plan.crown && (
        <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white font-outfit font-extrabold text-[11px] tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Star className="w-3.5 h-3.5" /> MOST POPULAR
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-4">
        <h3 className="font-outfit font-extrabold text-xl text-[var(--text-heading)] tracking-tight">
          {plan.label}
        </h3>
        <p className="font-inter text-xs text-[var(--text-muted)] font-medium mt-1">
          {plan.days}
        </p>
      </div>

      {/* Discount Pill */}
      {plan.discount && (
        <div className="mb-3 inline-flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-bold px-2.5 py-1 rounded-md">
          <Tag className="w-3.5 h-3.5" />
          <span>{plan.discount.discount_type === 'percentage' ? `${plan.discount.discount_value}% OFF` : `LKR ${plan.discount.discount_value} OFF`}</span>
        </div>
      )}

      {/* Price */}
      <div className="my-4">
        <div className="flex items-baseline gap-1">
          <span className="font-outfit font-extrabold text-xs text-[var(--text-muted)]">LKR</span>
          <span className="font-outfit font-extrabold text-4xl text-[var(--text-heading)]">
            {(plan.lkr || 0).toLocaleString()}
          </span>
        </div>
        {plan.originalLkr && (
          <span className="font-inter text-xs line-through text-[var(--text-muted)] font-semibold">
            LKR {plan.originalLkr.toLocaleString()}
          </span>
        )}
      </div>

      <div className="border-t border-[var(--border-color)] my-4" />

      {/* Features checklist */}
      <div className="space-y-3 flex-1 mb-6">
        {[
          '100% Undetected Anti-Cheat Bypass',
          'Aimbot, ESP & Speed Hack Included',
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

      {/* CTA Button */}
      <a
        href="https://wa.me/94761386077"
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full py-3.5 px-4 rounded-xl font-inter font-bold text-xs tracking-wide text-center flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 ${
          plan.crown 
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md' 
            : 'btn-primary-cyan btn-glow shadow-md'
        }`}
      >
        <Zap className="w-4 h-4" /> BUY VIP KEY NOW
      </a>
    </motion.div>
  );
}

export default function Prices() {
  const [panel, setPanel] = useState('external');
  const [plans, setPlans] = useState(() => {
    const cached = localStorage.getItem('prrx_cached_plans');
    return cached ? JSON.parse(cached) : DEFAULT_PLANS;
  });
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    // Instant background sync without blocking rendering
    Promise.all([
      getDocs(query(collection(db, 'price_plans'), orderBy('sort_order', 'asc'))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
      getDocs(query(collection(db, 'discounts'), orderBy('created_date', 'desc'))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
    ]).then(([planData, discountData]) => {
      if (planData?.length) {
        const newPlans = {
          external: planData.filter(p => p.panel_type === 'external').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
          internal: planData.filter(p => p.panel_type === 'internal').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
        };
        setPlans(newPlans);
        localStorage.setItem('prrx_cached_plans', JSON.stringify(newPlans));
      }
      setDiscounts(discountData || []);
    }).catch(err => console.error('Pricing sync error:', err));
  }, []);

  const current = plans[panel] || [];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter transition-colors duration-300">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-12 text-center bg-[var(--bg-glass-card)] backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-4">
          <div className="sub-heading">PRICING BUNDLES</div>
          <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl text-[var(--text-heading)] tracking-tight">
            VIP LICENSE <span className="text-[#06b6d4]">PRICING</span>
          </h1>
          <p className="font-inter text-[var(--text-muted)] text-base max-w-2xl mx-auto">
            Choose your VIP panel plan. Instant key activation delivered to your account and WhatsApp.
          </p>

          {/* Panel Selector Toggle */}
          <div className="flex justify-center pt-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-md flex items-center gap-2">
              <button
                onClick={() => setPanel('external')}
                className={`px-6 py-2.5 rounded-xl font-outfit font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
                  panel === 'external'
                    ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-md'
                    : 'text-[var(--text-primary)] hover:text-[var(--text-heading)]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> External Panel (PC)
              </button>

              <button
                onClick={() => setPanel('internal')}
                className={`px-6 py-2.5 rounded-xl font-outfit font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
                  panel === 'internal'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-[var(--text-primary)] hover:text-[var(--text-heading)]'
                }`}
              >
                <Settings className="w-4 h-4" /> Internal Panel (APK)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Plans Grid — Loads INSTANTLY (0 Seconds) */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {current.map((p, i) => {
            const planWithDiscount = applyDiscount(p, discounts, panel);
            return <PlanCard key={p.id || p.label} plan={planWithDiscount} index={i} />;
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
                Get instant answers, custom key activations, bulk pricing, and payment verification support.
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

      <Footer />
    </div>
  );
}