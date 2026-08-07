import React, { useState } from 'react';
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
    <div className="min-h-screen relative overflow-x-hidden liquid-bg text-white">
      <Navbar />
      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
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