import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShieldCheck, Volume2, VolumeX, ChevronRight, Zap, Sun, Moon, ChevronDown, Smartphone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSound } from '../../context/SoundContext';
import { useTheme } from '@/lib/ThemeContext';
import { usePwa } from '@/context/PwaContext';
import logoImg from '@/assets/logo.jpeg';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Status', path: '/status' },
  { label: 'Live Demo', path: '/live-demo', badge: 'HOT', badgeColor: '#f97316' },
  { label: 'Functions', path: '/functions' },
  { label: 'Prices & VIP Keys', path: '/prices' },
  { label: 'Resellers', path: '/resellers' },
  { label: 'Freebies', path: '/freebies', badge: 'FREE', badgeColor: '#10b981' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Admin Portal', path: '/admin', badge: 'STAFF', badgeColor: '#8b5cf6' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { soundEnabled, toggleSound } = useSound();
  const { theme, toggleTheme } = useTheme();
  const { promptInstall, isInstalled } = usePwa();

  const handleNav = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  const filteredNavLinks = window.electronAPI
    ? [
        { label: 'Home', path: '/' },
        { label: 'Launcher Panel', path: '/app-launcher', badge: 'VIP', badgeColor: '#06b6d4' },
        { label: 'Status', path: '/status' },
        { label: 'Prices & VIP Keys', path: '/prices' },
        { label: 'Freebies', path: '/freebies', badge: 'FREE', badgeColor: '#10b981' },
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Admin Portal', path: '/admin', badge: 'STAFF', badgeColor: '#8b5cf6' },
      ]
    : navLinks;

  return (
    <div className="sticky top-0 z-50 w-full font-inter">
      {/* Top Announcement Bar */}
      <div className="bg-slate-950 border-b border-white/10 text-white text-xs py-1.5 px-4">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-red-500/20 border border-red-500/50 text-red-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 text-red-400 fill-current animate-pulse" /> OB46 READY
            </span>
            <span className="hidden sm:inline">🔥 <strong>NEW UPDATE RELEASED!</strong> Free Fire OB46 Anti-Cheat Bypassed v5.8 is NOW LIVE & 100% UNDETECTED!</span>
          </div>
          <button onClick={() => navigate('/prices')} className="text-[#06b6d4] font-bold text-xs hover:underline flex items-center gap-0.5 ml-auto">
            Get Instant Key <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Navigation Header (Simplified as per Photo 1) */}
      <header className="clean-glass-header transition-all">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-900/60 border border-cyan-500/40 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-transform group-hover:scale-105">
              <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-outfit font-black text-xl tracking-tight leading-none text-[var(--text-heading)]">
                PRRX <span className="text-[#06b6d4]">HEX</span>
              </span>
              <span className="text-[9px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase mt-0.5">
                PREMIUM FF CHEATZ
              </span>
            </div>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
              className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center hover:border-[#06b6d4] transition-all shadow-sm"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title="Toggle UI Sounds"
              className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center hover:border-[#06b6d4] transition-all shadow-sm"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#06b6d4]" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>

            {/* Buy VIP Key CTA */}
            <button
              onClick={() => navigate('/prices')}
              className="btn-primary-cyan btn-glow px-3 sm:px-4 py-2 font-inter font-bold text-xs flex items-center gap-1.5 shadow-md whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline">Buy VIP Key</span>
              <span className="xs:hidden">VIP</span>
            </button>

            {/* Dropdown / Mobile Menu Drawer Toggle Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-heading)] font-outfit font-bold text-xs flex items-center gap-1.5 hover:border-[#06b6d4] transition-all shadow-sm shrink-0"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-[#06b6d4]" />}
              <span className="hidden sm:inline">Menu</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Responsive Mobile / Desktop Navigation Overlay & Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Tap Outside Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />

              {/* Menu Drawer */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-2 sm:right-6 top-16 w-[calc(100vw-1rem)] sm:w-80 p-3 rounded-2xl bg-[var(--bg-glass-card)] backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl z-50 text-left space-y-1 max-h-[80vh] overflow-y-auto custom-scrollbar"
              >
                <div className="px-3 py-2 mb-1 border-b border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-[10px] font-outfit font-bold uppercase tracking-wider text-[var(--text-muted)]">Navigation</span>
                  <div className="flex items-center gap-2 sm:hidden">
                    <button
                      onClick={toggleTheme}
                      className="p-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                    >
                      {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                    <button
                      onClick={toggleSound}
                      className="p-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#06b6d4]" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
                    </button>
                  </div>
                </div>

                {/* Web App Installation Action */}
                {!isInstalled && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      promptInstall();
                    }}
                    className="w-full font-inter font-bold text-xs px-3.5 py-2.5 my-1.5 rounded-xl flex items-center justify-between bg-gradient-to-r from-[#06b6d4]/20 to-cyan-500/20 text-[#06b6d4] border border-[#06b6d4]/40 hover:border-[#06b6d4] transition-all min-h-[44px] shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#06b6d4]" />
                      <span>Install App (PC & Mobile)</span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-[#06b6d4] text-white">
                      WEBAPP
                    </span>
                  </button>
                )}

                {filteredNavLinks.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.path)}
                    className={`w-full font-inter font-semibold text-xs px-3.5 py-3 rounded-xl flex items-center justify-between transition-all min-h-[44px] ${
                      isActive(item.path)
                        ? 'bg-[#06b6d4]/15 text-[#06b6d4] font-bold border border-[#06b6d4]/30'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-heading)]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span 
                        className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase text-white"
                        style={{ backgroundColor: item.badgeColor }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}