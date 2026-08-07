import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Shield, User, Lock, Eye, EyeOff, Store, AlertTriangle, Clock } from 'lucide-react';
import { isLocked, getRemainingLockout, recordFailedAttempt, recordSuccess, formatMs } from '@/components/security/SecurityGuard';

const STORE_KEY = 'reseller';

export default function ResellerLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  // Check lockout state every second
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
    const accounts = await base44.entities.ResellerAccount.filter({ username });
    const match = accounts.find(a => a.username === username && a.password === password && a.status === 'active');
    if (match) {
      recordSuccess(STORE_KEY, username);
      onLogin(match);
    } else {
      const { attempts, lockedUntil } = recordFailedAttempt(STORE_KEY, username);
      if (lockedUntil) {
        setError(`Too many failed attempts. Locked for 15 minutes.`);
        setLocked(true);
      } else {
        setError(`Invalid credentials or account suspended. (${5 - attempts} attempts remaining)`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl p-8"
        style={{
          background: 'rgba(0,8,28,0.85)',
          backdropFilter: 'blur(40px)',
          border: `1px solid ${locked ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,255,0.15)'}`,
          boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: locked ? 'rgba(255,68,68,0.1)' : 'rgba(0,212,255,0.1)', border: `1px solid ${locked ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,255,0.3)'}` }}>
            {locked ? <AlertTriangle className="w-8 h-8 text-red-400" /> : <Store className="w-8 h-8 text-primary" />}
          </div>
          <h1 className="font-orbitron font-black text-xl tracking-widest" style={{ color: locked ? '#ff4444' : '#00d4ff', textShadow: `0 0 20px ${locked ? 'rgba(255,68,68,0.5)' : 'rgba(0,212,255,0.5)'}` }}>
            {locked ? 'ACCESS LOCKED' : 'RESELLER PORTAL'}
          </h1>
          <p className="font-inter text-xs text-muted-foreground mt-2">
            {locked ? 'Too many failed attempts.' : 'Enter your reseller credentials to continue'}
          </p>
        </div>

        {/* Lockout countdown */}
        {locked && (
          <div className="mb-6 rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)' }}>
            <Clock className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-orbitron font-bold text-xs text-red-400">TEMPORARILY LOCKED</p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5">
                Try again in {formatMs(lockRemaining)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required
              disabled={locked}
              className="w-full pl-10 pr-4 py-3 rounded-xl font-inter text-sm text-foreground placeholder-muted-foreground outline-none transition-all disabled:opacity-40"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              disabled={locked}
              className="w-full pl-10 pr-10 py-3 rounded-xl font-inter text-sm text-foreground placeholder-muted-foreground outline-none transition-all disabled:opacity-40"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'} />
            <button type="button" onClick={() => setShowPass(!showPass)} disabled={locked}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-40">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)' }}>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="font-inter text-xs text-red-400">{error}</p>
            </div>
          )}
          <button type="submit" disabled={loading || locked}
            className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,150,255,0.1))', border: '1px solid rgba(0,212,255,0.5)', color: '#00d4ff', boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}>
            {loading ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <><Shield className="w-4 h-4" /> LOGIN</>}
          </button>
        </form>

        <p className="font-inter text-xs text-muted-foreground text-center mt-6">
          Don't have an account? Contact admin on Discord.
        </p>
      </motion.div>
    </div>
  );
}