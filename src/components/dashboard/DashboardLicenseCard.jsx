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
      <div className="rounded-[32px] p-8 flex items-center gap-6 liquid-glass border border-white/10"
        style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 relative group"
          style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)' }}>
          <div className="absolute inset-0 rounded-2xl bg-[#ffaa00] blur-md opacity-30"></div>
          <Shield className="w-8 h-8 relative z-10" style={{ color: '#ffaa00' }} />
        </div>
        <div className="flex-1">
          <p className="font-orbitron font-black text-lg text-white tracking-widest glow-cyan">NO LICENSE CONNECTED</p>
          <p className="font-inter text-sm text-gray-400 mt-1 tracking-wide">Log in via KeyAuth on the Chat page to view your subscription</p>
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
      className="rounded-[32px] p-8 liquid-glass border border-white/10 overflow-hidden relative"
      style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

      <div className="flex items-center gap-5 mb-8 relative z-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 relative group"
          style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)' }}>
          <div className="absolute inset-0 rounded-2xl bg-[#ffaa00] blur-md opacity-30"></div>
          <Crown className="w-8 h-8 relative z-10" style={{ color: '#ffaa00' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-orbitron font-black text-2xl text-white tracking-wider glow-cyan truncate">{info?.username}</p>
          <p className="font-inter text-sm text-[#00d4ff] mt-1 font-semibold">{sub?.subscription || 'Member'}</p>
        </div>
        <span className={`font-orbitron text-xs px-4 py-2 rounded-xl font-bold flex-shrink-0 tracking-widest ${isExpired ? 'text-red-400 shadow-[0_0_15px_rgba(255,80,80,0.4)]' : 'text-green-400 shadow-[0_0_15px_rgba(0,255,100,0.4)]'}`}
          style={{ background: isExpired ? 'rgba(255,80,80,0.1)' : 'rgba(0,255,100,0.1)', border: `1px solid ${isExpired ? 'rgba(255,80,80,0.3)' : 'rgba(0,255,100,0.3)'}` }}>
          {isExpired ? 'EXPIRED' : 'ACTIVE'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
        <div className="rounded-2xl p-4 text-center bg-black/40 border border-white/10 hover:border-[#00d4ff]/50 transition-colors">
          <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: isExpired ? '#ff5050' : '#00ff64' }} />
          <p className="font-orbitron font-black text-2xl mb-1" style={{ color: isExpired ? '#ff5050' : '#00ff64', textShadow: `0 0 10px ${isExpired ? 'rgba(255,80,80,0.5)' : 'rgba(0,255,100,0.5)'}` }}>{daysLeft ?? '—'}</p>
          <p className="font-inter text-xs text-gray-400 tracking-wide">Days Left</p>
        </div>
        <div className="rounded-2xl p-4 text-center bg-black/40 border border-white/10 hover:border-[#00d4ff]/50 transition-colors">
          <Calendar className="w-5 h-5 mx-auto mb-2 text-[#00d4ff]" />
          <p className="font-inter text-sm font-bold text-white mt-2 mb-1 truncate">{expireDate.split(',')[0]}</p>
          <p className="font-inter text-xs text-gray-400 tracking-wide">Expires</p>
        </div>
        <div className="rounded-2xl p-4 text-center bg-black/40 border border-white/10 hover:border-[#00d4ff]/50 transition-colors">
          <Zap className="w-5 h-5 mx-auto mb-2 text-yellow-400" />
          <p className="font-inter text-sm font-bold text-white mt-2 mb-1 truncate">{sub?.subscription || 'N/A'}</p>
          <p className="font-inter text-xs text-gray-400 tracking-wide">Plan</p>
        </div>
      </div>

      <button onClick={handleLogout}
        className="w-full relative z-10 flex items-center justify-center gap-3 py-3 rounded-xl font-orbitron font-bold text-sm tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group/btn overflow-hidden"
        style={{ border: '1px solid rgba(255,80,80,0.3)', background: 'rgba(255,80,80,0.1)' }}>
        <div className="absolute inset-0 bg-red-500/20 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
        <LogOut className="w-4 h-4 text-red-400 group-hover/btn:text-white transition-colors relative z-10" /> 
        <span className="text-red-400 group-hover/btn:text-white transition-colors relative z-10">DISCONNECT LICENSE</span>
      </button>
    </motion.div>
  );
}