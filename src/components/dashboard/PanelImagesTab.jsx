import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Image as ImageIcon, RefreshCw, Sparkles, Check, ExternalLink, Folder } from 'lucide-react';
import { resolveImageUrl, REPO_PANEL_PRESETS } from '@/utils/imagePathHelper';
import { toast } from 'sonner';

export default function PanelImagesTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState({
    external_image_url: 'panels/external_panel.png',
    internal_image_url: 'panels/internal_panel.png',
    hero_hud_url: 'panels/hero_hud.png'
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'public_settings', 'panel_images'));
      if (snap.exists()) {
        const data = snap.data();
        setImages({
          external_image_url: data.external_image_url || 'panels/external_panel.png',
          internal_image_url: data.internal_image_url || 'panels/internal_panel.png',
          hero_hud_url: data.hero_hud_url || 'panels/hero_hud.png'
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load panel images');
    }
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'public_settings', 'panel_images'), {
        external_image_url: images.external_image_url.trim(),
        internal_image_url: images.internal_image_url.trim(),
        hero_hud_url: images.hero_hud_url.trim(),
        updated_at: new Date().toISOString()
      }, { merge: true });

      toast.success('🎉 Panel Images updated successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save panel images');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 text-left font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-outfit font-black text-xl text-[var(--text-heading)] tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            PANEL SHOWCASE PHOTOS & GITHUB REPO HOSTING
          </h2>
          <p className="font-inter text-xs text-[var(--text-muted)] mt-1">
            Host images directly inside your GitHub repository folder (<code className="text-cyan-300 font-mono">public/panels/</code>) with 100% free, permanent CDN speed!
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white transition-colors"
          title="Refresh Settings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* GitHub Repo Quick Guide Banner */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3 text-xs">
        <Folder className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-outfit font-bold text-white block">
            How to add photos via GitHub Desktop:
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            1. Copy your screenshot files into <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-mono">public/panels/</code> in your Website folder.<br/>
            2. Commit and Push in <strong>GitHub Desktop</strong>.<br/>
            3. Set the image path below to <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-mono">panels/your_image_name.png</code>.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: External Panel UI */}
          <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-xl">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                PC CHEAT PANEL
              </span>
              <h3 className="font-outfit font-black text-lg text-white mt-1.5">External Panel Screenshot</h3>
              <p className="text-[11px] text-slate-400">Displayed on External Panel features & showcase.</p>
            </div>

            {/* Live Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 h-44 flex items-center justify-center">
              {images.external_image_url ? (
                <img
                  src={resolveImageUrl(images.external_image_url)}
                  alt="External Panel"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'; }}
                />
              ) : (
                <span className="text-xs text-slate-500">No Image Set</span>
              )}
            </div>

            {/* Input & Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300">GitHub Repo Path or URL:</label>
              <input
                type="text"
                value={images.external_image_url}
                onChange={(e) => setImages({ ...images, external_image_url: e.target.value })}
                placeholder="panels/external_panel.png"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs font-mono text-cyan-300 outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setImages({ ...images, external_image_url: 'panels/external_panel.png' })}
                className="text-[10px] text-cyan-400 hover:underline font-bold"
              >
                Use default: panels/external_panel.png
              </button>
            </div>
          </div>

          {/* Card 2: Internal Panel UI */}
          <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-xl">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30">
                ANDROID / INTERNAL V7A
              </span>
              <h3 className="font-outfit font-black text-lg text-white mt-1.5">Internal Panel Screenshot</h3>
              <p className="text-[11px] text-slate-400">Displayed on Internal Android Panel section.</p>
            </div>

            {/* Live Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 h-44 flex items-center justify-center">
              {images.internal_image_url ? (
                <img
                  src={resolveImageUrl(images.internal_image_url)}
                  alt="Internal Panel"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop'; }}
                />
              ) : (
                <span className="text-xs text-slate-500">No Image Set</span>
              )}
            </div>

            {/* Input & Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300">GitHub Repo Path or URL:</label>
              <input
                type="text"
                value={images.internal_image_url}
                onChange={(e) => setImages({ ...images, internal_image_url: e.target.value })}
                placeholder="panels/internal_panel.png"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs font-mono text-purple-300 outline-none focus:border-purple-400"
              />
              <button
                type="button"
                onClick={() => setImages({ ...images, internal_image_url: 'panels/internal_panel.png' })}
                className="text-[10px] text-purple-400 hover:underline font-bold"
              >
                Use default: panels/internal_panel.png
              </button>
            </div>
          </div>

          {/* Card 3: Hero HUD Showcase */}
          <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-xl">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                HERO OVERLAY
              </span>
              <h3 className="font-outfit font-black text-lg text-white mt-1.5">Hero HUD Overlay</h3>
              <p className="text-[11px] text-slate-400">Floating panel overlay on Homepage Hero.</p>
            </div>

            {/* Live Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 h-44 flex items-center justify-center">
              {images.hero_hud_url ? (
                <img
                  src={resolveImageUrl(images.hero_hud_url)}
                  alt="Hero HUD"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'; }}
                />
              ) : (
                <span className="text-xs text-slate-500">No Image Set</span>
              )}
            </div>

            {/* Input & Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300">GitHub Repo Path or URL:</label>
              <input
                type="text"
                value={images.hero_hud_url}
                onChange={(e) => setImages({ ...images, hero_hud_url: e.target.value })}
                placeholder="panels/hero_hud.png"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs font-mono text-emerald-300 outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={() => setImages({ ...images, hero_hud_url: 'panels/hero_hud.png' })}
                className="text-[10px] text-emerald-400 hover:underline font-bold"
              >
                Use default: panels/hero_hud.png
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Save Button */}
      <div className="pt-4 border-t border-[var(--border-color)] flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-outfit font-black text-xs tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{saving ? 'SAVING CHANGES...' : 'SAVE PANEL IMAGES'}</span>
        </button>
      </div>
    </div>
  );
}
