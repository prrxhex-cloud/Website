import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutGrid, Upload, RefreshCw, Link, Edit3 } from 'lucide-react';
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
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState('external'); // external | internal

  const [images, setImages] = useState({
    internal_screenshots: { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' },
    external_screenshots: { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' }
  });

  const [meta, setMeta] = useState({
    external_toggles: '59',
    internal_toggles: '51',
    categories_count: '6',
    external_description: 'External memory-safe overlay with smooth aim assistance, radar ESP, and 120FPS bypass capabilities.',
    internal_description: 'Advanced in-game injection overlay features: Headshot Aimbot, ESP Skeleton, Color Chams, and Custom Hotkeys.',
    external_labels: {},
    internal_labels: {}
  });

  const [files, setFiles] = useState({
    internal: {},
    external: {}
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('functions_screenshots').select('*').limit(1);
      if (data && data.length > 0) {
        const item = data[0];
        setRecordId(item.id);
        setImages({
          internal_screenshots: item.internal_screenshots || { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' },
          external_screenshots: item.external_screenshots || { aimbot: '', visuals: '', colors: '', misc: '', keybinds: '', settings: '' }
        });
        if (item.meta) {
          setMeta(prev => ({ ...prev, ...item.meta }));
        }
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

      const uploadCategoryFiles = async (panel) => {
        const panelFiles = files[panel];
        for (const cat of CATEGORIES) {
          const file = panelFiles[cat.key];
          if (file) {
            const filePath = `functions_screenshots/${panel}_${cat.key}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            await supabase.storage.from('panel_images').upload(filePath, file, { upsert: true });
            const url = supabase.storage.from('panel_images').getPublicUrl(filePath).data?.publicUrl || '';
            if (url) {
              updatedImages[`${panel}_screenshots`][cat.key] = url;
            }
          }
        }
      };

      await uploadCategoryFiles('internal');
      await uploadCategoryFiles('external');

      const payload = {
        internal_screenshots: updatedImages.internal_screenshots,
        external_screenshots: updatedImages.external_screenshots,
        meta: meta,
        updated_at: new Date().toISOString()
      };

      if (recordId) {
        const { error } = await supabase.from('functions_screenshots').update(payload).eq('id', recordId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('functions_screenshots').insert({
          ...payload,
          created_at: new Date().toISOString()
        });
        if (error) throw error;
      }

      setImages(updatedImages);
      setFiles({ internal: {}, external: {} });
      toast.success('Functions screenshots & statistics updated successfully!');
      loadSettings();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update settings: ' + e.message);
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
    <div className="space-y-6 text-left">
      <div className="rounded-xl p-5" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-orbitron font-bold text-lg text-primary tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" /> FUNCTIONS CONFIG & SCREENSHOTS
          </h3>
          <button onClick={loadSettings} className="text-muted-foreground hover:text-white transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Editable Stats & Descriptions Section */}
        <div className="p-4 rounded-xl mb-6 space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.1)' }}>
          <h4 className="font-orbitron font-bold text-sm tracking-widest text-[#06b6d4] flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> EDIT STATS & HERO DESCRIPTIONS
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">External Total Toggles</label>
              <input
                type="text"
                value={meta.external_toggles}
                onChange={e => setMeta({ ...meta, external_toggles: e.target.value })}
                className="w-full px-3 py-2 rounded-lg font-inter text-sm outline-none text-white bg-slate-900 border border-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Internal Total Toggles</label>
              <input
                type="text"
                value={meta.internal_toggles}
                onChange={e => setMeta({ ...meta, internal_toggles: e.target.value })}
                className="w-full px-3 py-2 rounded-lg font-inter text-sm outline-none text-white bg-slate-900 border border-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Total Categories</label>
              <input
                type="text"
                value={meta.categories_count}
                onChange={e => setMeta({ ...meta, categories_count: e.target.value })}
                className="w-full px-3 py-2 rounded-lg font-inter text-sm outline-none text-white bg-slate-900 border border-white/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">External Description</label>
              <textarea
                value={meta.external_description}
                onChange={e => setMeta({ ...meta, external_description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg font-inter text-xs outline-none text-white bg-slate-900 border border-white/10 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Internal Description</label>
              <textarea
                value={meta.internal_description}
                onChange={e => setMeta({ ...meta, internal_description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg font-inter text-xs outline-none text-white bg-slate-900 border border-white/10 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Panel Switcher */}
        <div className="flex gap-2 mb-6">
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
                  <div>
                    <label className="text-xs text-muted-foreground font-inter flex items-center gap-1.5 mb-1.5">Custom Label (Optional)</label>
                    <input 
                      type="text" 
                      value={meta[`${activePanel}_labels`]?.[cat.key] || ''} 
                      onChange={e => setMeta(prev => ({
                        ...prev,
                        [`${activePanel}_labels`]: {
                          ...prev[`${activePanel}_labels`],
                          [cat.key]: e.target.value
                        }
                      }))}
                      placeholder={cat.label}
                      className="w-full px-3 py-2 rounded-lg font-inter text-sm outline-none transition-all text-white"
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
