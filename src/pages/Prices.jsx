import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
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
      className="relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 cursor-pointer"
      style={{
        background: plan.crown
          ? `linear-gradient(135deg, rgba(255,170,0,0.12), rgba(255,100,0,0.06))`
          : plan.popular
          ? `linear-gradient(135deg, ${accent}18, ${accent}06)`
          : 'rgba(0,10,28,0.7)',
        border: plan.crown
          ? '1px solid rgba(255,170,0,0.4)'
          : plan.popular
          ? `1px solid ${accent}50`
          : `1px solid ${accent}18`,
        backdropFilter: 'blur(20px)',
        boxShadow: plan.crown
          ? '0 0 40px rgba(255,170,0,0.12), 0 20px 60px rgba(0,0,0,0.4)'
          : plan.popular
          ? `0 0 30px ${accent}12, 0 20px 60px rgba(0,0,0,0.4)`
          : '0 10px 40px rgba(0,0,0,0.3)',
      }}
    >
      {/* Badge */}
      {(plan.popular || plan.crown) && (
        <div className="absolute -top-px left-0 right-0 h-0.5 rounded-t-3xl"
          style={{ background: plan.crown ? 'linear-gradient(90deg, transparent, #ffaa00, transparent)' : `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      )}
      {plan.crown && (
        <div className="absolute top-4 right-4 flex items-center gap-1 font-orbitron font-black text-xs px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,170,0,0.15)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.35)' }}>
          <Crown className="w-3 h-3" /> BEST VALUE
        </div>
      )}
      {plan.popular && !plan.crown && (
        <div className="absolute top-4 right-4 flex items-center gap-1 font-orbitron font-black text-xs px-2.5 py-1 rounded-full"
          style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}40` }}>
          <Star className="w-3 h-3" /> POPULAR
        </div>
      )}

      <div className="p-7 flex flex-col flex-1">
        {/* Label */}
        <p className="font-orbitron font-black text-xs tracking-widest uppercase mb-4"
          style={{ color: plan.crown ? '#ffaa00' : accent }}>
          {plan.label}
        </p>

        {/* Discount badge */}
        {plan.discount && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="flex items-center gap-1 font-orbitron font-black text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,60,60,0.15)', color: '#ff6060', border: '1px solid rgba(255,60,60,0.3)' }}>
              <Tag className="w-3 h-3" />
              {plan.discount.discount_type === 'percentage' ? `${plan.discount.discount_value}% OFF` : `LKR ${plan.discount.discount_value} OFF`}
            </span>
            {plan.discount.badge_text && (
              <span className="font-orbitron font-black text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,170,0,0.15)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.3)' }}>
                {plan.discount.badge_text}
              </span>
            )}
            {plan.discount.promo_code && (
              <span className="font-orbitron text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
                {plan.discount.promo_code}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-2">
          <span className="font-inter text-xs text-muted-foreground uppercase tracking-wider">LKR</span>
          {plan.originalLkr && (
            <p className="font-inter text-sm line-through text-muted-foreground">{plan.originalLkr.toLocaleString()}</p>
          )}
          <p className="font-orbitron font-black text-5xl leading-none mt-0.5"
            style={{ color: plan.discount ? '#ff6060' : plan.crown ? '#ffaa00' : '#fff', textShadow: plan.discount ? '0 0 30px rgba(255,60,60,0.4)' : plan.crown ? '0 0 30px rgba(255,170,0,0.4)' : plan.popular ? `0 0 30px ${accent}50` : 'none' }}>
            {(plan.lkr || 0).toLocaleString()}
          </p>
        </div>

        {/* Days */}
        <p className="font-inter text-sm mb-6"
          style={{ color: plan.crown ? 'rgba(255,200,100,0.7)' : 'rgba(180,210,230,0.5)' }}>
          {plan.days}
        </p>

        {/* Divider */}
        <div className="h-px mb-6" style={{ background: plan.crown ? 'rgba(255,170,0,0.15)' : `${accent}12` }} />

        {/* Features list */}
        <div className="space-y-2.5 flex-1">
          {[
            'Full panel access',
            'Instant activation',
            plan.crown ? 'Never expires' : `Valid ${plan.days}`,
            'Priority support',
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: plan.crown ? 'rgba(255,170,0,0.15)' : `${accent}15` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: plan.crown ? '#ffaa00' : accent }} />
              </div>
              <span className="font-inter text-xs" style={{ color: 'rgba(180,210,230,0.65)' }}>{feat}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="https://wa.me/94761386077"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all hover:scale-105"
          style={
            plan.crown
              ? { background: 'linear-gradient(135deg, #ffaa00, #ff6600)', color: '#020810', boxShadow: '0 0 24px rgba(255,170,0,0.3)' }
              : plan.popular
              ? { background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#020810', boxShadow: `0 0 20px ${accent}40` }
              : { background: `${accent}10`, color: accent, border: `1px solid ${accent}30` }
          }
        >
          <Zap className="w-3.5 h-3.5" /> BUY NOW
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
      base44.entities.PricePlan.list('sort_order', 100),
      base44.entities.Discount.list('-created_date', 50),
    ]).then(([planData, discountData]) => {
      if (planData?.length) {
        setPlans({
          external: planData.filter(p => p.panel_type === 'external').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
          internal: planData.filter(p => p.panel_type === 'internal').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
        });
      }
      setDiscounts(discountData || []);
    }).finally(() => setLoading(false));
  }, []);

  const current = plans[panel] || [];
  const accent = panel === 'external' ? '#00d4ff' : '#aa44ff';

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--page-bg)' }}>
      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-36 pb-20 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,60,120,0.4) 0%, transparent 70%)' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-inter font-bold text-xs tracking-widest"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}>
                <Shield className="w-3.5 h-3.5" /> TRANSPARENT PRICING
              </div>
              <h1 className="font-orbitron font-black text-4xl sm:text-6xl lg:text-7xl tracking-widest mb-4"
                style={{ color: '#fff', textShadow: '0 0 60px rgba(0,212,255,0.25)' }}>
                PRICING
              </h1>
              <p className="font-inter text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-2">
                Simple, flexible pricing for every player. No hidden fees.
              </p>
              <p className="font-inter text-xs text-muted-foreground">
                Need help? Contact us on{' '}
                <a href="https://wa.me/94761386077" target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:underline">WhatsApp</a>
              </p>
            </motion.div>
          </div>
        </section>

        {/* Panel Toggle */}
        <div className="flex justify-center mb-12 px-4">
          <div className="p-1 rounded-2xl flex gap-1"
            style={{ background: 'rgba(0,10,28,0.8)', border: '1px solid rgba(0,212,255,0.12)', backdropFilter: 'blur(20px)' }}>
            {[
              { key: 'external', label: '⚡ External Panel', color: '#00d4ff' },
              { key: 'internal', label: '🔥 Internal Panel', color: '#aa44ff' },
            ].map(p => (
              <button key={p.key} onClick={() => setPanel(p.key)}
                className="font-orbitron font-bold text-xs tracking-widest px-8 py-3 rounded-xl transition-all duration-300"
                style={panel === p.key
                  ? { background: p.key === 'external' ? 'linear-gradient(135deg,#00d4ff,#0088cc)' : 'linear-gradient(135deg,#aa44ff,#7722cc)', color: '#020810', boxShadow: `0 0 20px ${p.color}40` }
                  : { color: 'rgba(180,200,230,0.5)', background: 'transparent' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-28">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {current.map((plan, i) => (
                <PlanCard key={i} plan={applyDiscount(plan, discounts, panel)} accent={accent} index={i} />
              ))}
              {current.length === 0 && (
                <div className="col-span-4 text-center py-20">
                  <p className="font-inter text-muted-foreground">No plans available. Check back soon.</p>
                </div>
              )}
            </div>
          )}

          {/* Bottom CTA strip */}
          <ScrollReveal variant="fadeUp" className="mt-20">
            <div className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
              style={{ background: 'rgba(0,10,28,0.8)', border: '1px solid rgba(0,212,255,0.12)', backdropFilter: 'blur(20px)' }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%)' }} />
              <div className="relative">
                <p className="font-orbitron font-black text-xs tracking-widest text-primary mb-3 uppercase">Ready to get started?</p>
                <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-foreground mb-4 tracking-wide">
                  Contact Us to Purchase
                </h2>
                <p className="font-inter text-sm text-muted-foreground max-w-md mx-auto mb-8">
                  Send your payment receipt via WhatsApp or Discord and get your key instantly.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="https://wa.me/94761386077" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 font-orbitron font-bold text-sm tracking-widest px-8 py-4 rounded-xl transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', color: '#fff', boxShadow: '0 0 24px rgba(37,211,102,0.3)' }}>
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  <a href="https://discord.com/users/prrx2021" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 font-orbitron font-bold text-sm tracking-widest px-8 py-4 rounded-xl transition-all hover:scale-105"
                    style={{ background: 'rgba(88,101,242,0.15)', color: '#5865f2', border: '1px solid rgba(88,101,242,0.4)' }}>
                    Discord
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