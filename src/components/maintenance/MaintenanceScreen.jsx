import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Lock, RefreshCw, MessageCircle, Users, ExternalLink, Clock, AlertTriangle, ChevronRight, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMaintenance } from '@/context/MaintenanceContext';
import { toast } from 'sonner';

export default function MaintenanceScreen({ 
  isGlobal = true, 
  pageKey = null, 
  pageTitle = null, 
  customReason = null, 
  onBypassContinue = null 
}) {
  const navigate = useNavigate();
  const { 
    maintenanceConfig, 
    reason: globalReason, 
    timerEnd, 
    isAdminBypassed, 
    isAdminUser 
  } = useMaintenance();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const displayReason = customReason || maintenanceConfig?.reason || globalReason;
  const effectiveTimerEnd = timerEnd || maintenanceConfig?.timer_end;

  // Real-time Countdown Timer Calculation
  useEffect(() => {
    if (!effectiveTimerEnd) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      return;
    }

    const calculateTime = () => {
      try {
        const dateObj = new Date(effectiveTimerEnd);
        const targetTime = dateObj.getTime();
        if (isNaN(targetTime)) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
          return;
        }
        const now = Date.now();
        const difference = targetTime - now;

        if (difference <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      } catch {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [effectiveTimerEnd]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info('Pinging PRRX server nodes for system status...');
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('System status verified: Calibration active.');
    }, 1200);
  };

  return (
    <div className="relative min-h-[85vh] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-inter">
      {/* Dynamic Cyberpunk Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Cyber Grid & Scanline Subtle Texture */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 212, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-3xl mx-auto"
      >
        {/* Main Terminal Card */}
        <div className="relative rounded-[32px] p-6 sm:p-10 bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,212,255,0.15)] backdrop-blur-xl overflow-hidden text-center">
          
          {/* Top Tech Accent Lines */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/20 blur-xl pointer-events-none" />

          {/* Admin Bypass Notification Pill */}
          {isAdminUser && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-outfit font-extrabold text-xs text-amber-300 uppercase tracking-wider block">
                    ADMIN BYPASS ACTIVE // STAFF CLEARANCE
                  </span>
                  <span className="text-[11px] text-amber-200/80 block">
                    You have verified staff access. You can enter or manage the system.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-outfit font-extrabold text-xs uppercase tracking-wider transition-transform hover:scale-105 shadow-md"
                >
                  Admin Portal
                </button>
                {onBypassContinue && (
                  <button
                    onClick={onBypassContinue}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-outfit font-bold text-xs"
                  >
                    View Page
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Central Pulsing Shield / Cyber Icon */}
          <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
            {/* Outer Rotating Glowing Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '14s' }} />
            <div className="absolute inset-2 rounded-full border border-rose-500/30 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-rose-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-md">
              <Lock className="w-8 h-8 text-cyan-300 animate-pulse" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-orbitron font-bold tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {isGlobal ? 'EMERGENCY PROTOCOL ENGAGED' : 'SECTION UNDER MAINTENANCE'}
          </div>

          {/* Heading */}
          <h1 className="font-outfit font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight uppercase">
            {isGlobal ? (
              <>SYSTEM UNDER <span className="text-[#00d4ff] text-glow-cyan">MAINTENANCE</span></>
            ) : (
              <>{pageTitle || pageKey || 'SECTION'} <span className="text-[#00d4ff]">OFFLINE</span></>
            )}
          </h1>

          <p className="font-inter text-sm sm:text-base text-slate-400 max-w-lg mx-auto mt-2">
            {isGlobal 
              ? 'Our infrastructure is undergoing a scheduled security and anti-cheat calibration.' 
              : `The ${pageTitle || 'selected feature'} is temporarily paused for maintenance and enhancements.`
            }
          </p>

          {/* Countdown Clock Widget */}
          {effectiveTimerEnd && !timeLeft.isExpired ? (
            <div className="my-8">
              <div className="flex items-center justify-center gap-2 text-xs font-orbitron font-bold text-cyan-400 tracking-wider mb-3">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>ESTIMATED SERVICE RESTORATION IN</span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
                {[
                  { label: 'DAYS', value: timeLeft.days },
                  { label: 'HOURS', value: timeLeft.hours },
                  { label: 'MINUTES', value: timeLeft.minutes },
                  { label: 'SECONDS', value: timeLeft.seconds },
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 shadow-inner flex flex-col items-center justify-center relative group hover:border-cyan-500/40 transition-colors"
                  >
                    <span className="font-orbitron font-black text-xl sm:text-3xl text-white tracking-wider group-hover:text-cyan-300 transition-colors">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 font-outfit uppercase tracking-widest mt-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : effectiveTimerEnd && timeLeft.isExpired ? (
            <div className="my-6 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-xs font-orbitron font-bold text-cyan-300 tracking-wider">
                <Activity className="w-4 h-4 animate-pulse text-cyan-400" />
                <span>MAINTENANCE CONCLUDING — FINAL VERIFICATION</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Systems are completing integrity checks. Service will be live momentarily.</p>
            </div>
          ) : (
            <div className="my-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs font-inter">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Live Maintenance In Progress &bull; Estimated completion: As soon as completed</span>
            </div>
          )}

          {/* Official Broadcast Reason Terminal Box */}
          <div className="my-6 rounded-2xl p-4 sm:p-5 bg-slate-900/90 border border-white/10 text-left relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
              <span className="text-[10px] font-orbitron font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400" /> OFFICIAL NOTICE // PRRX SYSTEM BROADCAST
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {maintenanceConfig?.updated_at ? new Date(maintenanceConfig.updated_at).toLocaleTimeString() : 'RECENT'}
              </span>
            </div>
            <p className="font-inter text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              &ldquo;{displayReason}&rdquo;
            </p>
          </div>

          {/* Action Hub & Community Support */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
            {/* Discord */}
            <a 
              href="https://discord.gg/EuwhvXXfJC" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-outfit font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Join Discord Support</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* WhatsApp */}
            <a 
              href="https://chat.whatsapp.com/CsElU5rhsXVDMjjuFHFvgI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-outfit font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp VIP Group</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* Refresh / Check Status */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-outfit font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>

          {!isGlobal && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => navigate('/')}
                className="text-xs font-outfit font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 mx-auto hover:underline"
              >
                <span>Return to Main Website</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
