import React, { useState, useEffect } from 'react';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Download, Shield, Zap, CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const FALLBACK_EXTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';
const FALLBACK_INTERNAL = 'https://github.com/AhmadhZahidh/panel-update/raw/main/PRRX%20HEX.rar';

const features = [
  'Silent Aim + Aimbot Range',
  'Teleport V2 + Fly Hack',
  'Auto Spawn Kill',
  'ESP Menu + Speed Hack',
  'Version Hack Included',
  '3 Min Timer System',
];

export default function DownloadSection() {
  const [externalUrl, setExternalUrl] = useState(FALLBACK_EXTERNAL);
  const [internalUrl, setInternalUrl] = useState(FALLBACK_INTERNAL);
  const [externalLabel, setExternalLabel] = useState('⚡ DOWNLOAD EXTERNAL PANEL');
  const [internalLabel, setInternalLabel] = useState('🔥 DOWNLOAD INTERNAL PANEL');

  useEffect(() => {
    getDocs(query(collection(db, 'download_links'), where('active', '==', true))).then(snapshot => {
      const links = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const ext = links.find(l => l.type === 'external');
      const int_ = links.find(l => l.type === 'internal');
      if (ext) { setExternalUrl(ext.url); if (ext.label) setExternalLabel(ext.label); }
      if (int_) { setInternalUrl(int_.url); if (int_.label) setInternalLabel(int_.label); }
    }).catch(() => {});
  }, []);

  return (
    <section id="download" className="py-20 bg-slate-50 border-b border-slate-200 font-inter">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <ScrollReveal variant="zoomIn" className="text-center mb-12 space-y-2">
          <div className="sub-heading">PREMIUM RELEASE — BETA X V7A</div>
          <h2 className="font-outfit font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight">
            DOWNLOAD <span className="text-[#06b6d4]">PRRX PANELS</span>
          </h2>
          <p className="font-inter text-slate-600 text-sm max-w-xl mx-auto">
            Download PRRX HEX Premium now. #1 External & Internal panels, full feature suite. Join thousands of elite Grandmaster players.
          </p>
        </ScrollReveal>

        {/* Main download card */}
        <div className="clean-card p-8 sm:p-12 bg-white border border-slate-200 rounded-3xl max-w-4xl mx-auto mb-12 shadow-md">
          <div className="grid sm:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#06b6d4]">
                  <Download className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-outfit font-extrabold text-2xl text-slate-900">PRRX HEX VIP</h3>
                  <p className="font-inter text-xs text-[#06b6d4] font-bold">Beta X V7A · Free Fire Bypass</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-xs font-inter text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-center">
              <a
                href={externalUrl}
                className="btn-primary-cyan btn-glow py-4 px-6 rounded-2xl font-inter font-bold text-xs flex items-center justify-center gap-3 shadow-md w-full"
              >
                <Download className="w-5 h-5" /> <span>{externalLabel}</span>
              </a>

              <a
                href={internalUrl}
                className="py-4 px-6 rounded-2xl font-inter font-bold text-xs flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 text-white shadow-md w-full transition-colors"
              >
                <Download className="w-5 h-5" /> <span>{internalLabel}</span>
              </a>

              <div className="flex items-center justify-center gap-6 pt-4 text-xs font-inter text-slate-500 font-bold border-t border-slate-100">
                <span className="flex items-center gap-1 text-emerald-600"><Shield className="w-4 h-4" /> 100% Undetected</span>
                <span className="flex items-center gap-1 text-amber-600"><Zap className="w-4 h-4" /> Instant Setup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { val: '12K+', label: 'Active Users' },
            { val: 'V7A', label: 'Latest Build' },
            { val: '99.9%', label: 'Undetected Uptime' },
          ].map((s) => (
            <div key={s.label} className="clean-card p-6 bg-white border border-slate-200 rounded-3xl text-center space-y-1">
              <div className="font-outfit font-extrabold text-3xl text-slate-900">{s.val}</div>
              <div className="font-inter text-xs text-slate-500 font-bold uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}