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
    <section className="py-24 relative overflow-hidden bg-black/40 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Inside the Engine */}
        <div className="mb-32">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-16">
              <span className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold bg-white/5 border border-white/10 text-muted-foreground uppercase font-orbitron mb-4 inline-block">
                DEEP DIVE
              </span>
              <h2 className="font-orbitron font-bold text-4xl sm:text-5xl text-white tracking-wider">Inside the Engine</h2>
            </div>
          </ScrollReveal>

          {/* External Bypass Row */}
          <ScrollReveal variant="fadeLeft">
            <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
              <div className="lg:w-1/2">
                <h3 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mb-4">External Bypass</h3>
                <p className="font-inter text-muted-foreground text-sm leading-relaxed mb-8">
                  Runs inside an isolated overlay space. It operates separately from your system processes,
                  achieving safety by never modifying protected game memory.
                </p>
                <ul className="space-y-4">
                  {[
                    'Zero memory injection footprint',
                    'Kernel-level overlay protection check',
                    'Customized system registry mapping',
                    'Bypass client validation engines'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]" />
                       <span className="font-inter text-sm text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="rounded-2xl overflow-hidden relative backdrop-blur-md shadow-2xl" style={{ background: 'rgba(0,15,35,0.6)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5 bg-black/40">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="p-1">
                    {panelImages.external_image_url ? (
                      <img src={panelImages.external_image_url} alt="External Panel" className="w-full h-auto rounded-b-xl" />
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
                <div className="rounded-2xl overflow-hidden relative backdrop-blur-md shadow-2xl" style={{ background: 'rgba(30,0,60,0.4)', border: '1px solid rgba(170,68,255,0.15)' }}>
                  <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5 bg-black/40">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="p-1">
                    {panelImages.internal_image_url ? (
                      <img src={panelImages.internal_image_url} alt="Internal Panel" className="w-full h-auto rounded-b-xl" />
                    ) : (
                      <div className="w-full aspect-[16/9] flex items-center justify-center bg-black/50">
                        <span className="text-muted-foreground text-xs font-inter uppercase tracking-widest">Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <h3 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mb-4">Internal Injection</h3>
                <p className="font-inter text-muted-foreground text-sm leading-relaxed mb-8">
                  Direct dynamic memory mapping gives you maximum speed. It integrates cleanly with the rendering pipeline, yielding predictive ESP boxes and instantaneous target acquisition.
                </p>
                <ul className="space-y-4">
                  {[
                    'VMT hooking technology',
                    'Real-time visual outline rendering',
                    'Ultra-fast prediction vector engines',
                    '0ms action delay metrics'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#aa44ff] shadow-[0_0_10px_#aa44ff]" />
                       <span className="font-inter text-sm text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Engineered Stack */}
        <div className="mb-32">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-16">
              <span className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold bg-white/5 border border-white/10 text-muted-foreground uppercase font-orbitron mb-4 inline-block">
                TECHNOLOGY
              </span>
              <h2 className="font-orbitron font-bold text-3xl sm:text-4xl text-white tracking-wider">Engineered Stack</h2>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-5xl mx-auto">
               {[
                 { name: 'JavaScript', short: 'JS', color: '#f7df1e' },
                 { name: 'TypeScript', short: 'TS', color: '#3178c6' },
                 { name: 'React', short: 'Re', color: '#61dafb' },
                 { name: 'Next.js', short: 'N', color: '#ffffff' },
                 { name: 'Node.js', short: 'No', color: '#339933' },
                 { name: 'Python', short: 'Py', color: '#3776ab' },
                 { name: 'C#', short: 'C#', color: '#9b4993' },
                 { name: 'C++', short: 'C++', color: '#00599c' },
                 { name: 'HTML5', short: '5', color: '#e34f26' },
                 { name: 'CSS3', short: '3', color: '#1572b6' }
               ].map((tech) => (
                 <div key={tech.name} className="flex flex-col items-center justify-center p-4 rounded-3xl w-24 h-28 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-lg">
                    <div className="w-12 h-12 mb-3 rounded-xl flex items-center justify-center text-lg font-bold font-orbitron shadow-inner" 
                         style={{ backgroundColor: `${tech.color}15`, color: tech.color, border: `1px solid ${tech.color}30` }}>
                      {tech.short}
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-inter">{tech.name}</span>
                 </div>
               ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Supported Platforms */}
        <div>
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-16">
              <span className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold bg-white/5 border border-white/10 text-muted-foreground uppercase font-orbitron mb-4 inline-block">
                COMPATIBILITY
              </span>
              <h2 className="font-orbitron font-bold text-3xl sm:text-4xl text-white tracking-wider mb-4">Supported Platforms & Emulators</h2>
              <p className="font-inter text-muted-foreground text-sm">Full support for popular Android emulators and Windows 10/11 x64 systems.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
               {[
                 { 
                   name: 'BlueStacks 5', 
                   sub: 'Pie 64-bit / Nougat 32 & 64-bit', 
                   color: '#ffcc00', 
                   icon: (
                     <div className="flex flex-col gap-[2px] transform -skew-y-12 w-6 mx-auto">
                       <div className="w-6 h-1.5 bg-green-500 rounded-sm" />
                       <div className="w-6 h-1.5 bg-yellow-400 rounded-sm" />
                       <div className="w-6 h-1.5 bg-red-500 rounded-sm" />
                       <div className="w-6 h-1.5 bg-blue-500 rounded-sm" />
                     </div>
                   )
                 },
                 { 
                   name: 'MSI App Player', 
                   sub: 'High FPS & Low Latency', 
                   color: '#ff0000', 
                   icon: <Shield className="w-6 h-6 text-red-500" fill="currentColor" />
                 },
                 { 
                   name: 'Windows 10 / 11', 
                   sub: 'Full 64-bit Kernel Support', 
                   color: '#00a4ef', 
                   icon: <LayoutGrid className="w-6 h-6 text-[#00a4ef]" fill="currentColor" />
                 }
               ].map((plat) => (
                 <div key={plat.name} className="p-6 rounded-2xl flex items-center gap-5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-lg">
                    <div className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${plat.color}10`, border: `1px solid ${plat.color}20` }}>
                       {plat.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold font-inter text-[15px] mb-1">{plat.name}</h4>
                      <p className="text-[11px] text-muted-foreground font-inter tracking-wide">{plat.sub}</p>
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
