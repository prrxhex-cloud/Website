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
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(2, 8, 20, 0.8)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        
        {/* Logo Section */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate('/')}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0077ff] shadow-[0_0_15px_rgba(0,212,255,0.4)]">
             <Hexagon className="absolute text-white/20 w-8 h-8" strokeWidth={1} />
             <Settings className="text-white w-5 h-5 animate-[spin_6s_linear_infinite]" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-orbitron font-bold text-xl text-white tracking-wide leading-tight">
              PRRX <span className="text-[#00d4ff]">HEX</span>
            </h1>
            <span className="text-[0.65rem] font-inter text-gray-400 tracking-[0.15em] uppercase font-semibold">
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
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,212,255,0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { navigate('/'); setTimeout(() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            className="hidden sm:flex items-center gap-2 font-orbitron font-bold text-[0.8rem] px-5 py-2.5 rounded-full transition-all"
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #0088cc)',
              color: '#020810',
              boxShadow: '0 4px 15px rgba(0,212,255,0.3)',
            }}
          >
            <Zap size={14} className="fill-current" /> BUY VIP KEY
          </motion.button>

          {/* Menu Dropdown Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-inter font-medium text-sm transition-colors"
            style={{ 
              background: mobileOpen ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: mobileOpen ? '#00d4ff' : 'white'
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
                className="absolute top-14 right-0 w-64 rounded-xl overflow-hidden shadow-2xl z-50"
                style={{
                  background: 'rgba(5, 12, 25, 0.95)',
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.05)',
                }}
              >
                <div className="flex flex-col py-2">
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