import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Download, Zap, Shield, Cpu } from 'lucide-react';
import HeroParticles from '@/components/effects/HeroParticles';
import DownloadModal from '@/components/landing/DownloadModal';

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showDownload, setShowDownload] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = ((e.clientX - cx) / rect.width) * 14;
    const y = -((e.clientY - cy) / rect.height) * 14;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden liquid-bg">
      <HeroParticles />
      
      {/* Liquid Blobs */}
      <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-[#00d4ff] liquid-blob mix-blend-screen"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-[#ff00ff] liquid-blob mix-blend-screen" style={{ animationDelay: '-4s' }}></div>

      <div className="relative text-center px-4 sm:px-8 max-w-5xl mx-auto pt-24 w-full z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 text-xs font-inter font-bold tracking-widest liquid-glass"
            style={{ color: '#00d4ff' }}
          >
            <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse shadow-[0_0_10px_#00d4ff]" />
            LIQUID ENGINE ACTIVE
          </motion.div>

          <h1 className="font-orbitron font-black text-6xl sm:text-7xl lg:text-9xl tracking-widest mb-4 glow-cyan float">
            PRRX
          </h1>
          <h2 className="font-orbitron font-bold text-xl sm:text-2xl lg:text-3xl mb-4 tracking-wider glow-magenta"
            style={{ color: '#ff00ff' }}>
            Next-Gen Free Fire Panel
          </h2>
          <p className="font-inter text-gray-300 text-sm sm:text-base mb-6 max-w-lg mx-auto">
            Experience the fluidity of our undetected external and internal panels. Maximum performance, zero compromise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <motion.button
              onClick={() => setShowDownload(true)}
              className="font-orbitron font-bold text-sm tracking-widest px-10 py-4 liquid-btn flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> DOWNLOAD NOW
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo('functions')}
              className="font-orbitron font-bold text-sm tracking-widest px-10 py-4 rounded-3xl liquid-glass transition-all hover:bg-white/10"
              style={{ color: '#ff00ff' }}
            >
              VIEW FEATURES
            </motion.button>
          </div>
        </motion.div>

        {/* Tilt card */}
        <div className="tilt-card-wrapper mt-20 max-w-2xl mx-auto perspective-[1200px]">
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            }}
            className="liquid-card tilt-card p-6 sm:p-10"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
              {[
                { icon: Cpu, label: 'External Panel · All FF Versions', val: 'EXTERNAL', color: '#00d4ff' },
                { icon: Shield, label: 'Internal Panel · V7a Apk', val: 'INTERNAL', color: '#ff00ff' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center liquid-glass"
                      style={{ border: `1px solid ${item.color}50` }}>
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <p className="font-orbitron font-black text-lg" style={{ color: item.color }}>{item.val}</p>
                    <p className="font-inter text-xs text-gray-400 text-center">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Server badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex justify-center mt-12 mb-20"
        >
          <div className="liquid-glass rounded-full px-6 py-3 flex items-center gap-3">
            <span className="text-xl">🇸🇬</span>
            <div>
              <p className="font-orbitron font-bold text-xs text-white">Singapore Server</p>
              <p className="font-inter text-[10px] text-[#00d4ff]">Main ID Safe</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse shadow-[0_0_10px_#00d4ff] ml-2" />
          </div>
        </motion.div>
      </div>

      <motion.button
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={() => scrollTo('functions')}
        className="absolute bottom-8 text-[#00d4ff]/60 hover:text-[#00d4ff] transition-colors z-20"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.button>

      <DownloadModal open={showDownload} onClose={() => setShowDownload(false)} />
    </section>
  );
}