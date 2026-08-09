import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cpu } from 'lucide-react';
import logoImg from '@/assets/logo.jpeg';

export default function PageLoader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.random() * 20 + 8;
      });
    }, 45);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setPhase(1);
      const t = setTimeout(() => {
        setPhase(2);
        setTimeout(() => onDone?.(), 400);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [progress, onDone]);

  const clampedProgress = Math.min(progress, 100);

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 font-inter"
        >
          {/* Ambient Security Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,rgba(15,23,42,0.95)_70%,rgba(3,7,18,1)_100%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6 px-8 max-w-md text-center">
            {/* Logo inside Security Shield Orb */}
            <div className="w-20 h-20 rounded-2xl bg-slate-900/80 border border-cyan-400/50 p-2 shadow-[0_0_40px_rgba(6,182,212,0.5)] flex items-center justify-center relative">
              <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl" />
            </div>

            <div className="text-center space-y-1">
              <h1 className="font-outfit font-extrabold text-3xl text-white tracking-wider">
                PRRX <span className="text-[#06b6d4]">HEX</span>
              </h1>
              <p className="font-inter text-xs text-[#06b6d4] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> INITIALIZING SECURITY PROTOCOLS...
              </p>
            </div>

            <div className="w-64 space-y-2">
              <div className="h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#06b6d4] to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  style={{ width: `${clampedProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] font-outfit">
                <span className="flex items-center gap-1 text-[11px] text-[#06b6d4]">
                  <Cpu className="w-3 h-3 animate-pulse" /> {phase === 1 ? 'SECURITY VERIFIED' : 'VERIFYING WAF...'}
                </span>
                <span className="text-white bg-slate-800 px-2 py-0.5 rounded border border-white/10">{Math.round(clampedProgress)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}