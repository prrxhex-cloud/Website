import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Lock, Maximize2, X } from 'lucide-react';

export default function DeepDiveSection() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [panelImages, setPanelImages] = useState(() => {
    const cached = localStorage.getItem('prrx_panel_images');
    return cached ? JSON.parse(cached) : { external_image_url: '', internal_image_url: '' };
  });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('panel_images')
          .select('*')
          .limit(1);

        if (data && !error && data.length > 0) {
          const newImages = {
            external_image_url: data[0].external_image_url || '',
            internal_image_url: data[0].internal_image_url || ''
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
    <section className="py-20 bg-[var(--bg-main)] border-b border-[var(--border-color)] font-inter text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-20">
        
        {/* Inside the Engine */}
        <div className="space-y-12">
          <ScrollReveal variant="fadeUp">
            <div className="text-center space-y-3">
              <div className="sub-heading">ENGINE ARCHITECTURE</div>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-5xl text-[var(--text-heading)] tracking-tight">
                INSIDE THE ENGINE
              </h2>
              <p className="font-inter text-[var(--text-muted)] text-sm max-w-xl mx-auto">
                Explore how our external and internal bypass technologies achieve 100% undetected performance.
              </p>
            </div>
          </ScrollReveal>

          {/* External Bypass Row */}
          <ScrollReveal variant="fadeLeft">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="clean-card p-8 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30 rounded-full font-outfit text-xs font-bold">
                  OFFICIAL — EXTERNAL
                </div>
                <h3 className="font-outfit font-extrabold text-3xl text-[var(--text-heading)]">
                  SAFETY <span className="text-[#06b6d4]">FIRST</span>
                </h3>
                <p className="font-inter text-[var(--text-muted)] text-sm leading-relaxed">
                  Runs inside an isolated overlay space. It operates separately from your system processes, achieving safety by never modifying protected game memory.
                </p>
                <div className="space-y-3">
                  {[
                    'Zero memory injection footprint',
                    'Kernel-level overlay protection check',
                    'Customized system registry mapping',
                    'Bypass client validation engines'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-inter text-[var(--text-primary)] bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--border-color)]">
                      <div className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Window */}
              <div className="clean-card p-3 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md">
                <div className="px-4 py-2 bg-slate-950 rounded-xl flex items-center justify-between text-xs text-cyan-400 font-mono mb-2 border border-slate-800">
                  <span>prrxhex.com</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div 
                  className="bg-slate-950 rounded-xl overflow-hidden min-h-[300px] aspect-[16/10] p-1 flex items-center justify-center relative group cursor-pointer border border-slate-800"
                  onClick={() => panelImages.external_image_url && setSelectedImage(panelImages.external_image_url)}
                >
                  {panelImages.external_image_url ? (
                    <>
                      <img src={panelImages.external_image_url} alt="External Panel" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-outfit text-xs font-bold gap-1.5">
                        <Maximize2 className="w-4 h-4" /> Full View
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 text-[var(--text-muted)] font-outfit text-sm">
                      External Overlay HUD Active
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Internal Injection Row */}
          <ScrollReveal variant="fadeRight">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="clean-card p-3 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md lg:order-1 order-2">
                <div className="px-4 py-2 bg-slate-950 rounded-xl flex items-center justify-between text-xs text-cyan-400 font-mono mb-2 border border-slate-800">
                  <span>prrxhex.com</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div 
                  className="bg-slate-950 rounded-xl overflow-hidden min-h-[300px] aspect-[16/10] p-1 flex items-center justify-center relative group cursor-pointer border border-slate-800"
                  onClick={() => panelImages.internal_image_url && setSelectedImage(panelImages.internal_image_url)}
                >
                  {panelImages.internal_image_url ? (
                    <>
                      <img src={panelImages.internal_image_url} alt="Internal Panel" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-outfit text-xs font-bold gap-1.5">
                        <Maximize2 className="w-4 h-4" /> Full View
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 text-[var(--text-muted)] font-outfit text-sm">
                      Internal Injected Menu Active
                    </div>
                  )}
                </div>
              </div>

              <div className="clean-card p-8 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md space-y-6 lg:order-2 order-1 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/15 text-violet-400 border border-violet-500/30 rounded-full font-outfit text-xs font-bold">
                  BETA X V7A — INTERNAL
                </div>
                <h3 className="font-outfit font-extrabold text-3xl text-[var(--text-heading)]">
                  MAXIMUM <span className="text-violet-400">POWER</span>
                </h3>
                <p className="font-inter text-[var(--text-muted)] text-sm leading-relaxed">
                  Dominate the battlefield. Optimized for maximum performance and security with a full combat suite and movement hacks.
                </p>
                <div className="space-y-3">
                  {[
                    'VMT hooking technology',
                    'Real-time visual outline rendering',
                    'Ultra-fast prediction vector engines',
                    '0ms action delay metrics'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-inter text-[var(--text-primary)] bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--border-color)]">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Technology Stack */}
        <ScrollReveal variant="fadeUp">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="sub-heading">TECHNOLOGY</div>
              <h2 className="font-outfit font-extrabold text-3xl text-[var(--text-heading)]">Engineered Stack</h2>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {[
                { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
                { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript/3178C6' },
                { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
                { name: 'Next.js', icon: 'https://cdn.simpleicons.org/nextdotjs/000000' },
                { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
                { name: 'Python', icon: 'https://cdn.simpleicons.org/python/3776AB' },
                { name: 'C#', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg' },
                { name: 'C++', icon: 'https://cdn.simpleicons.org/cplusplus/00599c' },
                { name: 'HTML5', icon: 'https://cdn.simpleicons.org/html5/E34F26' },
                { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' }
              ].map((tech) => (
                <div key={tech.name} className="clean-card p-4 w-28 h-28 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-shadow">
                  <img src={tech.icon} alt={tech.name} className="w-8 h-8 object-contain" />
                  <span className="text-[11px] font-bold text-[var(--text-heading)] font-inter">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Supported Platforms */}
        <ScrollReveal variant="fadeUp">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="sub-heading">COMPATIBILITY</div>
              <h2 className="font-outfit font-extrabold text-3xl text-[var(--text-heading)]">Supported Platforms</h2>
              <p className="font-inter text-[var(--text-muted)] text-xs">Full support for popular Android emulators and Windows 10/11 x64 systems.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { 
                  name: 'BlueStacks 5', 
                  sub: 'Pie 64-bit / Nougat 32 & 64-bit', 
                  icon: "https://www.google.com/s2/favicons?domain=bluestacks.com&sz=128"
                },
                { 
                  name: 'MSI App Player', 
                  sub: 'High FPS & Low Latency', 
                  icon: "https://www.google.com/s2/favicons?domain=msi.com&sz=128"
                },
                { 
                  name: 'Windows 10 / 11', 
                  sub: 'Full 64-bit Kernel Support', 
                  icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/windows8/windows8-original.svg"
                }
              ].map((plat) => (
                <div key={plat.name} className="clean-card p-5 bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center gap-4 text-left">
                  <img src={plat.icon} alt={plat.name} className="w-10 h-10 shrink-0 object-contain" />
                  <div>
                    <h4 className="text-[var(--text-heading)] font-extrabold font-outfit text-base">{plat.name}</h4>
                    <p className="text-xs text-[var(--text-muted)] font-inter">{plat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full shadow-lg border border-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedImage} 
              alt="Full Resolution View" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-slate-700" 
            />
          </div>
        </div>
      )}
    </section>
  );
}
