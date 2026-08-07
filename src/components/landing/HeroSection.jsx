import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Download, Zap, Shield, Cpu } from 'lucide-react';
import HeroParticles from '@/components/effects/HeroParticles';
import DownloadModal from '@/components/landing/DownloadModal';

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showDownload, setShowDownload] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = ((e.clientX - cx) / rect.width) * 14;
    const y = -((e.clientY - cy) / rect.height) * 14;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <HeroParticles />
      {/* Background layers */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(0,60,120,0.45) 0%, rgba(2,8,20,0.98) 70%)'
      }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      {/* Purple accent orb */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(170,68,255,1) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative text-center px-4 sm:px-8 max-w-5xl mx-auto pt-24 w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-inter font-bold tracking-widest"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            LIVE — FREE FIRE PANEL
          </motion.div>

          <h1 className="font-orbitron font-black text-5xl sm:text-7xl lg:text-9xl tracking-widest mb-2 glow-cyan"
            style={{ color: '#fff' }}>
            PRRX
          </h1>
          <h2 className="font-orbitron font-bold text-lg sm:text-2xl lg:text-3xl mb-3 tracking-wider glow-cyan"
            style={{ color: '#00d4ff' }}>
            Sri Lanka's #1 Free Fire Panel
          </h2>
          <p className="font-inter text-muted-foreground text-sm sm:text-base mb-2">
            External Panel · Maximum Performance · Undetected
          </p>

          {/* Panel badges */}
          <div className="flex items-center justify-center gap-3 mb-10 mt-4 flex-wrap">
            {[
              { label: '⚡ External Panel', color: '#00d4ff' },
              { label: '🔥 Internal Panel', color: '#aa44ff' },
              { label: '🛡️ Undetected', color: '#00ff88' },
            ].map(b => (
              <span key={b.label} className="font-orbitron font-bold text-xs px-3 py-1.5 rounded-full"
                style={{ background: `${b.color}15`, border: `1px solid ${b.color}40`, color: b.color }}>
                {b.label}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => setShowDownload(true)}
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(0,212,255,0.6)' }}
              whileTap={{ scale: 0.97 }}
              className="font-orbitron font-bold text-sm tracking-widest px-10 py-4 rounded-xl text-background flex items-center gap-2 pulse-glow"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #0088cc)', boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}
            >
              <Download className="w-4 h-4" /> DOWNLOAD NOW
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo('functions')}
              className="font-orbitron font-bold text-sm tracking-widest px-10 py-4 rounded-xl glass transition-all"
              style={{ color: '#00d4ff' }}
            >
              VIEW FEATURES
            </motion.button>
          </div>
        </motion.div>

        {/* Tilt card */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: 'transform 0.15s ease',
          }}
          className="mt-16 glass rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Cpu, label: 'External Panel · All FF Versions', val: 'EXTERNAL', color: '#00d4ff' },
              { icon: Shield, label: 'Internal Panel · V7a Apk', val: 'INTERNAL', color: '#aa44ff' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center gap-2 py-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <p className="font-orbitron font-black text-sm sm:text-base" style={{ color: item.color }}>{item.val}</p>
                  <p className="font-inter text-xs text-muted-foreground text-center">{item.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Server badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex justify-center mt-8"
        >
          <div className="glass-card rounded-xl px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">🇸🇬</span>
            <div>
              <p className="font-orbitron font-bold text-xs text-foreground">Singapore Server</p>
              <p className="font-inter text-xs text-primary">Main ID Safe</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-2" />
          </div>
        </motion.div>
      </div>

      <motion.button
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={() => scrollTo('features')}
        className="absolute bottom-8 text-primary/50 hover:text-primary transition-colors"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.button>

      <DownloadModal open={showDownload} onClose={() => setShowDownload(false)} />
    </section>
  );
}