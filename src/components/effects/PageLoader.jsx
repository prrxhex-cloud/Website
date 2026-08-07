import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function PageLoader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0=loading, 1=done, 2=exit

  useEffect(() => {
    // Rapid progress fill
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.random() * 18 + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setPhase(1);
      const t = setTimeout(() => {
        setPhase(2);
        setTimeout(() => onDone?.(), 600);
      }, 500);
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
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'var(--page-bg)' }}
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)' }}
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(0,80,200,0.1) 0%, transparent 70%)' }}
            />
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />

          {/* Center content */}
          <div className="relative flex flex-col items-center gap-8 px-8">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'backOut' }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ boxShadow: ['0 0 20px rgba(0,212,255,0.3)', '0 0 60px rgba(0,212,255,0.7)', '0 0 20px rgba(0,212,255,0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)' }}
              >
                <Zap className="w-10 h-10" style={{ color: '#00d4ff' }} />
              </motion.div>

              <div className="text-center">
                <motion.h1
                  className="font-orbitron font-black text-5xl tracking-widest"
                  style={{ color: '#00d4ff', textShadow: '0 0 40px rgba(0,212,255,0.6)' }}
                  animate={{ textShadow: ['0 0 20px rgba(0,212,255,0.4)', '0 0 60px rgba(0,212,255,0.9)', '0 0 20px rgba(0,212,255,0.4)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  PRRX
                </motion.h1>
                <p className="font-inter text-xs text-muted-foreground tracking-[0.4em] uppercase mt-1">
                  HEX Panel
                </p>
              </div>
            </motion.div>

            {/* Progress bar */}
            <div className="w-64 sm:w-80 space-y-3">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${clampedProgress}%`,
                    background: 'linear-gradient(90deg, #0070aa, #00d4ff)',
                    boxShadow: '0 0 12px rgba(0,212,255,0.6)',
                  }}
                  transition={{ ease: 'linear' }}
                />
              </div>

              <div className="flex items-center justify-between">
                <motion.p
                  className="font-inter text-xs text-muted-foreground"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {phase === 1 ? 'READY' : 'INITIALIZING...'}
                </motion.p>
                <p className="font-orbitron text-xs font-bold" style={{ color: '#00d4ff' }}>
                  {Math.round(clampedProgress)}%
                </p>
              </div>
            </div>

            {/* Scan lines */}
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#00d4ff' }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}