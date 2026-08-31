import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ShieldAlert, Home, DollarSign, Activity, Gift, ArrowLeft, Radio } from 'lucide-react';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.replace(/^\//, '') || 'unknown-route';

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Cyberpunk Radial Backdrop Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="w-full max-w-2xl mx-auto space-y-6">
          <Breadcrumbs items={[{ label: '404 Error Sentinel', path: location.pathname }]} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-8 sm:p-12 rounded-[32px] bg-slate-950/90 border border-rose-500/30 shadow-[0_0_60px_rgba(244,63,94,0.15)] backdrop-blur-xl text-center space-y-8 relative overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

            {/* Error Code HUD */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-outfit font-extrabold uppercase tracking-widest">
                <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                <span>SECTOR OUT OF BOUNDS</span>
              </div>

              <h1 className="font-outfit font-black text-7xl sm:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 tracking-tighter leading-none">
                404
              </h1>

              <h2 className="font-outfit font-extrabold text-xl sm:text-2xl text-white tracking-tight uppercase">
                TARGET COORDINATE NOT FOUND
              </h2>

              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                The requested URL route <code className="text-rose-300 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/20 font-mono">/{pageName}</code> does not exist on PRRX server nodes or has been relocated.
              </p>
            </div>

            {/* Quick Link Portals */}
            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <span className="text-[11px] font-outfit font-extrabold uppercase tracking-widest text-slate-500 block">
                REDIRECT TO OPERATIONAL NODES
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  to="/"
                  className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/40 text-slate-200 hover:text-cyan-300 font-outfit font-bold text-xs flex flex-col items-center gap-2 transition-all hover:scale-105"
                >
                  <Home className="w-5 h-5 text-cyan-400" />
                  <span>HOME</span>
                </Link>

                <Link
                  to="/prices"
                  className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 font-outfit font-bold text-xs flex flex-col items-center gap-2 transition-all hover:scale-105"
                >
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>VIP PRICES</span>
                </Link>

                <Link
                  to="/status"
                  className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/40 text-slate-200 hover:text-indigo-300 font-outfit font-bold text-xs flex flex-col items-center gap-2 transition-all hover:scale-105"
                >
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <span>LIVE RADAR</span>
                </Link>

                <Link
                  to="/freebies"
                  className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-purple-500/10 border border-slate-800 hover:border-purple-500/40 text-slate-200 hover:text-purple-300 font-outfit font-bold text-xs flex flex-col items-center gap-2 transition-all hover:scale-105"
                >
                  <Gift className="w-5 h-5 text-purple-400" />
                  <span>FREEBIES</span>
                </Link>
              </div>
            </div>

            {/* Back Button */}
            <div>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-outfit font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Previous Page</span>
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}