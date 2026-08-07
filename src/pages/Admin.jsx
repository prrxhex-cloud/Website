import React from 'react';
import Navbar from '@/components/landing/Navbar';
import AdminPortal from '@/components/dashboard/AdminPortal';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function Admin() {
  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--page-bg)' }}>
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.25)' }}>
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-orbitron text-xs font-bold tracking-widest text-yellow-400">RESTRICTED ACCESS</span>
            </div>
            <h1 className="font-orbitron font-black text-3xl sm:text-4xl tracking-widest text-foreground mb-2">
              ADMIN PORTAL
            </h1>
            <p className="font-inter text-sm text-muted-foreground">Full platform management & infrastructure control</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <AdminPortal />
          </motion.div>
        </div>
      </div>
    </div>
  );
}