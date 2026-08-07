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
    <div className="rounded-2xl overflow-hidden h-full"
      style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="font-orbitron font-bold text-sm text-primary tracking-wider">SERVICE STATUS</h2>
        </div>
        <button onClick={load} className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-5">
          {/* Summary badge */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl"
            style={{ background: allOnline ? 'rgba(34,197,94,0.08)' : 'rgba(234,179,8,0.08)', border: `1px solid ${allOnline ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}` }}>
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: allOnline ? '#22c55e' : '#eab308', boxShadow: `0 0 8px ${allOnline ? '#22c55e' : '#eab308'}` }} />
            <p className="font-inter text-xs font-semibold" style={{ color: allOnline ? '#22c55e' : '#eab308' }}>
              {allOnline ? 'All Systems Operational' : `${online}/${total} Services Online`}
            </p>
          </div>

          {/* Service list */}
          <div className="space-y-2">
            {services.slice(0, 6).map(s => {
              const cfg = STATUS_CFG[s.status] || STATUS_CFG.online;
              const Icon = cfg.icon;
              return (
                <div key={s.id} className="flex items-center gap-3 py-1.5">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cfg.color }} />
                  <p className="font-inter text-xs text-foreground/80 flex-1 truncate">{s.name}</p>
                  <span className="font-inter text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
              );
            })}
          </div>

          <button onClick={() => navigate('/status')}
            className="w-full mt-4 py-2 rounded-xl font-orbitron text-xs font-bold tracking-wider transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}>
            VIEW FULL STATUS
          </button>
        </div>
      )}
    </div>
  );
}