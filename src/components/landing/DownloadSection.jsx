import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Download, Shield, Zap, Star, CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const FALLBACK_EXTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';
const FALLBACK_INTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';

const features = [
  'Silent Aim + Aimbot Range',
  'Teleport V2 + Fly Hack',
  'Auto Spawn Kill',
  'ESP Menu + Speed Hack',
  'Version Hack Included',
  '3 Min Timer System',
];

export default function DownloadSection() {
  const [externalUrl, setExternalUrl] = useState(FALLBACK_EXTERNAL);
  const [internalUrl, setInternalUrl] = useState(FALLBACK_INTERNAL);
  const [externalLabel, setExternalLabel] = useState('⚡ EXTERNAL PANEL');
  const [internalLabel, setInternalLabel] = useState('🔥 INTERNAL PANEL');

  useEffect(() => {
    getDocs(query(collection(db, 'download_links'), where('active', '==', true))).then(snapshot => {
      const links = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const ext = links.find(l => l.type === 'external');
      const int_ = links.find(l => l.type === 'internal');
      if (ext) { setExternalUrl(ext.url); if (ext.label) setExternalLabel(ext.label); }
      if (int_) { setInternalUrl(int_.url); if (int_.label) setInternalLabel(int_.label); }
    }).catch(() => {});
  }, []);

  return (
    <section id="download" className="relative py-28 sm:py-36 overflow-hidden liquid-bg border-t border-white/5">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[#ff00ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none" style={{ animationDelay: '-2s' }}></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-8 z-10">
        <ScrollReveal variant="zoomIn" className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-inter font-bold tracking-widest liquid-glass border border-white/10 shadow-[0_0_20px_rgba(170,68,255,0.2)]">
            <Star className="w-4 h-4 text-[#ff00ff] animate-pulse" /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#ff00ff]">PREMIUM RELEASE — BETA X V7A</span>
          </div>
          <h2 className="font-orbitron font-black text-5xl sm:text-6xl lg:text-7xl text-white mb-6 tracking-widest glow-cyan">
            GET <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#00d4ff] to-[#ff00ff]">PRRX</span>
          </h2>
          <p className="font-inter text-gray-300 max-w-xl mx-auto text-lg">
            Download PRRX HEX Premium now. #1 External panel, full feature suite. Join thousands of elite players.
          </p>
        </ScrollReveal>

        {/* Main download card */}
        <ScrollReveal variant="fadeUp" delay={0.15} className="mb-12 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/20 to-[#ff00ff]/20 rounded-[40px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="liquid-glass rounded-[40px] p-8 sm:p-12 relative border border-white/10 z-10">
            <div className="grid sm:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-[20px] flex items-center justify-center liquid-glass border border-[#00d4ff]/40 shadow-[0_0_20px_rgba(0,212,255,0.2)] group-hover:scale-110 transition-transform duration-500">
                    <Download className="w-8 h-8 text-[#00d4ff]" />
                  </div>
                  <div>
                    <p className="font-orbitron font-black text-2xl text-white mb-1">PRRX HEX</p>
                    <p className="font-inter text-sm text-[#00d4ff] tracking-wide">Beta X V7A · Free Fire External</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  {features.map((f, i) => (
                    <div key={f} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors" style={{ animationDelay: `${i * 100}ms` }}>
                      <CheckCircle className="w-5 h-5 text-[#ff00ff] flex-shrink-0 drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]" />
                      <span className="font-inter text-sm text-gray-200">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {['Android', 'Free Fire', 'Auto-Update'].map(tag => (
                    <span key={tag} className="font-inter text-xs px-4 py-1.5 rounded-full font-bold tracking-wider"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', textShadow: '0 0 10px rgba(0,212,255,0.5)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-6">
                <motion.a
                  href={externalUrl}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full font-orbitron font-bold text-lg tracking-widest py-6 rounded-[24px] text-white flex items-center justify-center gap-4 relative overflow-hidden group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff] to-[#0070aa] opacity-80 group-hover/btn:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                  <div className="absolute inset-0 shadow-[0_0_50px_rgba(0,212,255,0.6)_inset] rounded-[24px]"></div>
                  <Download className="w-6 h-6 relative z-10 drop-shadow-md" /> 
                  <span className="relative z-10 drop-shadow-md">{externalLabel}</span>
                </motion.a>
                <motion.a
                  href={internalUrl}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,0,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full font-orbitron font-bold text-sm tracking-widest py-5 rounded-[20px] liquid-glass text-center transition-all border border-[#ff00ff]/30 text-[#ff00ff] hover:text-white hover:border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.1)_inset]"
                >
                  {internalLabel}
                </motion.a>
                <div className="flex items-center gap-4 mt-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
                    <span className="font-inter text-xs text-gray-300 uppercase tracking-widest">Undetected</span>
                  </div>
                  <div className="w-px h-4 bg-white/20"></div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
                    <span className="font-inter text-xs text-gray-300 uppercase tracking-widest">Instant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { val: '12K+', label: 'Elite Players', color: '#00d4ff' },
            { val: 'V7A', label: 'Latest Version', color: '#ff00ff' },
            { val: '99.9%', label: 'Uptime', color: '#00d4ff' },
          ].map((s, i) => (
            <ScrollReveal key={s.label} variant="fadeUp" delay={i * 0.1 + 0.3}
              className="liquid-glass rounded-[24px] p-6 text-center border border-white/10 hover:-translate-y-2 transition-transform duration-300 group">
              <p className="font-orbitron font-black text-3xl sm:text-4xl mb-2 transition-transform group-hover:scale-110" style={{ color: s.color, textShadow: `0 0 20px ${s.color}60` }}>{s.val}</p>
              <p className="font-inter text-[11px] uppercase tracking-widest text-gray-400 font-bold">{s.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}