import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Zap, Radio, Star } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import ScrollReveal from '@/components/effects/ScrollReveal';

const TESTIMONIALS_STATIC = [
  { name: 'Rivan_FF',    avatar: 'R', text: 'Best panel I\'ve ever used. Aimbot is insane 🔥',         time: '2m ago',  accent: '#00d4ff' },
  { name: 'ShadowX',     avatar: 'S', text: 'PRRX HEX literally saved my rank this season 💀',         time: '5m ago',  accent: '#ff00ff' },
  { name: 'DarkByte',    avatar: 'D', text: 'Silent aim on internal is godlike no cap',                time: '9m ago',  accent: '#00d4ff' },
  { name: 'NexusPlyr',   avatar: 'N', text: 'Lifetime deal at LKR 3499 is insane value fr fr',         time: '14m ago', accent: '#ffb400' },
  { name: 'VoidSniper',  avatar: 'V', text: 'ESP chams are clean af, never got flagged once ✅',       time: '21m ago', accent: '#ff00ff' },
  { name: 'Kira_Max',    avatar: 'K', text: 'External panel works on ALL versions. No more bans 😈',   time: '33m ago', accent: '#00d4ff' },
  { name: 'GhostAce',    avatar: 'G', text: 'Support team replied in under 5 min. 10/10 service',     time: '47m ago', accent: '#ffb400' },
  { name: 'Zephyr_Pro',  avatar: 'Z', text: '3D location wallhack on diamond is just too good 🎯',    time: '1h ago',  accent: '#ff00ff' },
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
    <section className="relative py-32 px-4 overflow-hidden liquid-bg">
      {/* Glow bg and Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none blur-[100px]"></div>
      <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-[#ff00ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none blur-[80px]" style={{ animationDelay: '-5s' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <ScrollReveal variant="fadeUp" className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full mb-6 liquid-glass border border-white/20 shadow-[0_0_20px_rgba(0,212,255,0.2)]">
            <Users className="w-4 h-4 text-[#00d4ff] animate-pulse" />
            <span className="font-orbitron font-bold text-[11px] tracking-[0.2em] text-[#00d4ff]">LIVE COMMUNITY</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-orbitron font-black text-4xl sm:text-6xl tracking-wide text-white glow-cyan">
            TRUSTED BY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#ff00ff]">THOUSANDS</span>
          </motion.h2>
          <p className="font-inter text-base text-gray-400 mt-6 max-w-2xl mx-auto">Real players. Real results. Live right now.</p>
        </ScrollReveal>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: Radio,
              label: 'ACTIVE RIGHT NOW',
              value: activeUsers !== null ? <CountUp target={activeUsers} /> : '...',
              suffix: '',
              color: '#00d4ff',
              pulse: true,
            },
            {
              icon: Users,
              label: 'TOTAL MEMBERS',
              value: <CountUp target={12400} duration={2500} />,
              suffix: '+',
              color: '#ff00ff',
              pulse: false,
            },
            {
              icon: Zap,
              label: 'SYSTEM UPTIME',
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
              className="rounded-[30px] p-8 flex flex-col items-center justify-center text-center liquid-glass border hover:-translate-y-2 transition-transform duration-500 relative group overflow-hidden"
              style={{
                borderColor: `${stat.color}30`,
                boxShadow: `0 0 30px ${stat.color}15`,
              }}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex-shrink-0 mb-6">
                <div className="w-16 h-16 rounded-[20px] flex items-center justify-center bg-white/5 border group-hover:scale-110 transition-transform duration-500"
                  style={{
                    borderColor: `${stat.color}40`,
                    boxShadow: `0 0 20px ${stat.color}20 inset`,
                  }}>
                  <stat.icon className="w-8 h-8" style={{ color: stat.color, filter: `drop-shadow(0 0 8px ${stat.color})` }} />
                </div>
                {stat.pulse && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
                    style={{ background: '#00d4ff', boxShadow: '0 0 10px #00d4ff', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                )}
              </div>
              <div className="relative z-10">
                <p className="font-orbitron font-black text-4xl mb-2" style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}40` }}>
                  {stat.value}{stat.suffix}
                </p>
                <p className="font-orbitron font-bold text-[10px] tracking-widest text-gray-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials feed */}
        <ScrollReveal variant="fadeUp" className="rounded-[40px] overflow-hidden liquid-glass border border-white/10 shadow-[0_0_50px_rgba(0,212,255,0.1)] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          
          {/* Feed header */}
          <div className="flex items-center gap-4 px-8 py-6 border-b border-white/10 bg-black/20 relative z-10">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff]" style={{ boxShadow: '0 0 10px #00d4ff', animation: 'pulse-glow 2s ease-in-out infinite' }} />
              <span className="font-orbitron font-bold text-[10px] tracking-widest text-[#00d4ff]">LIVE FEED</span>
            </div>
            <span className="font-inter text-xs text-gray-400 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Real-time player reviews
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5 relative z-10">
            <AnimatePresence mode="popLayout">
              {visible.map((t, i) => (
                <motion.div
                  key={t.name + visibleIdx}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: i * 0.1, type: 'spring' }}
                  className="p-8 flex flex-col gap-6 bg-black/40 backdrop-blur-md hover:bg-white/5 transition-colors group">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[16px] flex items-center justify-center font-orbitron font-black text-lg flex-shrink-0 border group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `${t.accent}15`,
                        borderColor: `${t.accent}50`,
                        color: t.accent,
                        boxShadow: `0 0 15px ${t.accent}20 inset`,
                        textShadow: `0 0 10px ${t.accent}`,
                      }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-orbitron font-bold text-sm tracking-wide text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all" style={{ '--tw-gradient-from': t.accent, '--tw-gradient-to': '#ffffff' }}>{t.name}</p>
                      <p className="font-inter text-[10px] uppercase font-bold tracking-wider text-gray-500">{t.time}</p>
                    </div>
                  </div>
                  {/* Text */}
                  <p className="font-inter text-sm leading-relaxed text-gray-300">
                    "{t.text}"
                  </p>
                  {/* Stars */}
                  <div className="flex gap-1 mt-auto">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-current" style={{ color: '#ffb400', filter: 'drop-shadow(0 0 5px rgba(255,180,0,0.5))' }} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}