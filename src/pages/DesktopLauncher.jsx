import React, { useState, useEffect } from 'react';
import { Shield, User, Lock, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TitleBar from '@/components/TitleBar';
import { useAuth } from '@/lib/AuthContext';

import logoImg from '@/assets/logo.jpeg';

export default function DesktopLauncher() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [license, setLicense] = useState('');
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('prrx_remember_me') === 'true');
  const [activeTab, setActiveTab] = useState('EXTERNAL'); // 'EXTERNAL', 'INTERNAL'
  const navigate = useNavigate();
  const { loginWithKeyAuth, isAuthenticated, logout } = useAuth();

  // Ensure user is logged out when landing on the login screen
  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  // Load saved credentials on mount
  useEffect(() => {
    if (rememberMe) {
      const savedUser = localStorage.getItem('prrx_keyauth_user_name') || localStorage.getItem('prrx_keyauth_email');
      const savedPass = localStorage.getItem('prrx_keyauth_pass');
      const savedLic = localStorage.getItem('prrx_keyauth_license');
      if (savedUser) setUsername(savedUser);
      if (savedPass) setPassword(savedPass);
      if (savedLic) setLicense(savedLic);
    }
  }, []);

  const handleSuccess = () => {
    if (window.electronAPI && window.electronAPI.onLoginSuccess) {
      window.electronAPI.onLoginSuccess();
    }
    navigate('/');
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
    if (!isLicense && (!username || !password)) {
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
        response = await window.electronAPI.keyAuthLogin(type, username, password);
      }

      if (response && response.success) {
        if (rememberMe) {
          localStorage.setItem('prrx_remember_me', 'true');
          if (isLicense) {
            localStorage.setItem('prrx_keyauth_license', license);
          } else {
            localStorage.setItem('prrx_keyauth_user_name', username);
            localStorage.setItem('prrx_keyauth_pass', password);
          }
        } else {
          localStorage.removeItem('prrx_remember_me');
          localStorage.removeItem('prrx_keyauth_user_name');
          localStorage.removeItem('prrx_keyauth_email');
          localStorage.removeItem('prrx_keyauth_pass');
          localStorage.removeItem('prrx_keyauth_license');
        }

        loginWithKeyAuth(response.user, type);
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

        {/* Tabs - Only External & Internal */}
        <div className="flex gap-2 bg-slate-950/50 p-1.5 rounded-xl mb-6 border border-slate-800">
          {['EXTERNAL', 'INTERNAL'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError('');
              }}
              className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
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
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  placeholder="Licence Key"
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
                className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-bold text-sm py-3 rounded-lg border border-cyan-500/40 hover:border-cyan-500 transition-all disabled:opacity-50"
              >
                {loading ? 'AUTHENTICATING...' : 'LOGIN'}
              </button>
              <button
                type="button"
                onClick={() => handleKeyAuthLogin(true)}
                disabled={loading}
                className="w-full bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm py-3 rounded-lg border border-slate-700 hover:border-slate-500 transition-all disabled:opacity-50"
              >
                {loading ? 'AUTHENTICATING...' : 'LICENCE LOGIN'}
              </button>
            </div>
          </motion.div>
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
