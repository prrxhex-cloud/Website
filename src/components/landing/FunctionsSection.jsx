import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Check, Minus, Settings, LayoutGrid, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import ScrollReveal from '@/components/effects/ScrollReveal';
import InteractiveCard from '@/components/effects/InteractiveCard';

export default function FunctionsSection() {
  const location = useLocation();
  const [activePanel, setActivePanel] = useState(location.state?.tab || 'internal');
  const [images, setImages] = useState({
    internal: { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' },
    external: { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' }
  });

  useEffect(() => {
    if (location.state?.tab) {
      setActivePanel(location.state.tab);
    }
    
    // Fetch screenshots
    const fetchImages = async () => {
      try {
        const snap = await getDoc(doc(db, 'public_settings', 'functions_screenshots'));
        if (snap.exists()) {
          const data = snap.data();
          setImages({
            internal: data.internal_screenshots || { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' },
            external: data.external_screenshots || { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' }
          });
        }
      } catch (error) {
        console.error("Error loading panel screenshots:", error);
      }
    };
    fetchImages();
  }, [location.state]);

  const currentImages = images[activePanel];

  return (
    <section className="py-16 sm:py-24" style={{ background: '#0a0a0a', minHeight: '100vh', backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 1) 0%, rgba(10, 10, 10, 1) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Toggle Switch */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-2 p-1.5 rounded-2xl w-fit" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              onClick={() => setActivePanel('external')}
              className="px-6 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all flex items-center gap-2"
              style={{
                background: activePanel === 'external' ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: activePanel === 'external' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                color: activePanel === 'external' ? '#ffffff' : 'rgba(255,255,255,0.4)',
              }}>
              <LayoutGrid className="w-4 h-4" />
              External Panel
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-white/10 border border-white/20">BASIC</span>
            </button>
            <button 
              onClick={() => setActivePanel('internal')}
              className="px-6 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all flex items-center gap-2"
              style={{
                background: activePanel === 'internal' ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: activePanel === 'internal' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                color: activePanel === 'internal' ? '#ffffff' : 'rgba(255,255,255,0.4)',
              }}>
              <Settings className="w-4 h-4" />
              Internal Panel
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-white/10 border border-white/20">ADVANCED</span>
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <ScrollReveal variant="fadeUp">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activePanel}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl p-8 sm:p-10 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)' }}>
              
              <div>
                <h2 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mb-2 flex items-center gap-3">
                  {activePanel === 'internal' ? 'Internal Panel' : 'External Panel'}
                  <span className="px-2 py-1 rounded-md text-[10px] tracking-widest bg-white/5 border border-white/10 text-muted-foreground uppercase">
                    {activePanel}
                  </span>
                </h2>
                <p className="font-inter text-muted-foreground text-sm max-w-xl leading-relaxed">
                  {activePanel === 'internal' 
                    ? 'Built from real internal screenshots: Menu, ESP, Colors, Other, Keybinds, and Settings tabs.'
                    : 'Built for speed and reliability: External modules tailored for smooth overlays.'}
                </p>
              </div>

              <div className="flex gap-10">
                <div className="text-center">
                  <p className="font-orbitron font-bold text-4xl text-white mb-1">{activePanel === 'internal' ? '51' : '59'}</p>
                  <p className="font-inter text-xs text-muted-foreground tracking-widest uppercase">Features</p>
                </div>
                <div className="text-center">
                  <p className="font-orbitron font-bold text-4xl text-white mb-1">6</p>
                  <p className="font-inter text-xs text-muted-foreground tracking-widest uppercase">Categories</p>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </ScrollReveal>

        {/* Style Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <InteractiveCard className="md:col-span-1 rounded-2xl p-6 flex flex-col justify-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
             <LayoutGrid className="w-6 h-6 text-white mb-4 opacity-50" />
             <h3 className="font-orbitron font-bold text-xl text-white mb-1">Tabbed</h3>
             <p className="font-inter text-xs text-muted-foreground tracking-widest uppercase">Layout Style</p>
          </InteractiveCard>
          <InteractiveCard className="md:col-span-1 rounded-2xl p-6 flex flex-col justify-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
             <SlidersHorizontal className="w-6 h-6 text-white mb-4 opacity-50" />
             <h3 className="font-orbitron font-bold text-xl text-white mb-1">Toggle + Slider</h3>
             <p className="font-inter text-xs text-muted-foreground tracking-widest uppercase">Control Style</p>
          </InteractiveCard>
          <InteractiveCard className="md:col-span-1 rounded-2xl p-6 flex flex-col justify-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
             <Check className="w-6 h-6 text-white mb-4 opacity-50" />
             <h3 className="font-orbitron font-bold text-xl text-white mb-1">{activePanel === 'internal' ? '51' : '59'}</h3>
             <p className="font-inter text-xs text-muted-foreground tracking-widest uppercase">Total Features</p>
          </InteractiveCard>
        </div>

        {/* Panel Screenshots */}
        <ScrollReveal variant="fadeUp">
          <div className="mb-6 flex items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
            <span className="font-orbitron text-xs tracking-widest font-bold uppercase">PANEL SCREENSHOTS</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activePanel}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
            >
              {['aimbot', 'visuals', 'colors', 'misc', 'keybinds', 'settings'].map((cat, idx) => (
                <div key={cat} className="rounded-2xl overflow-hidden aspect-[4/3] relative group" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {currentImages[cat] ? (
                    <img src={currentImages[cat]} alt={`${activePanel} ${cat}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="font-inter text-xs uppercase tracking-widest">{cat} Preview</span>
                    </div>
                  )}
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal variant="fadeUp">
          <div className="rounded-3xl p-8 sm:p-10 mb-10 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            
            <div className="mb-8">
              <span className="px-3 py-1.5 rounded-md text-[10px] tracking-widest bg-white/5 border border-white/10 text-muted-foreground uppercase font-orbitron mb-4 inline-block">
                SIDE-BY-SIDE
              </span>
              <h3 className="font-orbitron font-bold text-2xl text-white">External vs Internal — At a Glance</h3>
            </div>

            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <th className="py-4 font-inter text-xs tracking-widest text-muted-foreground uppercase font-medium">Capability</th>
                  <th className="py-4 font-inter text-xs tracking-widest text-muted-foreground uppercase font-medium text-center">External</th>
                  <th className="py-4 font-inter text-xs tracking-widest text-muted-foreground uppercase font-medium text-center">Internal</th>
                </tr>
              </thead>
              <tbody className="font-inter text-sm text-gray-300 divide-y divide-white/5">
                <tr>
                  <td className="py-5">Total Features (visible)</td>
                  <td className="py-5 text-center">59</td>
                  <td className="py-5 text-center">51</td>
                </tr>
                <tr>
                  <td className="py-5">Categories (visible)</td>
                  <td className="py-5 text-center">6</td>
                  <td className="py-5 text-center">6</td>
                </tr>
                <tr>
                  <td className="py-5">Aim controls</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                </tr>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <td className="py-5 px-3">ESP controls</td>
                  <td className="py-5 text-center">Basic</td>
                  <td className="py-5 text-center">Extended</td>
                </tr>
                <tr>
                  <td className="py-5">Color controls</td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                </tr>
                <tr>
                  <td className="py-5">Shop module</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                </tr>
                <tr>
                  <td className="py-5">Accessibility module</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                </tr>
                <tr>
                  <td className="py-5">Keybind controls</td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                </tr>
                <tr>
                  <td className="py-5">Settings safety/timer</td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                </tr>
                <tr>
                  <td className="py-5">Stream Mode</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}