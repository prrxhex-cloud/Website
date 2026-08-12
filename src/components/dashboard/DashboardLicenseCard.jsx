import React, { useState } from 'react';
import { Crown, Calendar, Clock, LogOut, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardLicenseCard() {
  const [info, setInfo] = useState(() => {
    try {
      const stored = localStorage.getItem('prrx_keyauth_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const handleLogout = () => {
    localStorage.removeItem('prrx_keyauth_user');
    setInfo(null);
  };

  if (!info) {
    return (
      <div className="rounded-[32px] p-8 flex items-center gap-6 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md text-left">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 relative group bg-amber-500/15 border border-amber-500/30">
          <Shield className="w-8 h-8 relative z-10 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="font-outfit font-black text-lg text-[var(--text-heading)] tracking-wider">NO LICENSE CONNECTED</p>
          <p className="font-inter text-xs text-[var(--text-muted)] mt-1">Log in via KeyAuth to view your subscription</p>
        </div>
      </div>
    );
  }

  const keyAuthData = info?.keyAuthData || info;
  const sub = keyAuthData?.subscriptions?.[0];
  const expireTs = sub?.expiry ? parseInt(sub.expiry) * 1000 : null;
  const isExpired = expireTs && expireTs < Date.now();
  const daysLeft = expireTs ? Math.max(0, Math.ceil((expireTs - Date.now()) / (1000 * 60 * 60 * 24))) : null;
  const expireDate = expireTs ? new Date(expireTs).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-[32px] p-8 bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden relative shadow-lg text-left">

      <div className="flex items-center gap-5 mb-8 relative z-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 relative group bg-amber-500/15 border border-amber-500/30">
          <Crown className="w-8 h-8 relative z-10 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-outfit font-black text-2xl text-[var(--text-heading)] tracking-wider truncate">{keyAuthData?.username || 'KeyAuth User'}</p>
          <p className="font-inter text-sm text-[#06b6d4] mt-1 font-semibold">{sub?.subscription || 'Member'}</p>
        </div>
        <span className={`font-outfit text-xs px-4 py-2 rounded-xl font-bold flex-shrink-0 tracking-widest ${isExpired ? 'bg-red-500/15 border border-red-500/30 text-red-500' : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500'}`}>
          {isExpired ? 'EXPIRED' : 'ACTIVE'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
        <div className="rounded-2xl p-4 text-center bg-[var(--bg-subtle)] border border-[var(--border-color)]">
          <Clock className="w-5 h-5 mx-auto mb-2 text-[#06b6d4]" />
          <p className="font-outfit font-black text-2xl mb-1 text-[var(--text-heading)]">{daysLeft ?? '—'}</p>
          <p className="font-inter text-xs text-[var(--text-muted)] tracking-wide">Days Left</p>
        </div>
        <div className="rounded-2xl p-4 text-center bg-[var(--bg-subtle)] border border-[var(--border-color)]">
          <Calendar className="w-5 h-5 mx-auto mb-2 text-[#06b6d4]" />
          <p className="font-inter text-sm font-bold text-[var(--text-heading)] mt-2 mb-1 truncate">{expireDate}</p>
          <p className="font-inter text-xs text-[var(--text-muted)] tracking-wide">Expires</p>
        </div>
        <div className="rounded-2xl p-4 text-center bg-[var(--bg-subtle)] border border-[var(--border-color)]">
          <Zap className="w-5 h-5 mx-auto mb-2 text-amber-500" />
          <p className="font-inter text-sm font-bold text-[var(--text-heading)] mt-2 mb-1 truncate">{sub?.subscription || 'N/A'}</p>
          <p className="font-inter text-xs text-[var(--text-muted)] tracking-wide">Plan</p>
        </div>
      </div>

      <button onClick={handleLogout}
        className="w-full relative z-10 flex items-center justify-center gap-3 py-3 rounded-xl font-outfit font-bold text-xs tracking-widest transition-all duration-300 bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500/25">
        <LogOut className="w-4 h-4" /> 
        <span>DISCONNECT LICENSE</span>
      </button>
    </motion.div>
  );
}