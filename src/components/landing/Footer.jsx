import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Shield, Server, Crown, MessageCircle, ExternalLink } from 'lucide-react';
import logoImg from '../../assets/logo.jpeg';

const devRoles = [
  { icon: Crown,         label: 'PRRX Official Seller' },
  { icon: Server,        label: 'Key Auth Manager' },
  { icon: Code2,         label: 'Web Design & Developer' },
  { icon: MessageCircle, label: 'Owner — PRRX Discord Server' },
  { icon: Shield,        label: 'Ethical Hacker' },
];

export default function Footer() {
  return (
    <footer className="relative border-t overflow-hidden liquid-bg" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
      {/* Background Blobs */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-5 pointer-events-none translate-y-1/2"></div>
      
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.8), rgba(255,0,255,0.8), transparent)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[50px] blur-[30px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2), rgba(255,0,255,0.2), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 relative z-10">

        {/* Brand */}
        <div className="text-center mb-12 relative group inline-block w-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#00d4ff] rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <img src={logoImg} alt="PRRX Logo" className="w-20 h-20 mx-auto mb-4 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,212,255,0.5)] group-hover:scale-110 transition-transform duration-500" />
          <p className="font-inter text-xs text-[#00d4ff] mt-2 tracking-widest uppercase font-bold text-shadow-glow">Free Fire Premium Panel</p>
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-16">
          {['Licence Log', 'User Log', 'Web', "What's New Update", 'Service Checking', 'Report PRRXApp'].map((link) => (
            <button key={link} className="font-inter text-xs text-gray-400 hover:text-white transition-all uppercase tracking-wider bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/10 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              {link}
            </button>
          ))}
        </div>

        {/* Dev card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[40px] overflow-hidden mb-12 liquid-glass border border-white/10 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/5 to-[#ff00ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Card header bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b backdrop-blur-md relative z-10"
            style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.4)' }}>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff] animate-pulse" />
              <span className="font-orbitron font-bold text-xs tracking-widest text-[#00d4ff]">DEVELOPER PROFILE</span>
            </div>
            <span className="font-orbitron font-bold text-xs text-[#ff00ff] tracking-widest">PRRX TEAM</span>
          </div>

          <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-start relative z-10">

            {/* Left — identity */}
            <div>
              {/* Avatar / name */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-[24px] flex items-center justify-center font-orbitron font-black text-3xl flex-shrink-0 liquid-glass border border-[#00d4ff]/30 shadow-[0_0_30px_rgba(0,212,255,0.15)] group-hover:scale-105 transition-transform">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#00d4ff] to-[#ff00ff]">G</span>
                </div>
                <div>
                  <h3 className="font-orbitron font-black text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] mb-1">
                    GAARA
                  </h3>
                  <p className="font-inter text-sm text-gray-400">Created By Gaara · PRRX Team</p>
                </div>
              </div>

              {/* Roles */}
              <div className="space-y-4">
                {devRoles.map(({ icon: Icon, label }, i) => (
                  <div key={label} className="flex items-center gap-4 group/item" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 group-hover/item:border-[#ff00ff]/50 group-hover/item:bg-[#ff00ff]/10 group-hover/item:shadow-[0_0_15px_rgba(255,0,255,0.2)] transition-all">
                      <Icon className="w-5 h-5 text-gray-400 group-hover/item:text-[#ff00ff] transition-colors" />
                    </div>
                    <span className="font-inter text-sm text-gray-300 group-hover/item:text-white transition-colors">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — contacts */}
            <div className="flex flex-col h-full justify-center">
              <p className="font-orbitron font-bold text-sm tracking-widest mb-6 text-gray-400 border-b border-white/10 pb-4">
                CONTACT DIRECTLY
              </p>

              <div className="space-y-4">
                {/* Discord */}
                <a
                  href="https://discord.com/users/prrx2021"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 p-5 rounded-3xl group/link transition-all duration-300 liquid-glass border border-white/10 hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(88,101,242,0.2)]"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#5865F2]/20 border border-[#5865F2]/40 group-hover/link:bg-[#5865F2] transition-colors">
                    <svg className="w-6 h-6 text-[#5865F2] group-hover/link:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-orbitron font-bold text-xs text-gray-400 group-hover/link:text-[#5865F2] transition-colors">DISCORD</p>
                    <p className="font-inter text-base font-bold text-white mt-0.5">prrx2021</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover/link:text-white transition-colors flex-shrink-0" />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/94761386077"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 p-5 rounded-3xl group/link transition-all duration-300 liquid-glass border border-white/10 hover:border-[#25D366]/50 hover:bg-[#25D366]/10 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(37,211,102,0.2)]"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#25D366]/20 border border-[#25D366]/40 group-hover/link:bg-[#25D366] transition-colors">
                    <svg className="w-6 h-6 text-[#25D366] group-hover/link:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M20.463 3.488C18.217 1.24 15.231 0 12.05 0 5.495 0 .16 5.334.157 11.893c0 2.096.547 4.142 1.588 5.946L.057 24l6.304-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.895.002-3.18-1.235-6.165-3.479-8.41zM12.05 21.785h-.004a9.876 9.876 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.861 9.861 0 0 1-1.51-5.27c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.892 6.993c-.003 5.451-4.437 9.896-9.885 9.896zm5.423-7.403c-.297-.149-1.758-.868-2.031-.967-.272-.1-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.1-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.207-.241-.579-.486-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-orbitron font-bold text-xs text-gray-400 group-hover/link:text-[#25D366] transition-colors">WHATSAPP</p>
                    <p className="font-inter text-base font-bold text-white mt-0.5">+94 761 386 077</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover/link:text-white transition-colors flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom copyright */}
        <div className="text-center space-y-2 relative z-10">
          <p className="font-inter text-sm text-gray-400">
            Created By <span className="font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#ff00ff]">Gaara</span>
          </p>
          <p className="font-inter text-xs text-gray-500 uppercase tracking-widest">
            © 2026 All Rights Reserved By PRRX TEAM
          </p>
        </div>

      </div>
    </footer>
  );
}