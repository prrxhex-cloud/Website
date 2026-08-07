import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShieldCheck, Volume2, VolumeX, Crosshair, ChevronRight, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSound } from '../../context/SoundContext';

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

  const handleNav = (item) => {
    setMobileOpen(false);
    navigate(item.path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs py-1.5 px-4 font-inter">
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

      {/* Main Navigation Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(6,182,212,0.3)] transition-transform group-hover:scale-105">
              <Crosshair className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-outfit font-black text-xl text-slate-900 tracking-tight leading-none">
                PRRX <span className="text-[#06b6d4]">HEX</span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase mt-0.5">
                PREMIUM FF CHEATZ
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
                  isActive(item.path) ? 'text-[#06b6d4]' : 'text-slate-700 hover:text-[#06b6d4]'
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
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              title="Toggle UI Sounds"
              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#06b6d4]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              onClick={() => navigate('/prices')}
              className="btn-primary-cyan btn-glow px-5 py-2.5 font-inter font-semibold text-sm flex items-center gap-2 shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Buy VIP Key</span>
            </button>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
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
            className="lg:hidden bg-white border-b border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2 max-w-[1240px] mx-auto">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item)}
                  className={`w-full text-left font-inter font-semibold px-4 py-2.5 rounded-xl flex items-center justify-between ${
                    isActive(item.path) 
                      ? 'bg-[#06b6d4]/10 text-[#06b6d4]' 
                      : 'text-slate-700 hover:bg-slate-50'
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