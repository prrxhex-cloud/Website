import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Zap, Shield, Smartphone, Rocket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePwa } from '@/context/PwaContext';

import { downloadMesh } from '@/utils/downloadMesh';

const FALLBACK_EXTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';
const FALLBACK_INTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';

export default function DownloadModal({ open, onClose }) {
  const [externalUrl, setExternalUrl] = useState(FALLBACK_EXTERNAL);
  const [internalUrl, setInternalUrl] = useState(FALLBACK_INTERNAL);
  const [launcherUrl, setLauncherUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [fastestMirror, setFastestMirror] = useState(null);
  const { promptInstall, isInstalled } = usePwa();

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    Promise.allSettled([
      supabase.from('download_links').select('*').eq('active', true),
      downloadMesh.getFastestMirror()
    ]).then(([resResult, mirrorResult]) => {
      if (resResult.status === 'fulfilled' && resResult.value?.data) {
        const links = resResult.value.data;
        const ext = links.find(l => l.type === 'external' || l.panel_type === 'external');
        const int_ = links.find(l => l.type === 'internal' || l.panel_type === 'internal');
        const laun = links.find(l => l.type === 'launcher' || l.panel_type === 'launcher');
        if (ext?.url) setExternalUrl(ext.url);
        if (int_?.url) setInternalUrl(int_.url);
        if (laun?.url) setLauncherUrl(laun.url);
      }
      if (mirrorResult.status === 'fulfilled' && mirrorResult.value) {
        setFastestMirror(mirrorResult.value);
      }
    }).catch(e => console.error(e)).finally(() => setLoading(false));
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 24 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl p-8 relative"
            style={{
              background: 'rgba(0,8,28,0.97)',
              border: '1px solid rgba(0,212,255,0.2)',
              boxShadow: '0 0 80px rgba(0,212,255,0.12), 0 24px 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* Close */}
            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                <Download className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-orbitron font-black text-xl tracking-widest" style={{ color: '#00d4ff' }}>
                CHOOSE YOUR PANEL
              </h2>
              <p className="font-inter text-xs text-muted-foreground mt-1">Select the version you have a license for</p>

              {/* High Availability Mirror Status */}
              {fastestMirror && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Mesh Route: {fastestMirror.name} ({fastestMirror.ping}ms) · SHA-256 Verified</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* PRRX Launcher */}
                {launcherUrl && (
                  <motion.a
                    href={launcherUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(245,158,11,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(200,100,0,0.08))',
                      border: '1px solid rgba(245,158,11,0.35)',
                      boxShadow: '0 0 24px rgba(245,158,11,0.1)',
                    }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)' }}>
                      <Rocket className="w-5 h-5" style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-orbitron font-bold text-sm tracking-wider" style={{ color: '#f59e0b' }}>
                        🚀 PRRX Launcher (PC Desktop)
                      </p>
                      <p className="font-inter text-xs text-muted-foreground mt-0.5">
                        Download the Desktop App to access all panels
                      </p>
                    </div>
                    <Download className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
                  </motion.a>
                )}

                {/* External Panel */}
                <motion.a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(0,212,255,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,100,200,0.08))',
                    border: '1px solid rgba(0,212,255,0.35)',
                    boxShadow: '0 0 24px rgba(0,212,255,0.1)',
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)' }}>
                    <Zap className="w-5 h-5" style={{ color: '#00d4ff' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-orbitron font-bold text-sm tracking-wider" style={{ color: '#00d4ff' }}>
                      ⚡ Premium External Panel
                    </p>
                    <p className="font-inter text-xs text-muted-foreground mt-0.5">
                      All FF Versions · Aimbot · ESP · No-Recoil
                    </p>
                  </div>
                  <Download className="w-4 h-4 flex-shrink-0" style={{ color: '#00d4ff' }} />
                </motion.a>

                {/* Internal Panel */}
                <motion.a
                  href={internalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(170,68,255,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(170,68,255,0.12), rgba(100,0,200,0.08))',
                    border: '1px solid rgba(170,68,255,0.35)',
                    boxShadow: '0 0 24px rgba(170,68,255,0.1)',
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(170,68,255,0.15)', border: '1px solid rgba(170,68,255,0.4)' }}>
                    <Shield className="w-5 h-5" style={{ color: '#aa44ff' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-orbitron font-bold text-sm tracking-wider" style={{ color: '#aa44ff' }}>
                      🔥 Premium Internal Panel
                    </p>
                    <p className="font-inter text-xs text-muted-foreground mt-0.5">
                      V7a Apk · Chams · God Mode · Repair Menu
                    </p>
                  </div>
                  <Download className="w-4 h-4 flex-shrink-0" style={{ color: '#aa44ff' }} />
                </motion.a>

                {/* Web App Desktop & Mobile Direct Install */}
                {!isInstalled && (
                  <motion.div
                    onClick={() => {
                      onClose();
                      promptInstall();
                    }}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(6,182,212,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(2,132,199,0.1))',
                      border: '1px solid rgba(6,182,212,0.4)',
                      boxShadow: '0 0 24px rgba(6,182,212,0.15)',
                    }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.5)' }}>
                      <Smartphone className="w-5 h-5 text-[#06b6d4]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-orbitron font-bold text-sm tracking-wider text-[#06b6d4]">
                        📲 Web App (PC Desktop & Phone)
                      </p>
                      <p className="font-inter text-xs text-muted-foreground mt-0.5">
                        Install as native app on PC / Android / iOS
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-[#06b6d4] text-white shrink-0">
                      INSTALL
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            <p className="font-inter text-xs text-muted-foreground text-center mt-6">
              🔒 You need a valid license key to use the panel
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}