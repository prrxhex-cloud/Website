import React from 'react';
import { Code2, Shield, Server, Crown, MessageCircle, ExternalLink } from 'lucide-react';
import logoImg from '@/assets/logo.jpeg';

const devRoles = [
  { icon: Crown,         label: 'PRRX Official Seller' },
  { icon: Server,        label: 'Key Auth Manager' },
  { icon: Code2,         label: 'Web Design & Developer' },
  { icon: MessageCircle, label: 'Owner — PRRX Discord Server' },
  { icon: Shield,        label: 'Ethical Hacker' },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-main)] border-t border-[var(--border-color)] py-16 font-inter text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-3 p-1 rounded-2xl bg-slate-900/60 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <img src={logoImg} alt="PRRX Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h3 className="font-outfit font-extrabold text-xl text-[var(--text-heading)]">PRRX CHEATS STORE</h3>
          <p className="font-inter text-xs text-[#06b6d4] font-bold tracking-wider uppercase mt-1">Free Fire Undetected Bypass</p>
        </div>

        {/* Developer card */}
        <div className="clean-card p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-4xl mx-auto mb-12 shadow-md">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-pulse" />
              <span className="font-outfit font-extrabold text-xs text-[var(--text-heading)] tracking-wider">DEVELOPER PROFILE</span>
            </div>
            <span className="font-outfit font-extrabold text-xs text-violet-500 tracking-wider">PRRX TEAM</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

            {/* Left — identity */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center font-outfit font-black text-2xl text-[#06b6d4]">
                  G
                </div>
                <div>
                  <h3 className="font-outfit font-black text-2xl text-[var(--text-heading)]">
                    GAARA
                  </h3>
                  <p className="font-inter text-xs text-[var(--text-muted)] font-medium">Created By Gaara · PRRX Lead Developer</p>
                </div>
              </div>

              <div className="space-y-3">
                {devRoles.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-xs text-[var(--text-primary)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center text-[#06b6d4]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — contacts */}
            <div className="space-y-4">
              <div className="font-outfit font-bold text-xs text-[var(--text-muted)] uppercase tracking-wider pb-2 border-b border-[var(--border-color)]">
                DIRECT CONTACT & SUPPORT
              </div>

              <a
                href="https://discord.com/users/prrx2021"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-indigo-500 hover:bg-indigo-500/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-outfit font-bold text-xs text-[var(--text-muted)]">DISCORD USER</p>
                  <p className="font-inter text-sm font-bold text-[var(--text-heading)]">prrx2021</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-500" />
              </a>

              <a
                href="https://wa.me/94761386077"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-emerald-500 hover:bg-emerald-500/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M20.463 3.488C18.217 1.24 15.231 0 12.05 0 5.495 0 .16 5.334.157 11.893c0 2.096.547 4.142 1.588 5.946L.057 24l6.304-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.895.002-3.18-1.235-6.165-3.479-8.41z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-outfit font-bold text-xs text-[var(--text-muted)]">WHATSAPP SUPPORT</p>
                  <p className="font-inter text-sm font-bold text-[var(--text-heading)]">+94 761 386 077</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="text-center space-y-1 text-xs text-[var(--text-muted)]">
          <p className="font-inter">
            Created By <span className="font-outfit font-bold text-[var(--text-heading)]">Gaara</span> — Lead Developer
          </p>
          <p className="font-inter">
            © 2026 PRRX TEAM. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}