import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function DiscordBotManagement() {
  const [botUrl, setBotUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'discord_webhooks'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length > 0 && data[0].bot_dashboard_url) {
        setBotUrl(data[0].bot_dashboard_url);
      }
    } catch (e) {
      toast.error('Failed to load Bot Dashboard URL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin glow-cyan" /></div>;
  }

  if (!botUrl) {
    return (
      <div className="p-8 text-center text-slate-400 font-inter space-y-4">
        <p>Discord Bot Dashboard URL is not configured.</p>
        <p className="text-xs">Please go to <strong>Website Management &gt; Discord</strong> to configure the Render/Hosting URL for your Discord Bot.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-outfit font-extrabold text-xs text-[#06b6d4] tracking-wider mb-1">BOT MANAGEMENT CONSOLE</p>
          <p className="font-inter text-xs text-slate-400 mb-1">Accessing secure dashboard at: <span className="text-white">{botUrl}</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors" title="Reload URL Configuration">
            <RefreshCw className="w-4 h-4" />
          </button>
          <a href={botUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-[#06b6d4] transition-colors flex items-center gap-2 text-xs font-bold font-inter" title="Open in new tab">
            <ExternalLink className="w-4 h-4" /> Open Externally
          </a>
        </div>
      </div>
      
      <div className="flex-1 min-h-[600px] w-full rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[#0d1117] shadow-xl">
        <iframe 
          src={botUrl} 
          className="w-full h-full border-none min-h-[600px]"
          title="Discord Bot Dashboard"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
      </div>
    </div>
  );
}
