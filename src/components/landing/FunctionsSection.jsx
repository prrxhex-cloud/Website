import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Check, Minus, Settings, LayoutGrid, SlidersHorizontal, Image as ImageIcon, Lock, Keyboard } from 'lucide-react';
import ScrollReveal from '@/components/effects/ScrollReveal';
import InteractiveCard from '@/components/effects/InteractiveCard';

export default function FunctionsSection() {
  const location = useLocation();
  const [activePanel, setActivePanel] = useState(location.state?.tab || 'internal');
  const [images, setImages] = useState({
    internal: { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' },
    external: { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' }
  });
  const [panelImages, setPanelImages] = useState({ external_image_url: '', internal_image_url: '' });

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
        
        // Fetch main panel images
        const panelSnap = await getDoc(doc(db, 'public_settings', 'panel_images'));
        if (panelSnap.exists()) {
          setPanelImages({
            external_image_url: panelSnap.data().external_image_url || '',
            internal_image_url: panelSnap.data().internal_image_url || ''
          });
        }
      } catch (error) {
        console.error("Error loading panel screenshots:", error);
      }
    };
    fetchImages();
  }, [location.state]);

  const currentImages = images[activePanel];
  const mainPreviewImage = panelImages[`${activePanel}_image_url`];

  const isInternal = activePanel === 'internal';
  const themeColor = isInternal ? '#aa44ff' : '#00d4ff';
  const themeBg = isInternal ? 'rgba(30,0,60,0.4)' : 'rgba(0,15,35,0.8)';
  const themeBorder = isInternal ? 'rgba(170,68,255,0.15)' : 'rgba(0,212,255,0.1)';

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden" style={{ minHeight: '100vh' }}>
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none transition-colors duration-1000" 
           style={{ 
             background: isInternal 
               ? 'radial-gradient(circle at 50% 0%, rgba(170,68,255,0.05) 0%, transparent 70%)' 
               : 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.05) 0%, transparent 70%)' 
           }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Toggle Switch */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-2 p-1.5 rounded-2xl w-fit" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              onClick={() => setActivePanel('external')}
              className="px-6 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all flex items-center gap-2"
              style={{
                background: !isInternal ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,100,200,0.1))' : 'transparent',
                border: !isInternal ? '1px solid rgba(0,212,255,0.5)' : '1px solid transparent',
                color: !isInternal ? '#00d4ff' : 'rgba(180,200,220,0.4)',
                boxShadow: !isInternal ? '0 0 20px rgba(0,212,255,0.2)' : 'none',
              }}>
              <LayoutGrid className="w-4 h-4" />
              External Panel
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-white/10 border border-white/10">BASIC</span>
            </button>
            <button 
              onClick={() => setActivePanel('internal')}
              className="px-6 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all flex items-center gap-2"
              style={{
                background: isInternal ? 'linear-gradient(135deg, rgba(170,68,255,0.2), rgba(100,0,200,0.15))' : 'transparent',
                border: isInternal ? '1px solid rgba(170,68,255,0.5)' : '1px solid transparent',
                color: isInternal ? '#aa44ff' : 'rgba(180,200,220,0.4)',
                boxShadow: isInternal ? '0 0 20px rgba(170,68,255,0.2)' : 'none',
              }}>
              <Settings className="w-4 h-4" />
              Internal Panel
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-white/10 border border-white/10">ADVANCED</span>
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <ScrollReveal variant="fadeUp">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activePanel}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl p-8 sm:p-10 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 backdrop-blur-md"
              style={{ background: themeBg, border: `1px solid ${themeBorder}`, boxShadow: `0 0 40px ${themeBorder}` }}>
              
              <div>
                <h2 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mb-3 flex items-center gap-3">
                  {isInternal ? 'Internal Panel' : 'External Panel'}
                  <span className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold uppercase"
                        style={{ border: `1px solid ${themeColor}50`, color: themeColor, background: `${themeColor}15` }}>
                    {activePanel}
                  </span>
                </h2>
                <p className="font-inter text-muted-foreground text-sm max-w-xl leading-relaxed">
                  {isInternal 
                    ? 'Built from real internal screenshots: Menu, ESP, Colors, Other, Keybinds, and Settings tabs.'
                    : 'Built for speed and reliability: External modules tailored for smooth overlays.'}
                </p>
              </div>

              <div className="flex gap-10">
                <div className="text-center">
                  <p className="font-orbitron font-black text-4xl mb-1" style={{ color: themeColor }}>{isInternal ? '51' : '59'}</p>
                  <p className="font-inter text-[10px] text-muted-foreground tracking-widest uppercase">Features</p>
                </div>
                <div className="text-center">
                  <p className="font-orbitron font-black text-4xl text-white mb-1">6</p>
                  <p className="font-inter text-[10px] text-muted-foreground tracking-widest uppercase">Categories</p>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </ScrollReveal>

        {/* Live Preview & Style Cards */}
        <ScrollReveal variant="fadeUp">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-16">
            
            {/* Left Large Preview (Spans 2 columns) */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={activePanel + '-preview'}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="lg:col-span-2 rounded-2xl overflow-hidden relative group flex flex-col backdrop-blur-md"
                style={{ background: themeBg, border: `1px solid ${themeBorder}` }}
              >
                {/* Mac OS Window Header */}
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="mx-auto text-[10px] text-muted-foreground font-inter flex items-center gap-1.5 bg-black/40 px-6 py-1.5 rounded-md border border-white/5">
                    <Lock className="w-3 h-3 opacity-50" /> {isInternal ? 'int.prrx.local' : 'ext.prrx.local'}
                  </div>
                </div>

                {/* Preview Image (Using main panel image) */}
                <div className="p-1 flex-1 relative bg-black/20">
                  {mainPreviewImage ? (
                    <img src={mainPreviewImage} className="w-full h-full object-cover rounded-xl" alt="Live Preview" />
                  ) : (
                    <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 opacity-20 text-white" />
                    </div>
                  )}
                  <div className="absolute top-6 left-6 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded font-orbitron text-[10px] tracking-widest text-white shadow-xl">
                    LIVE PREVIEW
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pt-12">
                    <p className="font-inter text-[10px] text-muted-foreground tracking-widest uppercase">
                      {isInternal ? 'Internal Panel — live preview' : 'External Panel — live preview'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Right Side Small Cards (2x2 Grid) */}
            <div className="lg:col-span-1 grid grid-cols-2 gap-4">
              <InteractiveCard className="rounded-2xl p-5 flex flex-col justify-center backdrop-blur-md" style={{ background: themeBg, border: `1px solid ${themeBorder}` }}>
                 <LayoutGrid className="w-5 h-5 mb-3 opacity-80" style={{ color: themeColor }} />
                 <h3 className="font-orbitron font-bold text-lg text-white mb-1">Tabbed</h3>
                 <p className="font-inter text-[9px] text-muted-foreground tracking-widest uppercase">Layout Style</p>
              </InteractiveCard>

              <InteractiveCard className="rounded-2xl p-5 flex flex-col justify-center backdrop-blur-md" style={{ background: themeBg, border: `1px solid ${themeBorder}` }}>
                 <SlidersHorizontal className="w-5 h-5 mb-3 opacity-80" style={{ color: themeColor }} />
                 <h3 className="font-orbitron font-bold text-lg text-white mb-1 leading-tight">Toggle +<br/>Slider</h3>
                 <p className="font-inter text-[9px] text-muted-foreground tracking-widest uppercase mt-1">Control Style</p>
              </InteractiveCard>

              <InteractiveCard className="rounded-2xl p-5 flex flex-col justify-center backdrop-blur-md" style={{ background: themeBg, border: `1px solid ${themeBorder}` }}>
                 <Keyboard className="w-5 h-5 mb-3 opacity-80" style={{ color: themeColor }} />
                 <h3 className="font-orbitron font-bold text-lg text-white mb-1">Keybind tab</h3>
                 <p className="font-inter text-[9px] text-muted-foreground tracking-widest uppercase">Hotkey Control</p>
              </InteractiveCard>

              <InteractiveCard className="rounded-2xl p-5 flex flex-col justify-center backdrop-blur-md" style={{ background: themeBg, border: `1px solid ${themeBorder}` }}>
                 <Check className="w-5 h-5 mb-3 opacity-80" style={{ color: themeColor }} />
                 <h3 className="font-orbitron font-bold text-2xl text-white mb-1">{isInternal ? '51' : '59'}</h3>
                 <p className="font-inter text-[9px] text-muted-foreground tracking-widest uppercase">Total Features</p>
              </InteractiveCard>
            </div>
          </div>
        </ScrollReveal>

        {/* Panel Screenshots */}
        <ScrollReveal variant="fadeUp">
          <div className="mb-6 flex items-center gap-2 text-muted-foreground pl-2">
            <ImageIcon className="w-4 h-4 opacity-50" />
            <span className="font-orbitron text-xs tracking-widest font-bold uppercase">PANEL SCREENSHOTS</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activePanel + '-screenshots'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20"
            >
              {[
                { key: 'aimbot', label: 'Aimbot Menu' },
                { key: 'visuals', label: 'Visuals / ESP' },
                { key: 'colors', label: 'Colors' },
                { key: 'misc', label: 'Misc / Other' },
                { key: 'keybinds', label: 'Keybinds' },
                { key: 'settings', label: 'Settings' }
              ].map((cat) => (
                <div key={cat.key} className="rounded-2xl overflow-hidden aspect-[16/10] relative group backdrop-blur-md" style={{ background: themeBg, border: `1px solid ${themeBorder}` }}>
                  {currentImages[cat.key] ? (
                    <img src={currentImages[cat.key]} alt={`${activePanel} ${cat.key}`} className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                      <ImageIcon className="w-6 h-6 mb-2" />
                      <span className="font-inter text-[10px] uppercase tracking-widest">{cat.label}</span>
                    </div>
                  )}
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end p-4">
                    <span className="font-orbitron text-xs font-bold tracking-widest text-white shadow-sm">{cat.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal variant="fadeUp">
          <div className="rounded-3xl p-8 sm:p-10 mb-10 overflow-x-auto backdrop-blur-md" style={{ background: themeBg, border: `1px solid ${themeBorder}` }}>
            
            <div className="mb-8">
              <span className="px-3 py-1.5 rounded-md text-[9px] tracking-widest font-bold bg-white/5 border border-white/10 text-muted-foreground uppercase font-orbitron mb-4 inline-block">
                SIDE-BY-SIDE
              </span>
              <h3 className="font-orbitron font-bold text-2xl text-white tracking-wide">External vs Internal — At a Glance</h3>
            </div>

            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <th className="py-4 font-inter text-xs tracking-widest text-muted-foreground uppercase font-medium">Capability</th>
                  <th className="py-4 font-inter text-xs tracking-widest text-muted-foreground uppercase font-medium text-center">External</th>
                  <th className="py-4 font-inter text-xs tracking-widest text-muted-foreground uppercase font-medium text-center">Internal</th>
                </tr>
              </thead>
              <tbody className="font-inter text-sm text-gray-300 divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Total Features (visible)</td>
                  <td className="py-5 text-center font-orbitron">59</td>
                  <td className="py-5 text-center font-orbitron">51</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Categories (visible)</td>
                  <td className="py-5 text-center font-orbitron">6</td>
                  <td className="py-5 text-center font-orbitron">6</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Aim controls</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors bg-white/5">
                  <td className="py-5 pl-2 font-medium text-white">ESP controls</td>
                  <td className="py-5 text-center text-muted-foreground">Basic</td>
                  <td className="py-5 text-center text-white">Extended</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Color controls</td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Shop module</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Accessibility module</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Keybind controls</td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Settings safety/timer</td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Stream Mode</td>
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