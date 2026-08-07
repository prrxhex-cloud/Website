/**
 * SessionWatcher — wraps portal content and auto-logs out after 30 min of inactivity.
 * Shows a 60-second warning before logout.
 */
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

const TIMEOUT_MS = 30 * 60 * 1000;   // 30 min
const WARN_BEFORE_MS = 60 * 1000;     // warn 1 min before

export default function SessionWatcher({ onTimeout, children, label = 'Session' }) {
  const [warning, setWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef(null);
  const warnRef = useRef(null);
  const countRef = useRef(null);

  const reset = () => {
    clearTimeout(timerRef.current);
    clearTimeout(warnRef.current);
    clearInterval(countRef.current);
    setWarning(false);

    warnRef.current = setTimeout(() => {
      setWarning(true);
      setCountdown(60);
      countRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(countRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    }, TIMEOUT_MS - WARN_BEFORE_MS);

    timerRef.current = setTimeout(() => {
      onTimeout();
    }, TIMEOUT_MS);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handler = () => { if (!warning) reset(); };
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    reset();
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(warnRef.current);
      clearInterval(countRef.current);
      events.forEach(e => window.removeEventListener(e, handler));
    };
  }, [warning]);

  return (
    <>
      {children}
      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="rounded-2xl p-8 w-full max-w-sm text-center space-y-5"
              style={{ background: 'rgba(0,8,28,0.98)', border: '1px solid rgba(255,170,0,0.35)', boxShadow: '0 0 60px rgba(255,170,0,0.15)' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)' }}>
                <AlertTriangle className="w-7 h-7" style={{ color: '#ffaa00' }} />
              </div>
              <div>
                <p className="font-orbitron font-bold text-sm tracking-wider" style={{ color: '#ffaa00' }}>SESSION EXPIRING</p>
                <p className="font-inter text-xs text-muted-foreground mt-1">{label} will auto-logout due to inactivity</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" style={{ color: '#ffaa00' }} />
                <span className="font-orbitron font-black text-3xl" style={{ color: '#ffaa00' }}>{countdown}s</span>
              </div>
              <button
                onClick={reset}
                className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all"
                style={{ background: 'rgba(255,170,0,0.15)', border: '1px solid rgba(255,170,0,0.5)', color: '#ffaa00' }}
              >
                STAY LOGGED IN
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}