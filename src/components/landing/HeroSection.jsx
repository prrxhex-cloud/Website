import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Download, Eye, ShieldCheck, Crosshair, Star, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DownloadModal from '@/components/landing/DownloadModal';

export default function HeroSection() {
  const navigate = useNavigate();
  const [showDownload, setShowDownload] = useState(false);

  return (
    <section className="relative pt-12 pb-20 overflow-hidden bg-slate-50 border-b border-slate-200">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-semibold font-inter">
              <span className="pulse-dot green" />
              <span className="text-slate-700">100% Undetected Garena Anti-Cheat Bypass</span>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded">
                v5.8 Active
              </span>
            </div>

            {/* Title */}
            <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.1]">
              DOMINATE FREE FIRE WITH <br />
              <span className="text-gradient">UNDETECTED VIP CHEATS</span>
            </h1>

            {/* Description */}
            <p className="font-inter text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
              Unlock 100% Headshot Aimbot, ESP Wallhack, Location Radar, Magic Bullet & Speed Hack. 0% Ban risk with hardware ID spoofing and automatic cloud updates.
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/prices')}
                className="btn-primary-cyan btn-glow px-7 py-3.5 font-inter font-bold text-base flex items-center gap-2.5 shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Browse VIP Bundles</span>
              </button>

              <button
                onClick={() => setShowDownload(true)}
                className="btn-secondary-white px-7 py-3.5 font-inter font-bold text-base flex items-center gap-2.5 text-slate-800"
              >
                <Download className="w-5 h-5 text-[#06b6d4]" />
                <span>Download Panel</span>
              </button>
            </div>

            {/* Trust Stats Grid */}
            <div className="pt-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="space-y-0.5">
                  <div className="font-outfit font-extrabold text-2xl text-slate-900">48.5K+</div>
                  <div className="font-inter text-xs text-slate-500 font-medium">Active Grandmasters</div>
                </div>
                <div className="space-y-0.5 sm:pl-4 pt-2 sm:pt-0">
                  <div className="font-outfit font-extrabold text-2xl text-emerald-600">99.9%</div>
                  <div className="font-inter text-xs text-slate-500 font-medium">Undetected Rate</div>
                </div>
                <div className="space-y-0.5 sm:pl-4 pt-2 sm:pt-0">
                  <div className="font-outfit font-extrabold text-2xl text-slate-900">&lt; 10s</div>
                  <div className="font-inter text-xs text-slate-500 font-medium">Auto Key Delivery</div>
                </div>
                <div className="space-y-0.5 sm:pl-4 pt-2 sm:pt-0">
                  <div className="font-outfit font-extrabold text-2xl text-amber-500 flex items-center gap-1">
                    4.95 <Star className="w-4 h-4 fill-current text-amber-400" />
                  </div>
                  <div className="font-inter text-xs text-slate-500 font-medium">From 12,400+ Reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Floating Preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              
              {/* Main VIP Feature Preview Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="clean-card p-6 space-y-5 relative z-10 bg-white"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="inline-flex items-center gap-2 font-outfit font-bold text-sm text-[#06b6d4]">
                    <Crosshair className="w-4 h-4" /> VIP AIMBOT PRO v5.8
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.0 h-3.0" /> Safe Main ID
                  </span>
                </div>

                {/* Simulated HUD graphic */}
                <div className="bg-slate-900 rounded-xl p-4 text-white space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                    <span>TARGET LOCK: ACTIVE</span>
                    <span>FOV: 360°</span>
                  </div>

                  <div className="py-6 text-center space-y-2 border border-cyan-500/20 rounded-lg bg-cyan-950/20">
                    <div className="inline-block p-3 rounded-full border-2 border-cyan-400 text-cyan-400 animate-pulse">
                      <Crosshair className="w-8 h-8" />
                    </div>
                    <div className="font-outfit font-black text-sm tracking-widest text-cyan-300">
                      HEADSHOT 100% (450m)
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Smoothness Rate</span>
                      <span className="text-cyan-400 font-bold">95%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full w-[95%]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-inter text-xs text-slate-500 font-medium">Instant Activation</span>
                  <span className="font-outfit font-extrabold text-lg text-slate-900">$4.99 / Day</span>
                </div>
              </motion.div>

              {/* Floating Badge 1 */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-6 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-lg flex items-center gap-3 z-20"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-outfit font-bold text-xs text-slate-900">ESP Wallhack</div>
                  <div className="font-inter text-[10px] text-slate-500">Skeleton, Name & Distance</div>
                </div>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-6 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-lg flex items-center gap-3 z-20"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-outfit font-bold text-xs text-slate-900">UD Anti-Ban v5.8</div>
                  <div className="font-inter text-[10px] text-slate-500">Auto HWID Spoofing</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <DownloadModal open={showDownload} onClose={() => setShowDownload(false)} />
    </section>
  );
}