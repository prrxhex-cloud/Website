import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Zap, Shield } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const FALLBACK_EXTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';
const FALLBACK_INTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';

export default function DownloadModal({ open, onClose }) {
  const [externalUrl, setExternalUrl] = useState(FALLBACK_EXTERNAL);
  const [internalUrl, setInternalUrl] = useState(FALLBACK_INTERNAL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getDocs(query(collection(db, 'download_links'), where('active', '==', true))).then(snapshot => {
      const links = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const ext = links.find(l => l.type === 'external');
      const int_ = links.find(l => l.type === 'internal');
      if (ext?.url) setExternalUrl(ext.url);
      if (int_?.url) setInternalUrl(int_.url);
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
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
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