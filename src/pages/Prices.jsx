import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Crown, Zap, Star, Shield, MessageCircle, Tag } from 'lucide-react';

// Apply active discounts to a plan
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
    { label: '1 Day',    lkr: 150,  days: '1 Day',     popular: false, crown: false, sort_order: 0 },
    { label: '1 Week',   lkr: 500,  days: '7+ Days',   popular: false, crown: false, sort_order: 1 },
    { label: '1 Month',  lkr: 1500, days: '30+ Days',  popular: true,  crown: false, sort_order: 2 },
    { label: 'Lifetime', lkr: 5000, days: 'Forever ∞', popular: false, crown: true,  sort_order: 3 },
  ],
  internal: [
    { label: '1 Day',    lkr: 200,  days: '1 Day',     popular: false, crown: false, sort_order: 0 },
    { label: '1 Week',   lkr: 700,  days: '7+ Days',   popular: false, crown: false, sort_order: 1 },
    { label: '1 Month',  lkr: 2000, days: '30+ Days',  popular: true,  crown: false, sort_order: 2 },
    { label: 'Lifetime', lkr: 7000, days: 'Forever ∞', popular: false, crown: true,  sort_order: 3 },
  ],
};

function PlanCard({ plan, accent, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1 }}
      className={`relative flex flex-col rounded-[30px] overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 cursor-pointer group ${plan.popular || plan.crown ? 'liquid-glass' : 'bg-white/5 backdrop-blur-xl'}`}
      style={{
        border: plan.crown
          ? '1px solid rgba(255,170,0,0.5)'
          : plan.popular
          ? `1px solid ${accent}60`
          : '1px solid rgba(255,255,255,0.1)',
        boxShadow: plan.crown
          ? '0 0 50px rgba(255,170,0,0.15)'
          : plan.popular
          ? `0 0 40px ${accent}20`
          : '0 20px 40px rgba(0,0,0,0.2)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* Badge */}
      {(plan.popular || plan.crown) && (
        <div className="absolute -top-px left-0 right-0 h-1"
          style={{ background: plan.crown ? 'linear-gradient(90deg, transparent, #ffaa00, transparent)' : `linear-gradient(90deg, transparent, ${accent}, transparent)`, boxShadow: `0 0 20px ${plan.crown ? '#ffaa00' : accent}` }} />
      )}
      {plan.crown && (
        <div className="absolute top-5 right-5 flex items-center gap-1 font-orbitron font-black text-[10px] px-3 py-1.5 rounded-full z-10 shadow-[0_0_15px_rgba(255,170,0,0.3)] animate-pulse"
          style={{ background: 'rgba(255,170,0,0.15)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.35)' }}>
          <Crown className="w-3.5 h-3.5" /> BEST VALUE
        </div>
      )}
      {plan.popular && !plan.crown && (
        <div className="absolute top-5 right-5 flex items-center gap-1 font-orbitron font-black text-[10px] px-3 py-1.5 rounded-full z-10 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
          style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}40` }}>
          <Star className="w-3.5 h-3.5" /> POPULAR
        </div>
      )}

      <div className="p-8 flex flex-col flex-1 relative z-10">
        {/* Label */}
        <p className="font-orbitron font-black text-sm tracking-widest uppercase mb-4"
          style={{ color: plan.crown ? '#ffaa00' : plan.popular ? accent : '#fff' }}>
          {plan.label}
        </p>

        {/* Discount badge */}
        {plan.discount && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="flex items-center gap-1 font-orbitron font-black text-xs px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,0,255,0.3)]"
              style={{ background: 'rgba(255,0,255,0.15)', color: '#ff00ff', border: '1px solid rgba(255,0,255,0.3)' }}>
              <Tag className="w-3 h-3" />
              {plan.discount.discount_type === 'percentage' ? `${plan.discount.discount_value}% OFF` : `LKR ${plan.discount.discount_value} OFF`}
            </span>
            {plan.discount.badge_text && (
              <span className="font-orbitron font-black text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,170,0,0.15)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.3)' }}>
                {plan.discount.badge_text}
              </span>
            )}
            {plan.discount.promo_code && (
              <span className="font-orbitron font-bold text-xs px-2 py-1 rounded-md"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px dashed rgba(255,255,255,0.3)' }}>
                {plan.discount.promo_code}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-2 relative">
          <span className="font-orbitron font-bold text-sm text-gray-400 uppercase tracking-widest">LKR</span>
          {plan.originalLkr && (
            <p className="font-inter text-sm line-through text-gray-500 absolute -top-4 right-0">{plan.originalLkr.toLocaleString()}</p>
          )}
          <p className="font-orbitron font-black text-5xl sm:text-6xl leading-none mt-1"
            style={{ color: plan.discount ? '#ff00ff' : plan.crown ? '#ffaa00' : '#fff', textShadow: plan.discount ? '0 0 30px rgba(255,0,255,0.4)' : plan.crown ? '0 0 30px rgba(255,170,0,0.4)' : plan.popular ? `0 0 30px ${accent}40` : 'none' }}>
            {(plan.lkr || 0).toLocaleString()}
          </p>
        </div>

        {/* Days */}
        <p className="font-inter text-sm mb-8 font-bold tracking-wide"
          style={{ color: plan.crown ? '#ffaa00' : 'rgba(255,255,255,0.6)' }}>
          {plan.days}
        </p>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

        {/* Features list */}
        <div className="space-y-4 flex-1">
          {[
            'Full panel access',
            'Instant activation',
            plan.crown ? 'Never expires' : `Valid ${plan.days}`,
            'Priority support',
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: plan.crown ? 'rgba(255,170,0,0.15)' : `${accent}15`, boxShadow: `0 0 10px ${plan.crown ? '#ffaa00' : accent}30` }}>
                <div className="w-2 h-2 rounded-full" style={{ background: plan.crown ? '#ffaa00' : accent }} />
              </div>
              <span className="font-inter text-sm font-semibold text-gray-300">{feat}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="https://wa.me/94761386077"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 w-full flex items-center justify-center gap-2 py-4 rounded-[16px] font-orbitron font-black text-sm tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={
            plan.crown
              ? { background: 'linear-gradient(90deg, #ffaa00, #ff6600)', color: '#000', boxShadow: '0 0 30px rgba(255,170,0,0.4)' }
              : plan.popular
              ? { background: `linear-gradient(90deg, ${accent}, #ff00ff)`, color: '#000', boxShadow: `0 0 30px ${accent}40` }
              : { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }
          }
        >
          <Zap className="w-4 h-4" /> BUY NOW
        </a>
      </div>
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
  const accent = panel === 'external' ? '#00d4ff' : '#ff00ff';

  return (
    <div className="min-h-screen overflow-x-hidden relative liquid-bg">
      {/* Background Blobs */}
      <div className="absolute top-20 left-10 w-[40vw] h-[40vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none blur-[100px]"></div>
      <div className="absolute bottom-20 right-10 w-[50vw] h-[50vw] bg-[#ff00ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none blur-[120px]" style={{ animationDelay: '-5s' }}></div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-40 pb-20 text-center overflow-hidden">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 font-orbitron font-bold text-[10px] tracking-widest liquid-glass shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                style={{ border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
                <Shield className="w-4 h-4 animate-pulse" /> TRANSPARENT PRICING
              </div>
              <h1 className="font-orbitron font-black text-5xl sm:text-7xl lg:text-8xl tracking-widest mb-6 text-white glow-cyan">
                PRICING
              </h1>
              <p className="font-inter text-lg text-gray-300 max-w-2xl mx-auto mb-4 font-light">
                Simple, flexible pricing for every player. No hidden fees.
              </p>
              <p className="font-inter text-sm text-gray-500 font-bold tracking-wide">
                Need help? Contact us on{' '}
                <a href="https://wa.me/94761386077" target="_blank" rel="noopener noreferrer"
                  className="text-[#00d4ff] hover:text-[#ff00ff] transition-colors underline decoration-dotted underline-offset-4">WhatsApp</a>
              </p>
            </motion.div>
          </div>
        </section>

        {/* Panel Toggle */}
        <div className="flex justify-center mb-16 px-4">
          <div className="p-2 rounded-full flex gap-2 liquid-glass border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            {[
              { key: 'external', label: '⚡ EXTERNAL PANEL', color: '#00d4ff' },
              { key: 'internal', label: '🔥 INTERNAL PANEL', color: '#ff00ff' },
            ].map(p => (
              <button key={p.key} onClick={() => setPanel(p.key)}
                className="font-orbitron font-bold text-xs tracking-widest px-8 py-4 rounded-full transition-all duration-300 relative overflow-hidden"
                style={panel === p.key
                  ? { color: '#000', boxShadow: `0 0 30px ${p.color}50` }
                  : { color: 'rgba(255,255,255,0.5)', background: 'transparent' }}>
                {panel === p.key && (
                  <motion.div layoutId="activeTab" className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color === '#00d4ff' ? '#ff00ff' : '#00d4ff'})` }} />
                )}
                <span className="relative z-10">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-32">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#00d4ff]/20 border-t-[#ff00ff] rounded-full animate-spin shadow-[0_0_30px_rgba(0,212,255,0.5)]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {current.map((plan, i) => (
                <PlanCard key={i} plan={applyDiscount(plan, discounts, panel)} accent={accent} index={i} />
              ))}
              {current.length === 0 && (
                <div className="col-span-4 text-center py-20 liquid-glass rounded-[30px] border border-white/10">
                  <p className="font-orbitron text-xl text-gray-400 tracking-wider">No plans available. Check back soon.</p>
                </div>
              )}
            </div>
          )}

          {/* Bottom CTA strip */}
          <ScrollReveal variant="fadeUp" className="mt-32">
            <div className="rounded-[40px] p-10 sm:p-16 text-center relative overflow-hidden liquid-glass border border-white/10 shadow-[0_0_50px_rgba(0,212,255,0.1)]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-[#00d4ff]/10 via-[#ff00ff]/10 to-[#00d4ff]/10 blur-[50px] pointer-events-none"></div>
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <span className="inline-block px-4 py-1.5 rounded-full text-[10px] tracking-widest font-bold bg-white/5 border border-white/10 text-[#00d4ff] uppercase font-orbitron mb-6 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                  Ready to dominate?
                </span>
                <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white mb-6 tracking-wide glow-cyan">
                  CONTACT US TO PURCHASE
                </h2>
                <p className="font-inter text-base sm:text-lg text-gray-300 mb-10 font-light">
                  Send your payment receipt via WhatsApp or Discord and get your key instantly.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <a href="https://wa.me/94761386077" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 font-orbitron font-black text-sm tracking-widest px-10 py-5 rounded-[20px] transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                    style={{ background: 'linear-gradient(90deg, #25d366, #128c7e)', color: '#fff', boxShadow: '0 0 30px rgba(37,211,102,0.4)' }}>
                    <MessageCircle className="w-5 h-5" /> WHATSAPP
                  </a>
                  <a href="https://discord.com/users/prrx2021" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 font-orbitron font-black text-sm tracking-widest px-10 py-5 rounded-[20px] transition-all hover:scale-105 active:scale-95 w-full sm:w-auto bg-white/5 border border-white/20 hover:bg-[#5865f2]/20 hover:border-[#5865f2]"
                    style={{ color: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                    <span className="text-[#5865f2] font-bold text-lg">#</span> DISCORD
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        <Footer />
      </div>
    </div>
  );
}