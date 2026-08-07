import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Shield, LayoutGrid, Monitor } from 'lucide-react';

export default function DeepDiveSection() {
  // Use localStorage caching to fix slower image loading
  const [panelImages, setPanelImages] = useState(() => {
    const cached = localStorage.getItem('prrx_panel_images');
    return cached ? JSON.parse(cached) : { external_image_url: '', internal_image_url: '' };
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
          setPanelImages(newImages);
          localStorage.setItem('prrx_panel_images', JSON.stringify(newImages));
        }
      } catch (error) {
        console.error("Error loading panel images for Deep Dive:", error);
      }
    };
    fetchImages();
  }, []);

  return (
    <section className="py-24 relative overflow-hidden liquid-bg border-t border-white/5">
      {/* Background Blobs */}
      <div className="absolute top-10 right-10 w-[20vw] h-[20vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-1/2 left-10 w-[30vw] h-[30vw] bg-[#ff00ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none" style={{ animationDelay: '-4s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Inside the Engine */}
        <div className="mb-32">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-16 relative">
              <span className="px-4 py-1.5 rounded-full text-[10px] tracking-widest font-bold bg-white/10 border border-white/20 text-white uppercase font-orbitron mb-6 inline-block shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                DEEP DIVE
              </span>
              <h2 className="font-orbitron font-bold text-4xl sm:text-6xl text-white tracking-wider glow-cyan mb-2">Inside the Engine</h2>
              <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] opacity-50" />
            </div>
          </ScrollReveal>

          {/* External Bypass Row */}
          <ScrollReveal variant="fadeLeft">
            <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
              <div className="lg:w-1/2 liquid-glass p-8 sm:p-10 rounded-[40px] border border-[#00d4ff]/30 shadow-[0_0_30px_rgba(0,212,255,0.1)]">
                <h3 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mb-6">External <span className="text-[#00d4ff]">Bypass</span></h3>
                <p className="font-inter text-gray-300 text-sm leading-relaxed mb-8">
                  Runs inside an isolated overlay space. It operates separately from your system processes,
                  achieving safety by never modifying protected game memory.
                </p>
                <ul className="space-y-5">
                  {[
                    'Zero memory injection footprint',
                    'Kernel-level overlay protection check',
                    'Customized system registry mapping',
                    'Bypass client validation engines'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                       <div className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_12px_#00d4ff]" />
                       <span className="font-inter text-sm text-gray-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="rounded-[30px] overflow-hidden relative shadow-[0_0_50px_rgba(0,212,255,0.2)] group" style={{ background: 'rgba(0,15,35,0.6)', border: '1px solid rgba(0,212,255,0.3)' }}>
                  <div className="px-5 py-4 flex items-center gap-2 border-b border-white/10 bg-black/60 backdrop-blur-md">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-auto text-[10px] font-inter uppercase tracking-widest text-[#00d4ff] font-bold">EXT.PRRX.LOCAL</span>
                  </div>
                  <div className="p-1">
                    {panelImages.external_image_url ? (
                      <img src={panelImages.external_image_url} alt="External Panel" className="w-full h-auto rounded-b-[26px] group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full aspect-[16/9] flex items-center justify-center bg-black/50">
                        <span className="text-muted-foreground text-xs font-inter uppercase tracking-widest">Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Internal Injection Row */}
          <ScrollReveal variant="fadeRight">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 w-full">
                <div className="rounded-[30px] overflow-hidden relative shadow-[0_0_50px_rgba(255,0,255,0.2)] group" style={{ background: 'rgba(30,0,60,0.4)', border: '1px solid rgba(170,68,255,0.3)' }}>
                  <div className="px-5 py-4 flex items-center gap-2 border-b border-white/10 bg-black/60 backdrop-blur-md">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-auto text-[10px] font-inter uppercase tracking-widest text-[#ff00ff] font-bold">INT.PRRX.LOCAL</span>
                  </div>
                  <div className="p-1">
                    {panelImages.internal_image_url ? (
                      <img src={panelImages.internal_image_url} alt="Internal Panel" className="w-full h-auto rounded-b-[26px] group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full aspect-[16/9] flex items-center justify-center bg-black/50">
                        <span className="text-muted-foreground text-xs font-inter uppercase tracking-widest">Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 liquid-glass p-8 sm:p-10 rounded-[40px] border border-[#ff00ff]/30 shadow-[0_0_30px_rgba(255,0,255,0.1)]">
                <h3 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mb-6">Internal <span className="text-[#ff00ff]" style={{ textShadow: '0 0 20px rgba(255,0,255,0.5)' }}>Injection</span></h3>
                <p className="font-inter text-gray-300 text-sm leading-relaxed mb-8">
                  Direct dynamic memory mapping gives you maximum speed. It integrates cleanly with the rendering pipeline, yielding predictive ESP boxes and instantaneous target acquisition.
                </p>
                <ul className="space-y-5">
                  {[
                    'VMT hooking technology',
                    'Real-time visual outline rendering',
                    'Ultra-fast prediction vector engines',
                    '0ms action delay metrics'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                       <div className="w-2 h-2 rounded-full bg-[#ff00ff] shadow-[0_0_12px_#ff00ff]" />
                       <span className="font-inter text-sm text-gray-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Engineered Stack */}
        <div className="mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] bg-gradient-to-r from-transparent via-[#00d4ff]/10 to-transparent blur-[100px] pointer-events-none" />
          
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-16 relative">
              <span className="px-4 py-1.5 rounded-full text-[10px] tracking-widest font-bold bg-white/10 border border-white/20 text-white uppercase font-orbitron mb-6 inline-block shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                TECHNOLOGY
              </span>
              <h2 className="font-orbitron font-bold text-3xl sm:text-5xl text-white tracking-wider glow-cyan">Engineered Stack</h2>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-5xl mx-auto relative z-10">
               {[
                 { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E', color: 'rgba(247,223,30,0.5)' },
                 { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript/3178C6', color: 'rgba(49,120,198,0.5)' },
                 { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB', color: 'rgba(97,218,251,0.5)' },
                 { name: 'Next.js', icon: 'https://cdn.simpleicons.org/nextdotjs/ffffff', color: 'rgba(255,255,255,0.3)' },
                 { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933', color: 'rgba(51,153,51,0.5)' },
                 { name: 'Python', icon: 'https://cdn.simpleicons.org/python/3776AB', color: 'rgba(55,118,171,0.5)' },
                 { name: 'C#', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg', color: 'rgba(104,33,122,0.5)' },
                 { name: 'C++', icon: 'https://cdn.simpleicons.org/cplusplus/00599c', color: 'rgba(0,89,156,0.5)' },
                 { name: 'HTML5', icon: 'https://cdn.simpleicons.org/html5/E34F26', color: 'rgba(227,79,38,0.5)' },
                 { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg', color: 'rgba(21,114,182,0.5)' }
               ].map((tech) => (
                 <div key={tech.name} className="flex flex-col items-center justify-center p-4 rounded-3xl w-28 h-32 liquid-glass border hover:-translate-y-2 hover:bg-white/10 transition-all duration-300 group" style={{ borderColor: tech.color }}>
                    <img src={tech.icon} alt={tech.name} className="w-10 h-10 mb-4 object-contain group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                    <span className="text-[10px] uppercase tracking-widest text-white font-inter font-bold">{tech.name}</span>
                 </div>
               ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Supported Platforms */}
        <div>
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-16 relative">
              <span className="px-4 py-1.5 rounded-full text-[10px] tracking-widest font-bold bg-white/10 border border-white/20 text-white uppercase font-orbitron mb-6 inline-block shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                COMPATIBILITY
              </span>
              <h2 className="font-orbitron font-bold text-3xl sm:text-5xl text-white tracking-wider mb-4 glow-cyan">Supported Platforms</h2>
              <p className="font-inter text-gray-300 text-sm max-w-2xl mx-auto">Full support for popular Android emulators and Windows 10/11 x64 systems.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
               {[
                 { 
                   name: 'BlueStacks 5', 
                   sub: 'Pie 64-bit / Nougat 32 & 64-bit', 
                   icon: "https://www.google.com/s2/favicons?domain=bluestacks.com&sz=128",
                   accent: "#ff3366"
                 },
                 { 
                   name: 'MSI App Player', 
                   sub: 'High FPS & Low Latency', 
                   icon: "https://www.google.com/s2/favicons?domain=msi.com&sz=128",
                   accent: "#ff0000"
                 },
                 { 
                   name: 'Windows 10 / 11', 
                   sub: 'Full 64-bit Kernel Support', 
                   icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/windows8/windows8-original.svg",
                   accent: "#00a4ef"
                 }
               ].map((plat) => (
                 <div key={plat.name} className="p-6 rounded-[30px] flex items-center gap-5 liquid-glass hover:-translate-y-2 hover:bg-white/10 transition-all duration-300 group overflow-hidden relative" style={{ border: `1px solid ${plat.accent}40` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: plat.accent }} />
                    <img src={plat.icon} alt={plat.name} className="w-14 h-14 shrink-0 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-md relative z-10" />
                    <div className="relative z-10">
                      <h4 className="text-white font-bold font-inter text-lg mb-1">{plat.name}</h4>
                      <p className="text-xs text-gray-300 font-inter tracking-wide">{plat.sub}</p>
                    </div>
                 </div>
               ))}
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
