import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

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
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setPhase(1);
      const t = setTimeout(() => {
        setPhase(2);
        setTimeout(() => onDone?.(), 500);
      }, 400);
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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 font-inter"
        >
          <div className="relative flex flex-col items-center gap-6 px-8">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-[#06b6d4]">
              <Zap className="w-8 h-8" />
            </div>

            <div className="text-center">
              <h1 className="font-outfit font-extrabold text-3xl text-slate-900 tracking-wider">
                PRRX <span className="text-[#06b6d4]">CHEATS</span>
              </h1>
              <p className="font-inter text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">
                Loading Undetected Engine...
              </p>
            </div>

            <div className="w-64 space-y-2">
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#06b6d4] to-cyan-500"
                  style={{ width: `${clampedProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-500 font-outfit">
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