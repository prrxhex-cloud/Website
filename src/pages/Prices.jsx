import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Crown, Zap, Star, Shield, MessageCircle, Tag, Check } from 'lucide-react';

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
      className={`clean-card p-6 flex flex-col relative bg-white border ${
        plan.crown 
          ? 'border-amber-400 shadow-amber-100' 
          : plan.popular 
          ? 'border-[#06b6d4] shadow-cyan-100' 
          : 'border-slate-200'
      }`}
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
        <h3 className="font-outfit font-extrabold text-xl text-slate-900 tracking-tight">
          {plan.label}
        </h3>
        <p className="font-inter text-xs text-slate-500 font-medium mt-1">
          {plan.days}
        </p>
      </div>

      {/* Discount Pill */}
      {plan.discount && (
        <div className="mb-3 inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-md">
          <Tag className="w-3.5 h-3.5" />
          <span>{plan.discount.discount_type === 'percentage' ? `${plan.discount.discount_value}% OFF` : `LKR ${plan.discount.discount_value} OFF`}</span>
        </div>
      )}

      {/* Price */}
      <div className="my-4">
        <div className="flex items-baseline gap-1">
          <span className="font-outfit font-extrabold text-xs text-slate-500">LKR</span>
          <span className="font-outfit font-extrabold text-4xl text-slate-900">
            {(plan.lkr || 0).toLocaleString()}
          </span>
        </div>
        {plan.originalLkr && (
          <span className="font-inter text-xs line-through text-slate-400 font-semibold">
            LKR {plan.originalLkr.toLocaleString()}
          </span>
        )}
      </div>

      <div className="border-t border-slate-100 my-4" />

      {/* Features checklist */}
      <div className="space-y-3 flex-1 mb-6">
        {[
          '100% Undetected Anti-Cheat Bypass',
          'Aimbot, ESP & Speed Hack Included',
          'Instant Auto-Key Delivery',
          'Main Account Safe (HWID Spoof)',
          '24/7 Priority Support',
        ].map((feat, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs font-inter text-slate-700">
            <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0">
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
        className={`w-full py-3 px-4 rounded-xl font-inter font-bold text-sm tracking-wide text-center flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 ${
          plan.crown 
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md' 
            : 'btn-primary-cyan shadow-md'
        }`}
      >
        <Zap className="w-4 h-4" /> BUY KEY NOW
      </a>
    </motion.div>
  );
}

export default function Prices() {
  const [panel, setPanel] = useState('external');
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, 'price_plans'), orderBy('sort_order', 'asc'))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
      getDocs(query(collection(db, 'discounts'), orderBy('created_date', 'desc'))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
    ]).then(([planData, discountData]) => {
      if (planData?.length) {
        setPlans({
          external: planData.filter(p => p.panel_type === 'external').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
          internal: planData.filter(p => p.panel_type === 'internal').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
        });
      }
      setDiscounts(discountData || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const current = plans[panel] || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-inter">
      <Navbar />

      {/* Header Section */}
      <section className="pt-16 pb-12 text-center bg-white border-b border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-4">
          <div className="sub-heading">
            <Shield className="w-3.5 h-3.5" /> TRANSPARENT PRICING
          </div>
          <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl text-slate-900 tracking-tight">
            VIP CHEATS CATALOG & PRICING
          </h1>
          <p className="font-inter text-slate-600 text-base max-w-xl mx-auto">
            Choose your preferred panel version. Instant activation key delivery with 24/7 support.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-12">
        
        {/* Panel Switcher Tabs */}
        <div className="flex justify-center">
          <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm flex items-center gap-2">
            <button
              onClick={() => setPanel('external')}
              className={`px-6 py-2.5 rounded-xl font-outfit font-bold text-sm transition-all ${
                panel === 'external'
                  ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              ⚡ EXTERNAL PANEL (PC / Emulator)
            </button>
            <button
              onClick={() => setPanel('internal')}
              className={`px-6 py-2.5 rounded-xl font-outfit font-bold text-sm transition-all ${
                panel === 'internal'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              🔥 INTERNAL PANEL (Android APK)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#06b6d4]/20 border-t-[#06b6d4] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {current.map((plan, i) => (
              <PlanCard key={i} plan={applyDiscount(plan, discounts, panel)} index={i} />
            ))}
            {current.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl">
                <p className="font-outfit text-slate-500 font-bold text-lg">No plans available for this category right now.</p>
              </div>
            )}
          </div>
        )}

        {/* Support & Contact Strip */}
        <ScrollReveal variant="fadeUp">
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <span className="text-xs font-bold tracking-widest uppercase text-[#06b6d4]">
                NEED CUSTOM BUNDLES OR RESELLER DISCOUNTS?
              </span>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl">
                TALK TO OUR ADMIN TEAM ON WHATSAPP
              </h2>
              <p className="font-inter text-slate-400 text-sm">
                Get instant answers, custom key activations, bulk pricing, and payment verification support.
              </p>
              <div className="pt-2 flex justify-center gap-4 flex-wrap">
                <a
                  href="https://wa.me/94761386077"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-inter font-bold px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
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