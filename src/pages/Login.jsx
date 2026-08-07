import React, { useState } from 'react';
import { Shield, Mail, Lock, Loader2, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, signInWithPopup, auth, googleProvider } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.includes('auth/') ? 'Invalid email or password.' : err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.includes('popup') ? 'Google login was cancelled.' : err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative flex flex-col" style={{ background: 'var(--page-bg)' }}>
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative"
          style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)', backdropFilter: 'blur(10px)' }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                 style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,80,160,0.1))', border: '1px solid rgba(0,212,255,0.3)' }}>
              <Key className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-orbitron font-black text-2xl text-foreground tracking-wider mb-1">PRRX PORTAL</h2>
            <p className="font-inter text-sm text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl font-inter text-sm text-foreground placeholder-muted-foreground outline-none transition-all"
                  style={{ background: 'rgba(0,10,25,0.6)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'} 
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl font-inter text-sm text-foreground placeholder-muted-foreground outline-none transition-all"
                  style={{ background: 'rgba(0,10,25,0.6)', border: '1px solid rgba(0,212,255,0.15)', caretColor: '#00d4ff' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'} 
                />
              </div>

              {error && <p className="font-inter text-xs text-red-400 text-center px-2 pt-2">{error}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
                style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,150,255,0.1))', border: '1px solid rgba(0,212,255,0.5)', color: '#00d4ff', boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="h-px flex-1" style={{ background: 'rgba(0,212,255,0.15)' }} />
              <p className="font-orbitron text-xs text-muted-foreground tracking-widest">OR</p>
              <div className="h-px flex-1" style={{ background: 'rgba(0,212,255,0.15)' }} />
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mt-6 py-3.5 rounded-xl font-inter font-semibold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60"
              style={{ background: '#ffffff', color: '#000000' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
