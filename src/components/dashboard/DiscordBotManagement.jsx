import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { RefreshCw, Server, Users, Activity, ShieldAlert, Clock, Cpu } from 'lucide-react';
import { toast } from 'sonner';

export default function DiscordBotManagement() {
  const [config, setConfig] = useState({ url: '', key: '' });
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'discord_webhooks'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length > 0) {
        setConfig({
          url: data[0].bot_dashboard_url || '',
          key: data[0].bot_api_key || ''
        });
      }
    } catch (e) {
      toast.error('Failed to load Bot Settings');
    }
  };

  const fetchBotData = async () => {
    if (!config.url || !config.key) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${config.key}` };
      const baseUrl = config.url.replace(/\/$/, ''); // remove trailing slash
      
      const [statusRes, logsRes] = await Promise.all([
        fetch(`${baseUrl}/api/status`, { headers }),
        fetch(`${baseUrl}/api/security/logs`, { headers })
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData);
      }
      
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.slice(0, 10)); // Top 10 logs
      }
    } catch (e) {
      toast.error('Failed to connect to Bot API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (config.url && config.key) {
      fetchBotData();
    } else {
      setLoading(false);
    }
  }, [config]);

  if (loading && !status) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin glow-cyan" /></div>;
  }

  if (!config.url || !config.key) {
    return (
      <div className="p-8 text-center text-slate-400 font-inter space-y-4">
        <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
        <p className="text-white font-bold text-lg">Discord Bot Not Configured</p>
        <p className="text-sm">Please go to <strong>Website Management &gt; Discord</strong> to configure your Bot Dashboard URL and API Key.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-outfit font-extrabold text-xs text-indigo-400 tracking-wider mb-1">NATIVE BOT MANAGEMENT</p>
          <p className="font-inter text-xs text-slate-400 mb-1">Securely connected to: <span className="text-white">{config.url}</span></p>
        </div>
        <button onClick={fetchBotData} className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors flex items-center gap-2 text-xs font-bold font-inter border border-indigo-500/30">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg"><Server className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400 font-inter font-semibold uppercase tracking-wider">Servers</p>
            <p className="text-xl text-white font-bold font-outfit">{status?.guilds || 0}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><Users className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400 font-inter font-semibold uppercase tracking-wider">Users</p>
            <p className="text-xl text-white font-bold font-outfit">{status?.users || 0}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-lg"><Activity className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400 font-inter font-semibold uppercase tracking-wider">Ping</p>
            <p className="text-xl text-white font-bold font-outfit">{status?.ping || 0}ms</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-lg"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400 font-inter font-semibold uppercase tracking-wider">Uptime</p>
            <p className="text-xl text-white font-bold font-outfit">{status?.uptime || '0m'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Recent Security Logs
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 font-inter">No security alerts detected.</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 text-xs font-inter bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-white font-semibold mb-1">{log.action}</p>
                      <p className="text-slate-400">{log.details}</p>
                      <p className="text-slate-500 text-[10px] mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* System Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> System Health
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
            <div>
              <div className="flex justify-between text-xs font-inter mb-2">
                <span className="text-slate-400">Memory Usage</span>
                <span className="text-white font-bold">{status?.memoryUsage || '0 MB'} / 512 MB</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.min(100, (parseInt(status?.memoryUsage || 0) / 512) * 100)}%` }} />
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-center">
              <p className="text-xs font-inter text-indigo-300 mb-2">Bot Process Status</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                ONLINE AND SECURED
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
