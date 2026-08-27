import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

import logoImg from '@/assets/logo.jpeg';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if there's a specific redirect requested
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/prices';

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign in failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md clean-card p-8 shadow-xl space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-slate-900/60 border border-cyan-500/40 p-1.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] mx-auto mb-3 flex items-center justify-center">
              <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <h2 className="font-outfit font-extrabold text-2xl text-[var(--text-heading)]">PRRX USER PORTAL</h2>
            <p className="font-inter text-xs text-[var(--text-muted)]">Sign in to manage your active panel subscriptions</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
              <Shield className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-secondary-white w-full py-3.5 font-inter font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition-all disabled:opacity-75"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating Securely...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
