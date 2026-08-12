import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NetworkGuard({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-inter">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="clean-card p-10 bg-[var(--bg-card)] border border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.1)] max-w-md w-full rounded-2xl"
        >
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-10 h-10 text-rose-500" />
          </div>
          
          <h1 className="font-outfit font-extrabold text-3xl text-white mb-3 tracking-tight">
            CONNECTION LOST
          </h1>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This premium application requires a constant internet connection to securely track activity and verify your license. Please restore your connection to continue.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-400 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            Waiting for network...
          </div>
        </motion.div>
      </div>
    );
  }

  return children;
}
