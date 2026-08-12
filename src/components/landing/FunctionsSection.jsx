import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Check, Settings, LayoutGrid, SlidersHorizontal, Image as ImageIcon, Lock, Keyboard, X, Maximize2 } from 'lucide-react';
import ScrollReveal from '@/components/effects/ScrollReveal';

export default function FunctionsSection() {
  const location = useLocation();
  const [activePanel, setActivePanel] = useState(location.state?.tab || 'external');
  const [selectedImage, setSelectedImage] = useState(null);

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

  const [meta, setMeta] = useState(() => {
    const cached = localStorage.getItem('prrx_functions_meta');
    return cached ? JSON.parse(cached) : {
      external_toggles: '59',
      internal_toggles: '51',
      categories_count: '6',
      external_description: 'External memory-safe overlay with smooth aim assistance, radar ESP, and 120FPS bypass capabilities.',
      internal_description: 'Advanced in-game injection overlay features: Headshot Aimbot, ESP Skeleton, Color Chams, and Custom Hotkeys.'
    };
  });

  useEffect(() => {
    if (location.state?.tab) {
      setActivePanel(location.state.tab);
    }
    
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
          if (data.meta) {
            setMeta(data.meta);
            localStorage.setItem('prrx_functions_meta', JSON.stringify(data.meta));
          }
        }
        
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

  return (
    <section className="py-16 sm:py-24 bg-[var(--bg-main)] border-b border-[var(--border-color)] font-inter text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Toggle Switch */}
        <div className="flex justify-center mb-10">
          <div className="bg-[var(--bg-glass-card)] backdrop-blur-xl border border-[var(--border-color)] p-1.5 rounded-2xl shadow-md flex items-center gap-2">
            <button 
              onClick={() => setActivePanel('external')}
              className={`px-6 py-2.5 rounded-xl font-outfit font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
                !isInternal
                  ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-md'
                  : 'text-[var(--text-primary)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              External Panel (PC)
            </button>

            <button 
              onClick={() => setActivePanel('internal')}
              className={`px-6 py-2.5 rounded-xl font-outfit font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
                isInternal
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-[var(--text-primary)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Settings className="w-4 h-4" />
              Internal Panel (APK)
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <ScrollReveal variant="fadeUp">
          <div className="clean-card p-8 sm:p-10 mb-10 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-left">
            <div>
              <div className="sub-heading mb-2">FEATURES OVERVIEW</div>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] flex items-center gap-3">
                {isInternal ? 'Internal Panel Suite' : 'External Overlay Panel'}
              </h2>
              <p className="font-inter text-[var(--text-muted)] text-sm max-w-xl mt-2 leading-relaxed">
                {isInternal ? meta.internal_description : meta.external_description}
              </p>
            </div>

            <div className="flex gap-8 border-l border-[var(--border-color)] pl-8">
              <div>
                <div className="font-outfit font-extrabold text-4xl text-[#06b6d4]">
                  {isInternal ? meta.internal_toggles : meta.external_toggles}
                </div>
                <div className="font-inter text-xs text-[var(--text-muted)] font-medium">Total Toggles</div>
              </div>
              <div>
                <div className="font-outfit font-extrabold text-4xl text-[var(--text-heading)]">
                  {meta.categories_count || '6'}
                </div>
                <div className="font-inter text-xs text-[var(--text-muted)] font-medium font-inter">Categories</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Live Preview & Style Cards */}
        <ScrollReveal variant="fadeUp">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            
            {/* Left Large Preview Container */}
            <div className="lg:col-span-2 clean-card p-4 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md flex flex-col">
              {/* Window Header */}
              <div className="px-4 py-2.5 bg-slate-950 rounded-xl flex items-center gap-2 mb-3 border border-slate-800">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto text-xs text-cyan-400 font-mono flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" /> prrxhex.com
                </div>
              </div>

              {/* Preview Image Viewport - Full View Object Contain */}
              <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden min-h-[250px] sm:min-h-[360px] p-2 relative flex items-center justify-center group cursor-pointer border border-slate-800"
                onClick={() => mainPreviewImage && setSelectedImage(mainPreviewImage)}>
                {mainPreviewImage ? (
                  <>
                    <img 
                      src={mainPreviewImage} 
                      className="w-full h-full max-h-[460px] object-contain rounded-lg" 
                      alt="Full Panel Preview" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-outfit text-xs font-bold gap-2">
                      <Maximize2 className="w-4 h-4" /> Click to view full image
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8 space-y-2">
                    <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="font-outfit text-[var(--text-muted)] text-sm font-bold">Panel HUD Interface Active</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Small Cards */}
            <div className="lg:col-span-1 grid grid-cols-2 gap-4">
              <div className="clean-card p-5 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-center shadow-sm text-left">
                <LayoutGrid className="w-5 h-5 mb-2 text-[#06b6d4]" />
                <h3 className="font-outfit font-extrabold text-base text-[var(--text-heading)]">Tabbed</h3>
                <p className="font-inter text-xs text-[var(--text-muted)]">Layout Style</p>
              </div>

              <div className="clean-card p-5 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-center shadow-sm text-left">
                <SlidersHorizontal className="w-5 h-5 mb-2 text-violet-400" />
                <h3 className="font-outfit font-extrabold text-base text-[var(--text-heading)]">Sliders</h3>
                <p className="font-inter text-xs text-[var(--text-muted)]">Smooth FOV</p>
              </div>

              <div className="clean-card p-5 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-center shadow-sm text-left">
                <Keyboard className="w-5 h-5 mb-2 text-indigo-400" />
                <h3 className="font-outfit font-extrabold text-base text-[var(--text-heading)]">Keybinds</h3>
                <p className="font-inter text-xs text-[var(--text-muted)]">Custom Binds</p>
              </div>

              <div className="clean-card p-5 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-center shadow-sm text-left">
                <Check className="w-5 h-5 mb-2 text-emerald-400" />
                <h3 className="font-outfit font-extrabold text-2xl text-[var(--text-heading)]">{isInternal ? '51' : '59'}</h3>
                <p className="font-inter text-xs text-[var(--text-muted)] font-medium">Total Features</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Panel Screenshots Grid - Object Contain */}
        <ScrollReveal variant="fadeUp">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-outfit font-extrabold text-lg text-[var(--text-heading)]">Panel Feature Screenshots</h3>
            <span className="text-xs text-[var(--text-muted)] font-medium">Click any screenshot to zoom in full view</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { key: 'aimbot', label: 'Aimbot Menu' },
              { key: 'visuals', label: 'Visuals / ESP' },
              { key: 'colors', label: 'Color Chams' },
              { key: 'misc', label: 'Misc Modifications' },
              { key: 'keybinds', label: 'Keybind Config' },
              { key: 'settings', label: 'Settings & Security' }
            ].map((cat) => (
              <div key={cat.key} className="clean-card p-3 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-sm text-left">
                <div 
                  className="aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden relative flex items-center justify-center p-0.5 group cursor-pointer border border-slate-800"
                  onClick={() => currentImages[cat.key] && setSelectedImage(currentImages[cat.key])}
                >
                  {currentImages[cat.key] ? (
                    <>
                      <img 
                        src={currentImages[cat.key]} 
                        alt={cat.label} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-outfit text-xs font-bold gap-1.5">
                        <Maximize2 className="w-4 h-4" /> Full View
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                      <span className="font-inter text-[11px] text-[var(--text-muted)] font-semibold">{cat.label}</span>
                    </div>
                  )}
                </div>
                <div className="font-outfit font-bold text-xs text-[var(--text-heading)] px-1">{cat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Full Image Lightbox Modal */}
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

      </div>
    </section>
  );
}