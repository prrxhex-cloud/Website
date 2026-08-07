import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User, Lock, Eye, EyeOff, Store, AlertTriangle, Clock } from 'lucide-react';
import { isLocked, getRemainingLockout, recordFailedAttempt, recordSuccess, formatMs } from '@/components/security/SecurityGuard';

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
        const { attempts, lockedUntil } = recordFailedAttempt(STORE_KEY, email);
        if (lockedUntil) {
          setError(`Too many failed attempts. Locked for 15 minutes.`);
          setLocked(true);
        } else {
          setError(`Access denied. Account is not authorized as reseller.`);
        }
      }
    } catch (err) {
      console.error(err);
      const { attempts, lockedUntil } = recordFailedAttempt(STORE_KEY, email);
      if (lockedUntil) {
        setError(`Too many failed attempts. Locked for 15 minutes.`);
        setLocked(true);
      } else {
        setError(`Invalid reseller credentials.`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#06b6d4] flex items-center justify-center mx-auto mb-3">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-900">RESELLER PORTAL</h1>
          <p className="font-inter text-xs text-slate-500">Sign in with your verified reseller account</p>
        </div>

        {locked && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3.5 flex items-center gap-3">
            <Clock className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div>
              <p className="font-bold">Locked Out</p>
              <p>Try again in {formatMs(lockRemaining)}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Reseller Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="reseller@prrxhex.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={locked}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-inter text-slate-900 focus:outline-none focus:border-[#06b6d4] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={locked}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-inter text-slate-900 focus:outline-none focus:border-[#06b6d4] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
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

        <p className="text-center font-inter text-xs text-slate-500">
          Want to become an official reseller? <span className="font-bold text-slate-900">Contact PRRX Admin</span>
        </p>
      </motion.div>
    </div>
  );
}