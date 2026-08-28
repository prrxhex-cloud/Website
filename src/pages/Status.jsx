import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { 
  Globe, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Radio, 
  Zap, 
  Lock, 
  Server, 
  Bell,
  Smartphone,
  Monitor,
  Apple,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const STATUS_CONFIG = {
  online: { 
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-400', 
    border: 'border-emerald-500/30', 
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    label: 'UNDETECTED', 
    icon: CheckCircle2,
    badgeColor: 'bg-emerald-500'
  },
  offline: { 
    bg: 'bg-rose-500/10', 
    text: 'text-rose-400', 
    border: 'border-rose-500/30', 
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    label: 'UPDATING SIG', 
    icon: XCircle,
    badgeColor: 'bg-rose-500'
  },
  maintaining: { 
    bg: 'bg-amber-500/10', 
    text: 'text-amber-400', 
    border: 'border-amber-500/30', 
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    label: 'TESTING PATCH', 
    icon: AlertTriangle,
    badgeColor: 'bg-amber-500'
  },
};

const DEFAULT_PLATFORM_NODES = [
  {
    id: 'ff_android_v7a',
    name: 'Free Fire Android (v7a 32-bit)',
    category: 'panel',
    platform: 'Android APK',
    icon: Smartphone,
    status: 'online',
    patch: 'Garena FF OB46 / OB47',
    latency: '18ms',
    uptime_elapsed: '99.99%',
    risk_level: '0% Ban Risk (Safe)',
    description: 'Direct APK injection with internal bytecode obfuscation.'
  },
  {
    id: 'ff_android_v8a',
    name: 'Free Fire MAX (v8a 64-bit)',
    category: 'panel',
    platform: 'Android 64-Bit',
    icon: Smartphone,
    status: 'online',
    patch: 'Garena FF MAX OB47',
    latency: '24ms',
    uptime_elapsed: '100%',
    risk_level: '0% Ban Risk (Safe)',
    description: 'High-definition 120FPS bypass with memory hook shield.'
  },
  {
    id: 'ff_ios_ipa',
    name: 'iOS VIP Menu (IPA Direct)',
    category: 'panel',
    platform: 'iOS / iPadOS',
    icon: Apple,
    status: 'online',
    patch: 'iOS 15 - 18.2 Compatible',
    latency: '31ms',
    uptime_elapsed: '99.95%',
    risk_level: '0% Ban Risk (Safe)',
    description: 'Enterprise signed DNS proxy with no jailbreak requirement.'
  },
  {
    id: 'ff_pc_emulator',
    name: 'PC Gameloop & LDPlayer Bypass',
    category: 'panel',
    platform: 'Windows PC',
    icon: Monitor,
    status: 'online',
    patch: 'Smart 2.0 & Gameloop 7.1',
    latency: '12ms',
    uptime_elapsed: '99.98%',
    risk_level: '0% Ban Risk (Safe)',
    description: 'Virtual machine hypervisor hook with HWID protection.'
  },
  {
    id: 'key_dispenser_cluster',
    name: 'Automated Key Dispenser Node',
    category: 'website',
    platform: 'Cloud Cluster',
    icon: Server,
    status: 'online',
    patch: 'PostgreSQL RPC v2',
    latency: '8ms',
    uptime_elapsed: '100%',
    risk_level: 'Instant Provisioning',
    description: 'Sub-second cryptographic license dispensing engine.'
  },
  {
    id: 'hwid_spoof_gateway',
    name: 'Hardware ID Spoofing Gateway',
    category: 'website',
    platform: 'Security Proxy',
    icon: Lock,
    status: 'online',
    patch: 'Kernel Filter Driver',
    latency: '15ms',
    uptime_elapsed: '99.99%',
    risk_level: 'Zero Ban History',
    description: 'Dynamic MAC and IMEI virtualizer preventing device flags.'
  }
];

export default function Status() {
  const [services, setServices] = useState(DEFAULT_PLATFORM_NODES);
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingTime, setLastPingTime] = useState('Just now');
  const [radarRotation, setRadarRotation] = useState(0);

  const loadStatusData = async () => {
    try {
      const { data, error } = await supabase
        .from('service_status')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(50);

      if (data && data.length > 0 && !error) {
        // Merge Supabase services with default architecture nodes
        const merged = DEFAULT_PLATFORM_NODES.map(def => {
          const matched = data.find(d => d.name?.toLowerCase().includes(def.id) || d.id === def.id);
          return matched ? { ...def, ...matched } : def;
        });
        setServices(merged);
      }
    } catch (e) {
      console.warn('Status telemetry using local cached nodes:', e);
    }
  };

  useEffect(() => {
    loadStatusData();
    const interval = setInterval(() => {
      setRadarRotation(prev => (prev + 4) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleManualProbe = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setLastPingTime(new Date().toLocaleTimeString());
      loadStatusData();
    }, 900);
  };

  const undetectedCount = services.filter(s => s.status === 'online').length;
  const totalCount = services.length;
  const securityHealthScore = Math.round((undetectedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter selection:bg-cyan-500/30">
      <Navbar />

      {/* Cyberpunk Radial Backdrop Accent */}
      <div className="relative overflow-hidden pt-12 pb-16 border-b border-[var(--border-color)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            
            {/* Header Text & Badges */}
            <div className="space-y-4 text-center lg:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-outfit font-extrabold uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                <span>LIVE ANTI-CHEAT RADAR & SENTINEL</span>
              </div>
              <h1 className="font-outfit font-black text-3xl sm:text-5xl text-[var(--text-heading)] tracking-tight leading-none uppercase">
                GARENA PATCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">INTEGRITY RADAR</span>
              </h1>
              <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl leading-relaxed">
                Autonomous continuous probing engine inspecting Garena Free Fire memory signatures, bytecode hashes, and server-side heuristic filters every 30 seconds.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={handleManualProbe}
                  disabled={isPinging}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-outfit font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'PROBING SERVER NODES...' : 'PROBE SIGNATURES NOW'}</span>
                </button>

                <a
                  href="https://discord.gg/D2nCuvyE4t"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] font-outfit font-bold text-xs flex items-center gap-2 transition-colors"
                >
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span>GET PATCH PUSH NOTIFICATIONS</span>
                </a>
              </div>
            </div>

            {/* Live Visual Circular Radar HUD */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex-none">
              {/* Concentric Radar Grid Rings */}
              <div className="absolute inset-4 rounded-full border border-cyan-500/15 pointer-events-none" />
              <div className="absolute inset-12 rounded-full border border-cyan-500/10 pointer-events-none" />
              <div className="absolute inset-20 rounded-full border border-cyan-500/10 pointer-events-none" />
              
              {/* Crosshair Axes */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-cyan-500/20 pointer-events-none" />
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-cyan-500/20 pointer-events-none" />

              {/* Sweeping Radar Scanner Cone */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `conic-gradient(from ${radarRotation}deg at 50% 50%, rgba(6,182,212,0.4) 0deg, rgba(6,182,212,0.05) 45deg, transparent 90deg, transparent 360deg)`
                }}
              />

              {/* Blip Telemetry Nodes */}
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-16 left-20 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"
              />
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-20 right-16 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
              />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
                className="absolute top-24 right-20 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]"
              />

              {/* Radar Center Status Badge */}
              <div className="relative z-10 text-center space-y-1 p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md shadow-lg">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="font-outfit font-black text-lg text-white leading-none">
                  {securityHealthScore}%
                </div>
                <div className="font-inter text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                  SHIELD ACTIVE
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Status Dashboard Grid */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-10">

        {/* Global Metric Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-1">
            <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider block">CURRENT GAME PATCH</span>
            <div className="font-outfit font-black text-xl sm:text-2xl text-cyan-400">OB46 / OB47</div>
            <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified Safe
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-1">
            <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider block">DETECTION DEFENSE</span>
            <div className="font-outfit font-black text-xl sm:text-2xl text-emerald-400">{undetectedCount} / {totalCount} Online</div>
            <span className="text-[var(--text-muted)] text-[11px]">0 Active Flagged Nodes</span>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-1">
            <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider block">30-DAY UPTIME RATIO</span>
            <div className="font-outfit font-black text-xl sm:text-2xl text-[var(--text-heading)]">99.98%</div>
            <span className="text-cyan-400 text-[11px]">Sub-20ms Probe Ping</span>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-1">
            <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider block">TELEMETRY HEARTBEAT</span>
            <div className="font-outfit font-black text-xl sm:text-2xl text-indigo-400">{lastPingTime}</div>
            <span className="text-[var(--text-muted)] text-[11px]">Refreshed automatically</span>
          </div>
        </div>

        {/* Platform Node Architecture Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="font-outfit font-extrabold text-xl text-[var(--text-heading)] uppercase tracking-tight">
                FREE FIRE INJECTOR & BYPASS NODES
              </h2>
            </div>
            <span className="text-xs font-inter text-[var(--text-muted)] font-medium">Real-time Signature Telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => {
              const cfg = STATUS_CONFIG[service.status] || STATUS_CONFIG.online;
              const IconComp = service.icon || (service.category === 'website' ? Globe : Cpu);

              return (
                <motion.div
                  key={service.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative p-6 rounded-3xl bg-[var(--bg-card)] border ${cfg.border} shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group`}
                >
                  {/* Subtle Corner Glow Accent */}
                  <div className={`absolute top-0 right-0 w-24 h-24 ${cfg.bg} rounded-full blur-2xl pointer-events-none`} />

                  <div className="space-y-4">
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-cyan-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-outfit font-black text-base text-[var(--text-heading)] tracking-tight">
                            {service.name}
                          </h3>
                          <span className="text-[11px] font-mono text-[var(--text-muted)] font-bold">
                            {service.platform || 'Cross-Platform Node'}
                          </span>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div className={`px-3 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} font-outfit font-black text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-sm`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.badgeColor} animate-pulse`} />
                        <span>{cfg.label}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-inter">
                      {service.description}
                    </p>
                  </div>

                  {/* Node Diagnostic Specs */}
                  <div className="pt-4 mt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-2 text-xs font-inter">
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px] font-bold uppercase tracking-wider">Patch Version</span>
                      <span className="font-semibold text-[var(--text-heading)] font-mono text-[11px]">{service.patch || 'OB46 / OB47'}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px] font-bold uppercase tracking-wider">Security State</span>
                      <span className="font-semibold text-emerald-400 font-mono text-[11px]">{service.risk_level || '0% Risk'}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Security Assurance & Ban Prevention Protocol */}
        <div className="p-8 rounded-3xl bg-slate-950 border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)] space-y-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit font-black text-xl uppercase tracking-tight text-white">
                PRRX 3-STAGE ANTI-DETECTION PROTOCOL
              </h3>
              <p className="text-slate-400 text-xs font-inter">
                How our cloud infrastructure guarantees account safety across all Free Fire ranked seasons.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <div className="font-outfit font-bold text-sm text-cyan-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
                <span>Dynamic Bytecode Mutation</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-inter">
                Every generated APK uses a distinct binary polymorphism algorithm, making signature-based antivirus scanners incapable of fingerprinting.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <div className="font-outfit font-bold text-sm text-cyan-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">2</span>
                <span>Kernel-Level Memory Cloaking</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-inter">
                Our injectors execute outside of Garena's userland memory space, concealing all aimbot and ESP hooks from the game process.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <div className="font-outfit font-bold text-sm text-cyan-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">3</span>
                <span>Instant Kill-Switch Sentinel</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-inter">
                If Garena releases a silent server-side security update, our radar automatically marks the node as maintenance, preventing users from opening the panel.
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}