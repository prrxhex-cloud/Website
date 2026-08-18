import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User, Lock, Eye, EyeOff, AlertTriangle, Clock, ShieldCheck, LogIn, MessageCircle, X } from 'lucide-react';
import { isLocked, getRemainingLockout, recordFailedAttempt, recordSuccess, formatMs } from '@/components/security/SecurityGuard';
import logoImg from '@/assets/logo.jpeg';

const STORE_KEY = 'reseller';

export default function ResellerLogin({ onLogin, onApplyWhatsApp, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  useEffect(() => {
    const tick = () => {
      if (isLocked(STORE_KEY)) {
        setLocked(true);
        setLockRemaining(getRemainingLockout(STORE_KEY));
      } else {
        setLocked(false);
        setLockRemaining(0);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked(STORE_KEY)) return;
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', user.email.toLowerCase()), where('role', '==', 'reseller'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        recordSuccess(STORE_KEY, email);
        const userData = snapshot.docs[0].data();
        onLogin({ ...userData, uid: user.uid });
        if (onClose) onClose();
      } else {
        await auth.signOut();
        const { lockedUntil } = recordFailedAttempt(STORE_KEY, email);
        if (lockedUntil) {
          setError(`Too many failed attempts. Locked for 15 minutes.`);
          setLocked(true);
        } else {
          setError(`Access denied. Account is not authorized as reseller.`);
        }
      }
    } catch {
      const { lockedUntil } = recordFailedAttempt(STORE_KEY, email);
      if (lockedUntil) {
        setError(`Too many failed attempts. Locked for 15 minutes.`);
        setLocked(true);
      } else {
        setError('Invalid reseller credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      className="w-full max-w-md clean-card p-6 sm:p-8 shadow-2xl space-y-5 bg-[var(--bg-card)] border border-[var(--border-color)] text-left rounded-3xl relative overflow-hidden"
    >
      {/* Close button if in modal */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-cyan-500/40 p-1 shadow-[0_0_25px_rgba(6,182,212,0.3)] mx-auto mb-2 flex items-center justify-center">
          <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase">
          <ShieldCheck className="w-3.5 h-3.5" /> Authorized Resellers Only
        </div>
        <h2 className="font-outfit font-black text-2xl text-[var(--text-heading)] tracking-tight">
          RESELLER PORTAL
        </h2>
        <p className="font-inter text-xs text-[var(--text-muted)]">
          Sign in to generate keys, upload payment slips, and manage inventory.
        </p>
      </div>

      {locked && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-xl p-3.5 flex items-center gap-3">
          <Clock className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <p className="font-bold">Security Lockout Active</p>
            <p>Try again in {formatMs(lockRemaining)}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-outfit font-bold text-[var(--text-heading)]">
            Reseller Email
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reseller@prrxhex.com"
              required
              disabled={locked || loading}
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 font-inter transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-outfit font-bold text-[var(--text-heading)]">
            Portal Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={locked || loading}
              className="w-full pl-10 pr-10 py-3 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 font-inter transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={locked || loading}
          className="w-full py-3.5 rounded-xl font-outfit font-extrabold text-xs tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>ACCESS RESELLER DASHBOARD</span>
            </>
          )}
        </button>
      </form>

      {/* Apply / Need Account CTA */}
      <div className="pt-3 border-t border-[var(--border-color)] text-center space-y-2">
        <p className="text-[11px] text-[var(--text-muted)]">Don't have a reseller account yet?</p>
        <button
          type="button"
          onClick={onApplyWhatsApp}
          className="w-full py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-outfit font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Apply to Become a Reseller</span>
        </button>
      </div>
    </motion.div>
  );
}