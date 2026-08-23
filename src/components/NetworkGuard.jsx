import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NetworkGuard({ children }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isRetrying, setIsRetrying] = useState(false);

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

  const handleManualRetry = () => {
    setIsRetrying(true);
    fetch('https://prrxhex-cloud.github.io/Website/logo.jpeg', { method: 'HEAD', mode: 'no-cors' })
      .then(() => setIsOnline(true))
      .catch(() => {})
      .finally(() => setTimeout(() => setIsRetrying(false), 1000));
  };

  return (
    <>
      <AnimatePresence>
        {!isOnline && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center font-inter">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="p-8 bg-slate-900 border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)] max-w-md w-full rounded-3xl space-y-5"
            >
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                <WifiOff className="w-8 h-8" />
              </div>
              
              <div className="space-y-1">
                <h1 className="font-outfit font-black text-2xl text-white tracking-tight">
                  NETWORK CONNECTION WEAK
                </h1>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Your device appears to be disconnected or experiencing packet loss on low mobile data.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-[11px] text-cyan-300 font-mono">
                Cached offline shell active · Auto-reconnecting...
              </div>

              <button
                onClick={handleManualRetry}
                disabled={isRetrying}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-outfit font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'TESTING CONNECTION...' : 'RETRY CONNECTION'}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {children}
    </>
  );
}
