import React, { useState, useEffect } from 'react';
import { Shield, User, Lock, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup, signInWithEmailAndPassword, auth, googleProvider } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import TitleBar from '@/components/TitleBar';
import { useAuth } from '@/lib/AuthContext';

import logoImg from '@/assets/logo.jpeg';

export default function DesktopLauncher() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState(''); // Reused for KeyAuth username
  const [password, setPassword] = useState('');
  const [license, setLicense] = useState('');
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('prrx_remember_me') === 'true');
  const [activeTab, setActiveTab] = useState('WEB'); // 'WEB', 'EXTERNAL', 'INTERNAL'
  const navigate = useNavigate();
  const { loginWithKeyAuth, isAuthenticated, isLoadingAuth } = useAuth();

  // Auto-redirect if already logged in (speeds up Google login significantly)
  useEffect(() => {
    if (isAuthenticated && !isLoadingAuth) {
      handleSuccess();
    }
  }, [isAuthenticated, isLoadingAuth]);

  // Load saved credentials on mount
  useEffect(() => {
    if (rememberMe) {
      const savedEmail = localStorage.getItem('prrx_keyauth_email');
      const savedPass = localStorage.getItem('prrx_keyauth_pass');
      const savedLic = localStorage.getItem('prrx_keyauth_license');
      if (savedEmail) setEmail(savedEmail);
      if (savedPass) setPassword(savedPass);
      if (savedLic) setLicense(savedLic);
    }
  }, []);

  const handleSuccess = () => {
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
      
      // Save for next time if checked
      if (rememberMe) {
        localStorage.setItem('prrx_remember_me', 'true');
        localStorage.setItem('prrx_keyauth_email', email);
        localStorage.setItem('prrx_keyauth_pass', password);
      } else {
        localStorage.removeItem('prrx_remember_me');
        localStorage.removeItem('prrx_keyauth_email');
        localStorage.removeItem('prrx_keyauth_pass');
      }

      handleSuccess();
    } catch (err) {
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  const handleKeyAuthLogin = async (isLicense) => {
    if (!window.electronAPI || !window.electronAPI.keyAuthLogin) {
      setError('Desktop environment required for KeyAuth.');
      return;
    }

    if (isLicense && !license) {
      setError('Please enter a license key.');
      return;
    }
    if (!isLicense && (!email || !password)) {
      setError('Please enter username and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const type = activeTab; // 'EXTERNAL' or 'INTERNAL'
      let response;
      if (isLicense) {
        response = await window.electronAPI.keyAuthLicense(type, license);
      } else {
        response = await window.electronAPI.keyAuthLogin(type, email, password);
      }

      if (response && response.success) {
        if (rememberMe) {
          localStorage.setItem('prrx_remember_me', 'true');
          if (isLicense) {
            localStorage.setItem('prrx_keyauth_license', license);
          } else {
            localStorage.setItem('prrx_keyauth_email', email);
            localStorage.setItem('prrx_keyauth_pass', password);
          }
        } else {
          localStorage.removeItem('prrx_remember_me');
          localStorage.removeItem('prrx_keyauth_email');
          localStorage.removeItem('prrx_keyauth_pass');
          localStorage.removeItem('prrx_keyauth_license');
        }

        loginWithKeyAuth(response.user);
        handleSuccess();
      } else {
        setError(response.message || 'KeyAuth authentication failed.');
      }
    } catch (err) {
      setError(err.message || 'Unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100vh] w-full text-white font-inter flex flex-col items-center justify-center relative select-none bg-slate-950" style={{ WebkitAppRegion: 'drag' }}>
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <TitleBar />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-full max-w-[340px] p-6 pt-12 relative z-10 flex flex-col justify-center"
        style={{ WebkitAppRegion: 'no-drag' }}
      >

        {/* Header */}
        <div className="text-center space-y-4 mb-6 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-cyan-500/50 p-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] mx-auto flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl blur-md group-hover:bg-cyan-400/30 transition-all"></div>
            <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl relative z-10" />
          </div>
          <div>
            <h2 className="font-outfit font-extrabold text-xl text-white tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">PRRX HEX</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-950/50 p-1 rounded-lg mb-6 border border-slate-800">
          {['WEB', 'EXTERNAL', 'INTERNAL'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError('');
              }}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-lg p-3 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1">
          {activeTab === 'WEB' ? (
            <motion.form 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleEmailLogin} 
              className="space-y-4"
            >
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

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="rememberWeb"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
                />
                <label htmlFor="rememberWeb" className="text-xs text-slate-400 cursor-pointer select-none">
                  Remember credentials
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-bold text-sm py-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
              </button>

              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">OR</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="mt-4 w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-white font-medium text-sm py-3 rounded-lg flex items-center justify-center gap-3 transition-all hover:border-slate-600 disabled:opacity-50 disabled:pointer-events-none"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </motion.form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-50 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 opacity-80">
                    <User size={16} />
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-50 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 opacity-80">
                    <Lock size={16} />
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Licence"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-50 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 opacity-80">
                    <Key size={16} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="rememberAuth"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
                />
                <label htmlFor="rememberAuth" className="text-xs text-slate-400 cursor-pointer select-none">
                  Remember credentials
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleKeyAuthLogin(false)}
                  disabled={loading}
                  className="w-full bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm py-3 rounded-lg border border-slate-700 hover:border-slate-500 transition-all disabled:opacity-50"
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyAuthLogin(true)}
                  disabled={loading}
                  className="w-full bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm py-3 rounded-lg border border-slate-700 hover:border-slate-500 transition-all disabled:opacity-50"
                >
                  LICENCE LOGIN
                </button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Settings Toggle */}
        <div className="mt-4 flex justify-center">
          <button 
            type="button"
            onClick={() => {
              const current = localStorage.getItem('prrx_show_fps') === 'true';
              localStorage.setItem('prrx_show_fps', (!current).toString());
              window.dispatchEvent(new Event('prrx_toggle_fps'));
            }}
            className="text-[10px] text-slate-500 hover:text-white uppercase tracking-wider font-bold transition-colors"
          >
            Toggle FPS Overlay
          </button>
        </div>
      </motion.div>
    </div>
  );
}
