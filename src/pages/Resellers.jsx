import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ResellerLogin from '@/components/resellers/ResellerLogin';
import ResellerPortal from '@/components/resellers/ResellerPortal';
import SessionWatcher from '@/components/security/SessionWatcher';

const SESSION_KEY = 'prrx_reseller_logged_in';

export default function Resellers() {
  const [resellerUser, setResellerUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; }
  });
  const handleLogin = (account) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(account));
    setResellerUser(account);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setResellerUser(null);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col">
      <Navbar />
      <div className="flex-1 relative z-10 pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!resellerUser ? (
            <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ResellerLogin onLogin={handleLogin} />
            </motion.div>
          ) : (
            <motion.div key="portal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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