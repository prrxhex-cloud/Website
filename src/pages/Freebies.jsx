import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '@/components/landing/Navbar';
import { Download, CheckCircle, XCircle, Calendar, User, Lock, Smartphone, Gift, RefreshCw } from 'lucide-react';

const FALLBACK_EXTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';
const FALLBACK_INTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';

function FreePanelCard({ panel, label, accent, downloadUrl, index }) {
  const isOnline = panel && panel.start_day && panel.end_day && panel.username && panel.password;
  const statusColor = isOnline ? '#22c55e' : '#ef4444';
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
      className="glass-card rounded-2xl p-6 flex flex-col gap-4"
      style={{ borderTop: `3px solid ${statusColor}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
            <Smartphone className="w-4 h-4" style={{ color: accent }} />
          </div>
          <h3 className="font-orbitron font-bold text-sm tracking-wide text-foreground">{label}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusIcon className="w-3.5 h-3.5" style={{ color: statusColor }} />
          <span className="font-orbitron font-bold text-xs tracking-widest" style={{ color: statusColor }}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {fields.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="rounded-xl p-3" style={{ background: 'rgba(0,212,255,0.03)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span className="font-inter text-xs text-muted-foreground">{f.label}</span>
              </div>
              <p className="font-orbitron font-bold text-xs truncate" style={{ color: f.value ? 'var(--foreground)' : 'rgba(180,200,220,0.3)' }}>
                {f.value || '—'}
              </p>
            </div>
          );
        })}
      </div>

      <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
        className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all hover:scale-[1.02]"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#020810' }}>
        <Download className="w-4 h-4" /> DOWNLOAD PANEL
      </a>
    </motion.div>
  );
}

function V7aApkCard({ link, index }) {
  const hasLink = !!link;
  const color = '#aa44ff';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-2xl p-6 flex flex-col gap-4 max-w-md"
      style={{ borderTop: `3px solid ${hasLink ? color : '#ef4444'}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            <Smartphone className="w-4 h-4" style={{ color }} />
          </div>
          <h3 className="font-orbitron font-bold text-sm tracking-wide text-foreground">V7a Apk</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {hasLink ? <CheckCircle className="w-3.5 h-3.5" style={{ color: '#22c55e' }} /> : <XCircle className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />}
          <span className="font-orbitron font-bold text-xs tracking-widest" style={{ color: hasLink ? '#22c55e' : '#ef4444' }}>
            {hasLink ? 'AVAILABLE' : 'UNAVAILABLE'}
          </span>
        </div>
      </div>

      <p className="font-inter text-sm text-muted-foreground leading-relaxed">
        This apk for our internal panel users. This Apk Dumped for internal panel by PRRX team.
      </p>

      {hasLink ? (
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest transition-all hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: '#020810' }}>
          <Download className="w-4 h-4" /> DOWNLOAD APK
        </a>
      ) : (
        <div className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl font-orbitron font-bold text-xs tracking-widest opacity-50"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(180,200,220,0.4)' }}>
          <Download className="w-4 h-4" /> NO LINK AVAILABLE
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
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--page-bg)' }}>
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
              <Gift className="w-3.5 h-3.5" style={{ color: '#00d4ff' }} />
              <span className="font-orbitron text-xs font-bold tracking-widest" style={{ color: '#00d4ff' }}>FREEBIES</span>
            </div>
            <h1 className="font-orbitron font-black text-3xl sm:text-4xl tracking-widest text-foreground mb-2 glow-cyan">
              PRRX FREEBIES
            </h1>
            <p className="font-inter text-sm text-muted-foreground">FREE PANEL CREDENTIALS & APK DOWNLOADS</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Free Panel Section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass rounded-3xl p-6 sm:p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-orbitron font-black text-xl text-foreground tracking-wide">Free Panel Section</h2>
                    <p className="font-inter text-xs text-muted-foreground mt-1 tracking-wider">FREE PANEL CREDENTIALS FOR OUR USERS</p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FreePanelCard panel={panels.external} label="PRRX Premium External Panel" accent="#00d4ff" downloadUrl={downloadUrls.external} index={0} />
                  <FreePanelCard panel={panels.internal} label="PRRX Premium Internal Panel" accent="#aa44ff" downloadUrl={downloadUrls.internal} index={1} />
                </div>
              </motion.div>

              {/* V7a Apk Section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass rounded-3xl p-6 sm:p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-orbitron font-black text-xl text-foreground tracking-wide">V7a Apk</h2>
                    <p className="font-inter text-xs text-muted-foreground mt-1 tracking-wider">INTERNAL PANEL APK DOWNLOAD</p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(170,68,255,0.08)', border: '1px solid rgba(170,68,255,0.15)' }}>
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <V7aApkCard link={v7aLink} index={0} />
              </motion.div>
            </>
          )}

          {/* Refresh */}
          <div className="flex justify-center mt-6">
            <button onClick={load} className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}