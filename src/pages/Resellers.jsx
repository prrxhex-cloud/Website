import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ResellerProfitTable from '@/components/resellers/ResellerProfitTable';
import ResellerLogin from '@/components/resellers/ResellerLogin';
import ResellerPortal from '@/components/resellers/ResellerPortal';
import SessionWatcher from '@/components/security/SessionWatcher';
import { ShieldCheck, TrendingUp, Sparkles, MessageCircle, Lock, Store, ArrowLeft, LogIn } from 'lucide-react';

const SESSION_KEY = 'prrx_reseller_logged_in';
const WHATSAPP_NUMBER = '94761386077';

export default function Resellers() {
  const [resellerUser, setResellerUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = (account) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(account));
    setResellerUser(account);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setResellerUser(null);
  };

  const handleApplyWhatsApp = () => {
    const message = `Hello PRRX HEX Admin! 👋
I would like to apply to become an Authorized PRRX Reseller for External and Internal Free Fire VIP Panels.

Please provide me with reseller onboarding details, bulk key packages, and portal account access!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col font-inter">
      <Navbar />

      {/* Main Page Container */}
      <div className="flex-1 relative z-10 pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        <AnimatePresence mode="wait">
          {!resellerUser ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Header Showcase Banner with Top Corner Reseller Login Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[var(--bg-card)] to-purple-950/40 border border-[var(--border-color)] shadow-xl relative overflow-hidden">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>PRRX RESELLER NETWORK // 30% - 40% COMMISSION RATE</span>
                  </div>
                  <h1 className="font-outfit font-black text-3xl sm:text-4xl text-[var(--text-heading)] tracking-tight">
                    BECOME A PRRX <span className="text-[#06b6d4]">RESELLER</span>
                  </h1>
                  <p className="font-inter text-xs sm:text-sm text-[var(--text-muted)] max-w-xl">
                    Earn massive profit margins with Sri Lanka's #1 Free Fire VIP panel. Instant automated key generation & 24/7 dedicated admin backing.
                  </p>
                </div>

                {/* Top Corner Reseller Login Button */}
                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-center">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-outfit font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 transition-all"
                  >
                    <Lock className="w-4 h-4 text-slate-950" />
                    <span>RESELLER PORTAL LOGIN</span>
                  </button>
                </div>
              </div>

              {/* Full Width Per-Item Profit Breakdown Table */}
              <div className="w-full">
                <ResellerProfitTable onApplyWhatsApp={handleApplyWhatsApp} />
              </div>
            </motion.div>
          ) : (
            /* Logged-in Authorized Reseller Dashboard */
            <motion.div
              key="portal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <SessionWatcher onTimeout={handleLogout} label="Reseller Portal">
                <ResellerPortal account={resellerUser} onLogout={handleLogout} />
              </SessionWatcher>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reseller Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <div className="relative z-10 w-full max-w-md">
              <ResellerLogin
                onLogin={handleLogin}
                onApplyWhatsApp={handleApplyWhatsApp}
                onClose={() => setShowLoginModal(false)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}