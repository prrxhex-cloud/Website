import React, { useState } from 'react';
import { Crown, Calendar, Activity, Clock, LogOut, Shield, Zap } from 'lucide-react';
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
      <div className="rounded-2xl p-6 flex items-center gap-4"
        style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.12)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)' }}>
          <Shield className="w-6 h-6" style={{ color: '#ffaa00' }} />
        </div>
        <div className="flex-1">
          <p className="font-orbitron font-bold text-sm text-foreground">No License Connected</p>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">Log in via KeyAuth on the Chat page to view your subscription</p>
        </div>
      </div>
    );
  }

  const sub = info?.subscriptions?.[0];
  const expireTs = sub?.expiry ? parseInt(sub.expiry) * 1000 : null;
  const isExpired = expireTs && expireTs < Date.now();
  const daysLeft = expireTs ? Math.max(0, Math.ceil((expireTs - Date.now()) / (1000 * 60 * 60 * 24))) : null;
  const expireDate = expireTs ? new Date(expireTs).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6"
      style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,80,160,0.08))', border: '1px solid rgba(0,212,255,0.2)' }}>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,170,0,0.15)', border: '1px solid rgba(255,170,0,0.3)' }}>
          <Crown className="w-7 h-7" style={{ color: '#ffaa00' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-orbitron font-black text-lg text-foreground tracking-wide">{info?.username}</p>
          <p className="font-inter text-xs text-primary mt-0.5">{sub?.subscription || 'Member'}</p>
        </div>
        <span className={`font-inter text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${isExpired ? 'text-red-400' : 'text-green-400'}`}
          style={{ background: isExpired ? 'rgba(255,80,80,0.1)' : 'rgba(0,255,100,0.1)', border: `1px solid ${isExpired ? 'rgba(255,80,80,0.3)' : 'rgba(0,255,100,0.3)'}` }}>
          {isExpired ? 'EXPIRED' : 'ACTIVE'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,15,35,0.5)', border: '1px solid rgba(0,212,255,0.08)' }}>
          <Clock className="w-4 h-4 mx-auto mb-1" style={{ color: isExpired ? '#ff5050' : '#00ff64' }} />
          <p className="font-orbitron font-black text-lg" style={{ color: isExpired ? '#ff5050' : '#00ff64' }}>{daysLeft ?? '—'}</p>
          <p className="font-inter text-xs text-muted-foreground">Days Left</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,15,35,0.5)', border: '1px solid rgba(0,212,255,0.08)' }}>
          <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="font-inter text-xs font-bold text-foreground mt-1.5">{expireDate.split(',')[0]}</p>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">Expires</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,15,35,0.5)', border: '1px solid rgba(0,212,255,0.08)' }}>
          <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
          <p className="font-inter text-xs font-bold text-foreground mt-1.5">{sub?.subscription || 'N/A'}</p>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">Plan</p>
        </div>
      </div>

      <button onClick={handleLogout}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-xl font-inter text-xs text-red-400 hover:text-red-300 transition-colors"
        style={{ border: '1px solid rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.05)' }}>
        <LogOut className="w-3.5 h-3.5" /> Disconnect License
      </button>
    </motion.div>
  );
}