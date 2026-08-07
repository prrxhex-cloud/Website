import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Clock, MessageCircle, LogOut, Store, CheckCircle } from 'lucide-react';
import ReceiptUpload from './ReceiptUpload';
import ResellerStatus from './ResellerStatus';
import ResellerSupport from './ResellerSupport';
import SubscriptionHistory from './SubscriptionHistory';

const tabs = [
  { key: 'upload', label: 'Upload Receipt', icon: Upload },
  { key: 'status', label: 'My Orders', icon: Clock },
  { key: 'history', label: 'Sub History', icon: CheckCircle },
  { key: 'support', label: 'Support', icon: MessageCircle },
];

export default function ResellerPortal({ account, onLogout }) {
  const [tab, setTab] = useState('upload');

  return (
    <div className="space-y-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 liquid-glass p-6 rounded-[32px] border border-white/10"
        style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative group"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
            <div className="absolute inset-0 rounded-2xl bg-[#00d4ff] blur-md opacity-40"></div>
            <Store className="w-6 h-6 text-[#00d4ff] relative z-10" />
          </div>
          <div>
            <h1 className="font-orbitron font-black text-xl tracking-widest glow-cyan" style={{ color: '#fff' }}>RESELLER PORTAL</h1>
            <p className="font-inter text-sm text-gray-400 mt-1 tracking-wide">Welcome back, <span className="text-[#00d4ff] font-semibold">{account.display_name || account.email}</span></p>
          </div>
        </div>
        <button onClick={onLogout}
          className="flex items-center gap-2 font-inter font-bold text-sm text-red-400 hover:text-white transition-all px-5 py-2.5 rounded-xl group/btn overflow-hidden relative"
          style={{ border: '1px solid rgba(255,80,80,0.3)', background: 'rgba(255,80,80,0.1)' }}>
          <div className="absolute inset-0 bg-red-500/20 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
          <LogOut className="w-4 h-4 relative z-10" /> <span className="relative z-10 tracking-wider">LOGOUT</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-2 rounded-2xl liquid-glass border border-white/10" style={{ boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-orbitron text-xs font-bold tracking-widest transition-all duration-300 relative overflow-hidden"
              style={{
                color: isActive ? '#000' : 'rgba(255,255,255,0.6)',
                background: isActive ? '#00d4ff' : 'transparent',
                boxShadow: isActive ? '0 0 20px rgba(0,212,255,0.4)' : 'none',
              }}>
              {isActive && <div className="absolute inset-0 bg-white/20"></div>}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Wrapper */}
      <div className="liquid-glass rounded-[40px] p-6 sm:p-8 border border-white/10" style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
            {tab === 'upload' && <ReceiptUpload account={account} />}
            {tab === 'status' && <ResellerStatus account={account} />}
            {tab === 'history' && <SubscriptionHistory account={account} />}
            {tab === 'support' && <ResellerSupport account={account} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}