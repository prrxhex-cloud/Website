import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Shield, Server, Crown, MessageCircle, Phone, ExternalLink } from 'lucide-react';
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
    <footer className="relative border-t" style={{ borderColor: 'rgba(0,212,255,0.1)', background: 'rgba(0,4,14,0.95)' }}>
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14">

        {/* Brand */}
        <div className="text-center mb-10">
          <img src={logoImg} alt="PRRX Logo" className="w-16 h-16 mx-auto mb-2 object-contain" />
          <p className="font-inter text-xs text-muted-foreground mt-1 tracking-widest uppercase">Free Fire Premium Panel</p>
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap justify-center gap-5 mb-12">
          {['Licence Log', 'User Log', 'Web', "What's New Update", 'Service Checking', 'Report PRRXApp'].map((link) => (
            <button key={link} className="font-inter text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide">
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
          className="rounded-3xl overflow-hidden mb-10"
          style={{
            background: 'rgba(0,8,28,0.7)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(0,212,255,0.12)',
            boxShadow: '0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03), 0 0 60px rgba(0,212,255,0.04)',
          }}>

          {/* Card header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'rgba(0,212,255,0.08)', background: 'rgba(0,212,255,0.04)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }} />
              <span className="font-orbitron font-bold text-xs tracking-widest" style={{ color: '#00d4ff' }}>DEVELOPER PROFILE</span>
            </div>
            <span className="font-orbitron text-xs text-muted-foreground">PRRX TEAM</span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">

            {/* Left — identity */}
            <div>
              {/* Avatar / name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-orbitron font-black text-2xl flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,80,160,0.2))',
                    border: '1px solid rgba(0,212,255,0.35)',
                    color: '#00d4ff',
                    boxShadow: '0 0 24px rgba(0,212,255,0.2)',
                  }}>
                  G
                </div>
                <div>
                  <h3 className="font-orbitron font-black text-lg tracking-widest" style={{ color: '#00d4ff', textShadow: '0 0 16px rgba(0,212,255,0.5)' }}>
                    GAARA
                  </h3>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5">Created By Gaara · PRRX Team</p>
                </div>
              </div>

              {/* Roles */}
              <div className="space-y-2.5">
                {devRoles.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: '#00d4ff' }} />
                    </div>
                    <span className="font-inter text-sm" style={{ color: 'rgba(180,210,230,0.85)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — contacts */}
            <div>
              <p className="font-orbitron font-bold text-xs tracking-widest mb-5"
                style={{ color: 'rgba(0,212,255,0.6)', borderBottom: '1px solid rgba(0,212,255,0.08)', paddingBottom: '12px' }}>
                CONTACTS
              </p>

              <div className="space-y-4">
                {/* Discord */}
                <a
                  href="https://discord.com/users/prrx2021"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl group transition-all duration-200"
                  style={{
                    background: 'rgba(88,101,242,0.08)',
                    border: '1px solid rgba(88,101,242,0.2)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(88,101,242,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(88,101,242,0.2)'}
                >
                  {/* Discord SVG icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.3)' }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="#5865F2"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-orbitron font-bold text-xs" style={{ color: '#5865f2' }}>DISCORD</p>
                    <p className="font-inter text-sm font-medium mt-0.5" style={{ color: 'rgba(180,200,230,0.9)' }}>prrx2021</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/94761386077"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl group transition-all duration-200"
                  style={{
                    background: 'rgba(37,211,102,0.07)',
                    border: '1px solid rgba(37,211,102,0.2)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(37,211,102,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(37,211,102,0.2)'}
                >
                  {/* WhatsApp SVG icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)' }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M20.463 3.488C18.217 1.24 15.231 0 12.05 0 5.495 0 .16 5.334.157 11.893c0 2.096.547 4.142 1.588 5.946L.057 24l6.304-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.895.002-3.18-1.235-6.165-3.479-8.41zM12.05 21.785h-.004a9.876 9.876 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.861 9.861 0 0 1-1.51-5.27c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.892 6.993c-.003 5.451-4.437 9.896-9.885 9.896zm5.423-7.403c-.297-.149-1.758-.868-2.031-.967-.272-.1-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.1-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.207-.241-.579-.486-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-orbitron font-bold text-xs" style={{ color: '#25d366' }}>WHATSAPP</p>
                    <p className="font-inter text-sm font-medium mt-0.5" style={{ color: 'rgba(180,200,230,0.9)' }}>+94 761 386 077</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom copyright */}
        <div className="text-center space-y-1.5">
          <p className="font-inter text-xs text-muted-foreground">
            Created By <span className="font-orbitron font-bold" style={{ color: '#00d4ff' }}>Gaara</span>
          </p>
          <p className="font-inter text-xs text-muted-foreground">
            © 2026 All Rights Reserved By <span className="font-orbitron font-bold" style={{ color: '#00d4ff' }}>PRRX TEAM</span>
          </p>
        </div>

      </div>
    </footer>
  );
}