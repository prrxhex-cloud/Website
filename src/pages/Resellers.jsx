import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
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
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--page-bg)' }}>
      <Navbar />
      <div className="relative z-10 pt-28 pb-20 px-4 max-w-5xl mx-auto">
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
    </div>
  );
}