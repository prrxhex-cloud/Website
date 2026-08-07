import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShieldCheck, Volume2, VolumeX, ChevronRight, Zap, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSound } from '../../context/SoundContext';
import { useTheme } from '@/lib/ThemeContext';
import logoImg from '@/assets/logo.jpeg';

const navLinks = [
  { label: 'Home', type: 'page', path: '/' },
  { label: 'Status', type: 'page', path: '/status' },
  { label: 'Live Demo', type: 'page', path: '/live-demo', badge: 'HOT', badgeColor: '#f97316' },
  { label: 'Functions', type: 'page', path: '/functions' },
  { label: 'Prices', type: 'page', path: '/prices' },
  { label: 'Resellers', type: 'page', path: '/resellers' },
  { label: 'Freebies', type: 'page', path: '/freebies', badge: 'FREE', badgeColor: '#10b981' },
  { label: 'Dashboard', type: 'page', path: '/dashboard' },
  { label: 'Admin', type: 'page', path: '/admin', badge: 'STAFF', badgeColor: '#8b5cf6' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { soundEnabled, toggleSound } = useSound();
  const { theme, toggleTheme } = useTheme();

  const handleNav = (item) => {
    setMobileOpen(false);
    navigate(item.path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sticky top-0 z-50 w-full font-inter">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-white/10 text-white text-xs py-1.5 px-4">
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

      {/* Main Navigation Header with iOS Liquid Glass backdrop */}
      <header className="clean-glass-header transition-all">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between">
          
          {/* Official Logo Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => navigate('/')}
          >
            <div className="w-11 h-11 rounded-2xl bg-slate-900/50 border border-cyan-500/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-transform group-hover:scale-105">
              <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-outfit font-black text-xl tracking-tight leading-none text-[var(--text-heading)]">
                PRRX <span className="text-[#06b6d4]">HEX</span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase mt-0.5">
                PREMIUM CHEATS STORE
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className={`font-inter text-sm font-semibold transition-colors flex items-center gap-1.5 relative py-1 ${
                  isActive(item.path) 
                    ? 'text-[#06b6d4]' 
                    : 'text-[var(--text-primary)] hover:text-[#06b6d4]'
                }`}
              >
                {item.label}
                {item.badge && (
                  <span 
                    className="text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase text-white"
                    style={{ backgroundColor: item.badgeColor }}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive(item.path) && (
                  <motion.div 
                    layoutId="activeNavIndicator" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06b6d4] rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Switcher Toggle (iOS Style) */}
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

            {/* VIP Key Button */}
            <button
              onClick={() => navigate('/prices')}
              className="btn-primary-cyan btn-glow px-4 py-2 font-inter font-semibold text-xs flex items-center gap-2 shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Buy VIP Key</span>
            </button>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[var(--bg-glass-card)] backdrop-blur-xl border-b border-[var(--border-color)] shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2 max-w-[1240px] mx-auto">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item)}
                  className={`w-full text-left font-inter font-semibold px-4 py-2.5 rounded-xl flex items-center justify-between ${
                    isActive(item.path) 
                      ? 'bg-[#06b6d4]/15 text-[#06b6d4]' 
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span 
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: item.badgeColor }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}