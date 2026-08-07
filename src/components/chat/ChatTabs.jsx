import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Bot } from 'lucide-react';

const tabs = [
  { key: 'admin', label: 'Support', icon: Shield, color: '#ffaa00' },
  { key: 'world', label: 'World', icon: Globe, color: '#00d4ff' },
  { key: 'ai', label: 'AI', icon: Bot, color: '#a855f7' },
];

export default function ChatTabs({ active, onChange }) {
  return (
    <div className="flex gap-2 p-3 border-b" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(tab.key)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-inter font-semibold text-xs tracking-wide transition-all duration-300"
            style={{
              background: isActive ? `${tab.color}15` : 'transparent',
              border: `1px solid ${isActive ? `${tab.color}40` : 'rgba(255,255,255,0.05)'}`,
              color: isActive ? tab.color : 'rgba(180,200,220,0.5)',
              boxShadow: isActive ? `0 0 20px ${tab.color}10` : 'none',
            }}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}