import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, ShieldAlert, Cpu } from 'lucide-react';
import logoImg from '@/assets/logo.jpeg';

export default function LiquidLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Simulate organic security initialization
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsFinished(true), 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 6;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isFinished) {
      setTimeout(onComplete, 600);
    }
  }, [isFinished, onComplete]);

  const clampedProgress = Math.min(progress, 100);

  // Dynamic security status text
  const getSecurityStatusText = () => {
    if (clampedProgress < 35) return 'INITIALIZING SECURITY PROTOCOLS...';
    if (clampedProgress < 70) return 'VERIFYING WAF & ANTI-CHEAT ENCRYPTION...';
    if (clampedProgress < 95) return 'SECURING HYPERVISOR BYPASS MODULES...';
    return 'SECURITY PROTOCOLS VERIFIED — 100%';
  };

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-slate-950 font-inter"
        >
          {/* Cyber Security Ambient Glow Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,rgba(15,23,42,0.95)_70%,rgba(3,7,18,1)_100%)] pointer-events-none" />

          {/* Security Pulse Grid */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"
          />

          {/* Main Security HUD Center Container */}
          <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
            
            {/* Security Shield Orb Container */}
            <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
              
              {/* Outer Counter-Rotating Security Rings */}
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-[#06b6d4]/40"
              />
              <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-3 rounded-full border-t-2 border-b-2 border-indigo-500/50"
              />
              
              {/* Inner Glowing Shield Glass Orb */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.03, 1],
                  boxShadow: [
                    '0 0 30px rgba(6,182,212,0.4)',
                    '0 0 50px rgba(99,102,241,0.6)',
                    '0 0 30px rgba(6,182,212,0.4)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-28 h-28 rounded-3xl bg-slate-900/80 border border-cyan-400/50 backdrop-blur-xl flex flex-col items-center justify-center p-3 relative group"
              >
                {/* Brand Logo & Security Icon */}
                <img src={logoImg} alt="PRRX Logo" className="w-12 h-12 object-contain rounded-xl shadow-md mb-1" />
                <div className="flex items-center gap-1 text-[10px] font-outfit font-black text-[#06b6d4]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SECURE</span>
                </div>
              </motion.div>
            </div>

            {/* Brand Header */}
            <h1 className="font-outfit font-black text-3xl tracking-widest text-white mb-2">
              PRRX <span className="text-[#06b6d4]">HEX</span>
            </h1>

            <div className="flex items-center gap-2 mb-6">
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-outfit font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3 h-3" /> WAF & ANTI-CHEAT ENCRYPTION ACTIVE
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-72 sm:w-80 space-y-2.5">
              <div className="w-full h-2 bg-slate-900 border border-white/10 rounded-full overflow-hidden p-0.5 shadow-inner relative">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-[#06b6d4] via-indigo-500 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,0.9)]"
                  style={{ width: `${clampedProgress}%` }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                />
              </div>

              {/* Dynamic Security Status Text & Percentage */}
              <div className="flex items-center justify-between font-outfit text-xs font-bold tracking-wider">
                <span className="text-[#06b6d4] flex items-center gap-1 text-[11px]">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" /> {getSecurityStatusText()}
                </span>
                <span className="text-white bg-slate-800 px-2 py-0.5 rounded-md border border-white/10 font-extrabold">
                  {Math.round(clampedProgress)}%
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
