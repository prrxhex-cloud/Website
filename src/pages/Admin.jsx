import React, { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import AdminPortal from '@/components/dashboard/AdminPortal';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function Admin() {
  const [securityScan, setSecurityScan] = useState(true);
  const [scanText, setScanText] = useState('INITIALIZING SECURE CONNECTION...');

  useEffect(() => {
    const sequence = [
      { text: 'VERIFYING ADMIN ENCRYPTION...', time: 400 },
      { text: 'ACCESS GRANTED. OPENING PORTAL...', time: 800 },
    ];

    sequence.forEach(({ text, time }) => {
      setTimeout(() => setScanText(text), time);
    });

    setTimeout(() => {
      setSecurityScan(false);
    }, 1200);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-inter">
      <Navbar />

      <AnimatePresence mode="wait">
        {securityScan ? (
          <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-[70vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#06b6d4]/20 border-t-[#06b6d4] rounded-full animate-spin mb-4" />
            <h2 className="font-outfit font-extrabold text-xl text-slate-900">SYSTEM VERIFICATION</h2>
            <p className="font-inter text-xs text-[#06b6d4] font-bold mt-1">{scanText}</p>
          </motion.div>
        ) : (
          <motion.div key="portal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold font-outfit">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> RESTRICTED STAFF ACCESS
              </div>
              <h1 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900">
                PRRX ADMIN MANAGEMENT PORTAL
              </h1>
              <p className="font-inter text-slate-500 text-xs mt-1">
                Authorized personnel only. System logs active.
              </p>
            </div>

            <AdminPortal />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}