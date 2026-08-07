import React, { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import AdminPortal from '@/components/dashboard/AdminPortal';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, Lock, Fingerprint, Scan, AlertTriangle } from 'lucide-react';

export default function Admin() {
  const [securityScan, setSecurityScan] = useState(true);
  const [scanText, setScanText] = useState('INITIALIZING SECURE CONNECTION...');

  useEffect(() => {
    // Fake security scan sequence for aesthetic & perceived security
    const sequence = [
      { text: 'ESTABLISHING ENCRYPTED TUNNEL...', time: 800 },
      { text: 'VERIFYING ADMIN CREDENTIALS...', time: 1600 },
      { text: 'SCANNING FOR INTRUSIONS...', time: 2400 },
      { text: 'BYPASSING FIREWALLS...', time: 3000 },
      { text: 'ACCESS GRANTED. DECRYPTING PORTAL...', time: 3800 },
    ];

    sequence.forEach(({ text, time }) => {
      setTimeout(() => setScanText(text), time);
    });

    setTimeout(() => {
      setSecurityScan(false);
    }, 4500);
  }, []);

  return (
    <div className="min-h-screen bg-[#00020a] text-white overflow-x-hidden selection:bg-[#ffaa00]/30 relative font-inter">
      {/* Liquid fluid animated blobs (Admin theme: Deep Space Navy, Cyan, Orange warning) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#331100] blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#001a33] blur-[150px] mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-[#1a0033] blur-[130px] mix-blend-screen animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        
        <AnimatePresence mode="wait">
          {securityScan ? (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              className="min-h-screen flex flex-col items-center justify-center relative z-50">
              <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                <div className="absolute inset-0 border-4 border-t-[#00d4ff] border-r-transparent border-b-[#ffaa00] border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-t-transparent border-r-[#00d4ff] border-b-transparent border-l-[#ffaa00] rounded-full animate-spin-reverse opacity-70"></div>
                <div className="absolute inset-0 bg-[#00d4ff] blur-2xl opacity-20 animate-pulse"></div>
                <Scan className="w-16 h-16 text-[#00d4ff] relative z-10" />
                <div className="absolute w-full h-1 bg-[#00d4ff]/50 shadow-[0_0_15px_#00d4ff] animate-scanline"></div>
              </div>
              <h2 className="font-orbitron font-black text-2xl tracking-[0.3em] glow-cyan mb-2 text-center">PRRX_SYS_DEFENSE</h2>
              <p className="font-inter text-sm text-[#ffaa00] tracking-widest font-bold animate-pulse text-center h-6">{scanText}</p>
            </motion.div>
          ) : (
            <motion.div key="portal" initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.8 }}
              className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-32 pb-24">
              
              <div className="text-center mb-12">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-6 py-2 rounded-2xl mb-6 border relative overflow-hidden group"
                  style={{ background: 'rgba(255,80,80,0.1)', borderColor: 'rgba(255,80,80,0.3)', boxShadow: '0 0 30px rgba(255,80,80,0.2)' }}>
                  <div className="absolute inset-0 bg-red-500/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                  <ShieldAlert className="w-5 h-5 text-red-500 relative z-10 animate-pulse" />
                  <span className="font-orbitron text-sm font-black tracking-widest text-red-500 relative z-10">LEVEL 5 CLEARANCE REQUIRED</span>
                </motion.div>
                
                <h1 className="font-orbitron font-black text-4xl sm:text-5xl lg:text-6xl tracking-widest text-white mb-4 relative inline-block">
                  <span className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">ADMIN OVERRIDE</span>
                  <div className="absolute -inset-4 bg-white/5 blur-xl -z-10 rounded-full"></div>
                </h1>
                
                <p className="font-inter text-lg text-gray-400 max-w-2xl mx-auto">
                  Full platform management, security oversight, and infrastructure control. <span className="text-red-400 font-bold">All actions are logged.</span>
                </p>
              </div>

              <AdminPortal />

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}