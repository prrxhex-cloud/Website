import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Download, Eye, ShieldCheck, Crosshair, Star, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFormattedPrices } from '@/lib/currency';
import DownloadModal from '@/components/landing/DownloadModal';
import logoImg from '@/assets/logo.jpeg';
import heroBooyahImg from '@/assets/hero_booyah.png';

export default function HeroSection() {
  const navigate = useNavigate();
  const [showDownload, setShowDownload] = useState(false);
  const [heroHudUrl, setHeroHudUrl] = useState(() => {
    return localStorage.getItem('prrx_hero_hud_url') || '';
  });

  const [dayPriceUsd, setDayPriceUsd] = useState(() => {
    const cached = localStorage.getItem('prrx_cached_plans');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const ext1Day = parsed.external?.find(p => p.label?.toLowerCase() === '1 day') || parsed.external?.[0];
        if (ext1Day?.lkr) return getFormattedPrices(ext1Day.lkr).usd;
      } catch (e) {}
    }
    return '$0.49';
  });

  useEffect(() => {
    const fetchHeroHud = async () => {
      try {
        const snap = await getDoc(doc(db, 'public_settings', 'panel_images'));
        if (snap.exists() && snap.data().hero_hud_url) {
          const url = snap.data().hero_hud_url;
          setHeroHudUrl(url);
          localStorage.setItem('prrx_hero_hud_url', url);
        }
      } catch (err) {
        console.error('Error fetching hero HUD image:', err);
      }
    };

    const fetchDayPrice = async () => {
      try {
        const snap = await getDocs(collection(db, 'price_plans'));
        if (!snap.empty) {
          const plans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const oneDayPlan = plans.find(p => p.label?.toLowerCase() === '1 day' || p.days?.toLowerCase()?.includes('1 day')) || plans[0];
          if (oneDayPlan?.lkr) {
            setDayPriceUsd(getFormattedPrices(oneDayPlan.lkr).usd);
          }
        }
      } catch (err) {
        console.error('Error fetching 1 Day price plan:', err);
      }
    };

    fetchHeroHud();
    fetchDayPrice();
  }, []);

  return (
    <section className="relative pt-12 pb-20 overflow-hidden font-inter transition-colors duration-300">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Logo Badge & Status Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full shadow-md text-xs font-semibold">
                <span className="pulse-dot green" />
                <span className="text-[var(--text-primary)]">100% Undetected Garena Anti-Cheat Bypassed</span>
                <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded">
                  v5.8 Active
                </span>
              </div>
            </div>

            {/* Main Brand Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="PRRX Logo" className="w-12 h-12 object-contain rounded-2xl border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]" />
                <span className="font-outfit font-black text-2xl tracking-widest text-[#06b6d4]">PRRX CHEATS STORE</span>
              </div>
              <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-heading)] tracking-tight leading-[1.1]">
                DOMINATE FREE FIRE WITH <br />
                <span className="text-gradient">UNDETECTED VIP CHEATS</span>
              </h1>
            </div>

            {/* Description */}
            <p className="font-inter text-[var(--text-muted)] text-base sm:text-lg leading-relaxed max-w-2xl">
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
                className="btn-secondary-white px-7 py-3.5 font-inter font-bold text-base flex items-center gap-2.5"
              >
                <Download className="w-5 h-5 text-[#06b6d4]" />
                <span>Download Panel</span>
              </button>
            </div>

            {/* Trust Stats Grid */}
            <div className="pt-4">
              <div className="clean-card p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-color)]">
                <div className="space-y-0.5">
                  <div className="font-outfit font-extrabold text-2xl text-[var(--text-heading)]">48.5K+</div>
                  <div className="font-inter text-xs text-[var(--text-muted)] font-medium">Active Grandmasters</div>
                </div>
                <div className="space-y-0.5 sm:pl-4 pt-2 sm:pt-0">
                  <div className="font-outfit font-extrabold text-2xl text-emerald-500">99.9%</div>
                  <div className="font-inter text-xs text-[var(--text-muted)] font-medium">Undetected Rate</div>
                </div>
                <div className="space-y-0.5 sm:pl-4 pt-2 sm:pt-0">
                  <div className="font-outfit font-extrabold text-2xl text-[var(--text-heading)]">&lt; 10s</div>
                  <div className="font-inter text-xs text-[var(--text-muted)] font-medium">Auto Key Delivery</div>
                </div>
                <div className="space-y-0.5 sm:pl-4 pt-2 sm:pt-0">
                  <div className="font-outfit font-extrabold text-2xl text-amber-500 flex items-center gap-1">
                    4.95 <Star className="w-4 h-4 fill-current text-amber-400" />
                  </div>
                  <div className="font-inter text-xs text-[var(--text-muted)] font-medium">From 12,400+ Reviews</div>
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
                className="clean-card p-6 space-y-5 relative z-10"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <div className="inline-flex items-center gap-2 font-outfit font-bold text-sm text-[#06b6d4]">
                    <Crosshair className="w-4 h-4" /> VIP AIMBOT PRO v5.8
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.0 h-3.0" /> Safe Main ID
                  </span>
                </div>

                {/* Simulated HUD graphic / Booyah Image */}
                <div className="bg-slate-950 rounded-xl p-3 text-white space-y-3 relative overflow-hidden border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                    <span>TARGET LOCK: ACTIVE</span>
                    <span>FOV: 360°</span>
                  </div>

                  <div className="rounded-lg overflow-hidden border border-cyan-500/30 shadow-md aspect-video relative group">
                    <img 
                      src={heroHudUrl || heroBooyahImg} 
                      alt="Hero Gameplay Preview" 
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300 font-semibold">
                      <span>Smoothness Rate</span>
                      <span className="text-cyan-400 font-bold">95%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full w-[95%]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-inter text-xs text-[var(--text-muted)] font-medium">Instant Activation</span>
                  <span className="font-outfit font-extrabold text-lg text-[var(--text-heading)]">{dayPriceUsd} / Day</span>
                </div>
              </motion.div>

              {/* Floating Badge 1 */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-6 clean-card p-3.5 shadow-xl flex items-center gap-3 z-20"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-[#06b6d4] flex items-center justify-center border border-cyan-500/30">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-outfit font-bold text-xs text-[var(--text-heading)]">ESP Wallhack</div>
                  <div className="font-inter text-[10px] text-[var(--text-muted)]">Skeleton, Name & Distance</div>
                </div>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-6 clean-card p-3.5 shadow-xl flex items-center gap-3 z-20"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-outfit font-bold text-xs text-[var(--text-heading)]">UD Anti-Ban v5.8</div>
                  <div className="font-inter text-[10px] text-[var(--text-muted)]">Auto HWID Spoofing</div>
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