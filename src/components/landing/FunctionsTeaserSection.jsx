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
    <section id="functions" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* EXTERNAL PANEL */}
          <ScrollReveal variant="fadeUp" delay={0}>
            <motion.div 
              className="rounded-3xl p-6 sm:p-10 h-full flex flex-col justify-between overflow-hidden relative group cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(0,25,50,0.9) 0%, rgba(0,10,25,0.95) 100%)',
                border: '1px solid rgba(0,212,255,0.15)',
                boxShadow: '0 0 40px rgba(0,212,255,0.05)'
              }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(0,212,255,0.3)', boxShadow: '0 0 60px rgba(0,212,255,0.15)' }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/functions', { state: { tab: 'external' } })}
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 mb-8">
                <span className="inline-block font-inter text-[10px] sm:text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-4"
                  style={{ border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff', background: 'rgba(0,212,255,0.08)' }}>
                  OFFICIAL — EXTERNAL
                </span>
                <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-foreground mb-3 leading-tight">
                  SAFETY <span style={{ color: '#00d4ff' }}>FIRST</span>
                </h2>
                <p className="font-inter text-muted-foreground text-sm leading-relaxed max-w-sm">
                  Engineered for speed with fast module response and light memory usage. Fully optimized for real-time gameplay.
                </p>
                <button 
                  className="mt-6 px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all hover:brightness-125"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
                >
                  EXPLORE NOW →
                </button>
              </div>

              {/* Dynamic Image */}
              <div className="relative z-10 w-full rounded-xl overflow-hidden mt-auto flex-1" style={{ minHeight: '200px', border: '1px solid rgba(0,212,255,0.1)' }}>
                {images.external_image_url ? (
                  <img src={images.external_image_url} alt="External Panel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-black/50 flex items-center justify-center min-h-[200px]">
                    <span className="font-inter text-xs text-muted-foreground">Image not set</span>
                  </div>
                )}
              </div>
            </motion.div>
          </ScrollReveal>

          {/* INTERNAL PANEL */}
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <motion.div 
              className="rounded-3xl p-6 sm:p-10 h-full flex flex-col justify-between overflow-hidden relative group cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(30,0,60,0.9) 0%, rgba(10,0,25,0.95) 100%)',
                border: '1px solid rgba(170,68,255,0.15)',
                boxShadow: '0 0 40px rgba(170,68,255,0.05)'
              }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(170,68,255,0.3)', boxShadow: '0 0 60px rgba(170,68,255,0.15)' }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/functions', { state: { tab: 'internal' } })}
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#aa44ff]/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 mb-8">
                <span className="inline-block font-inter text-[10px] sm:text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-4"
                  style={{ border: '1px solid rgba(255,68,68,0.5)', color: '#ff4444', background: 'rgba(255,68,68,0.1)' }}>
                  🔥 BETA X V7A — INTERNAL
                </span>
                <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-foreground mb-3 leading-tight">
                  MAXIMUM <span style={{ color: '#aa44ff' }}>POWER</span>
                </h2>
                <p className="font-inter text-muted-foreground text-sm leading-relaxed max-w-sm">
                  Dominate the battlefield. Optimized for maximum performance and security with a full combat suite and movement hacks.
                </p>
                <button 
                  className="mt-6 px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all hover:brightness-125"
                  style={{ background: 'rgba(170,68,255,0.1)', border: '1px solid rgba(170,68,255,0.3)', color: '#aa44ff' }}
                >
                  EXPLORE NOW →
                </button>
              </div>

              {/* Dynamic Image */}
              <div className="relative z-10 w-full rounded-xl overflow-hidden mt-auto flex-1" style={{ minHeight: '200px', border: '1px solid rgba(170,68,255,0.1)' }}>
                {images.internal_image_url ? (
                  <img src={images.internal_image_url} alt="Internal Panel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-black/50 flex items-center justify-center min-h-[200px]">
                    <span className="font-inter text-xs text-muted-foreground">Image not set</span>
                  </div>
                )}
              </div>
            </motion.div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
