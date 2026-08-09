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
        return p + Math.random() * 25 + 10;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setPhase(1);
      const t = setTimeout(() => {
        setPhase(2);
        setTimeout(() => onDone?.(), 300);
      }, 250);
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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-main)] font-inter"
        >
          <div className="relative flex flex-col items-center gap-5 px-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-900/60 border border-cyan-500/40 p-2 shadow-lg flex items-center justify-center">
              <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl" />
            </div>

            <div className="text-center">
              <h1 className="font-outfit font-extrabold text-2xl text-[var(--text-heading)] tracking-wider">
                PRRX <span className="text-[#06b6d4]">CHEATS STORE</span>
              </h1>
            </div>

            <div className="w-56 space-y-2">
              <div className="h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#06b6d4] to-indigo-500"
                  style={{ width: `${clampedProgress}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}