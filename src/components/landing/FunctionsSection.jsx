import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Check, Settings, LayoutGrid, SlidersHorizontal, Image as ImageIcon, Lock, Keyboard } from 'lucide-react';
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
    <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Toggle Switch */}
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm flex items-center gap-2">
            <button 
              onClick={() => setActivePanel('external')}
              className={`px-6 py-2.5 rounded-xl font-outfit font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
                !isInternal
                  ? 'bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Internal Panel (APK)
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <ScrollReveal variant="fadeUp">
          <div className="clean-card p-8 sm:p-10 mb-10 bg-white border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="sub-heading mb-2">FEATURES OVERVIEW</div>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 flex items-center gap-3">
                {isInternal ? 'Internal Panel Suite' : 'External Overlay Panel'}
              </h2>
              <p className="font-inter text-slate-600 text-sm max-w-xl mt-2 leading-relaxed">
                {isInternal 
                  ? 'Advanced in-game injection overlay features: Headshot Aimbot, ESP Skeleton, Color Chams, and Custom Hotkeys.'
                  : 'External memory-safe overlay with smooth aim assistance, radar ESP, and 120FPS bypass capabilities.'}
              </p>
            </div>

            <div className="flex gap-8 border-l border-slate-200 pl-8">
              <div>
                <div className="font-outfit font-extrabold text-4xl text-[#06b6d4]">{isInternal ? '51' : '59'}</div>
                <div className="font-inter text-xs text-slate-500 font-medium">Total Toggles</div>
              </div>
              <div>
                <div className="font-outfit font-extrabold text-4xl text-slate-900">6</div>
                <div className="font-inter text-xs text-slate-500 font-medium font-inter">Categories</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Live Preview & Style Cards */}
        <ScrollReveal variant="fadeUp">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            
            {/* Left Large Preview */}
            <div className="lg:col-span-2 clean-card p-4 bg-white border border-slate-200 flex flex-col">
              {/* Window Header */}
              <div className="px-4 py-2.5 bg-slate-100 rounded-xl flex items-center gap-2 mb-3 border border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto text-xs text-slate-500 font-mono flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" /> {isInternal ? 'int.prrx.local' : 'ext.prrx.local'}
                </div>
              </div>

              {/* Preview Image */}
              <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden min-h-[340px] relative flex items-center justify-center">
                {mainPreviewImage ? (
                  <img src={mainPreviewImage} className="w-full h-full object-contain" alt="Live Preview" />
                ) : (
                  <div className="text-center p-8 space-y-2">
                    <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="font-outfit text-slate-400 text-sm font-bold">Panel HUD Interface Active</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Small Cards */}
            <div className="lg:col-span-1 grid grid-cols-2 gap-4">
              <div className="clean-card p-5 bg-white border border-slate-200 flex flex-col justify-center">
                <LayoutGrid className="w-5 h-5 mb-2 text-[#06b6d4]" />
                <h3 className="font-outfit font-extrabold text-base text-slate-900">Tabbed</h3>
                <p className="font-inter text-xs text-slate-500">Layout Style</p>
              </div>

              <div className="clean-card p-5 bg-white border border-slate-200 flex flex-col justify-center">
                <SlidersHorizontal className="w-5 h-5 mb-2 text-violet-600" />
                <h3 className="font-outfit font-extrabold text-base text-slate-900">Sliders</h3>
                <p className="font-inter text-xs text-slate-500">Smooth FOV</p>
              </div>

              <div className="clean-card p-5 bg-white border border-slate-200 flex flex-col justify-center">
                <Keyboard className="w-5 h-5 mb-2 text-indigo-600" />
                <h3 className="font-outfit font-extrabold text-base text-slate-900">Keybinds</h3>
                <p className="font-inter text-xs text-slate-500">Custom Binds</p>
              </div>

              <div className="clean-card p-5 bg-white border border-slate-200 flex flex-col justify-center">
                <Check className="w-5 h-5 mb-2 text-emerald-600" />
                <h3 className="font-outfit font-extrabold text-2xl text-slate-900">{isInternal ? '51' : '59'}</h3>
                <p className="font-inter text-xs text-slate-500">Total Features</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Panel Screenshots */}
        <ScrollReveal variant="fadeUp">
          <div className="mb-4">
            <h3 className="font-outfit font-extrabold text-lg text-slate-900">Panel Feature Screenshots</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {[
              { key: 'aimbot', label: 'Aimbot Menu' },
              { key: 'visuals', label: 'Visuals / ESP' },
              { key: 'colors', label: 'Color Chams' },
              { key: 'misc', label: 'Misc Modifications' },
              { key: 'keybinds', label: 'Keybind Config' },
              { key: 'settings', label: 'Settings & Security' }
            ].map((cat) => (
              <div key={cat.key} className="clean-card p-3 bg-white border border-slate-200 space-y-2">
                <div className="aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                  {currentImages[cat.key] ? (
                    <img src={currentImages[cat.key]} alt={cat.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                      <span className="font-inter text-[11px] text-slate-400 font-semibold">{cat.label}</span>
                    </div>
                  )}
                </div>
                <div className="font-outfit font-bold text-xs text-slate-800 px-1">{cat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal variant="fadeUp">
          <div className="clean-card p-6 sm:p-8 bg-white border border-slate-200 overflow-x-auto">
            <div className="mb-6">
              <h3 className="font-outfit font-extrabold text-xl text-slate-900">External vs Internal Comparison</h3>
            </div>

            <table className="w-full text-left font-inter text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                  <th className="py-3">Capability</th>
                  <th className="py-3 text-center">External Panel</th>
                  <th className="py-3 text-center">Internal Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 font-semibold text-slate-900">Total Features</td>
                  <td className="py-3 text-center font-bold">59</td>
                  <td className="py-3 text-center font-bold">51</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900">Aimbot & Aim Assist</td>
                  <td className="py-3 text-center text-emerald-600 font-bold">✓ Included</td>
                  <td className="py-3 text-center text-emerald-600 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900">ESP Wallhack & Skeleton</td>
                  <td className="py-3 text-center text-slate-600">Basic Overlay</td>
                  <td className="py-3 text-center text-indigo-600 font-bold">Extended 3D Box</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900">Stream Mode Stealth</td>
                  <td className="py-3 text-center text-emerald-600 font-bold">✓ Included</td>
                  <td className="py-3 text-center text-emerald-600 font-bold">✓ Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}