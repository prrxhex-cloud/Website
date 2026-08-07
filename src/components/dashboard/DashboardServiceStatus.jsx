import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const STATUS_CFG = {
  online:      { color: '#22c55e', icon: CheckCircle,   label: 'Online' },
  offline:     { color: '#ef4444', icon: XCircle,        label: 'Offline' },
  maintaining: { color: '#eab308', icon: AlertTriangle,  label: 'Maintaining' },
};

export default function DashboardServiceStatus() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'service_status'), orderBy('sort_order', 'asc'), limit(20));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setServices(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const online = services.filter(s => s.status === 'online').length;
  const total = services.length;
  const allOnline = online === total && total > 0;

  return (
    <div className="rounded-[32px] overflow-hidden h-full liquid-glass border border-white/10 relative flex flex-col"
      style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

      <div className="px-6 py-5 border-b flex items-center justify-between relative z-10" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center relative group"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="absolute inset-0 rounded-xl bg-[#22c55e] blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <Activity className="w-5 h-5 text-[#22c55e] relative z-10" />
          </div>
          <h2 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase">SERVICE STATUS</h2>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:rotate-180 duration-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#22c55e]/30 border-t-[#22c55e] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6">
            {/* Summary badge */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl relative overflow-hidden"
              style={{ background: allOnline ? 'rgba(34,197,94,0.08)' : 'rgba(234,179,8,0.08)', border: `1px solid ${allOnline ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5"></div>
              <span className="w-3 h-3 rounded-full flex-shrink-0 animate-pulse relative z-10" style={{ background: allOnline ? '#22c55e' : '#eab308', boxShadow: `0 0 10px ${allOnline ? '#22c55e' : '#eab308'}` }} />
              <p className="font-orbitron text-sm font-bold tracking-wider relative z-10" style={{ color: allOnline ? '#22c55e' : '#eab308' }}>
                {allOnline ? 'ALL SYSTEMS OPERATIONAL' : `${online}/${total} SERVICES ONLINE`}
              </p>
            </div>

            {/* Service list */}
            <div className="space-y-3">
              {services.slice(0, 6).map(s => {
                const cfg = STATUS_CFG[s.status] || STATUS_CFG.online;
                const Icon = cfg.icon;
                return (
                  <div key={s.id} className="flex items-center gap-4 py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                    <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" style={{ color: cfg.color }} />
                    <p className="font-inter text-sm text-gray-300 flex-1 truncate group-hover:text-white transition-colors">{s.name}</p>
                    <span className="font-orbitron text-xs font-bold tracking-wider" style={{ color: cfg.color, textShadow: `0 0 10px ${cfg.color}40` }}>{cfg.label.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>

            <button onClick={() => navigate('/status')}
              className="w-full mt-6 py-3.5 rounded-2xl font-orbitron text-xs font-bold tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group/btn relative overflow-hidden"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
              <div className="absolute inset-0 bg-[#00d4ff]/10 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
              <span className="relative z-10 glow-cyan">VIEW FULL STATUS</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}