import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, MessageSquare, X, ShieldCheck } from 'lucide-react';

export default function StickyMobileCta() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  // Show only after user scrolls 180px and hide on checkout/admin routes
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 180 && !dismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  const isExcludedRoute = ['/admin', '/dashboard', '/launcher', '/app-launcher'].includes(location.pathname);

  if (isExcludedRoute || !isVisible || dismissed) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative p-2.5 rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl flex items-center justify-between gap-2.5">
        
        {/* Left Action Button: Buy Key */}
        <Link
          to="/prices"
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-outfit font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
        >
          <Zap className="w-3.5 h-3.5 fill-slate-950" />
          <span>GET VIP KEY</span>
        </Link>

        {/* Right Action Button: Freebies / Discord */}
        <Link
          to="/freebies"
          className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-outfit font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>FREEBIES</span>
        </Link>

        {/* Dismiss Button */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Close sticky bar"
          className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-colors flex-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
