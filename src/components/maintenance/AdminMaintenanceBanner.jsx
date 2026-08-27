import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Settings, X, ChevronRight, AlertOctagon, Eye } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMaintenance } from '@/context/MaintenanceContext';

export default function AdminMaintenanceBanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isGlobalMaintenance, pageMaintenance, isAdminUser, allowAdminBypass } = useMaintenance();
  const [minimized, setMinimized] = useState(false);

  // Determine if any maintenance is active
  const activePageCount = Object.values(pageMaintenance || {}).filter(Boolean).length;
  const isAnyMaintenanceActive = isGlobalMaintenance || activePageCount > 0;

  // Only show to authorized admins if maintenance is currently active and user is not already on /admin
  if (!isAdminUser || !isAnyMaintenanceActive || location.pathname === '/admin') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-inter">
      <AnimatePresence>
        {!minimized ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="rounded-2xl p-4 bg-slate-950/95 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)] backdrop-blur-xl text-left max-w-sm"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="font-orbitron font-extrabold text-xs text-amber-400 tracking-wider uppercase">
                  STAFF BYPASS ACTIVE
                </span>
              </div>
              <button
                onClick={() => setMinimized(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Minimize banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 mb-3">
              <p className="text-xs text-slate-200 font-medium">
                {isGlobalMaintenance ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> Master Kill Switch: ACTIVE
                  </span>
                ) : (
                  <span className="text-amber-300 font-semibold">
                    Granular Mode: {activePageCount} page{activePageCount > 1 ? 's' : ''} locked
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-400">
                Visitors are seeing the maintenance screen. You are browsing with full admin clearance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/admin')}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-outfit font-extrabold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] shadow-md"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Manage Controls</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setMinimized(false)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-950/90 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-amber-400 text-xs font-outfit font-bold hover:scale-105 transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Staff Bypass Active</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
