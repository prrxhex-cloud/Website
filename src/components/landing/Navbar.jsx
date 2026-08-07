import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, Volume2, VolumeX, Sun, Hexagon, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSound } from '../../context/SoundContext';
import logoImg from '../../assets/logo.jpeg';

const navLinks = [
  { label: 'Home', type: 'scroll', id: 'hero', path: '/' },
  { label: 'Status', type: 'page', path: '/status' },
  { label: 'Live Demo', type: 'page', path: '/live-demo', badge: 'HOT', badgeColor: '#ef4444' },
  { label: 'Functions', type: 'page', path: '/functions' },
  { label: 'Chat', type: 'page', path: '/chat' },
  { label: 'Resellers', type: 'page', path: '/resellers' },
  { label: 'Freebies', type: 'page', path: '/freebies', badge: 'FREE', badgeColor: '#10b981' },
  { label: 'Prices', type: 'page', path: '/prices' },
  { label: 'Admin', type: 'page', path: '/admin', badge: 'STAFF', badgeColor: '#f59e0b' },
  { label: 'Dashboard', type: 'page', path: '/dashboard' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { soundEnabled, toggleSound } = useSound();

  const handleNav = (item) => {
    setMobileOpen(false);
    if (item.type === 'page') {
      navigate(item.path);
    } else {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isActive = (item) => {
    if (item.type === 'page') return location.pathname === item.path;
    return location.pathname === '/';
  };

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed top-4 left-4 right-4 z-50 liquid-glass"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        
        {/* Logo Section */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate('/')}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#ff00ff] shadow-[0_0_15px_rgba(0,212,255,0.4)] overflow-hidden">
             <div className="absolute inset-0 bg-white/10 shimmer mix-blend-overlay"></div>
             <Hexagon className="absolute text-white/20 w-8 h-8" strokeWidth={1} />
             <Settings className="text-white w-5 h-5 animate-[spin_6s_linear_infinite]" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-orbitron font-bold text-xl text-white tracking-wide leading-tight glow-cyan">
              PRRX <span className="text-[#ff00ff] glow-magenta">HEX</span>
            </h1>
            <span className="text-[0.65rem] font-inter text-gray-300 tracking-[0.15em] uppercase font-semibold">
              Premium FF Cheatz
            </span>
          </div>
        </motion.div>

        {/* Desktop & Actions Right Side */}
        <div className="flex items-center gap-3 md:gap-4 relative">
          
          {/* Theme Toggle (Placeholder) */}
          <button className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <Sun size={18} />
          </button>

          {/* Sound toggle button */}
          <button
            id="sound-toggle"
            onClick={toggleSound}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/10"
            style={{ color: soundEnabled ? '#00d4ff' : 'rgba(156,163,175,0.8)' }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* VIP Button */}
          <motion.button
            onClick={() => { navigate('/'); setTimeout(() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            className="hidden sm:flex items-center gap-2 font-orbitron font-bold text-[0.8rem] px-5 py-2.5 liquid-btn"
          >
            <Zap size={14} className="fill-current" /> BUY VIP KEY
          </motion.button>

          {/* Menu Dropdown Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-inter font-medium text-sm transition-colors"
            style={{ 
              background: mobileOpen ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(0,212,255,0.2)',
              color: mobileOpen ? '#ffffff' : 'white'
            }}
          >
            <Menu size={18} /> <span className="hidden sm:block">Menu</span>
          </motion.button>

          {/* Dropdown Menu Panel */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-14 right-0 w-64 liquid-glass z-50 overflow-hidden p-2"
              >
                <div className="flex flex-col">
                  <div className="px-4 py-2 mb-1 border-b border-white/5">
                    <span className="text-xs font-orbitron font-bold text-[#00d4ff] tracking-wider uppercase">Menu</span>
                  </div>
                  {navLinks.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNav(item)}
                      className="group flex items-center justify-between px-5 py-2.5 text-left font-inter text-sm transition-all hover:bg-white/5"
                      style={{
                        color: isActive(item) ? '#00d4ff' : 'rgba(200,210,220,0.85)',
                        borderLeft: isActive(item) ? '2px solid #00d4ff' : '2px solid transparent'
                      }}
                    >
                      <span className="group-hover:text-white transition-colors">{item.label}</span>
                      {item.badge && (
                        <span 
                          className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${item.badgeColor}20`,
                            color: item.badgeColor,
                            border: `1px solid ${item.badgeColor}40`
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                  
                  {/* Mobile-only CTA */}
                  <div className="sm:hidden px-4 mt-2 pt-3 border-t border-white/5">
                     <button
                        onClick={() => { setMobileOpen(false); navigate('/'); setTimeout(() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                        className="w-full flex justify-center items-center gap-2 font-orbitron font-bold text-[0.8rem] px-5 py-2.5 rounded-lg transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #00d4ff, #0088cc)',
                          color: '#020810',
                        }}
                      >
                        <Zap size={14} className="fill-current" /> BUY VIP KEY
                      </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}