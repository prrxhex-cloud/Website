import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Shield, User, Lock, Eye, EyeOff, Store, AlertTriangle, Clock } from 'lucide-react';
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
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Check if user is a reseller
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', user.email.toLowerCase()), where('role', '==', 'reseller'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        recordSuccess(STORE_KEY, email);
        const userData = snapshot.docs[0].data();
        onLogin({ ...userData, uid: user.uid });
      } else {
        // Not a reseller, sign them out
        await auth.signOut();
        const { attempts, lockedUntil } = recordFailedAttempt(STORE_KEY, email);
        if (lockedUntil) {
          setError(`Too many failed attempts. Locked for 15 minutes.`);
          setLocked(true);
        } else {
          setError(`Access denied. This account is not a reseller. (${5 - attempts} attempts remaining)`);
        }
      }
    } catch (err) {
      console.error(err);
      const { attempts, lockedUntil } = recordFailedAttempt(STORE_KEY, email);
      if (lockedUntil) {
        setError(`Too many failed attempts. Locked for 15 minutes.`);
        setLocked(true);
      } else {
        setError(`Invalid credentials. (${5 - attempts} attempts remaining)`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] relative">
      {/* Background Blobs for Login */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] sm:w-[40vw] sm:h-[40vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none blur-[100px]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[40px] p-8 sm:p-12 relative overflow-hidden liquid-glass"
        style={{
          border: `1px solid ${locked ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,255,0.15)'}`,
          boxShadow: locked ? '0 20px 50px rgba(255,68,68,0.15)' : '0 20px 50px rgba(0,212,255,0.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 relative group"
            style={{ background: locked ? 'rgba(255,68,68,0.1)' : 'rgba(0,212,255,0.1)', border: `1px solid ${locked ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,255,0.3)'}` }}>
            <div className={`absolute inset-0 rounded-[24px] blur-xl opacity-50 ${locked ? 'bg-[#ff4444]' : 'bg-[#00d4ff]'}`}></div>
            {locked ? <AlertTriangle className="w-10 h-10 text-red-400 relative z-10" /> : <Store className="w-10 h-10 text-[#00d4ff] relative z-10" />}
          </div>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl tracking-widest uppercase glow-cyan" style={{ color: locked ? '#ff4444' : '#fff' }}>
            {locked ? 'ACCESS LOCKED' : 'RESELLER PORTAL'}
          </h1>
          <p className="font-inter text-sm text-gray-400 mt-3 tracking-wide">
            {locked ? 'Too many failed attempts.' : 'Enter your reseller credentials to continue'}
          </p>
        </div>

        {locked && (
          <div className="mb-8 rounded-2xl p-5 flex items-center gap-4 relative z-10"
            style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)' }}>
            <Clock className="w-6 h-6 text-red-400 flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-orbitron font-bold text-sm text-red-400 tracking-wider">TEMPORARILY LOCKED</p>
              <p className="font-inter text-sm text-gray-400 mt-1">
                Try again in <span className="font-bold text-white">{formatMs(lockRemaining)}</span>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-gray-500 group-focus-within:text-[#00d4ff] transition-colors" />
            </div>
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required
              disabled={locked}
              className="w-full pl-12 pr-4 py-4 rounded-2xl font-inter text-base text-white placeholder-gray-500 outline-none transition-all disabled:opacity-40 bg-black/40 border border-white/10 focus:border-[#00d4ff] focus:bg-black/60 focus:shadow-[0_0_20px_rgba(0,212,255,0.15)]"
              style={{ caretColor: '#00d4ff' }} />
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-[#00d4ff] transition-colors" />
            </div>
            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              disabled={locked}
              className="w-full pl-12 pr-12 py-4 rounded-2xl font-inter text-base text-white placeholder-gray-500 outline-none transition-all disabled:opacity-40 bg-black/40 border border-white/10 focus:border-[#00d4ff] focus:bg-black/60 focus:shadow-[0_0_20px_rgba(0,212,255,0.15)]"
              style={{ caretColor: '#00d4ff' }} />
            <button type="button" onClick={() => setShowPass(!showPass)} disabled={locked}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00d4ff] transition-colors disabled:opacity-40">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)' }}>
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="font-inter text-sm text-red-400 leading-relaxed">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading || locked}
            className="w-full py-4 rounded-2xl font-orbitron font-black text-sm tracking-widest transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/btn"
            style={{ background: 'linear-gradient(90deg, #00d4ff, #ff00ff)', color: '#000', boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin relative z-10" /> : <><Shield className="w-5 h-5 relative z-10" /> <span className="relative z-10">LOGIN SECURELY</span></>}
          </button>
        </form>

        <p className="font-inter text-sm text-gray-500 text-center mt-8 relative z-10">
          Don't have an account? <span className="text-white">Contact admin on Discord.</span>
        </p>
      </motion.div>
    </div>
  );
}