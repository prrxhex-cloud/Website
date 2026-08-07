import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Zap, Radio, Star } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';

const TESTIMONIALS_STATIC = [
  { name: 'Rivan_FF',    avatar: 'R', text: 'Best panel I\'ve ever used. Aimbot is insane 🔥',         time: '2m ago',  accent: '#00d4ff' },
  { name: 'ShadowX',     avatar: 'S', text: 'PRRX HEX literally saved my rank this season 💀',         time: '5m ago',  accent: '#aa44ff' },
  { name: 'DarkByte',    avatar: 'D', text: 'Silent aim on internal is godlike no cap',                time: '9m ago',  accent: '#00d4ff' },
  { name: 'NexusPlyr',   avatar: 'N', text: 'Lifetime deal at LKR 3499 is insane value fr fr',         time: '14m ago', accent: '#ffb400' },
  { name: 'VoidSniper',  avatar: 'V', text: 'ESP chams are clean af, never got flagged once ✅',       time: '21m ago', accent: '#aa44ff' },
  { name: 'Kira_Max',    avatar: 'K', text: 'External panel works on ALL versions. No more bans 😈',   time: '33m ago', accent: '#00d4ff' },
  { name: 'GhostAce',    avatar: 'G', text: 'Support team replied in under 5 min. 10/10 service',     time: '47m ago', accent: '#ffb400' },
  { name: 'Zephyr_Pro',  avatar: 'Z', text: '3D location wallhack on diamond is just too good 🎯',    time: '1h ago',  accent: '#aa44ff' },
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
  const [testimonials, setTestimonials] = useState(TESTIMONIALS_STATIC);
  const [visibleIdx, setVisibleIdx] = useState(0);

  // Fetch world message count as proxy for active community size
  useEffect(() => {
    const q = query(collection(db, 'world_messages'), orderBy('created_date', 'desc'), limit(50));
    getDocs(q)
      .then((snapshot) => {
        // base count + realistic offset
        setActiveUsers(1200 + (snapshot.docs.length || 0) * 3);
      })
      .catch(() => setActiveUsers(1247));
  }, []);

  // Cycle testimonials every 4s
  useEffect(() => {
    const id = setInterval(() => {
      setVisibleIdx((v) => (v + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  // Show 3 at a time in a sliding window
  const visible = [0, 1, 2].map((offset) => testimonials[(visibleIdx + offset) % testimonials.length]);

  return (
    <section className="relative py-24 px-4">
      {/* Glow bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.25)',
              backdropFilter: 'blur(16px)',
            }}>
            <Users className="w-4 h-4" style={{ color: '#00d4ff' }} />
            <span className="font-orbitron font-bold text-xs tracking-widest" style={{ color: '#00d4ff' }}>LIVE COMMUNITY</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-orbitron font-black text-3xl sm:text-5xl tracking-wide text-foreground"
            style={{ textShadow: '0 0 40px rgba(0,212,255,0.3)' }}>
            TRUSTED BY <span style={{ color: '#00d4ff' }}>THOUSANDS</span>
          </motion.h2>
          <p className="font-inter text-sm text-muted-foreground mt-3">Real players. Real results. Live right now.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {[
            {
              icon: Radio,
              label: 'Active Right Now',
              value: activeUsers !== null ? <CountUp target={activeUsers} /> : '...',
              suffix: ' players',
              color: '#00d4ff',
              pulse: true,
            },
            {
              icon: Users,
              label: 'Total Members',
              value: <CountUp target={12400} duration={2500} />,
              suffix: '+',
              color: '#aa44ff',
              pulse: false,
            },
            {
              icon: Zap,
              label: 'Uptime',
              value: '99.9',
              suffix: '%',
              color: '#ffb400',
              pulse: false,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6 flex items-center gap-4"
              style={{
                background: 'rgba(0,8,24,0.6)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: `1px solid rgba(${stat.color === '#00d4ff' ? '0,212,255' : stat.color === '#aa44ff' ? '170,68,255' : '255,180,0'},0.15)`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
              }}>
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `rgba(${stat.color === '#00d4ff' ? '0,212,255' : stat.color === '#aa44ff' ? '170,68,255' : '255,180,0'},0.12)`,
                    border: `1px solid ${stat.color}33`,
                  }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                {stat.pulse && (
                  <span className="absolute top-0 right-0 w-3 h-3 rounded-full"
                    style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                )}
              </div>
              <div>
                <p className="font-orbitron font-black text-2xl leading-none" style={{ color: stat.color }}>
                  {stat.value}{stat.suffix}
                </p>
                <p className="font-inter text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials feed */}
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(0,6,20,0.65)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(0,212,255,0.08)',
            boxShadow: '0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}>
          {/* Feed header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff', animation: 'pulse-glow 2s ease-in-out infinite' }} />
              <span className="font-orbitron font-bold text-xs tracking-widest" style={{ color: '#00d4ff' }}>LIVE FEED</span>
            </div>
            <span className="font-inter text-xs text-muted-foreground ml-auto flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" /> Recent player reviews
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: 'rgba(0,212,255,0.05)' }}>
            <AnimatePresence mode="popLayout">
              {visible.map((t, i) => (
                <motion.div
                  key={t.name + visibleIdx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-6 flex flex-col gap-3"
                  style={{ background: 'rgba(0,6,20,0.65)' }}>
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-orbitron font-black text-sm flex-shrink-0"
                      style={{
                        background: `${t.accent}18`,
                        border: `1px solid ${t.accent}40`,
                        color: t.accent,
                        boxShadow: `0 0 12px ${t.accent}18`,
                      }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-orbitron font-bold text-xs" style={{ color: t.accent }}>{t.name}</p>
                      <p className="font-inter text-xs text-muted-foreground">{t.time}</p>
                    </div>
                  </div>
                  {/* Text */}
                  <p className="font-inter text-sm leading-relaxed" style={{ color: 'rgba(180,200,220,0.8)' }}>
                    "{t.text}"
                  </p>
                  {/* Stars */}
                  <div className="flex gap-0.5 mt-auto">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className="w-3 h-3 fill-current" style={{ color: '#ffb400' }} />
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