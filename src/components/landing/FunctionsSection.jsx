import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Check, Minus, Settings, LayoutGrid, SlidersHorizontal, Image as ImageIcon, Lock, Keyboard } from 'lucide-react';
import ScrollReveal from '@/components/effects/ScrollReveal';

export default function FunctionsSection() {
  const location = useLocation();
  const [activePanel, setActivePanel] = useState(location.state?.tab || 'internal');
  const [images, setImages] = useState(() => {
    const cached = localStorage.getItem('prrx_functions_screenshots');
    return cached ? JSON.parse(cached) : {
      internal: { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' },
      external: { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' }
    };
  });
  const [panelImages, setPanelImages] = useState(() => {
    const cached = localStorage.getItem('prrx_panel_images');
    return cached ? JSON.parse(cached) : { external_image_url: '', internal_image_url: '' };
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
          const newImages = {
            internal: data.internal_screenshots || { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' },
            external: data.external_screenshots || { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' }
          };
          setImages(newImages);
          localStorage.setItem('prrx_functions_screenshots', JSON.stringify(newImages));
        }
        
        // Fetch main panel images
        const panelSnap = await getDoc(doc(db, 'public_settings', 'panel_images'));
        if (panelSnap.exists()) {
          const newPanelImages = {
            external_image_url: panelSnap.data().external_image_url || '',
            internal_image_url: panelSnap.data().internal_image_url || ''
          };
          setPanelImages(newPanelImages);
          localStorage.setItem('prrx_panel_images', JSON.stringify(newPanelImages));
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
  const themeColor = isInternal ? '#ff00ff' : '#00d4ff';

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden liquid-bg" style={{ minHeight: '100vh' }}>
      
      {/* Dynamic Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[#ff00ff] liquid-blob mix-blend-screen opacity-20" style={{ animationDelay: '-2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Toggle Switch */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-2 p-1.5 rounded-[40px] liquid-glass w-fit">
            <button 
              onClick={() => setActivePanel('external')}
              className="px-6 py-3 rounded-full font-orbitron font-bold text-xs tracking-wider transition-all flex items-center gap-2"
              style={{
                background: !isInternal ? 'linear-gradient(135deg, rgba(0,212,255,0.4), rgba(0,100,200,0.2))' : 'transparent',
                color: !isInternal ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: !isInternal ? '0 0 20px rgba(0,212,255,0.4)' : 'none',
              }}>
              <LayoutGrid className="w-4 h-4" />
              External Panel
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-white/20">BASIC</span>
            </button>
            <button 
              onClick={() => setActivePanel('internal')}
              className="px-6 py-3 rounded-full font-orbitron font-bold text-xs tracking-wider transition-all flex items-center gap-2"
              style={{
                background: isInternal ? 'linear-gradient(135deg, rgba(255,0,255,0.4), rgba(100,0,200,0.2))' : 'transparent',
                color: isInternal ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: isInternal ? '0 0 20px rgba(255,0,255,0.4)' : 'none',
              }}>
              <Settings className="w-4 h-4" />
              Internal Panel
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-white/20">ADVANCED</span>
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <ScrollReveal variant="fadeUp">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activePanel}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="liquid-glass p-8 sm:p-10 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
              style={{ border: `1px solid ${themeColor}50`, boxShadow: `0 0 40px ${themeColor}30` }}>
              
              <div>
                <h2 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mb-3 flex items-center gap-3">
                  {isInternal ? 'Internal Panel' : 'External Panel'}
                  <span className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold uppercase"
                        style={{ background: `linear-gradient(90deg, ${themeColor}40, transparent)`, color: themeColor }}>
                    {activePanel}
                  </span>
                </h2>
                <p className="font-inter text-gray-300 text-sm max-w-xl leading-relaxed">
                  {isInternal 
                    ? 'Built from real internal screenshots: Menu, ESP, Colors, Other, Keybinds, and Settings tabs.'
                    : 'Built for speed and reliability: External modules tailored for smooth overlays.'}
                </p>
              </div>

              <div className="flex gap-10">
                <div className="text-center">
                  <p className="font-orbitron font-black text-4xl mb-1 glow-cyan" style={{ color: themeColor }}>{isInternal ? '51' : '59'}</p>
                  <p className="font-inter text-[10px] text-gray-400 tracking-widest uppercase">Features</p>
                </div>
                <div className="text-center">
                  <p className="font-orbitron font-black text-4xl text-white mb-1">6</p>
                  <p className="font-inter text-[10px] text-gray-400 tracking-widest uppercase">Categories</p>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </ScrollReveal>

        {/* Live Preview & Style Cards */}
        <ScrollReveal variant="fadeUp">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            
            {/* Left Large Preview */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={activePanel + '-preview'}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="lg:col-span-2 liquid-glass overflow-hidden relative flex flex-col p-2"
                style={{ border: `1px solid ${themeColor}40` }}
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
              <InteractiveCard className="rounded-[30px] p-5 flex flex-col justify-center liquid-glass" style={{ border: `1px solid ${themeColor}40` }}>
                 <LayoutGrid className="w-5 h-5 mb-3 opacity-80" style={{ color: themeColor }} />
                 <h3 className="font-orbitron font-bold text-lg text-white mb-1">Tabbed</h3>
                 <p className="font-inter text-[9px] text-gray-400 tracking-widest uppercase">Layout Style</p>
              </InteractiveCard>

              <InteractiveCard className="rounded-[30px] p-5 flex flex-col justify-center liquid-glass" style={{ border: `1px solid ${themeColor}40` }}>
                 <SlidersHorizontal className="w-5 h-5 mb-3 opacity-80" style={{ color: themeColor }} />
                 <h3 className="font-orbitron font-bold text-lg text-white mb-1 leading-tight">Toggle +<br/>Slider</h3>
                 <p className="font-inter text-[9px] text-gray-400 tracking-widest uppercase mt-1">Control Style</p>
              </InteractiveCard>

              <InteractiveCard className="rounded-[30px] p-5 flex flex-col justify-center liquid-glass" style={{ border: `1px solid ${themeColor}40` }}>
                 <Keyboard className="w-5 h-5 mb-3 opacity-80" style={{ color: themeColor }} />
                 <h3 className="font-orbitron font-bold text-lg text-white mb-1">Keybind tab</h3>
                 <p className="font-inter text-[9px] text-gray-400 tracking-widest uppercase">Hotkey Control</p>
              </InteractiveCard>

              <InteractiveCard className="rounded-[30px] p-5 flex flex-col justify-center liquid-glass" style={{ border: `1px solid ${themeColor}40` }}>
                 <Check className="w-5 h-5 mb-3 opacity-80" style={{ color: themeColor }} />
                 <h3 className="font-orbitron font-bold text-2xl text-white mb-1">{isInternal ? '51' : '59'}</h3>
                 <p className="font-inter text-[9px] text-gray-400 tracking-widest uppercase">Total Features</p>
              </InteractiveCard>
            </div>
          </div>
        </ScrollReveal>

        {/* Panel Screenshots */}
        <ScrollReveal variant="fadeUp">
          <div className="mb-6 flex items-center gap-2 text-gray-400 pl-2">
            <ImageIcon className="w-4 h-4 opacity-50" />
            <span className="font-orbitron text-xs tracking-widest font-bold uppercase">PANEL SCREENSHOTS</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activePanel + '-screenshots'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
            >
              {[
                { key: 'aimbot', label: 'Aimbot Menu' },
                { key: 'visuals', label: 'Visuals / ESP' },
                { key: 'colors', label: 'Colors' },
                { key: 'misc', label: 'Misc / Other' },
                { key: 'keybinds', label: 'Keybinds' },
                { key: 'settings', label: 'Settings' }
              ].map((cat) => (
                <div key={cat.key} className="liquid-card aspect-[16/10] relative group p-1" style={{ border: `1px solid ${themeColor}40` }}>
                  <div className="w-full h-full rounded-[28px] overflow-hidden relative">
                    {currentImages[cat.key] ? (
                      <img src={currentImages[cat.key]} alt={`${activePanel} ${cat.key}`} className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 bg-black/50">
                        <ImageIcon className="w-6 h-6 mb-2 text-white" />
                        <span className="font-inter text-[10px] text-white uppercase tracking-widest">{cat.label}</span>
                      </div>
                    )}
                    {/* Subtle overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end p-6">
                      <span className="font-orbitron text-sm font-bold tracking-widest text-white shadow-sm glow-cyan">{cat.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal variant="fadeUp">
          <div className="liquid-glass p-8 sm:p-10 mb-10 overflow-x-auto" style={{ border: `1px solid ${themeColor}40` }}>
            
            <div className="mb-8">
              <span className="px-3 py-1.5 rounded-full text-[9px] tracking-widest font-bold bg-white/10 text-gray-300 uppercase font-orbitron mb-4 inline-block">
                SIDE-BY-SIDE
              </span>
              <h3 className="font-orbitron font-bold text-2xl text-white tracking-wide">External vs Internal — At a Glance</h3>
            </div>

            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 font-inter text-xs tracking-widest text-gray-400 uppercase font-medium">Capability</th>
                  <th className="py-4 font-inter text-xs tracking-widest text-gray-400 uppercase font-medium text-center">External</th>
                  <th className="py-4 font-inter text-xs tracking-widest text-gray-400 uppercase font-medium text-center">Internal</th>
                </tr>
              </thead>
              <tbody className="font-inter text-sm text-gray-300 divide-y divide-white/10">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Total Features (visible)</td>
                  <td className="py-5 text-center font-orbitron text-white">59</td>
                  <td className="py-5 text-center font-orbitron text-white">51</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Categories (visible)</td>
                  <td className="py-5 text-center font-orbitron text-white">6</td>
                  <td className="py-5 text-center font-orbitron text-white">6</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Aim controls</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70 text-[#00d4ff]" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70 text-[#ff00ff]" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors bg-white/5">
                  <td className="py-5 pl-2 font-medium text-white glow-cyan">ESP controls</td>
                  <td className="py-5 text-center text-gray-400">Basic</td>
                  <td className="py-5 text-center text-white font-bold">Extended</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Color controls</td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70 text-[#ff00ff]" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Shop module</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70 text-[#00d4ff]" /></td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Accessibility module</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70 text-[#00d4ff]" /></td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Keybind controls</td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70 text-[#ff00ff]" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Settings safety/timer</td>
                  <td className="py-5 text-center"><Minus className="w-4 h-4 mx-auto opacity-30" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70 text-[#ff00ff]" /></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-5 pl-2">Stream Mode</td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70 text-[#00d4ff]" /></td>
                  <td className="py-5 text-center"><Check className="w-4 h-4 mx-auto opacity-70 text-[#ff00ff]" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}