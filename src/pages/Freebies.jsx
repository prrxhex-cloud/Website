import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Download, XCircle, Calendar, User, Lock, Smartphone, Gift } from 'lucide-react';

const FALLBACK_EXTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';
const FALLBACK_INTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';

const DEFAULT_PANELS = {
  external: { start_day: '2026-08-01', end_day: '2026-08-31', username: 'FREE-PRRX-EXT', password: 'PASSWORD123' },
  internal: { start_day: '2026-08-01', end_day: '2026-08-31', username: 'FREE-PRRX-INT', password: 'PASSWORD123' }
};

function FreePanelCard({ panel, label, downloadUrl, index }) {
  const isOnline = panel && panel.start_day && panel.end_day && panel.username && panel.password;

  const fields = [
    { icon: Calendar, label: 'Start Date', value: panel?.start_day },
    { icon: Calendar, label: 'End Date', value: panel?.end_day },
    { icon: User, label: 'Free Username', value: panel?.username },
    { icon: Lock, label: 'Free Password', value: panel?.password },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="clean-card p-6 flex flex-col gap-5 bg-[var(--bg-card)] border border-[var(--border-color)] text-left shadow-md rounded-3xl"
    >
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#06b6d4] flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit font-extrabold text-[var(--text-heading)] text-lg">{label}</h3>
            <span className="font-inter text-xs text-[var(--text-muted)] font-medium">Public Demo Credentials</span>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full border font-outfit font-extrabold text-[11px] flex items-center gap-1.5 ${
          isOnline ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
        }`}>
          {isOnline ? <span className="pulse-dot green" /> : <XCircle className="w-3.5 h-3.5" />}
          <span>{isOnline ? 'ONLINE & ACTIVE' : 'EXPIRED / OFFLINE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[#06b6d4] flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="font-inter text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">{f.label}</span>
                <span className="font-outfit font-bold text-sm text-[var(--text-heading)] truncate block">
                  {f.value || 'Not Configured'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary-cyan btn-glow w-full py-3 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 mt-2 shadow-md"
      >
        <Download className="w-4 h-4" /> Download Panel Build
      </a>
    </motion.div>
  );
}

export default function Freebies() {
  const [panels, setPanels] = useState(DEFAULT_PANELS);
  const [v7aLink, setV7aLink] = useState('https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar');
  const [downloadUrls, setDownloadUrls] = useState({ external: FALLBACK_EXTERNAL, internal: FALLBACK_INTERNAL });

  useEffect(() => {
    // Instant background sync without blocking rendering
    Promise.all([
      supabase.from('free_panels').select('*'),
      supabase.from('v7a_apk_links').select('*').eq('active', true),
      supabase.from('download_links').select('*').eq('active', true),
    ]).then(([panelRes, linkRes, dlRes]) => {
      const panelData = panelRes.data;
      const linkData = linkRes.data;
      const dlLinks = dlRes.data || [];

      if (panelData?.length) {
        const panelMap = {};
        panelData.forEach(p => { panelMap[p.panel_type] = p; });
        setPanels(panelMap);
      }
      if (linkData?.[0]?.url) setV7aLink(linkData[0].url);
      const ext = dlLinks.find(l => l.type === 'external' || l.panel_type === 'external');
      const int_ = dlLinks.find(l => l.type === 'internal' || l.panel_type === 'internal');
      setDownloadUrls({
        external: ext?.url || FALLBACK_EXTERNAL,
        internal: int_?.url || FALLBACK_INTERNAL,
      });
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter transition-colors duration-300">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-12 text-center bg-[var(--bg-glass-card)] backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-4">
          <div className="sub-heading">
            <Gift className="w-3.5 h-3.5" /> FREEBIES & DEMO KEYS
          </div>
          <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl text-[var(--text-heading)] tracking-tight">
            PUBLIC DEMO KEYS & BUILDS
          </h1>
          <p className="font-inter text-[var(--text-muted)] text-base max-w-xl mx-auto">
            Test our panel using public credentials updated daily and download the latest verified builds.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* PUBLIC FREE PANELS */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FreePanelCard panel={panels.external} label="Free External Panel" downloadUrl={downloadUrls.external} index={0} />
            <FreePanelCard panel={panels.internal} label="Free Internal Panel" downloadUrl={downloadUrls.internal} index={1} />
          </div>

          {/* V7a Apk Card */}
          <div className="clean-card p-6 bg-[var(--bg-card)] border border-[var(--border-color)] max-w-2xl mx-auto space-y-4 rounded-3xl shadow-md text-left">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-[var(--text-heading)] text-lg">V7a Internal APK Dump</h3>
                  <span className="font-inter text-xs text-[var(--text-muted)] font-medium">Original APK build for Android users</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${v7aLink ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/15 text-slate-400'}`}>
                {v7aLink ? 'AVAILABLE' : 'OFFLINE'}
              </span>
            </div>
            <p className="font-inter text-xs text-[var(--text-muted)] leading-relaxed">
              This APK build is compiled directly for our internal panel users. Dumped and verified by the PRRX engineering team.
            </p>
            {v7aLink ? (
              <a
                href={v7aLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-cyan btn-glow w-full py-3 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" /> Download V7a APK
              </a>
            ) : (
              <div className="w-full py-3 rounded-xl font-inter font-semibold text-xs text-center bg-[var(--bg-subtle)] text-[var(--text-muted)] cursor-not-allowed">
                No APK build currently linked
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}