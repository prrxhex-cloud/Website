import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Download, CheckCircle, XCircle, Calendar, User, Lock, Smartphone, Gift, RefreshCw } from 'lucide-react';

const FALLBACK_EXTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';
const FALLBACK_INTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';

function FreePanelCard({ panel, label, accent, downloadUrl, index }) {
  const isOnline = panel && panel.start_day && panel.end_day && panel.username && panel.password;
  const statusColor = isOnline ? '#22c55e' : '#ff00ff';
  const StatusIcon = isOnline ? CheckCircle : XCircle;

  const fields = [
    { icon: Calendar, label: 'Start Day', value: panel?.start_day },
    { icon: Calendar, label: 'End Day', value: panel?.end_day },
    { icon: User, label: 'Username', value: panel?.username },
    { icon: Lock, label: 'Password', value: panel?.password },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2"
      style={{ borderTop: `2px solid ${statusColor}`, boxShadow: `0 20px 50px rgba(0,0,0,0.3)` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <Smartphone className="w-6 h-6" style={{ color: accent }} />
          </div>
          <h3 className="font-orbitron font-black text-lg tracking-widest text-white uppercase">{label}</h3>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <StatusIcon className="w-4 h-4 animate-pulse shadow-[0_0_10px_currentColor]" style={{ color: statusColor }} />
          <span className="font-orbitron font-black text-xs tracking-widest uppercase shadow-[0_0_10px_currentColor]" style={{ color: statusColor, textShadow: `0 0 10px ${statusColor}80` }}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
        {fields.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="rounded-2xl p-4 bg-white/5 border border-white/10 flex items-center gap-4 group/field hover:bg-white/10 transition-colors duration-300">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center border border-white/5">
                <Icon className="w-4 h-4 text-gray-400 group-hover/field:text-white transition-colors" />
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="font-inter text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{f.label}</span>
                <p className="font-orbitron font-black text-sm text-white truncate group-hover/field:text-cyan-400 transition-colors" style={{ textShadow: f.value ? '0 0 10px rgba(0,212,255,0.3)' : 'none' }}>
                  {f.value || '—'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
        className="mt-auto w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-orbitron font-black text-sm tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative z-10 overflow-hidden group/btn"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent === '#00d4ff' ? '#ff00ff' : '#00d4ff'})`, color: '#000', boxShadow: `0 0 30px ${accent}40` }}>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
        <Download className="w-5 h-5 relative z-10" /> <span className="relative z-10">DOWNLOAD PANEL</span>
      </a>
    </motion.div>
  );
}

function V7aApkCard({ link, index }) {
  const hasLink = !!link;
  const color = '#ff00ff';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 h-full"
      style={{ borderTop: `2px solid ${hasLink ? color : '#ff00ff'}`, boxShadow: `0 20px 50px rgba(0,0,0,0.3)` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,0,255,0.2)]">
            <Smartphone className="w-6 h-6" style={{ color }} />
          </div>
          <h3 className="font-orbitron font-black text-lg tracking-widest text-white uppercase">V7a Apk</h3>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          {hasLink ? <CheckCircle className="w-4 h-4 animate-pulse" style={{ color: '#00d4ff' }} /> : <XCircle className="w-4 h-4" style={{ color: '#ff00ff' }} />}
          <span className="font-orbitron font-black text-xs tracking-widest uppercase" style={{ color: hasLink ? '#00d4ff' : '#ff00ff', textShadow: `0 0 10px ${hasLink ? '#00d4ff' : '#ff00ff'}80` }}>
            {hasLink ? 'AVAILABLE' : 'UNAVAILABLE'}
          </span>
        </div>
      </div>

      <p className="font-inter text-base text-gray-300 leading-relaxed relative z-10 font-light mt-4 mb-4">
        This apk for our internal panel users. This Apk Dumped for internal panel by PRRX team.
      </p>

      {hasLink ? (
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="mt-auto w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-orbitron font-black text-sm tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative z-10 overflow-hidden group/btn"
          style={{ background: `linear-gradient(90deg, ${color}, #00d4ff)`, color: '#000', boxShadow: `0 0 30px ${color}40` }}>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
          <Download className="w-5 h-5 relative z-10" /> <span className="relative z-10">DOWNLOAD APK</span>
        </a>
      ) : (
        <div className="mt-auto w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-orbitron font-black text-sm tracking-widest opacity-50 cursor-not-allowed bg-white/5 border border-white/10 text-gray-500 relative z-10">
          <Download className="w-5 h-5" /> NO LINK AVAILABLE
        </div>
      )}
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
    <div className="min-h-screen overflow-x-hidden relative liquid-bg">
      {/* Background Blobs */}
      <div className="absolute top-20 left-10 w-[40vw] h-[40vw] bg-[#00d4ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none blur-[100px]"></div>
      <div className="absolute bottom-20 right-10 w-[50vw] h-[50vw] bg-[#ff00ff] liquid-blob mix-blend-screen opacity-10 pointer-events-none blur-[120px]" style={{ animationDelay: '-5s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#0f172a] liquid-blob mix-blend-screen opacity-40 pointer-events-none blur-[150px]" style={{ animationDelay: '-2s', animationDuration: '25s' }}></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <div className="flex-1 max-w-7xl mx-auto px-4 pt-40 pb-20 w-full">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 font-orbitron font-bold text-[10px] tracking-widest liquid-glass shadow-[0_0_20px_rgba(0,212,255,0.2)]"
              style={{ border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
              <Gift className="w-4 h-4 animate-pulse" /> FREEBIES
            </div>
            <h1 className="font-orbitron font-black text-5xl sm:text-7xl lg:text-8xl tracking-widest text-white mb-6 glow-cyan">
              PRRX FREEBIES
            </h1>
            <p className="font-inter text-lg text-gray-300 font-light max-w-2xl mx-auto uppercase tracking-wider">FREE PANEL CREDENTIALS & APK DOWNLOADS</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-32">
              <div className="w-12 h-12 border-4 border-[#00d4ff]/20 border-t-[#ff00ff] rounded-full animate-spin shadow-[0_0_30px_rgba(0,212,255,0.5)]" />
            </div>
          ) : (
            <div className="space-y-12">
              {/* Free Panel Section */}
              <ScrollReveal variant="fadeUp">
                <div className="rounded-[40px] p-8 sm:p-12 liquid-glass" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#00d4ff]/10 border border-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                          <Smartphone className="w-6 h-6 text-[#00d4ff]" />
                        </div>
                        <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-white tracking-widest glow-cyan">FREE PANELS</h2>
                      </div>
                      <p className="font-inter text-sm text-gray-400 tracking-widest uppercase ml-16">FREE PANEL CREDENTIALS FOR OUR USERS</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FreePanelCard panel={panels.external} label="EXTERNAL PANEL" accent="#00d4ff" downloadUrl={downloadUrls.external} index={0} />
                    <FreePanelCard panel={panels.internal} label="INTERNAL PANEL" accent="#ff00ff" downloadUrl={downloadUrls.internal} index={1} />
                  </div>
                </div>
              </ScrollReveal>

              {/* V7a Apk Section */}
              <ScrollReveal variant="fadeUp" delay={0.2}>
                <div className="rounded-[40px] p-8 sm:p-12 liquid-glass" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#ff00ff]/10 border border-[#ff00ff]/30 shadow-[0_0_20px_rgba(255,0,255,0.2)]">
                          <Download className="w-6 h-6 text-[#ff00ff]" />
                        </div>
                        <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-white tracking-widest" style={{ textShadow: '0 0 30px rgba(255,0,255,0.5)' }}>V7A APK</h2>
                      </div>
                      <p className="font-inter text-sm text-gray-400 tracking-widest uppercase ml-16">INTERNAL PANEL APK DOWNLOAD</p>
                    </div>
                  </div>
                  <div className="max-w-2xl">
                    <V7aApkCard link={v7aLink} index={0} />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          )}

          {/* Refresh */}
          <div className="fixed bottom-8 right-8 z-50">
            <button onClick={load} className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/20 backdrop-blur-xl text-white hover:bg-[#00d4ff]/20 hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] group">
              <RefreshCw className="w-6 h-6 group-hover:animate-spin" />
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}