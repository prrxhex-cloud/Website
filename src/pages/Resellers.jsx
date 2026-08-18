import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ResellerProfitTable from '@/components/resellers/ResellerProfitTable';
import ResellerLogin from '@/components/resellers/ResellerLogin';
import ResellerPortal from '@/components/resellers/ResellerPortal';
import SessionWatcher from '@/components/security/SessionWatcher';
import { ShieldCheck, TrendingUp, Sparkles, MessageCircle, DollarSign, Store, ArrowLeft } from 'lucide-react';

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

  const handleLogin = (account) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(account));
    setResellerUser(account);
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
      <div className="flex-1 relative z-10 pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        <AnimatePresence mode="wait">
          {!resellerUser ? (
            <motion.div
              key="overview-and-login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {/* Header Showcase Banner */}
              <div className="text-center space-y-3 pt-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PRRX RESELLER NETWORK // 30% - 40% COMMISSION RATE</span>
                </div>
                <h1 className="font-outfit font-black text-4xl sm:text-5xl text-[var(--text-heading)] tracking-tight">
                  BECOME A PRRX <span className="text-[#06b6d4]">RESELLER</span>
                </h1>
                <p className="font-inter text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto">
                  Earn massive profit margins with Sri Lanka's #1 Free Fire VIP panel. Instant automated key generation & 24/7 dedicated admin backing.
                </p>
              </div>

              {/* 2-Column Responsive Layout: Table on Left + Reseller Login on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column (7 cols): Per-Item Profit Breakdown Table */}
                <div className="lg:col-span-7 space-y-6">
                  <ResellerProfitTable onApplyWhatsApp={handleApplyWhatsApp} />
                </div>

                {/* Right Column (5 cols): Reseller Portal Login Card */}
                <div className="lg:col-span-5 sticky top-24">
                  <ResellerLogin
                    onLogin={handleLogin}
                    onApplyWhatsApp={handleApplyWhatsApp}
                    isSideCard={true}
                  />
                </div>
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

      <Footer />
    </div>
  );
}