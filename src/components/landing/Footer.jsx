import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, ShieldCheck, ChevronRight, MessageCircle, PhoneCall, Crown } from 'lucide-react';
import logoImg from '@/assets/logo.jpeg';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[var(--bg-main)] border-t border-[var(--border-color)] py-16 font-inter text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">

        {/* Main 4-Column Footer Grid (Matching Photo 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Brand & About (4 cols) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => navigate('/')}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-cyan-500/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-transform group-hover:scale-105">
                <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div className="flex flex-col">
                <span className="font-outfit font-black text-2xl tracking-tight leading-none text-[var(--text-heading)]">
                  PRRX <span className="text-[#06b6d4]">HEX</span>
                </span>
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#06b6d4] uppercase mt-0.5">
                  PREMIUM FF CHEATS
                </span>
              </div>
            </div>

            <p className="font-inter text-xs text-[var(--text-muted)] leading-relaxed max-w-sm">
              The premier destination for undetected Free Fire VIP cheats, aimbot injectors, location ESP, and emulator bypasses.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold font-inter">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Safe Main ID · Anti-Cheat Bypassed</span>
            </div>
          </div>

          {/* Column 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="font-outfit font-extrabold text-sm text-[var(--text-heading)] uppercase tracking-wider border-b border-[var(--border-color)] pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              {[
                { label: 'Home', path: '/' },
                { label: 'Safe Status', path: '/status' },
                { label: 'Live Demo Engine', path: '/live-demo' },
                { label: 'Functions', path: '/functions' },
                { label: 'Prices & VIP Bundles', path: '/prices' },
                { label: 'Resellers Portal', path: '/resellers' },
                { label: 'Freebies & Trials', path: '/freebies' },
                { label: 'User Dashboard', path: '/dashboard' },
              ]
                .filter(link => {
                  if (window.electronAPI) {
                    return !['/live-demo', '/functions', '/resellers'].includes(link.path);
                  }
                  return true;
                })
                .map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="hover:text-[#06b6d4] transition-colors flex items-center gap-1.5 group text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                  >
                    <ChevronRight className="w-3 h-3 text-[#06b6d4] group-hover:translate-x-0.5 transition-transform" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Cheat Products (2 cols) */}
          <div className="lg:col-span-2 space-y-3 text-left">
            <h4 className="font-outfit font-extrabold text-sm text-[var(--text-heading)] uppercase tracking-wider border-b border-[var(--border-color)] pb-2">
              Products
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button
                  onClick={() => navigate('/prices')}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[#06b6d4] transition-all group"
                >
                  <div className="font-outfit font-bold text-xs text-[var(--text-heading)] group-hover:text-[#06b6d4]">
                    Internal Panel
                  </div>
                  <div className="font-inter text-[10px] text-[var(--text-muted)] mt-0.5">
                    Non Root Apk Injection
                  </div>
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigate('/prices')}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-violet-500 transition-all group"
                >
                  <div className="font-outfit font-bold text-xs text-[var(--text-heading)] group-hover:text-violet-400">
                    External Panel
                  </div>
                  <div className="font-inter text-[10px] text-[var(--text-muted)] mt-0.5">
                    100% Safer Gameplay
                  </div>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Payment Methods (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="font-outfit font-extrabold text-sm text-[var(--text-heading)] uppercase tracking-wider border-b border-[var(--border-color)] pb-2">
              Payment Methods
            </h4>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-500 font-outfit font-bold text-xs">
                  <PhoneCall className="w-4 h-4 animate-pulse" />
                  <span>Receipt to WhatsApp only</span>
                </div>
                <p className="font-inter text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Send your payment screenshot / receipt directly to WhatsApp for 10-second instant key delivery!
                </p>
              </div>

              <a
                href="https://wa.me/94761386077"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-glow px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-outfit font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send Receipt via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-75" />
              </a>
            </div>
          </div>

        </div>

        {/* Developer Profile Card */}
        <div className="clean-card p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-4xl mx-auto shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center font-outfit font-black text-lg text-[#06b6d4]">
                G
              </div>
              <div className="text-left">
                <div className="font-outfit font-black text-base text-[var(--text-heading)] flex items-center gap-2">
                  GAARA <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div className="font-inter text-xs text-[var(--text-muted)]">Co Developer · PRRX CHEATS CO-OWNER</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <a
                href="https://discord.com/users/prrx2021"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/25 transition-all flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> Discord: prrx2021
              </a>
              <a
                href="https://wa.me/94761386077"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 transition-all flex items-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4" /> +94 761 386 077
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)] font-inter">
          <p>© 2026 PRRX CHEATS. All rights reserved. Designed for educational & research purposes only.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/status')} className="hover:text-[var(--text-heading)] transition-colors">Safe Status</button>
            <span>•</span>
            <button onClick={() => navigate('/prices')} className="hover:text-[var(--text-heading)] transition-colors">VIP Bundles</button>
            <span>•</span>
            <button onClick={() => navigate('/admin')} className="hover:text-[var(--text-heading)] transition-colors">Staff Portal</button>
          </div>
        </div>

      </div>
    </footer>
  );
}