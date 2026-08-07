import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User, Lock, Eye, EyeOff, AlertTriangle, Clock } from 'lucide-react';
import { isLocked, getRemainingLockout, recordFailedAttempt, recordSuccess, formatMs } from '@/components/security/SecurityGuard';
import logoImg from '@/assets/logo.jpeg';

const STORE_KEY = 'reseller';

export default function ResellerLogin({ onLogin }) {
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
        setError('Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 font-inter text-[var(--text-primary)] transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md clean-card p-8 shadow-2xl space-y-6 bg-[var(--bg-card)] border border-[var(--border-color)] text-left rounded-3xl"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/60 border border-cyan-500/40 p-1.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] mx-auto mb-3 flex items-center justify-center">
            <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-[var(--text-heading)]">RESELLER PORTAL</h2>
          <p className="font-inter text-xs text-[var(--text-muted)]">Authorized PRRX Resellers & Bulk Key Managers</p>
        </div>

        {locked && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-xl p-3.5 flex items-center gap-3">
            <Clock className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="font-bold">Locked Out</p>
              <p>Try again in {formatMs(lockRemaining)}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-heading)] mb-1.5 uppercase">Reseller Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="reseller@prrxhex.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={locked}
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl text-sm font-inter text-[var(--text-heading)] focus:outline-none focus:border-[#06b6d4] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-heading)] mb-1.5 uppercase">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setShowPass(e.target.value)}
                required
                disabled={locked}
                className="w-full pl-10 pr-10 py-3 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl text-sm font-inter text-[var(--text-heading)] focus:outline-none focus:border-[#06b6d4] transition-colors"
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

          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || locked}
            className="btn-primary-cyan btn-glow w-full py-3.5 rounded-xl font-inter font-bold text-sm shadow-md"
          >
            {loading ? 'Authenticating...' : 'Sign In To Portal'}
          </button>
        </form>

        <p className="text-center font-inter text-xs text-[var(--text-muted)]">
          Want to become an official reseller? <span className="font-bold text-[var(--text-heading)]">Contact PRRX Admin</span>
        </p>
      </motion.div>
    </div>
  );
}