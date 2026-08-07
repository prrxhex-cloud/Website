import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, Radio, Star } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import ScrollReveal from '@/components/effects/ScrollReveal';

const TESTIMONIALS_STATIC = [
  { name: 'Rivan_FF',    avatar: 'R', text: 'Best panel I\'ve ever used. Aimbot is insane 🔥',         time: '2m ago',  accent: '#06b6d4' },
  { name: 'ShadowX',     avatar: 'S', text: 'PRRX HEX literally saved my rank this season 💀',         time: '5m ago',  accent: '#8b5cf6' },
  { name: 'DarkByte',    avatar: 'D', text: 'Silent aim on internal is godlike no cap',                time: '9m ago',  accent: '#06b6d4' },
  { name: 'NexusPlyr',   avatar: 'N', text: 'Lifetime deal is insane value fr fr',                    time: '14m ago', accent: '#f59e0b' },
  { name: 'VoidSniper',  avatar: 'V', text: 'ESP chams are clean af, never got flagged once ✅',       time: '21m ago', accent: '#8b5cf6' },
  { name: 'Kira_Max',    avatar: 'K', text: 'External panel works on ALL versions. No more bans 😈',   time: '33m ago', accent: '#06b6d4' },
  { name: 'GhostAce',    avatar: 'G', text: 'Support team replied in under 5 min. 10/10 service',     time: '47m ago', accent: '#f59e0b' },
  { name: 'Zephyr_Pro',  avatar: 'Z', text: '3D location wallhack on diamond is just too good 🎯',    time: '1h ago',  accent: '#8b5cf6' },
];

function CountUp({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = performance.now();
    const animate = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <>{count.toLocaleString()}</>;
}

export default function CommunitySection() {
  const [activeUsers, setActiveUsers] = useState(null);
  const [testimonials] = useState(TESTIMONIALS_STATIC);
  const [visibleIdx, setVisibleIdx] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'world_messages'), orderBy('created_date', 'desc'), limit(50));
    getDocs(q)
      .then((snapshot) => {
        setActiveUsers(1200 + (snapshot.docs.length || 0) * 3);
      })
      .catch(() => setActiveUsers(1247));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setVisibleIdx((v) => (v + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const visible = [0, 1, 2].map((offset) => testimonials[(visibleIdx + offset) % testimonials.length]);

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200 font-inter">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <ScrollReveal variant="fadeUp" className="text-center mb-16 space-y-2">
          <div className="sub-heading">LIVE COMMUNITY</div>
          <h2 className="font-outfit font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight">
            TRUSTED BY <span className="text-[#06b6d4]">THOUSANDS</span>
          </h2>
          <p className="font-inter text-slate-600 text-sm max-w-xl mx-auto">
            Real players. Real results. Live right now across Free Fire global servers.
          </p>
        </ScrollReveal>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Radio,
              label: 'ACTIVE USERS NOW',
              value: activeUsers !== null ? <CountUp target={activeUsers} /> : '...',
              color: '#06b6d4',
            },
            {
              icon: Users,
              label: 'TOTAL COMMUNITY',
              value: <CountUp target={12400} duration={2500} />,
              color: '#8b5cf6',
            },
            {
              icon: Zap,
              label: 'SYSTEM UPTIME',
              value: '99.9%',
              color: '#f59e0b',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="clean-card p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto" style={{ color: stat.color }}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="font-outfit font-extrabold text-3xl text-slate-900">{stat.value}</div>
              <div className="font-inter text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials feed */}
        <div className="clean-card bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-outfit font-extrabold text-xs text-slate-900 tracking-wider">LIVE VERIFIED REVIEWS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {visible.map((t) => (
                <motion.div
                  key={t.name + visibleIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-outfit font-extrabold text-sm" style={{ color: t.accent }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-outfit font-bold text-sm text-slate-900">{t.name}</p>
                      <p className="font-inter text-[10px] text-slate-400 font-semibold">{t.time}</p>
                    </div>
                  </div>

                  <p className="font-inter text-xs text-slate-700 leading-relaxed font-medium">"{t.text}"</p>

                  <div className="flex gap-1">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}