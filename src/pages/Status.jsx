import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Navbar from '@/components/landing/Navbar';
import { Globe, Cpu, Shield, Activity, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  online:      { color: '#22c55e', dot: '●', label: 'ONLINE',      icon: CheckCircle,   border: 'rgba(34,197,94,0.5)' },
  offline:     { color: '#ef4444', dot: '●', label: 'OFFLINE',     icon: XCircle,        border: 'rgba(239,68,68,0.5)' },
  maintaining: { color: '#eab308', dot: '●', label: 'MAINTAINING', icon: AlertTriangle,  border: 'rgba(234,179,8,0.5)' },
};

function ServiceCard({ service, index }) {
  const cfg = STATUS_CONFIG[service.status] || STATUS_CONFIG.online;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: '#121212',
        borderTop: `3px solid ${cfg.color}`,
        border: `1px solid rgba(255,255,255,0.06)`,
        borderTopColor: cfg.color,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron font-bold text-sm tracking-wide text-white">{service.name}</h3>
      </div>

      <div className="flex items-center gap-2">
        <span style={{ color: cfg.color, fontSize: '10px' }}>{cfg.dot}</span>
        <span className="font-orbitron font-bold text-xs tracking-widest" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      </div>

      <p className="font-inter text-xs text-gray-400 leading-relaxed flex-1">{service.description}</p>

      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
        <span className="font-inter text-xs text-gray-500">
          {service.status === 'offline' ? 'DOWNTIME ELAPSED' : service.status === 'maintaining' ? 'MAINTENANCE ELAPSED' : 'UPTIME ELAPSED'}
        </span>
        <span className="font-orbitron font-bold text-xs ml-auto" style={{ color: cfg.color }}>
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
    { label: 'TOTAL SERVICES', value: total,   color: '#ffffff' },
    { label: 'ONLINE',         value: online,  color: '#22c55e' },
    { label: 'OFFLINE',        value: offline, color: '#ef4444' },
    { label: 'MAINTAINING',    value: maintaining, color: '#eab308' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: '#0a0a0a' }}>
      <div className="relative z-10">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-orbitron text-xs font-bold tracking-widest text-cyan-400">SYSTEM STATUS</span>
            </div>
            <h1 className="font-orbitron font-black text-3xl sm:text-4xl tracking-widest text-white mb-2 glow-cyan">
              PRRX STATUS
            </h1>
            <p className="font-inter text-sm text-gray-500">REAL-TIME SERVICE AVAILABILITY AND INFRASTRUCTURE MONITORING</p>
          </motion.div>

          {/* Summary bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {summaryCards.map(card => (
              <div key={card.label} className="rounded-2xl p-5 text-center" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-orbitron font-black text-3xl mb-1" style={{ color: card.color }}>{card.value}</p>
                <p className="font-inter text-xs text-gray-500 tracking-wider">{card.label}</p>
              </div>
            ))}
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Website Status */}
              {websiteServices.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="rounded-3xl p-6 sm:p-8 mb-8" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-orbitron font-black text-xl text-white tracking-wide">Website Status</h2>
                      <p className="font-inter text-xs text-gray-500 mt-1 tracking-wider">LIVE INFRASTRUCTURE MONITORING UPLINK</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {websiteServices.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
                  </div>
                </motion.div>
              )}

              {/* Panel Status */}
              {panelServices.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="rounded-3xl p-6 sm:p-8 mb-8" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-orbitron font-black text-xl text-white tracking-wide">Panel Status</h2>
                      <p className="font-inter text-xs text-gray-500 mt-1 tracking-wider">CORE CHEATS EXECUTION AND BYPASS SERVICES</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Cpu className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {panelServices.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
                  </div>
                </motion.div>
              )}

              {/* Admin entrance */}
              <div className="text-center mt-12">
                <button onClick={() => navigate('/dashboard')}
                  className="font-inter text-xs text-gray-700 hover:text-gray-500 transition-colors tracking-widest">
                  ADMINISTRATIVE ENTRANCE PROTOCOL
                </button>
              </div>
            </>
          )}

          {/* Refresh */}
          <div className="flex justify-center mt-6">
            <button onClick={load} className="p-2 rounded-lg text-gray-500 hover:text-cyan-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}