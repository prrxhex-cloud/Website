import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Home', type: 'scroll', id: 'hero', path: '/' },
  { label: 'Price', type: 'page', path: '/prices' },
  { label: 'Functions', type: 'page', path: '/functions' },
  { label: 'Resellers', type: 'page', path: '/resellers', badge: 'NEW' },
  { label: 'Freebies', type: 'page', path: '/freebies', badge: 'FREE' },
  { label: 'Status', type: 'page', path: '/status' },
  { label: 'Admin', type: 'page', path: '/admin', badge: 'STAFF' },
  { label: 'Dashboard', type: 'page', path: '/dashboard' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4"
      style={{ pointerEvents: 'none' }}
    >
      {/* Pill navbar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-full"
        style={{
          pointerEvents: 'auto',
          background: 'rgba(2, 12, 30, 0.55)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid rgba(0,212,255,0.18)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(0,212,255,0.05)',
        }}
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer select-none flex items-center mr-2"
          onClick={() => navigate('/')}
        >
          <img src="/logo.png" alt="PRRX Logo" className="w-8 h-8 object-contain" />
        </motion.div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <motion.button
              key={item.label}
              onClick={() => handleNav(item)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="relative font-inter font-medium text-sm px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5"
              style={{
                color: isActive(item) ? '#020810' : 'rgba(180,210,230,0.75)',
                background: isActive(item)
                  ? 'linear-gradient(135deg, #00d4ff, #0099cc)'
                  : 'transparent',
                boxShadow: isActive(item) ? '0 0 16px rgba(0,212,255,0.4)' : 'none',
              }}
            >
              {item.label}
              {item.badge && (
                <span className="text-xs font-orbitron font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive(item) ? 'rgba(0,0,0,0.25)' : 'rgba(0,212,255,0.15)',
                    color: isActive(item) ? '#020810' : '#00d4ff',
                    fontSize: '8px',
                    border: `1px solid ${isActive(item) ? 'rgba(0,0,0,0.1)' : 'rgba(0,212,255,0.3)'}`,
                  }}>
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* GET NOW button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 24px rgba(0,212,255,0.5)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { navigate('/'); setTimeout(() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          className="hidden md:block font-orbitron font-bold text-xs tracking-widest px-5 py-2 rounded-full ml-2 transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,100,200,0.1))',
            border: '1px solid rgba(0,212,255,0.5)',
            color: '#00d4ff',
            boxShadow: '0 0 16px rgba(0,212,255,0.15)',
          }}
        >
          ⚡ GET NOW
        </motion.button>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-primary ml-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ pointerEvents: 'auto' }}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-4 right-4 rounded-2xl overflow-hidden"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(2,10,28,0.92)',
              backdropFilter: 'blur(30px) saturate(200%)',
              WebkitBackdropFilter: 'blur(30px) saturate(200%)',
              border: '1px solid rgba(0,212,255,0.15)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            }}
          >
            <div className="p-3 space-y-1">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item)}
                  className="block w-full text-left text-sm font-inter py-3 px-4 rounded-xl transition-all"
                  style={{
                    color: isActive(item) ? '#00d4ff' : 'rgba(180,200,220,0.75)',
                    background: isActive(item) ? 'rgba(0,212,255,0.08)' : 'transparent',
                    border: isActive(item) ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                  }}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { setMobileOpen(false); navigate('/'); setTimeout(() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                className="w-full font-orbitron font-bold text-xs tracking-widest px-6 py-3 rounded-xl mt-1"
                style={{ borderColor: 'rgba(0,212,255,0.4)', color: '#00d4ff', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)' }}
              >
                ⚡ GET NOW
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}