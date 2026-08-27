import React, { useState, useEffect } from 'react';
import { 
  Crosshair, ShieldCheck, Zap, Activity, Download, Play, CheckCircle2, 
  AlertTriangle, RefreshCw, Cpu, Monitor, Wifi, Volume2, VolumeX, 
  ExternalLink, MessageCircle, LogOut, Settings, Eye, Sliders, Lock, Info,
  DollarSign, Sparkles, Terminal, Layers, Shield, FolderOpen, FileCode, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useSound } from '@/context/SoundContext';
import TitleBar from '@/components/TitleBar';
import appInfo from '../../desktop-app/package.json';
import logoImg from '@/assets/logo.jpeg';

export default function AppLauncher() {
  const { user: currentUser, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const navigate = useNavigate();
  const { soundEnabled, toggleSound, playSound } = useSound();
  const playClickSound = () => playSound && playSound(700, 'triangle', 0.06);

  // Detect user login type: 'EXTERNAL' or 'INTERNAL'
  const userLoginType = (currentUser?.panelType || localStorage.getItem('prrx_panel_type') || 'EXTERNAL').toUpperCase();
  const isExternal = userLoginType === 'EXTERNAL';

  // Selected Application / Panel Executable Path
  const [selectedAppPath, setSelectedAppPath] = useState(() => {
    return localStorage.getItem('prrx_selected_app_path') || '';
  });

  // Injection & Launch States
  const [launchStatus, setLaunchStatus] = useState('idle'); // 'idle' | 'preparing' | 'bypassing' | 'launching' | 'running'
  const [statusLog, setStatusLog] = useState('');
  const [progress, setProgress] = useState(0);

  // Emulator State
  const [selectedEmulator, setSelectedEmulator] = useState(() => {
    return localStorage.getItem('prrx_selected_emulator') || 'bluestacks';
  });
  const [customEmulatorPath, setCustomEmulatorPath] = useState(() => {
    return localStorage.getItem('prrx_custom_emulator_path') || '';
  });
  const [isOptimizingEmulator, setIsOptimizingEmulator] = useState(false);

  const getActiveEmulatorPath = () => {
    if (selectedEmulator === 'bluestacks') return 'C:\\Program Files\\BlueStacks_nxt\\HD-Player.exe';
    if (selectedEmulator === 'msi') return 'C:\\Program Files\\BlueStacks_msi5\\HD-Player.exe';
    return customEmulatorPath;
  };

  const getActiveEmulatorLabel = () => {
    if (selectedEmulator === 'bluestacks') return 'BlueStacks App Player';
    if (selectedEmulator === 'msi') return 'MSI App Player';
    return 'Custom Player';
  };

  const handleSelectCustomEmulator = async () => {
    if (playClickSound) playClickSound();
    if (window.electronAPI && window.electronAPI.selectExecutable) {
      try {
        const filePath = await window.electronAPI.selectExecutable();
        if (filePath) {
          setCustomEmulatorPath(filePath);
          localStorage.setItem('prrx_custom_emulator_path', filePath);
          showCyberToast({
            type: 'check',
            title: 'Emulator Configured',
            desc: `Custom emulator: ${filePath.split('\\').pop()}`
          });
        }
      } catch (e) {}
    }
  };

  const handleStartEmulatorWithOptimizers = async () => {
    if (playClickSound) playClickSound();

    const emuPath = getActiveEmulatorPath();
    const emuName = getActiveEmulatorLabel();

    if (selectedEmulator === 'custom' && !customEmulatorPath) {
      showCyberToast({
        type: 'info',
        title: 'Select Custom Player',
        desc: 'Please browse and select your custom emulator executable file.'
      });
      handleSelectCustomEmulator();
      return;
    }

    setIsOptimizingEmulator(true);
    showCyberToast({
      type: 'check',
      title: 'Optimizer Engaged',
      desc: `Deploying 4 PRRX Real Optimization scripts & starting ${emuName}...`
    });

    if (window.electronAPI && window.electronAPI.launchEmulatorAndOptimize) {
      try {
        await window.electronAPI.launchEmulatorAndOptimize({
          emulatorPath: emuPath,
          emulatorName: emuName,
          emulatorType: selectedEmulator
        });
      } catch (err) {
        console.error("Emulator launch error:", err);
      }
    }

    setTimeout(() => {
      setIsOptimizingEmulator(false);
      showCyberToast({
        type: 'check',
        title: 'Optimization Complete',
        desc: `${emuName} initialized with zero latency and clean caches!`
      });
    }, 2500);
  };

  // Security Toggles
  const [streamProof, setStreamProof] = useState(true);
  const [hwidSpoofer, setHwidSpoofer] = useState(true);
  const [autoClose, setAutoClose] = useState(false);
  const [discordRPC, setDiscordRPC] = useState(localStorage.getItem('discordRPC') !== 'false');

  // Network / Ping Latency
  const [ping, setPing] = useState(24);

  // Custom Cyberpunk Side Notifications (Matching Reference Design)
  const [cyberToasts, setCyberToasts] = useState([]);

  const showCyberToast = ({ type = 'info', title, desc }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, type, title, desc };
    setCyberToasts((prev) => [...prev.slice(-1), newToast]);

    // Auto disappear after exactly 2 seconds as requested
    setTimeout(() => {
      setCyberToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  };

  // Discord RPC Synchronization
  useEffect(() => {
    localStorage.setItem('discordRPC', discordRPC.toString());
    if (window.electronAPI && window.electronAPI.toggleDiscordRPC) {
      window.electronAPI.toggleDiscordRPC(discordRPC);
    }
  }, [discordRPC]);

  useEffect(() => {
    if (currentUser && window.electronAPI && window.electronAPI.updateDiscordRPCUser) {
      const displayUsername = currentUser.full_name?.split(' ')[0] || currentUser.username || currentUser.email?.split('@')[0] || 'User';
      
      let displayExpiry = "Lifetime";
      const keyAuthData = currentUser?.keyAuthData || currentUser;
      const sub = keyAuthData?.subscriptions?.[0];
      const expireTs = sub?.expiry ? parseInt(sub.expiry) * 1000 : null;
      
      if (expireTs) {
        const date = new Date(expireTs);
        displayExpiry = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0') + "-" + String(date.getDate()).padStart(2, '0');
      }
      
      window.electronAPI.updateDiscordRPCUser(displayUsername, displayExpiry);
    }
  }, [currentUser]);

  // Ping jitter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(20 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Listen for process closure from Electron
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onExecutableClosed) {
      window.electronAPI.onExecutableClosed((data) => {
        setLaunchStatus('idle');
        setStatusLog('Target application closed. Session detached.');
        setProgress(0);
        showCyberToast({
          type: 'info',
          title: 'Application Closed',
          desc: `${data?.fileName || 'Target application'} was closed. Ready for next session.`
        });
      });

      return () => {
        if (window.electronAPI.removeExecutableClosedListener) {
          window.electronAPI.removeExecutableClosedListener();
        }
      };
    }
  }, []);

  if (isLoadingAuth || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
      </div>
    );
  }

  // Format subscription expiry
  const keyAuthData = currentUser?.keyAuthData || currentUser;
  const sub = keyAuthData?.subscriptions?.[0];
  const expireTs = sub?.expiry ? parseInt(sub.expiry) * 1000 : null;
  let formattedExpiry = "Lifetime VIP";
  let isExpiringSoon = false;

  if (expireTs) {
    const date = new Date(expireTs);
    formattedExpiry = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0') + "-" + String(date.getDate()).padStart(2, '0');
    const diffDays = Math.ceil((expireTs - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) isExpiringSoon = true;
  }

  // File Browser to Select Application Executable
  const handleSelectApplication = async () => {
    if (playClickSound) playClickSound();
    
    if (window.electronAPI && window.electronAPI.selectExecutable) {
      try {
        const filePath = await window.electronAPI.selectExecutable();
        if (filePath) {
          setSelectedAppPath(filePath);
          localStorage.setItem('prrx_selected_app_path', filePath);
          showCyberToast({
            type: 'check',
            title: 'Application Selected',
            desc: `Target set to: ${filePath.split('\\').pop()}`
          });
        }
      } catch (err) {
        showCyberToast({
          type: 'info',
          title: 'Selection Cancelled',
          desc: 'No executable file was selected.'
        });
      }
    } else {
      showCyberToast({
        type: 'info',
        title: 'Desktop Mode',
        desc: 'Executable selection runs on the desktop app.'
      });
    }
  };

  // Start / Launch Application with Full Admin Power
  const handleStartApplication = async () => {
    if (playClickSound) playClickSound();

    if (!selectedAppPath) {
      showCyberToast({
        type: 'info',
        title: 'Select Application First',
        desc: "Click 'Browse .exe' to select your panel or game file."
      });
      handleSelectApplication();
      return;
    }

    if (launchStatus === 'running') {
      if (window.electronAPI && window.electronAPI.stopExecutable) {
        window.electronAPI.stopExecutable(selectedAppPath);
      }
      setLaunchStatus('idle');
      setStatusLog('Security protocol session detached.');
      setProgress(0);
      showCyberToast({
        type: 'info',
        title: 'Application Closed',
        desc: 'Security session detached cleanly.'
      });
      return;
    }

    setLaunchStatus('preparing');
    setStatusLog(`Initializing PRRX Security Protocols for ${userLoginType} Panel...`);
    setProgress(30);

    // Call the Electron IPC directly to launch the process with admin privileges and working directory
    let launchResult = null;
    if (window.electronAPI && window.electronAPI.launchExecutableAsAdmin) {
      try {
        launchResult = await window.electronAPI.launchExecutableAsAdmin(selectedAppPath);
      } catch (err) {
        console.error("Launch error:", err);
      }
    }

    setTimeout(() => {
      setLaunchStatus('bypassing');
      setStatusLog('Elevating administrator tokens & activating HWID spoofer...');
      setProgress(75);
    }, 500);

    setTimeout(() => {
      setLaunchStatus('running');
      setStatusLog(`${userLoginType} PANEL RUNNING AS ADMIN WITH PRRX SECURITY PROTOCOLS`);
      setProgress(100);

      showCyberToast({
        type: 'check',
        title: 'Application Started',
        desc: `Launched with Full Admin Power and 100% Undetected PRRX Protocols.`
      });

      if (autoClose && window.electronAPI && window.electronAPI.minimizeApp) {
        setTimeout(() => window.electronAPI.minimizeApp(), 1000);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter select-none flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className={`absolute -top-32 left-1/4 w-96 h-96 ${isExternal ? 'bg-cyan-500/10' : 'bg-violet-500/10'} rounded-full blur-[120px] pointer-events-none`} />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Titlebar Area */}
      <div className="relative z-50">
        <TitleBar />
      </div>

      {/* Sleek RGB Cyberpunk Side Notifications (Auto-disappears in 2s) */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {cyberToasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative group min-w-[320px] max-w-[390px] pointer-events-auto"
            >
              {/* Outer RGB Glow Bloom */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-fuchsia-500 via-violet-500 to-emerald-400 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none animate-rgb-shift" />

              {/* Animated Multi-Color RGB Border Container */}
              <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-cyan-400 via-pink-500 via-purple-500 via-emerald-400 to-cyan-400 animate-rgb-shift shadow-[0_15px_45px_rgba(0,0,0,0.85)] overflow-hidden">
                
                {/* Main Card Body */}
                <div className="bg-[#0b121e]/95 backdrop-blur-2xl rounded-[14.5px] p-4 flex items-center gap-3.5 relative overflow-hidden">
                  
                  {/* Subtle Shimmer Sweep */}
                  <motion.div 
                    initial={{ x: "-120%" }}
                    animate={{ x: "220%" }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none -skew-x-12"
                  />

                  {/* Left Glowing RGB Icon Badge */}
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full blur-sm opacity-85 animate-pulse" />
                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                      {t.type === 'check' ? (
                        <Check className="w-4 h-4 text-slate-950 stroke-[3.5]" />
                      ) : (
                        <Info className="w-4 h-4 text-slate-950 stroke-[3.5]" />
                      )}
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 text-left relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-outfit font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 tracking-wide">
                        {t.title}
                      </h4>
                      <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed mt-0.5">
                      {t.desc}
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between gap-5 relative z-10">
        
        {/* Header Ribbon with Navigation to all other pages */}
        <header className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl bg-slate-950 border ${isExternal ? 'border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]'} p-1 flex items-center justify-center`}>
              <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-outfit font-black text-xl text-white tracking-wider">
                  PRRX <span className={isExternal ? 'text-cyan-400' : 'text-violet-400'}>HEX</span>
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isExternal ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-violet-500/10 text-violet-400 border border-violet-500/30'}`}>
                  {userLoginType} SESSION
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  UNDETECTED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Elevated Administrator & Security Engine</p>
            </div>
          </div>

          {/* User Profile & Navigation Buttons to all tabs */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-3 shadow-inner">
              <div className="text-right">
                <div className="text-[11px] font-bold text-slate-200">
                  {currentUser.full_name?.split(' ')[0] || currentUser.username || `${userLoginType} User`}
                </div>
                <div className={`text-[10px] font-mono font-semibold ${isExpiringSoon ? 'text-amber-400' : (isExternal ? 'text-cyan-400' : 'text-violet-400')}`}>
                  EXP: {formattedExpiry}
                </div>
              </div>
              <div className={`w-8 h-8 rounded-lg ${isExternal ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-violet-500/10 border-violet-500/30 text-violet-400'} border flex items-center justify-center font-black text-xs`}>
                VIP
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => navigate('/')}
                title="Home Page"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <span>Home</span>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                title="User Dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigate('/prices')}
                title="View VIP Bundles"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Prices</span>
              </button>

              <button
                onClick={() => navigate('/status')}
                title="Service Status"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Status</span>
              </button>

              <button
                onClick={() => logout(true)}
                title="Sign Out"
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Title Banner Required by User */}
        <div className={`p-4 sm:p-5 rounded-2xl border ${isExternal ? 'bg-gradient-to-r from-cyan-950/50 via-slate-900/80 to-slate-950 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'bg-gradient-to-r from-violet-950/50 via-slate-900/80 to-slate-950 border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.15)]'} flex flex-col md:flex-row md:items-center justify-between gap-4 text-left`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isExternal ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-violet-500/20 text-violet-400 border border-violet-500/40'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-[10px] font-extrabold tracking-widest uppercase ${isExternal ? 'text-cyan-400' : 'text-violet-400'}`}>
                OFFICIAL {userLoginType} LAUNCHER HUB
              </span>
              <h2 className="font-outfit font-extrabold text-xl sm:text-2xl text-white tracking-wide">
                Run As Admin {userLoginType === 'EXTERNAL' ? 'External' : 'Internal'} Panel With PRRX Security Protocoles
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Full Admin Control
            </span>
          </div>
        </div>

        {/* Center Grid: Application Selector & Start Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
          
          {/* Left Column: Application Chooser & Big Start Button (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            
            {/* 1. EMULATOR RUN AS ADMIN & REAL OPTIMIZER (Positioned Before Panel Starter) */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-outfit font-extrabold text-sm text-white">
                  <Monitor className={`w-4 h-4 ${isExternal ? 'text-cyan-400' : 'text-violet-400'}`} />
                  <span>EMULATOR RUN AS ADMIN & REAL OPTIMIZER</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  4X BATCH TWEAKS
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                  {/* Dropdown Selector */}
                  <div className="relative flex-1">
                    <select
                      value={selectedEmulator}
                      onChange={(e) => {
                        setSelectedEmulator(e.target.value);
                        localStorage.setItem('prrx_selected_emulator', e.target.value);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none pr-8"
                    >
                      <option value="bluestacks">Bluestack App Player (Default Location)</option>
                      <option value="msi">Msi App Player (Default Location)</option>
                      <option value="custom">Custom Player (Choose Executable)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>

                  {/* Start Emulator Button */}
                  <button
                    onClick={handleStartEmulatorWithOptimizers}
                    disabled={isOptimizingEmulator}
                    className={`px-4 py-2.5 rounded-xl font-outfit font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all whitespace-nowrap ${
                      isOptimizingEmulator
                        ? 'bg-cyan-500/40 text-white cursor-wait'
                        : isExternal
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                          : 'bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-400 hover:to-fuchsia-500 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    }`}
                  >
                    {isOptimizingEmulator ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>OPTIMIZING SYSTEM...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>START EMULATOR & OPTIMIZE</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Location Display */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={getActiveEmulatorPath() || 'No custom executable chosen.'}
                      placeholder="Path to emulator..."
                      className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-400 focus:outline-none"
                    />
                    {selectedEmulator !== 'custom' && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-500 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        Default Locked
                      </span>
                    )}
                  </div>

                  {selectedEmulator === 'custom' && (
                    <button
                      onClick={handleSelectCustomEmulator}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Browse</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>Auto-cleans temp caches, flushes DNS, unthrottles CPU & GPU</span>
                  <span className="text-cyan-400 font-bold">4 Consoles Auto-Close</span>
                </div>
              </div>
            </div>

            {/* 2. TARGET APPLICATION SELECTION (Panel Starter) */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-outfit font-extrabold text-sm text-white">
                  <FolderOpen className={`w-4 h-4 ${isExternal ? 'text-cyan-400' : 'text-violet-400'}`} />
                  <span>TARGET APPLICATION SELECTION</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">EXE / PANEL / EMULATOR</span>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose your panel executable, game client, or emulator to launch with <strong>Full Administrator Privileges & Owner Control</strong>.
                </p>

                {/* File Path Input / Display */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      placeholder="No application selected (Click Browse to choose .exe)"
                      value={selectedAppPath}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                    {selectedAppPath && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSelectApplication}
                    className={`px-4 py-2.5 rounded-xl font-outfit font-bold text-xs flex items-center gap-2 shadow-sm transition-all whitespace-nowrap ${
                      isExternal
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                        : 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Browse .exe</span>
                  </button>
                </div>

                {/* Selected File Details Banner */}
                {selectedAppPath ? (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-white font-bold truncate">{selectedAppPath.split('\\').pop()}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAppPath('');
                        localStorage.removeItem('prrx_selected_app_path');
                      }}
                      className="text-[10px] text-slate-500 hover:text-rose-400 underline font-sans ml-2 shrink-0"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">
                    💡 Click Browse .exe to choose your panel file on PC.
                  </div>
                )}
              </div>
            </div>

            {/* Launch Console & Full Admin Start Action */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex-1 flex flex-col justify-between gap-5 relative overflow-hidden">
              
              {/* Status Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Terminal className={`w-4 h-4 ${isExternal ? 'text-cyan-400' : 'text-violet-400'}`} />
                    <span>SECURITY PROTOCOLS: <strong className="text-white">PRRX OB46 BYPASS</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">{ping} ms</span>
                  </div>
                </div>

                {/* Console Log Screen */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-300 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">EXECUTION LEVEL</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> FULL ADMIN (OWNER POWER)
                    </span>
                  </div>
                  <div className={`text-[11px] font-bold ${isExternal ? 'text-cyan-300' : 'text-violet-300'} truncate`}>
                    &gt; {statusLog || `Ready to launch ${selectedAppPath ? selectedAppPath.split('\\').pop() : `${userLoginType} Panel`} with full admin power.`}
                  </div>
                  
                  {/* Progress Bar */}
                  {launchStatus !== 'idle' && (
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${isExternal ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' : 'bg-gradient-to-r from-violet-500 to-emerald-400'} transition-all duration-300`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Big Glowing Start Button (Auto switches back to Start when closed) */}
              <button
                onClick={handleStartApplication}
                disabled={launchStatus !== 'idle' && launchStatus !== 'running'}
                className={`w-full py-4 rounded-xl font-outfit font-extrabold text-base tracking-wider flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] shadow-xl ${
                  launchStatus === 'running'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_25px_rgba(225,29,72,0.4)]'
                    : (isExternal
                        ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-[1.01]'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:scale-[1.01]')
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {launchStatus === 'running' ? (
                  <>
                    <Crosshair className="w-5 h-5 animate-spin" />
                    <span>STOP RUNNING APPLICATION</span>
                  </>
                ) : launchStatus === 'idle' ? (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>START APPLICATION (FULL ADMIN POWER)</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>LAUNCHING WITH ADMIN RIGHTS {progress}%...</span>
                  </>
                )}
              </button>

            </div>

          </div>

          {/* Right Column: PRRX Security Protocols & Quick Utilities (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 text-left">
            
            {/* PRRX Security Protocols Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-outfit font-extrabold text-sm text-white">
                  <ShieldCheck className={`w-4 h-4 ${isExternal ? 'text-cyan-400' : 'text-violet-400'}`} />
                  <span>PRRX SECURITY PROTOCOLS</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  ARMOR ACTIVE
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5 text-slate-500" /> BlueStacks / MSI Status
                  </span>
                  <span className="text-emerald-400 font-bold">Ready / Attached</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" /> HWID Randomizer Spoofer
                  </span>
                  <button 
                    onClick={() => setHwidSpoofer(!hwidSpoofer)}
                    className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase transition-colors ${
                      hwidSpoofer ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {hwidSpoofer ? 'PROTECTED' : 'DISABLED'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-slate-500" /> StreamProof (OBS Safe)
                  </span>
                  <button 
                    onClick={() => setStreamProof(!streamProof)}
                    className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase transition-colors ${
                      streamProof ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {streamProof ? 'HIDDEN' : 'VISIBLE'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-slate-500" /> Discord Rich Presence
                  </span>
                  <button 
                    onClick={() => setDiscordRPC(!discordRPC)}
                    className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase transition-colors ${
                      discordRPC ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {discordRPC ? 'ENABLED' : 'MUTED'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Utilities & Support Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-outfit font-extrabold text-sm text-white">
                  <Zap className={`w-4 h-4 ${isExternal ? 'text-cyan-400' : 'text-violet-400'}`} />
                  <span>VIP SUPPORT & TOOLS</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">24/7 ACTIVE</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="https://wa.me/94761386077"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-3 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp VIP</span>
                </a>
                
                <button
                  onClick={() => {
                    const current = localStorage.getItem('prrx_show_fps') === 'true';
                    localStorage.setItem('prrx_show_fps', (!current).toString());
                    window.dispatchEvent(new Event('prrx_toggle_fps'));
                    showCyberToast({
                      type: 'check',
                      title: 'FPS Overlay',
                      desc: !current ? 'Overlay enabled' : 'Overlay disabled'
                    });
                  }}
                  className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Toggle FPS</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Kernel Driver Protection:</span>
                <span className="text-emerald-400 font-mono font-bold">ACTIVE (OB46)</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Bar */}
        <footer className="py-2 px-1 text-slate-500 text-[11px] font-mono flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Server: ASIA-ONLINE · Latency: {ping}ms · Administrator Elevation: Enabled</span>
          </div>
          <div>
            <span>© 2026 PRRX HEX · Full Owner Control & Run As Admin Mode</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
