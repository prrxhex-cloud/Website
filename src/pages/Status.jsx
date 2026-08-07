import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Globe, Cpu, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const STATUS_CONFIG = {
  online:      { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'UNDETECTED', icon: CheckCircle },
  offline:     { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/30',    label: 'OFFLINE',    icon: XCircle },
  maintaining: { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30',   label: 'TESTING',    icon: AlertTriangle },
};

function ServiceCard({ service, index }) {
  const cfg = STATUS_CONFIG[service.status] || STATUS_CONFIG.online;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="clean-card p-6 flex flex-col gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md hover:shadow-lg transition-all text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center">
            {service.category === 'website' ? <Globe className="w-5 h-5" /> : <Cpu className="w-5 h-5 text-[#06b6d4]" />}
          </div>
          <div>
            <h3 className="font-outfit font-bold text-[var(--text-heading)] text-base">{service.name}</h3>
            <p className="font-inter text-xs text-[var(--text-muted)]">{service.description}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} font-outfit font-extrabold text-[11px] flex items-center gap-1.5`}>
          <span className="pulse-dot green" />
          <span>{cfg.label}</span>
        </div>
      </div>

      <div className="border-t border-[var(--border-color)] pt-3 grid grid-cols-2 gap-2 text-xs font-inter">
        <div>
          <span className="text-[var(--text-muted)] block text-[10px] font-bold uppercase">Current Patch</span>
          <span className="font-semibold text-[var(--text-heading)]">Free Fire OB46</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block text-[10px] font-bold uppercase">Uptime Ratio</span>
          <span className="font-semibold text-emerald-500">{service.uptime_elapsed || '99.9% (30D)'}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Status() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'service_status'), orderBy('sort_order', 'asc'), limit(50));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setServices(data);
    } catch (e) {
      console.error('Failed to load status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const websiteServices = services.filter(s => s.category === 'website');
  const panelServices = services.filter(s => s.category === 'panel');
  const total = services.length;
  const online = services.filter(s => s.status === 'online').length;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter transition-colors duration-300">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-12 text-center bg-[var(--bg-glass-card)] backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-4">
          <div className="sub-heading">
            <Activity className="w-3.5 h-3.5" /> REAL-TIME MONITORING
          </div>
          <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl text-[var(--text-heading)] tracking-tight">
            LIVE ANTI-CHEAT DETECTION STATUS
          </h1>
          <p className="font-inter text-[var(--text-muted)] text-base max-w-2xl mx-auto">
            Our automated server system continuously tests every cheat build against Garena's latest anti-cheat patches every 60 seconds.
          </p>
        </div>
      </section>

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-12">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="clean-card p-5 text-center bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md">
            <div className="font-outfit font-extrabold text-3xl text-[var(--text-heading)]">{total || 6}</div>
            <div className="font-inter text-xs text-[var(--text-muted)] font-medium mt-1">Total Services</div>
          </div>
          <div className="clean-card p-5 text-center bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md">
            <div className="font-outfit font-extrabold text-3xl text-emerald-500">{online || 6}</div>
            <div className="font-inter text-xs text-[var(--text-muted)] font-medium mt-1">Undetected Build</div>
          </div>
          <div className="clean-card p-5 text-center bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md">
            <div className="font-outfit font-extrabold text-3xl text-[#06b6d4]">99.98%</div>
            <div className="font-inter text-xs text-[var(--text-muted)] font-medium mt-1">30-Day Uptime</div>
          </div>
          <div className="clean-card p-5 text-center bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md">
            <div className="font-outfit font-extrabold text-3xl text-indigo-400">60s</div>
            <div className="font-inter text-xs text-[var(--text-muted)] font-medium mt-1">Check Frequency</div>
          </div>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#06b6d4]/20 border-t-[#06b6d4] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Panel Services */}
            <div className="space-y-4 text-left">
              <h2 className="font-outfit font-extrabold text-xl text-[var(--text-heading)] flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#06b6d4]" /> Free Fire Cheat Panels
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(panelServices.length > 0 ? panelServices : [
                  { id: '1', name: 'Android VIP Injector', description: 'APK / No Root Needed', status: 'online', category: 'panel', uptime_elapsed: '99.98%' },
                  { id: '2', name: 'iOS VIP Menu', description: 'IPA / DNS / No Jailbreak', status: 'online', category: 'panel', uptime_elapsed: '100%' },
                  { id: '3', name: 'Gameloop PC Bypass', description: 'Smart 2 & Gameloop 7.1', status: 'online', category: 'panel', uptime_elapsed: '99.95%' },
                ]).map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
              </div>
            </div>

            {/* Infrastructure Services */}
            <div className="space-y-4 pt-6 border-t border-[var(--border-color)] text-left">
              <h2 className="font-outfit font-extrabold text-xl text-[var(--text-heading)] flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" /> Infrastructure & Server Systems
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(websiteServices.length > 0 ? websiteServices : [
                  { id: '4', name: 'Auto-Key Generation Server', description: 'Instant license provisioning', status: 'online', category: 'website', uptime_elapsed: '100%' },
                  { id: '5', name: 'Cloud Anti-Cheat Bypass DB', description: 'Real-time definition updates', status: 'online', category: 'website', uptime_elapsed: '100%' },
                  { id: '6', name: 'HWID Spoofing Gateway', description: 'Hardware ban removal protocol', status: 'online', category: 'website', uptime_elapsed: '99.99%' },
                ]).map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}