import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Clock, MessageCircle, LogOut, Store, Key } from 'lucide-react';
import ReceiptUpload from './ReceiptUpload';
import ResellerStatus from './ResellerStatus';
import ResellerSupport from './ResellerSupport';
import KeyHistory from './KeyHistory';

const tabs = [
  { key: 'upload', label: 'Upload Receipt', icon: Upload },
  { key: 'status', label: 'My Orders', icon: Clock },
  { key: 'keys', label: 'Key History', icon: Key },
  { key: 'support', label: 'Support', icon: MessageCircle },
];

export default function ResellerPortal({ account, onLogout }) {
  const [tab, setTab] = useState('upload');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-orbitron font-black text-lg tracking-widest" style={{ color: '#00d4ff' }}>RESELLER PORTAL</h1>
            <p className="font-inter text-xs text-muted-foreground">Welcome, {account.display_name || account.username}</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="flex items-center gap-1.5 font-inter text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg"
          style={{ border: '1px solid rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.05)' }}>
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-inter text-xs font-medium transition-all"
              style={{
                background: tab === t.key ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: tab === t.key ? '#00d4ff' : 'rgba(180,200,220,0.5)',
                border: tab === t.key ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
              }}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {tab === 'upload' && <ReceiptUpload account={account} />}
          {tab === 'status' && <ResellerStatus account={account} />}
          {tab === 'keys' && <KeyHistory account={account} />}
          {tab === 'support' && <ResellerSupport account={account} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}