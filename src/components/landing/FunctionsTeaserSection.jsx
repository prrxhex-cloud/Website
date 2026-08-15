import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

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
    <section id="functions" className="py-16 sm:py-24 bg-[var(--bg-main)] border-b border-[var(--border-color)] font-inter text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* EXTERNAL PANEL */}
          <ScrollReveal variant="fadeUp" delay={0}>
            <div 
              className="clean-card p-8 sm:p-10 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl h-full flex flex-col justify-between cursor-pointer group hover:border-[#06b6d4] transition-all shadow-md"
              onClick={() => {
                if (window.electronAPI) {
                  navigate('/prices');
                } else {
                  navigate('/functions', { state: { tab: 'external' } });
                }
              }}
            >
              <div className="space-y-4 mb-6 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30 font-outfit">
                  <ShieldCheck className="w-3.5 h-3.5" /> OFFICIAL — EXTERNAL
                </span>
                <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] leading-tight">
                  SAFETY <span className="text-[#06b6d4]">FIRST</span>
                </h2>
                <p className="font-inter text-[var(--text-muted)] text-sm leading-relaxed">
                  Engineered for speed with fast module response and light memory usage. Fully optimized for real-time gameplay.
                </p>
                <div className="pt-2">
                  <button 
                    className="btn-primary-cyan btn-glow px-6 py-2.5 rounded-xl font-inter font-bold text-xs flex items-center gap-2 shadow-sm"
                  >
                    <span>EXPLORE FEATURES</span> <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              <div className="w-full rounded-2xl overflow-hidden bg-slate-950 aspect-[16/9] border border-[var(--border-color)] relative flex items-center justify-center shadow-inner">
                {images.external_image_url ? (
                  <img src={images.external_image_url} alt="External Panel" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-center text-[var(--text-muted)] font-outfit text-xs font-bold">
                    External Panel Overlay Build
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* INTERNAL PANEL */}
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <div 
              className="clean-card p-8 sm:p-10 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl h-full flex flex-col justify-between cursor-pointer group hover:border-violet-500 transition-all shadow-md"
              onClick={() => {
                if (window.electronAPI) {
                  navigate('/prices');
                } else {
                  navigate('/functions', { state: { tab: 'internal' } });
                }
              }}
            >
              <div className="space-y-4 mb-6 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/15 text-violet-400 border border-violet-500/30 font-outfit">
                  <Zap className="w-3.5 h-3.5" /> BETA X V7A — INTERNAL
                </span>
                <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] leading-tight">
                  MAXIMUM <span className="text-violet-400">POWER</span>
                </h2>
                <p className="font-inter text-[var(--text-muted)] text-sm leading-relaxed">
                  Dominate the battlefield. Optimized for maximum performance and security with a full combat suite and movement hacks.
                </p>
                <div className="pt-2">
                  <button 
                    className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-inter font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <span>EXPLORE FEATURES</span> <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              <div className="w-full rounded-2xl overflow-hidden bg-slate-950 aspect-[16/9] border border-[var(--border-color)] relative flex items-center justify-center shadow-inner">
                {images.internal_image_url ? (
                  <img src={images.internal_image_url} alt="Internal Panel" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-center text-[var(--text-muted)] font-outfit text-xs font-bold">
                    Internal Injected APK Build
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
