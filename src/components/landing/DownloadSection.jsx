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
    <section id="download" className="relative py-28 sm:py-36 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,80,120,0.25) 0%, transparent 70%)'
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(170,68,255,1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-8">
        <ScrollReveal variant="zoomIn" className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-inter font-bold tracking-widest"
            style={{ background: 'rgba(170,68,255,0.1)', border: '1px solid rgba(170,68,255,0.3)', color: '#aa44ff' }}>
            <Star className="w-3 h-3" /> PREMIUM RELEASE — BETA X V7A
          </div>
          <h2 className="font-orbitron font-black text-4xl sm:text-5xl lg:text-6xl text-foreground mb-4 tracking-widest glow-cyan">
            GET <span style={{ color: '#00d4ff' }}>PRRX</span>
          </h2>
          <p className="font-inter text-muted-foreground max-w-lg mx-auto">
            Download PRRX HEX Premium now. #1 External panel, full feature suite. Join thousands of elite players.
          </p>
        </ScrollReveal>

        {/* Main download card */}
        <ScrollReveal variant="fadeUp" delay={0.15} className="mb-8">
          <div className="glass rounded-3xl p-8 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-orbitron font-black text-lg text-foreground">PRRX HEX</p>
                    <p className="font-inter text-xs text-muted-foreground">Beta X V7A · Free Fire External</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  {features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span className="font-inter text-sm text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Android', 'Free Fire', 'Auto-Update'].map(tag => (
                    <span key={tag} className="font-inter text-xs px-3 py-1 rounded-full"
                      style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <motion.a
                  href={externalUrl}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(0,212,255,0.7)' }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full font-orbitron font-bold text-base tracking-widest py-5 rounded-2xl text-background flex items-center justify-center gap-3 pulse-glow"
                  style={{ background: 'linear-gradient(135deg, #00d4ff, #0070aa)', boxShadow: '0 0 40px rgba(0,212,255,0.35)' }}
                >
                  <Download className="w-5 h-5" /> {externalLabel}
                </motion.a>
                <motion.a
                  href={internalUrl}
                  whileHover={{ scale: 1.03 }}
                  className="w-full font-orbitron font-bold text-sm tracking-widest py-4 rounded-2xl glass text-center transition-all"
                  style={{ color: '#aa44ff', border: '1px solid rgba(170,68,255,0.3)' }}
                >
                  {internalLabel}
                </motion.a>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="font-inter text-xs">Undetected · Safe</span>
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="font-inter text-xs">Instant Download</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { val: '12K+', label: 'Elite Players', color: '#00d4ff' },
            { val: 'V7A', label: 'Latest Version', color: '#aa44ff' },
            { val: '99.9%', label: 'Uptime', color: '#00ff88' },
          ].map((s, i) => (
            <ScrollReveal key={s.label} variant="fadeUp" delay={i * 0.1 + 0.3}
              className="glass-card rounded-2xl p-4 sm:p-6 text-center">
              <p className="font-orbitron font-black text-2xl sm:text-3xl mb-1" style={{ color: s.color }}>{s.val}</p>
              <p className="font-inter text-xs text-muted-foreground">{s.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}