import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Power, 
  Clock, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Save, 
  Layers, 
  Eye, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Zap,
  Globe,
  Sliders,
  DollarSign,
  Download,
  Gift,
  Store,
  LayoutDashboard,
  Activity,
  PlayCircle,
  Cpu,
  Info
} from 'lucide-react';
import { useMaintenance, DEFAULT_MAINTENANCE_CONFIG } from '@/context/MaintenanceContext';
import { toast } from 'sonner';

const PAGE_SECTIONS = [
  { key: 'prices', label: 'Prices & VIP Keys', path: '/prices', icon: DollarSign, description: 'Storefront purchase catalog & pricing tiers' },
  { key: 'downloads', label: 'Download Links', path: '/downloads', icon: Download, description: 'APK downloads & client setup files' },
  { key: 'freebies', label: 'Free Panels & Freebies', path: '/freebies', icon: Gift, description: 'Community free panel downloads & resources' },
  { key: 'resellers', label: 'Reseller Portal', path: '/resellers', icon: Store, description: 'Reseller tiers, packages & account requests' },
  { key: 'dashboard', label: 'VIP Member Dashboard', path: '/dashboard', icon: LayoutDashboard, description: 'User licenses, chat, & key downloads' },
  { key: 'status', label: 'Service Status Page', path: '/status', icon: Activity, description: 'Real-time panel and server uptime status' },
  { key: 'live_demo', label: 'Live Demo Playground', path: '/live-demo', icon: PlayCircle, description: 'Interactive demo panel simulation' },
  { key: 'functions', label: 'Functions & Cheats', path: '/functions', icon: Cpu, description: 'Feature showcase & cheat functionality' },
  { key: 'about', label: 'About & Specifications', path: '/about', icon: Info, description: 'Platform information and hardware specs' },
];

const PRESET_REASONS = [
  'Scheduled Anti-Cheat & Security Patch Update in Progress. VIP services will resume shortly.',
  'Emergency Server Core Calibration & Infrastructure Maintenance.',
  'VIP License Key Dispenser Synchronization & Database Upgrade.',
  'Node Optimization & Cloud Defense Re-routing in Progress.',
  'PRRX V7A & External Kernel Driver Synchronization.',
];

const PRESET_DURATIONS = [
  { label: '+15 Mins', minutes: 15 },
  { label: '+30 Mins', minutes: 30 },
  { label: '+1 Hour', minutes: 60 },
  { label: '+3 Hours', minutes: 180 },
  { label: '+6 Hours', minutes: 360 },
  { label: '+12 Hours', minutes: 720 },
  { label: '+24 Hours', minutes: 1440 },
  { label: '+48 Hours', minutes: 2880 },
];

export default function MaintenanceTab({ adminUser = 'Sayuru' }) {
  const { 
    maintenanceConfig, 
    isLoadingMaintenance, 
    updateMaintenanceConfig 
  } = useMaintenance();

  const [formState, setFormState] = useState(DEFAULT_MAINTENANCE_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [showKillSwitchModal, setShowKillSwitchModal] = useState(false);
  const [previewTab, setPreviewTab] = useState('config'); // 'config' | 'preview'
  const [customDateTime, setCustomDateTime] = useState('');

  // Sync state from Firestore context
  useEffect(() => {
    if (maintenanceConfig) {
      setFormState({
        global_maintenance: Boolean(maintenanceConfig.global_maintenance),
        page_maintenance: {
          ...DEFAULT_MAINTENANCE_CONFIG.page_maintenance,
          ...(maintenanceConfig.page_maintenance || {}),
        },
        reason: maintenanceConfig.reason || DEFAULT_MAINTENANCE_CONFIG.reason,
        timer_end: maintenanceConfig.timer_end || null,
        allow_admin_bypass: maintenanceConfig.allow_admin_bypass !== false,
        updated_at: maintenanceConfig.updated_at,
        updated_by: maintenanceConfig.updated_by,
      });

      if (maintenanceConfig.timer_end) {
        try {
          const dateObj = new Date(maintenanceConfig.timer_end);
          if (!isNaN(dateObj.getTime())) {
            // Format for datetime-local input (YYYY-MM-DDTHH:mm)
            const localIso = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setCustomDateTime(localIso);
          }
        } catch {}
      }
    }
  }, [maintenanceConfig]);

  // Handle saving changes
  const handleSave = async (overrides = {}) => {
    setIsSaving(true);
    try {
      const payload = {
        ...formState,
        ...overrides,
      };
      await updateMaintenanceConfig(payload, adminUser);
      toast.success('Maintenance configuration broadcasted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update maintenance settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle master kill switch
  const handleToggleGlobalKillSwitch = () => {
    const nextState = !formState.global_maintenance;
    if (nextState) {
      // Prompt confirmation before turning ON
      setShowKillSwitchModal(true);
    } else {
      // Turning OFF can be done immediately
      const updated = { ...formState, global_maintenance: false };
      setFormState(updated);
      handleSave({ global_maintenance: false });
    }
  };

  const confirmEngageKillSwitch = () => {
    setShowKillSwitchModal(false);
    const updated = { ...formState, global_maintenance: true };
    setFormState(updated);
    handleSave({ global_maintenance: true });
  };

  // Toggle specific page
  const handleTogglePage = (key) => {
    const updatedPages = {
      ...formState.page_maintenance,
      [key]: !formState.page_maintenance[key],
    };
    const updated = { ...formState, page_maintenance: updatedPages };
    setFormState(updated);
  };

  // Batch lock/unlock all pages
  const handleBatchPages = (lockAll) => {
    const updatedPages = {};
    PAGE_SECTIONS.forEach(p => {
      updatedPages[p.key] = lockAll;
    });
    setFormState(prev => ({ ...prev, page_maintenance: updatedPages }));
    toast.info(lockAll ? 'All sub-pages marked for maintenance' : 'All sub-pages set to live');
  };

  // Preset timer duration
  const applyPresetDuration = (minutes) => {
    const target = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setFormState(prev => ({ ...prev, timer_end: target }));
    const localIso = new Date(new Date(target).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setCustomDateTime(localIso);
    toast.success(`Timer set for +${minutes >= 60 ? (minutes / 60) + ' hr(s)' : minutes + ' mins'}`);
  };

  const clearTimer = () => {
    setFormState(prev => ({ ...prev, timer_end: null }));
    setCustomDateTime('');
    toast.info('Countdown timer removed (Indefinite mode)');
  };

  const handleCustomDateTimeChange = (e) => {
    const val = e.target.value;
    setCustomDateTime(val);
    if (val) {
      const iso = new Date(val).toISOString();
      setFormState(prev => ({ ...prev, timer_end: iso }));
    } else {
      setFormState(prev => ({ ...prev, timer_end: null }));
    }
  };

  const activePagesCount = Object.values(formState.page_maintenance || {}).filter(Boolean).length;

  return (
    <div className="space-y-6 text-left font-inter">
      {/* Top Banner & Live Status Radar */}
      <div className={`rounded-3xl p-6 sm:p-8 border relative overflow-hidden transition-all ${
        formState.global_maintenance 
          ? 'bg-gradient-to-r from-rose-950/80 via-slate-950 to-rose-950/80 border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.25)]' 
          : activePagesCount > 0 
            ? 'bg-gradient-to-r from-amber-950/60 via-slate-950 to-amber-950/60 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
            : 'bg-gradient-to-r from-cyan-950/40 via-slate-950 to-slate-900 border-cyan-500/30'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${
                formState.global_maintenance 
                  ? 'bg-rose-500 animate-ping' 
                  : activePagesCount > 0 
                    ? 'bg-amber-400 animate-ping' 
                    : 'bg-emerald-400 animate-pulse'
              }`} />
              <span className="font-orbitron font-extrabold text-sm sm:text-base tracking-widest uppercase text-white">
                SYSTEM STATUS: {
                  formState.global_maintenance 
                    ? <span className="text-rose-400">GLOBAL KILL SWITCH ENGAGED</span> 
                    : activePagesCount > 0 
                      ? <span className="text-amber-400">PARTIAL MAINTENANCE ({activePagesCount} PAGES LOCKED)</span> 
                      : <span className="text-emerald-400">ALL SYSTEMS OPERATIONAL (LIVE)</span>
                }
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {formState.global_maintenance
                ? 'The entire storefront is closed to all standard visitors. Only authorized admins with bypass clearance can access the site.'
                : activePagesCount > 0
                  ? 'Specific store sections are gated with custom maintenance screens while the remaining site remains open.'
                  : 'Visitors have full unrestricted access to all public and customer features.'
              }
            </p>

            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span>Last Modified: {formState.updated_at ? new Date(formState.updated_at).toLocaleString() : 'Never'}</span>
              <span>&bull;</span>
              <span>Updated By: <strong className="text-cyan-400">{formState.updated_by || 'Unknown'}</strong></span>
            </div>
          </div>

          {/* Master Kill Switch CTA Button */}
          <button
            onClick={handleToggleGlobalKillSwitch}
            className={`w-full md:w-auto px-6 py-4 rounded-2xl font-orbitron font-extrabold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl ${
              formState.global_maintenance
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                : 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-[0_0_25px_rgba(225,29,72,0.4)]'
            }`}
          >
            <Power className="w-5 h-5" />
            <span>
              {formState.global_maintenance ? 'DEACTIVATE KILL SWITCH (RESTORE SITE)' : 'ENGAGE EMERGENCY KILL SWITCH'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls & Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Granular Page Toggles (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="rounded-3xl p-6 bg-slate-950/70 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <h3 className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  GRANULAR PAGE CONTROL
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toggle individual sub-pages into maintenance mode independently.
                </p>
              </div>

              {/* Batch Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBatchPages(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-outfit font-bold transition-colors"
                >
                  Lock All
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchPages(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-outfit font-bold transition-colors"
                >
                  Unlock All
                </button>
              </div>
            </div>

            {/* Page List */}
            <div className="space-y-2.5">
              {PAGE_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isLocked = Boolean(formState.page_maintenance[section.key]) || formState.global_maintenance;
                const isDirectlyLocked = Boolean(formState.page_maintenance[section.key]);

                return (
                  <div
                    key={section.key}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isDirectlyLocked
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-slate-900/50 border-white/5 hover:border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDirectlyLocked 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-outfit font-bold text-sm text-white truncate">
                            {section.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {section.path}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-orbitron font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isLocked 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {isLocked ? 'LOCKED' : 'LIVE'}
                      </span>

                      {/* Custom Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleTogglePage(section.key)}
                        disabled={formState.global_maintenance}
                        className={`w-12 h-6 rounded-full transition-all relative p-0.5 ${
                          formState.global_maintenance 
                            ? 'opacity-40 cursor-not-allowed bg-slate-800'
                            : isDirectlyLocked 
                              ? 'bg-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.4)]' 
                              : 'bg-slate-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          isDirectlyLocked ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security & Admin Bypass Controls */}
          <div className="rounded-3xl p-6 bg-slate-950/70 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-sm text-white tracking-wider">
                  SECURITY & BYPASS CLEARANCE
                </h3>
                <p className="text-xs text-slate-400">
                  Configure who can bypass active maintenance screens.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4">
              <div>
                <p className="font-outfit font-bold text-sm text-slate-200">
                  Allow Verified Admin Bypass
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  When enabled, authenticated administrators can browse the entire website and test features while visitors are held on the maintenance screen.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormState(prev => ({ ...prev, allow_admin_bypass: !prev.allow_admin_bypass }))}
                className={`w-12 h-6 rounded-full transition-all relative p-0.5 shrink-0 ${
                  formState.allow_admin_bypass 
                    ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                    : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  formState.allow_admin_bypass ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Countdown Timer & Reason Broadcast (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Countdown Timer Configurator */}
          <div className="rounded-3xl p-6 bg-slate-950/70 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="font-orbitron font-bold text-sm text-white tracking-wider">
                  COUNTDOWN TIMER
                </h3>
              </div>
              {formState.timer_end && (
                <button
                  type="button"
                  onClick={clearTimer}
                  className="text-[11px] text-rose-400 hover:underline font-bold"
                >
                  Clear Timer
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Set an estimated restoration time. Visitors will see a live ticking clock.
            </p>

            {/* Duration Presets */}
            <div>
              <label className="text-[11px] font-outfit font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Duration Presets
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_DURATIONS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPresetDuration(preset.minutes)}
                    className="px-2 py-2 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 font-outfit font-bold text-xs transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom DateTime Input */}
            <div>
              <label className="text-[11px] font-outfit font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Custom Restoration Timestamp
              </label>
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={handleCustomDateTimeChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-cyan-500 outline-none transition-colors"
              />
            </div>

            {/* Current Timer Status Pill */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Status:</span>
              <span className={`font-mono font-bold ${formState.timer_end ? 'text-cyan-400' : 'text-slate-500'}`}>
                {formState.timer_end ? new Date(formState.timer_end).toLocaleString() : 'Indefinite (No Timer)'}
              </span>
            </div>
          </div>

          {/* Broadcast Reason & Notice Editor */}
          <div className="rounded-3xl p-6 bg-slate-950/70 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="font-orbitron font-bold text-sm text-white tracking-wider">
                BROADCAST NOTICE
              </h3>
            </div>

            <div>
              <label className="text-[11px] font-outfit font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Template Presets
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                {PRESET_REASONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormState(prev => ({ ...prev, reason: preset }))}
                    className="w-full p-2 text-left rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-cyan-500/30 text-[11px] text-slate-300 transition-colors line-clamp-2"
                  >
                    &bull; {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-outfit font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Notice Displayed to Visitors
              </label>
              <textarea
                rows={4}
                value={formState.reason}
                onChange={(e) => setFormState(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter official maintenance notice..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white font-inter text-xs leading-relaxed focus:border-cyan-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Save / Apply Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00d4ff] to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-orbitron font-black text-sm tracking-widest flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,212,255,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>SAVE & BROADCAST CHANGES</span>
            </button>
          </div>

        </div>

      </div>

      {/* Confirmation Modal for Engaging Global Kill Switch */}
      <AnimatePresence>
        {showKillSwitchModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKillSwitchModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-slate-950 border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.35)] z-10 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-500 mx-auto flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              </div>

              <h2 className="font-orbitron font-black text-xl text-white tracking-wider uppercase">
                ENGAGE MASTER KILL SWITCH?
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                This will immediately take down the public storefront for <strong className="text-rose-400">all visitors</strong> and show the Emergency Maintenance screen.
              </p>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-left text-xs space-y-1">
                <div className="text-slate-400">&bull; Admin bypass: <span className="text-emerald-400 font-bold">{formState.allow_admin_bypass ? 'Enabled' : 'Disabled'}</span></div>
                <div className="text-slate-400">&bull; Broadcast reason: <span className="text-white font-medium truncate block">&ldquo;{formState.reason}&rdquo;</span></div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKillSwitchModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-outfit font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmEngageKillSwitch}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-orbitron font-bold text-xs tracking-wider shadow-lg transition-transform hover:scale-105"
                >
                  Confirm & Engage
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
