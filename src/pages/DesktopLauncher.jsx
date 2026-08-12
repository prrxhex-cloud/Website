import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { signInWithPopup, signInWithEmailAndPassword, auth, googleProvider } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

import logoImg from '@/assets/logo.jpeg';

export default function DesktopLauncher() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Tell Electron to resize the window and center it
    if (window.electronAPI && window.electronAPI.onLoginSuccess) {
      window.electronAPI.onLoginSuccess();
    }
    navigate('/dashboard');
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      handleSuccess();
    } catch (err) {
      setError(err.message.includes('popup') ? 'Google login was cancelled.' : err.message);
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      handleSuccess();
    } catch (err) {
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full text-white font-inter flex flex-col items-center justify-center p-6 relative select-none" style={{ WebkitAppRegion: 'drag' }}>
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[320px] bg-slate-900/60 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl relative z-10"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        {/* Close Button */}
        {window.electronAPI && (
          <button 
            onClick={() => window.electronAPI.quitApp()}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            title="Close Application"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-slate-900/80 border border-cyan-500/50 p-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] mx-auto flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl blur-md group-hover:bg-cyan-400/30 transition-all"></div>
            <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl relative z-10" />
          </div>
          <div>
            <h2 className="font-outfit font-extrabold text-2xl text-white tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">PRRX HEX</h2>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-lg p-3 mb-6 flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-50"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-bold text-sm py-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">OR</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-6 w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-white font-medium text-sm py-3 rounded-lg flex items-center justify-center gap-3 transition-all hover:border-slate-600 disabled:opacity-50 disabled:pointer-events-none"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

      </motion.div>
    </div>
  );
}
