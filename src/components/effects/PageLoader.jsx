import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        return p + Math.random() * 20 + 5;
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
  }, [progress]);

  const clampedProgress = Math.min(progress, 100);

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-main)] font-inter"
        >
          <div className="relative flex flex-col items-center gap-6 px-8">
            {/* Logo in glowing glass orb */}
            <div className="w-20 h-20 rounded-2xl bg-slate-900/60 border border-cyan-500/40 p-2 shadow-[0_0_40px_rgba(6,182,212,0.4)] flex items-center justify-center">
              <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl" />
            </div>

            <div className="text-center">
              <h1 className="font-outfit font-extrabold text-3xl text-[var(--text-heading)] tracking-wider">
                PRRX <span className="text-[#06b6d4]">CHEATS STORE</span>
              </h1>
              <p className="font-inter text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mt-1">
                Loading Undetected Engine...
              </p>
            </div>

            <div className="w-64 space-y-2">
              <div className="h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#06b6d4] to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  style={{ width: `${clampedProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] font-outfit">
                <span>{phase === 1 ? 'READY' : 'INITIALIZING'}</span>
                <span className="text-[#06b6d4]">{Math.round(clampedProgress)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}