import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShieldCheck, Volume2, VolumeX, ChevronRight, Zap, Sun, Moon, ChevronDown, Smartphone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useSound } from '@/context/SoundContext';
import { useTheme } from '@/lib/ThemeContext';
import { usePwa } from '@/context/PwaContext';
import { useAuth } from '@/lib/AuthContext';
import { isDiscountActive } from '@/utils/discountUtils';
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
  const [activeDiscount, setActiveDiscount] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { soundEnabled, toggleSound } = useSound();
  const { theme, toggleTheme } = useTheme();
  const { promptInstall, isInstalled } = usePwa();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const fetchDiscounts = async () => {
      try {
        const { data: discountList, error } = await supabase
          .from('discounts')
          .select('*')
          .order('created_date', { ascending: false });

        if (isMounted && discountList && !error && discountList.length > 0) {
          const myPersonal = discountList.find(d => isDiscountActive(d) && d.is_personal && d.owner_email && d.owner_email === user?.email);
          const globalFlash = discountList.find(d => isDiscountActive(d) && !d.is_personal);
          const valid = myPersonal || globalFlash || null;
          if (valid) {
            setActiveDiscount(valid);
          } else {
            setActiveDiscount(null);
          }
        }
      } catch (err) {
        console.warn('Navbar discount fetch error:', err);
      }
    };
    fetchDiscounts();
    return () => { isMounted = false; };
  }, [user?.email]);

  const handleNav = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleClaimDiscount = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/prices');
    } else {
      navigate('/prices');
    }
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

  const discountValText = activeDiscount?.discount_type === 'percentage'
    ? `${activeDiscount.discount_value}% OFF`
    : `LKR ${activeDiscount?.discount_value} OFF`;

  return (
    <div className="sticky top-0 z-50 w-full font-inter">
      {/* Top Announcement Bar with Flash Discount - ONLY SHOWN WHEN A DISCOUNT IS ACTIVELY VALID */}
      {activeDiscount && (
        <div className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-b border-cyan-500/20 text-white text-xs py-1.5 px-4 animate-fadeIn">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 font-medium">
              <span className="bg-gradient-to-r from-red-500/30 to-amber-500/30 border border-red-500/50 text-red-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-current animate-pulse" /> FLASH SALE
              </span>
              <span className="hidden sm:inline">
                🎉 <strong>LIMITED TIME:</strong> Sign in with code <code className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold border border-cyan-500/30">{activeDiscount.promo_code}</code> for <strong>{discountValText}</strong> all VIP keys!
              </span>
              <span className="sm:hidden text-[11px]">
                🎉 Code <code className="bg-cyan-500/20 text-cyan-300 px-1 rounded font-mono font-bold">{activeDiscount.promo_code}</code> for {discountValText}!
              </span>
            </div>
            <button onClick={handleClaimDiscount} className="text-[#06b6d4] hover:text-cyan-300 font-bold text-xs hover:underline flex items-center gap-0.5 ml-auto">
              <span>{isAuthenticated ? 'View Discounts' : 'Login to Claim Discount'}</span> <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
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

          {/* Right Action Controls with Side Navbar Trigger */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors shadow-sm"
              title={theme === 'dark' ? 'Switch to Cyber Light' : 'Switch to Midnight Dark'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors shadow-sm"
              title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#06b6d4]" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>

            {/* VIP Member Login / Status */}
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-outfit shadow-sm hover:scale-105 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>VIP Active</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#06b6d4] to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-outfit font-extrabold text-xs tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>VIP</span>
              </button>
            )}

            {/* Side Navbar Menu Trigger Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-500/40 text-xs font-bold font-outfit text-[var(--text-heading)] shadow-sm hover:scale-105 transition-all"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4 text-cyan-400" />}
              <span className="hidden sm:inline">Menu</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Over Side Navigation Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-inter">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            />

            {/* Slide-Over Drawer Panel from Right */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[var(--bg-card)] border-l border-[var(--border-color)] shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div className="space-y-5">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                  <div className="flex items-center gap-3">
                    <img src={logoImg} alt="PRRX Logo" className="w-8 h-8 rounded-xl object-contain border border-cyan-500/30 p-0.5" />
                    <div>
                      <span className="font-outfit font-black text-lg text-[var(--text-heading)]">PRRX <span className="text-[#06b6d4]">HEX</span></span>
                      <span className="text-[9px] font-bold text-[var(--text-muted)] block tracking-wider uppercase">NAVIGATION MENU</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-heading)] flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <div className="space-y-1.5">
                  {filteredNavLinks.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => handleNav(link.path)}
                      className={`w-full px-4 py-3 rounded-2xl text-left font-outfit text-sm font-bold flex items-center justify-between transition-all ${
                        isActive(link.path)
                          ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-md'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <span 
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ 
                            backgroundColor: `${link.badgeColor}25`, 
                            color: link.badgeColor,
                            border: `1px solid ${link.badgeColor}40`
                          }}
                        >
                          {link.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-[var(--border-color)] space-y-3">
                {!isAuthenticated ? (
                  <button
                    onClick={() => handleNav('/login')}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-slate-950 font-outfit font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>SIGN IN TO VIP PORTAL</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('/dashboard')}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 font-outfit font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>MY VIP DASHBOARD</span>
                  </button>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}