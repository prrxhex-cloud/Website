import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Download, XCircle, Calendar, User, Lock, Smartphone, Gift } from 'lucide-react';

const FALLBACK_EXTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';
const FALLBACK_INTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';

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
      className="clean-card p-6 flex flex-col gap-5 bg-white border border-slate-200"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-[#06b6d4] flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit font-extrabold text-slate-900 text-lg">{label}</h3>
            <span className="font-inter text-xs text-slate-500 font-medium">Public Demo Credentials</span>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full border font-outfit font-extrabold text-[11px] flex items-center gap-1.5 ${
          isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {isOnline ? <span className="pulse-dot green" /> : <XCircle className="w-3.5 h-3.5" />}
          <span>{isOnline ? 'ONLINE & ACTIVE' : 'EXPIRED / OFFLINE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="font-inter text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{f.label}</span>
                <span className="font-outfit font-bold text-sm text-slate-900 truncate block">
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
  const [panels, setPanels] = useState({});
  const [v7aLink, setV7aLink] = useState('');
  const [downloadUrls, setDownloadUrls] = useState({ external: FALLBACK_EXTERNAL, internal: FALLBACK_INTERNAL });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [panelData, linkData, dlLinks] = await Promise.all([
        getDocs(query(collection(db, 'free_panels'))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
        getDocs(query(collection(db, 'v7a_apk_links'), where('active', '==', true))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
        getDocs(query(collection(db, 'download_links'), where('active', '==', true))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
      ]);
      const panelMap = {};
      panelData.forEach(p => { panelMap[p.panel_type] = p; });
      setPanels(panelMap);
      setV7aLink(linkData[0]?.url || '');
      const ext = dlLinks.find(l => l.type === 'external');
      const int_ = dlLinks.find(l => l.type === 'internal');
      setDownloadUrls({
        external: ext?.url || FALLBACK_EXTERNAL,
        internal: int_?.url || FALLBACK_INTERNAL,
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-inter">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-12 text-center bg-white border-b border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-4">
          <div className="sub-heading">
            <Gift className="w-3.5 h-3.5" /> FREEBIES & DEMO KEYS
          </div>
          <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl text-slate-900 tracking-tight">
            PUBLIC DEMO KEYS & FREE DOWNLOADS
          </h1>
          <p className="font-inter text-slate-600 text-base max-w-xl mx-auto">
            Test our panel for free using public credentials updated daily by our team.
          </p>
        </div>
      </section>

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#06b6d4]/20 border-t-[#06b6d4] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FreePanelCard panel={panels.external} label="Free External Panel" downloadUrl={downloadUrls.external} index={0} />
              <FreePanelCard panel={panels.internal} label="Free Internal Panel" downloadUrl={downloadUrls.internal} index={1} />
            </div>

            {/* V7a Apk Card */}
            <div className="clean-card p-6 bg-white border border-slate-200 max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-slate-900 text-lg">V7a Internal APK Dump</h3>
                    <span className="font-inter text-xs text-slate-500 font-medium">Original APK build for Android users</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${v7aLink ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {v7aLink ? 'AVAILABLE' : 'OFFLINE'}
                </span>
              </div>
              <p className="font-inter text-xs text-slate-600 leading-relaxed">
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
                <div className="w-full py-3 rounded-xl font-inter font-semibold text-xs text-center bg-slate-100 text-slate-400 cursor-not-allowed">
                  No APK build currently linked
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}