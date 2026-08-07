import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiquidLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Simulate loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsFinished(true), 500); // Small delay before hiding
          return 100;
        }
        // Random jumps for a more organic feel
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isFinished) {
      setTimeout(onComplete, 800); // Wait for exit animation
    }
  }, [isFinished, onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'var(--page-bg)' }}
        >
          {/* Background Liquid Blobs for Loader */}
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,1) 0%, rgba(255,0,255,0.5) 100%)' }}
          />

          {/* Core HUD */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
              {/* Outer Spinners */}
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-t-2 border-b-2 border-[#00d4ff] opacity-50"
              />
              <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border-l-2 border-r-2 border-[#ff00ff] opacity-50"
              />
              
              {/* Central Liquid Core */}
              <motion.div 
                animate={{ 
                  borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "70% 30% 50% 50% / 30% 60% 40% 70%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-gradient-to-tr from-[#00d4ff] to-[#ff00ff] shadow-[0_0_30px_rgba(0,212,255,0.8)]"
              />
            </div>

            {/* Text & Progress */}
            <h1 className="font-orbitron font-bold text-3xl tracking-[0.2em] mb-4 glow-cyan">PRRX HEX</h1>
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00d4ff] to-[#ff00ff]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>
            <p className="mt-2 text-sm font-inter text-[#00d4ff]/80 tracking-widest uppercase">
              INITIALIZING LIQUID PROTOCOL... {progress > 100 ? 100 : progress}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
