import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ScrollReveal from '@/components/effects/ScrollReveal';
import { Globe, Cpu, Shield, Activity, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  online:      { color: '#22c55e', dot: '●', label: 'ONLINE',      icon: CheckCircle,   border: 'rgba(34,197,94,0.5)' },
  offline:     { color: '#ff00ff', dot: '●', label: 'OFFLINE',     icon: XCircle,        border: 'rgba(255,0,255,0.5)' },
  maintaining: { color: '#ffaa00', dot: '●', label: 'MAINTAINING', icon: AlertTriangle,  border: 'rgba(255,170,0,0.5)' },
};

function ServiceCard({ service, index }) {
  const cfg = STATUS_CONFIG[service.status] || STATUS_CONFIG.online;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: `2px solid ${cfg.color}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 10px 40px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.02)`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="flex items-center justify-between relative z-10">
        <h3 className="font-orbitron font-black text-sm tracking-widest text-white uppercase">{service.name}</h3>
      </div>

      <div className="flex items-center gap-2 relative z-10">
        <span className="animate-pulse shadow-[0_0_10px_currentColor]" style={{ color: cfg.color, fontSize: '10px' }}>{cfg.dot}</span>
        <span className="font-orbitron font-black text-xs tracking-widest shadow-[0_0_10px_currentColor]" style={{ color: cfg.color, textShadow: `0 0 10px ${cfg.color}80` }}>
          {cfg.label}
        </span>
      </div>

      <p className="font-inter text-sm text-gray-400 leading-relaxed flex-1 relative z-10">{service.description}</p>

      <div className="flex items-center gap-3 pt-4 border-t border-white/10 relative z-10">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}40`, boxShadow: `0 0 15px ${cfg.color}20` }}>
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>
        <span className="font-inter text-xs font-semibold text-gray-500 uppercase tracking-widest">
          {service.status === 'offline' ? 'Downtime' : service.status === 'maintaining' ? 'Maintenance' : 'Uptime'}
        </span>
        <span className="font-orbitron font-black text-sm ml-auto bg-white/5 px-3 py-1 rounded-full border border-white/10" style={{ color: cfg.color }}>
          {service.uptime_elapsed || '0s'}
        </span>
      </div>
    </motion.div>
  );
}

export default function Status() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  const offline = services.filter(s => s.status === 'offline').length;
  const maintaining = services.filter(s => s.status === 'maintaining').length;

  const summaryCards = [
    { label: 'TOTAL SERVICES', value: total,   color: '#00d4ff' },
    { label: 'ONLINE',         value: online,  color: '#22c55e' },
    { label: 'OFFLINE',        value: offline, color: '#ff00ff' },
    { label: 'MAINTAINING',    value: maintaining, color: '#ffaa00' },
  ];

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
              <Activity className="w-4 h-4 animate-pulse" /> SYSTEM STATUS
            </div>
            <h1 className="font-orbitron font-black text-5xl sm:text-7xl lg:text-8xl tracking-widest text-white mb-6 glow-cyan">
              PRRX STATUS
            </h1>
            <p className="font-inter text-lg text-gray-300 font-light max-w-2xl mx-auto uppercase tracking-wider">REAL-TIME SERVICE AVAILABILITY AND INFRASTRUCTURE MONITORING</p>
          </motion.div>

          {/* Summary bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {summaryCards.map(card => (
              <div key={card.label} className="rounded-3xl p-6 text-center liquid-glass group hover:bg-white/10 transition-colors duration-300" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ background: `${card.color}15`, boxShadow: `0 0 20px ${card.color}30` }}>
                  <Activity className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <p className="font-orbitron font-black text-4xl sm:text-5xl mb-2" style={{ color: card.color, textShadow: `0 0 20px ${card.color}80` }}>{card.value}</p>
                <p className="font-orbitron text-[10px] font-bold text-gray-400 tracking-widest uppercase">{card.label}</p>
              </div>
            ))}
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-32">
              <div className="w-12 h-12 border-4 border-[#00d4ff]/20 border-t-[#ff00ff] rounded-full animate-spin shadow-[0_0_30px_rgba(0,212,255,0.5)]" />
            </div>
          ) : (
            <div className="space-y-12">
              {/* Website Status */}
              {websiteServices.length > 0 && (
                <ScrollReveal variant="fadeUp">
                  <div className="rounded-[40px] p-8 sm:p-12 liquid-glass" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#00d4ff]/10 border border-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                            <Globe className="w-6 h-6 text-[#00d4ff]" />
                          </div>
                          <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-white tracking-widest glow-cyan">WEBSITE STATUS</h2>
                        </div>
                        <p className="font-inter text-sm text-gray-400 tracking-widest uppercase ml-16">LIVE INFRASTRUCTURE MONITORING UPLINK</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {websiteServices.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Panel Status */}
              {panelServices.length > 0 && (
                <ScrollReveal variant="fadeUp" delay={0.2}>
                  <div className="rounded-[40px] p-8 sm:p-12 liquid-glass" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#ff00ff]/10 border border-[#ff00ff]/30 shadow-[0_0_20px_rgba(255,0,255,0.2)]">
                            <Cpu className="w-6 h-6 text-[#ff00ff]" />
                          </div>
                          <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-white tracking-widest" style={{ textShadow: '0 0 30px rgba(255,0,255,0.5)' }}>PANEL STATUS</h2>
                        </div>
                        <p className="font-inter text-sm text-gray-400 tracking-widest uppercase ml-16">CORE CHEATS EXECUTION AND BYPASS SERVICES</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {panelServices.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Admin entrance */}
              <div className="text-center mt-20 pb-10">
                <button onClick={() => navigate('/dashboard')}
                  className="font-orbitron font-black text-[10px] tracking-[0.3em] text-gray-600 hover:text-[#ff00ff] transition-all duration-300 uppercase hover:shadow-[0_0_20px_rgba(255,0,255,0.5)] px-6 py-3 rounded-full border border-transparent hover:border-[#ff00ff]/30">
                  ADMINISTRATIVE ENTRANCE PROTOCOL
                </button>
              </div>
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