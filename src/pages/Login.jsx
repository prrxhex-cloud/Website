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
    <div className="min-h-screen overflow-x-hidden relative flex flex-col liquid-bg text-white">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-20 relative">
        {/* Background Blobs for Login */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] sm:w-[40vw] sm:h-[40vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none blur-[100px]"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl relative liquid-glass border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center border-b border-white/5 relative z-10">
            <div className="w-20 h-20 mx-auto rounded-[24px] flex items-center justify-center mb-6 relative group"
                 style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
              <div className="absolute inset-0 rounded-[24px] bg-[#00d4ff] blur-xl opacity-40"></div>
              <Key className="w-10 h-10 text-[#00d4ff] relative z-10" />
            </div>
            <h2 className="font-orbitron font-black text-3xl tracking-widest uppercase glow-cyan mb-2">PRRX PORTAL</h2>
            <p className="font-inter text-sm text-gray-400 tracking-wide">Sign in to access your dashboard</p>
          </div>

          <div className="p-8 sm:p-10 relative z-10">
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-[#00d4ff] transition-colors" />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl font-inter text-base text-white placeholder-gray-500 outline-none transition-all disabled:opacity-40 bg-black/40 border border-white/10 focus:border-[#00d4ff] focus:bg-black/60 focus:shadow-[0_0_20px_rgba(0,212,255,0.15)]"
                  style={{ caretColor: '#00d4ff' }}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-[#00d4ff] transition-colors" />
                </div>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl font-inter text-base text-white placeholder-gray-500 outline-none transition-all disabled:opacity-40 bg-black/40 border border-white/10 focus:border-[#00d4ff] focus:bg-black/60 focus:shadow-[0_0_20px_rgba(0,212,255,0.15)]"
                  style={{ caretColor: '#00d4ff' }}
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)' }}>
                  <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="font-inter text-sm text-red-400 leading-relaxed">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-2xl font-orbitron font-black text-sm tracking-widest transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/btn"
                style={{ background: 'linear-gradient(90deg, #00d4ff, #ff00ff)', color: '#000', boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                {loading ? <Loader2 className="w-5 h-5 animate-spin relative z-10" /> : <Shield className="w-5 h-5 relative z-10" />}
                <span className="relative z-10">{loading ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
              </button>
            </form>

            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5))' }} />
              <p className="font-orbitron text-xs text-[#00d4ff] font-bold tracking-widest">OR</p>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, transparent, rgba(0,212,255,0.5))' }} />
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mt-8 py-4 rounded-2xl font-inter font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              SIGN IN WITH GOOGLE
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
