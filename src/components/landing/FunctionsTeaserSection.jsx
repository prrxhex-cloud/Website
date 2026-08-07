import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ScrollReveal from '@/components/effects/ScrollReveal';

export default function FunctionsTeaserSection() {
  const navigate = useNavigate();
  const [images, setImages] = useState(() => {
    const cached = localStorage.getItem('prrx_panel_images_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch(e) {}
    }
    return { external_image_url: '', internal_image_url: '' };
  });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const snap = await getDoc(doc(db, 'public_settings', 'panel_images'));
        if (snap.exists()) {
          const newImages = {
            external_image_url: snap.data().external_image_url || '',
            internal_image_url: snap.data().internal_image_url || ''
          };
          setImages(newImages);
          localStorage.setItem('prrx_panel_images_cache', JSON.stringify(newImages));
        }
      } catch (e) {
        console.error('Failed to load panel images', e);
      }
    };
    fetchImages();
  }, []);

  return (
    <section id="functions" className="py-16 sm:py-24 relative overflow-hidden liquid-bg">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[25vw] h-[25vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-[#ff00ff] liquid-blob mix-blend-screen opacity-20 pointer-events-none" style={{ animationDelay: '-3s' }}></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10">
        
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* EXTERNAL PANEL */}
          <ScrollReveal variant="fadeUp" delay={0}>
            <motion.div 
              className="liquid-glass rounded-[40px] p-8 sm:p-10 h-full flex flex-col justify-between overflow-hidden relative group cursor-pointer"
              style={{
                border: '1px solid rgba(0,212,255,0.3)',
                boxShadow: '0 0 40px rgba(0,212,255,0.1)'
              }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(0,212,255,0.6)', boxShadow: '0 0 60px rgba(0,212,255,0.2)' }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/functions', { state: { tab: 'external' } })}
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d4ff]/20 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 mb-8">
                <span className="inline-block font-inter text-[10px] sm:text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-6"
                  style={{ border: '1px solid rgba(0,212,255,0.5)', color: '#00d4ff', background: 'rgba(0,212,255,0.1)', boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}>
                  OFFICIAL — EXTERNAL
                </span>
                <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white mb-4 leading-tight">
                  SAFETY <span className="glow-cyan text-[#00d4ff]">FIRST</span>
                </h2>
                <p className="font-inter text-gray-300 text-sm leading-relaxed max-w-sm mb-8">
                  Engineered for speed with fast module response and light memory usage. Fully optimized for real-time gameplay.
                </p>
                <button 
                  className="px-8 py-3 rounded-2xl font-orbitron font-bold text-xs tracking-widest transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,100,200,0.1))', border: '1px solid rgba(0,212,255,0.4)', color: '#fff', boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}
                >
                  EXPLORE NOW →
                </button>
              </div>

              {/* Dynamic Image */}
              <div className="relative z-10 w-full rounded-3xl overflow-hidden mt-auto flex-1 group-hover:shadow-[0_0_40px_rgba(0,212,255,0.3)] transition-shadow duration-500" style={{ minHeight: '220px', border: '1px solid rgba(0,212,255,0.2)' }}>
                {images.external_image_url ? (
                  <img src={images.external_image_url} alt="External Panel" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-black/50 flex items-center justify-center min-h-[220px]">
                    <span className="font-inter text-xs text-gray-500">Image not set</span>
                  </div>
                )}
                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </ScrollReveal>

          {/* INTERNAL PANEL */}
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <motion.div 
              className="liquid-glass rounded-[40px] p-8 sm:p-10 h-full flex flex-col justify-between overflow-hidden relative group cursor-pointer"
              style={{
                border: '1px solid rgba(255,0,255,0.3)',
                boxShadow: '0 0 40px rgba(255,0,255,0.1)'
              }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255,0,255,0.6)', boxShadow: '0 0 60px rgba(255,0,255,0.2)' }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/functions', { state: { tab: 'internal' } })}
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff00ff]/20 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 mb-8">
                <span className="inline-block font-inter text-[10px] sm:text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-6"
                  style={{ border: '1px solid rgba(255,0,255,0.5)', color: '#ff00ff', background: 'rgba(255,0,255,0.1)', boxShadow: '0 0 20px rgba(255,0,255,0.2)' }}>
                  🔥 BETA X V7A — INTERNAL
                </span>
                <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white mb-4 leading-tight">
                  MAXIMUM <span className="text-[#ff00ff]" style={{ textShadow: '0 0 20px rgba(255,0,255,0.5)' }}>POWER</span>
                </h2>
                <p className="font-inter text-gray-300 text-sm leading-relaxed max-w-sm mb-8">
                  Dominate the battlefield. Optimized for maximum performance and security with a full combat suite and movement hacks.
                </p>
                <button 
                  className="px-8 py-3 rounded-2xl font-orbitron font-bold text-xs tracking-widest transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, rgba(255,0,255,0.2), rgba(100,0,200,0.1))', border: '1px solid rgba(255,0,255,0.4)', color: '#fff', boxShadow: '0 0 20px rgba(255,0,255,0.2)' }}
                >
                  EXPLORE NOW →
                </button>
              </div>

              {/* Dynamic Image */}
              <div className="relative z-10 w-full rounded-3xl overflow-hidden mt-auto flex-1 group-hover:shadow-[0_0_40px_rgba(255,0,255,0.3)] transition-shadow duration-500" style={{ minHeight: '220px', border: '1px solid rgba(255,0,255,0.2)' }}>
                {images.internal_image_url ? (
                  <img src={images.internal_image_url} alt="Internal Panel" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-black/50 flex items-center justify-center min-h-[220px]">
                    <span className="font-inter text-xs text-gray-500">Image not set</span>
                  </div>
                )}
                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
