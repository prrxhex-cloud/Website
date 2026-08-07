import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Crosshair, Eye, Zap, Shield, Lock, Cpu, Layers, Wind, Map } from 'lucide-react';
import InteractiveCard from '@/components/effects/InteractiveCard';
import ScrollReveal from '@/components/effects/ScrollReveal';

// ─── EXTERNAL PANEL ───────────────────────────────────────────────
const externalGroups = [
  {
    title: 'Aimbot Menu',
    emoji: '🎯',
    items: ['Aimbot Head', 'Aimbot Drag', 'Aimbot External', 'Aimbot Neck', 'Aimbot Power Change'],
  },
  {
    title: 'Repair Menu',
    emoji: '🔧',
    items: ['Mouse Bot', 'Headshot Boost', 'Mouse Recoil', 'Chams Fix', 'Female Fix (Lobby)', 'Mouse Bot Power Change'],
  },
  {
    title: 'ESP Menu',
    emoji: '👁️',
    items: ['Chams Menu v1', 'Chams Menu v2', '3D Location', 'Glow Hack'],
  },
];

// ─── INTERNAL PANEL ───────────────────────────────────────────────
const internalGroups = [
  {
    title: '🎯 Combat',
    emoji: '🔫',
    color: '#ff4444',
    items: [
      { label: 'Silent Aim', emoji: '🔫' },
      { label: 'Aimbot Range', emoji: '📏' },
      { label: 'ESP Menu', emoji: '👁️' },
      { label: 'Fast Fire', emoji: '🏎️' },
      { label: 'Rapid Fire', emoji: '🧨' },
      { label: 'Auto Spawn Kill', emoji: '⚰️' },
    ],
  },
  {
    title: '💀 Special Kills',
    emoji: '💀',
    color: '#aa44ff',
    items: [
      { label: 'Under Kill', emoji: '🕳️' },
      { label: 'Drive Kill', emoji: '🏎️' },
    ],
  },
  {
    title: '🌀 Movement & Teleport',
    emoji: '⚡',
    color: '#00d4ff',
    items: [
      { label: 'Teleport V2', emoji: '⚡' },
      { label: 'Teleport to Enemy', emoji: '📍' },
      { label: 'Teleport Map', emoji: '🗺️' },
      { label: '200M Teleport', emoji: '🛰️' },
      { label: 'Fly Hack', emoji: '🕊️' },
      { label: 'Fly Run', emoji: '🏃' },
      { label: 'Fly Map', emoji: '🌌' },
      { label: 'Speed Hack', emoji: '👟' },
    ],
  },
  {
    title: '📸 System',
    emoji: '💻',
    color: '#00ff88',
    items: [
      { label: 'Left Camera View', emoji: '🎥' },
      { label: 'Version Hack', emoji: '💻' },
      { label: '3 Min Timer Activated', emoji: '⏱️' },
    ],
  },
];

const featureCards = [
  { title: 'Aimbot', icon: Crosshair, desc: 'Advanced targeting with smooth tracking and configurable power settings.' },
  { title: 'ESP / Chams', icon: Eye, desc: 'Clean visual overlays with glow, 3D location, and rich color tuning.' },
  { title: 'Teleport', icon: Map, desc: 'Multi-mode teleport engine — enemy snap, map jump, and 200m range.' },
  { title: 'Security', icon: Shield, desc: 'Layered protection logic for safer runtime behavior and session control.' },
  { title: 'Speed & Flight', icon: Wind, desc: 'Fly Hack, Speed Hack, and Fly Run for full movement domination.' },
  { title: 'Encryption', icon: Lock, desc: 'Encrypted communication paths for secure panel operations.' },
];

export default function FunctionsSection() {
  const [activePanel, setActivePanel] = useState('internal');

  return (
    <section id="functions" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">

        {/* Hero banner */}
        <ScrollReveal variant="fadeUp">
        <motion.div
          className="rounded-2xl p-8 sm:p-12 mb-10"
          style={{
            background: activePanel === 'internal'
              ? 'linear-gradient(135deg, rgba(30,0,60,0.95) 0%, rgba(0,15,35,0.98) 100%)'
              : 'linear-gradient(135deg, rgba(0,30,60,0.9) 0%, rgba(0,15,35,0.95) 100%)',
            border: activePanel === 'internal' ? '1px solid rgba(170,68,255,0.25)' : '1px solid rgba(0,212,255,0.15)',
            boxShadow: activePanel === 'internal' ? '0 0 60px rgba(170,68,255,0.08)' : '0 0 40px rgba(0,212,255,0.05)',
            transition: 'all 0.5s ease',
          }}
        >
          {activePanel === 'internal' ? (
            <>
              <span className="inline-block font-inter text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-4"
                style={{ border: '1px solid rgba(255,68,68,0.5)', color: '#ff4444', background: 'rgba(255,68,68,0.1)' }}>
                🔥 BETA X V7A — INTERNAL
              </span>
              <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-foreground mb-4 leading-tight">
                PRRX <span style={{ color: '#aa44ff' }}>INTERNAL</span> PANEL
              </h2>
              <p className="font-inter text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                Dominate the battlefield with our most powerful internal panel. Optimized for maximum performance and security. 
                Full combat suite with teleport, movement hacks, and advanced kill mechanics.
              </p>
            </>
          ) : (
            <>
              <span className="inline-block font-inter text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-4"
                style={{ border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff', background: 'rgba(0,212,255,0.08)' }}>
                OFFICIAL — EXTERNAL
              </span>
              <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-foreground mb-4 leading-tight">
                PRRX <span style={{ color: '#00d4ff' }}>EXTERNAL</span> PANEL
              </h2>
              <p className="font-inter text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                PRRX is engineered for speed with fast module response, light memory usage, and stable long-session performance. Every feature is tuned for real-time gameplay.
              </p>
            </>
          )}
        </motion.div>
        </ScrollReveal>

        {/* Panel Switcher */}
        <div className="flex gap-2 mb-8 p-1.5 rounded-2xl w-fit"
          style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
          <button onClick={() => setActivePanel('internal')}
            className="px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all duration-300"
            style={{
              background: activePanel === 'internal' ? 'linear-gradient(135deg, rgba(170,68,255,0.2), rgba(100,0,200,0.15))' : 'transparent',
              border: activePanel === 'internal' ? '1px solid rgba(170,68,255,0.5)' : '1px solid transparent',
              color: activePanel === 'internal' ? '#aa44ff' : 'rgba(180,200,220,0.4)',
              boxShadow: activePanel === 'internal' ? '0 0 20px rgba(170,68,255,0.2)' : 'none',
            }}>
            🔥 INTERNAL
          </button>
          <button onClick={() => setActivePanel('external')}
            className="px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all duration-300"
            style={{
              background: activePanel === 'external' ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,100,200,0.1))' : 'transparent',
              border: activePanel === 'external' ? '1px solid rgba(0,212,255,0.5)' : '1px solid transparent',
              color: activePanel === 'external' ? '#00d4ff' : 'rgba(180,200,220,0.4)',
              boxShadow: activePanel === 'external' ? '0 0 20px rgba(0,212,255,0.2)' : 'none',
            }}>
            ⚡ EXTERNAL
          </button>
        </div>

        {/* Function Preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-6 sm:p-8 mb-10"
            style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-orbitron font-bold text-base sm:text-lg text-primary tracking-wider">
                {activePanel === 'internal' ? '🔥 Internal Panel Features' : '⚡ External Panel Features'}
              </h3>
              <span className="font-inter text-xs text-muted-foreground hidden sm:block">
                {activePanel === 'internal' ? 'Beta X V7A — Free Fire' : 'UI structure mapped from your panel.'}
              </span>
            </div>

            {activePanel === 'internal' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {internalGroups.map((group, gi) => (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.08 }}
                    className="rounded-xl overflow-hidden"
                    style={{ background: 'rgba(0,25,55,0.8)', border: `1px solid ${group.color}18` }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: `${group.color}15`, background: `${group.color}08` }}>
                      <h4 className="font-orbitron font-bold text-xs tracking-wide" style={{ color: group.color }}>{group.title}</h4>
                    </div>
                    <ul className="divide-y" style={{ borderColor: 'rgba(0,212,255,0.05)' }}>
                      {group.items.map((item) => (
                        <li key={item.label} className="flex items-center justify-between px-4 py-2.5">
                          <span className="font-inter text-xs text-muted-foreground">{item.emoji} {item.label}</span>
                          <span className="font-inter text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: `${group.color}15`, color: group.color, border: `1px solid ${group.color}30`, fontSize: '9px', letterSpacing: '0.1em' }}>
                            ON
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                {externalGroups.map((group, gi) => (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.1 }}
                    className="rounded-xl overflow-hidden"
                    style={{ background: 'rgba(0,25,55,0.8)', border: '1px solid rgba(0,212,255,0.08)' }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
                      <h4 className="font-orbitron font-bold text-xs text-foreground tracking-wide">{group.emoji} {group.title}</h4>
                    </div>
                    <ul className="divide-y" style={{ borderColor: 'rgba(0,212,255,0.05)' }}>
                      {group.items.map((item) => (
                        <li key={item} className="flex items-center justify-between px-4 py-2.5">
                          <span className="font-inter text-xs text-muted-foreground">{item}</span>
                          <span className="font-inter text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)', fontSize: '10px', letterSpacing: '0.1em' }}>
                            ADDED
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {featureCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <ScrollReveal key={card.title} variant="fadeUp" delay={i * 0.08}>
                <InteractiveCard
                  className="rounded-xl p-5 h-full"
                  style={{ background: 'rgba(0,20,45,0.85)', border: '1px solid rgba(0,212,255,0.08)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-orbitron font-bold text-sm text-foreground mb-2 tracking-wide">{card.title}</h4>
                  <p className="font-inter text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                </InteractiveCard>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}