import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { LayoutGrid, Upload, RefreshCw, Link } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { key: 'aimbot', label: 'Aimbot Menu' },
  { key: 'visuals', label: 'Visuals / ESP' },
  { key: 'colors', label: 'Colors' },
  { key: 'misc', label: 'Misc / Other' },
  { key: 'keybinds', label: 'Keybinds' },
  { key: 'settings', label: 'Settings' }
];

export default function FunctionsScreenshotsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState('internal'); // internal | external

  const [images, setImages] = useState({
    internal_screenshots: { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' },
    external_screenshots: { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' }
  });

  const [files, setFiles] = useState({
    internal: {},
    external: {}
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'public_settings', 'functions_screenshots'));
      if (snap.exists()) {
        const data = snap.data();
        setImages({
          internal_screenshots: data.internal_screenshots || { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' },
          external_screenshots: data.external_screenshots || { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' }
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load screenshots data');
    }
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const handleUrlChange = (panel, category, url) => {
    setImages(prev => ({
      ...prev,
      [`${panel}_screenshots`]: {
        ...prev[`${panel}_screenshots`],
        [category]: url
      }
    }));
  };

  const handleFileChange = (panel, category, file) => {
    setFiles(prev => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        [category]: file
      }
    }));
  };

  const handleUploadAndSave = async () => {
    setSaving(true);
    try {
      let updatedImages = { ...images };

      // Helper function to upload and update url
      const uploadCategoryFiles = async (panel) => {
        const panelFiles = files[panel];
        for (const cat of CATEGORIES) {
          const file = panelFiles[cat.key];
          if (file) {
            const fileRef = ref(storage, `functions_screenshots/${panel}_${cat.key}_${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            updatedImages[`${panel}_screenshots`][cat.key] = url;
          }
        }
      };

      await uploadCategoryFiles('internal');
      await uploadCategoryFiles('external');

      // Save to Firestore
      await setDoc(doc(db, 'public_settings', 'functions_screenshots'), {
        internal_screenshots: updatedImages.internal_screenshots,
        external_screenshots: updatedImages.external_screenshots,
        updated_at: new Date().toISOString()
      }, { merge: true });

      setImages(updatedImages);
      setFiles({ internal: {}, external: {} });
      toast.success('Functions screenshots updated successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update screenshots');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  const currentPanelKey = `${activePanel}_screenshots`;
  const currentImages = images[currentPanelKey];
  const currentFiles = files[activePanel];

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-5" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-orbitron font-bold text-lg text-primary tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" /> FUNCTIONS SCREENSHOTS
          </h3>
          <button onClick={loadSettings} className="text-muted-foreground hover:text-white transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Switcher */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setActivePanel('internal')}
            className="px-6 py-2 rounded-lg font-orbitron font-bold text-xs tracking-wider transition-all"
            style={{
              background: activePanel === 'internal' ? 'rgba(170,68,255,0.2)' : 'rgba(255,255,255,0.05)',
              border: activePanel === 'internal' ? '1px solid rgba(170,68,255,0.5)' : '1px solid transparent',
              color: activePanel === 'internal' ? '#aa44ff' : 'rgba(255,255,255,0.5)'
            }}
          >
            INTERNAL PANEL
          </button>
          <button 
            onClick={() => setActivePanel('external')}
            className="px-6 py-2 rounded-lg font-orbitron font-bold text-xs tracking-wider transition-all"
            style={{
              background: activePanel === 'external' ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: activePanel === 'external' ? '1px solid rgba(0,212,255,0.5)' : '1px solid transparent',
              color: activePanel === 'external' ? '#00d4ff' : 'rgba(255,255,255,0.5)'
            }}
          >
            EXTERNAL PANEL
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => {
            const hasFile = !!currentFiles[cat.key];
            const displayUrl = hasFile ? URL.createObjectURL(currentFiles[cat.key]) : currentImages[cat.key];

            return (
              <div key={cat.key} className="space-y-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 className="font-orbitron font-bold text-sm tracking-widest text-white">{cat.label}</h4>
                
                {/* Current Image Preview */}
                <div className="w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center relative" 
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  {displayUrl ? (
                    <img src={displayUrl} className="w-full h-full object-cover" alt={`${cat.label} Preview`} />
                  ) : (
                    <span className="text-muted-foreground text-xs font-inter">No image set</span>
                  )}
                  {hasFile && <div className="absolute top-2 right-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded">NEW FILE</div>}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-inter flex items-center gap-1.5 mb-1.5"><Link className="w-3.5 h-3.5"/> Direct URL</label>
                    <input 
                      type="text" 
                      value={currentImages[cat.key]} 
                      onChange={e => handleUrlChange(activePanel, cat.key, e.target.value)}
                      disabled={hasFile}
                      placeholder="https://example.com/image.png"
                      className="w-full px-3 py-2 rounded-lg font-inter text-sm outline-none transition-all disabled:opacity-50 text-white"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                  <div className="text-center text-xs text-muted-foreground">OR</div>
                  <div>
                    <label className="text-xs text-muted-foreground font-inter flex items-center gap-1.5 mb-1.5"><Upload className="w-3.5 h-3.5"/> Upload File</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleFileChange(activePanel, cat.key, e.target.files[0])}
                      className="w-full font-inter text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <button 
            onClick={handleUploadAndSave}
            disabled={saving}
            className="px-8 py-3 rounded-xl font-orbitron font-bold text-sm tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
          >
            {saving && <div className="w-4 h-4 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />}
            SAVE ALL CHANGES
          </button>
        </div>

      </div>
    </div>
  );
}
