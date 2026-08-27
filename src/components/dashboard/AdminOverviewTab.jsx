import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, MessageCircle, Megaphone, Activity, Ticket, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-[24px] p-6 flex flex-col items-center justify-center gap-3 liquid-glass relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
    style={{ border: `1px solid ${color}40`, boxShadow: `0 10px 30px ${color}10, inset 0 0 20px ${color}05` }}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}></div>
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative z-10" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div className="text-center relative z-10">
      <p className="font-orbitron font-black text-3xl" style={{ color, textShadow: `0 0 15px ${color}50` }}>{value}</p>
      <p className="font-inter text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{label}</p>
    </div>
  </div>
);

export default function AdminOverviewTab() {
  const [stats, setStats] = useState({ users: 0, messages: 0, announcements: 0, conversations: 0, openTickets: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [resellersRes, msgsRes, annRes, receiptsRes] = await Promise.allSettled([
        supabase.from('resellers').select('*').limit(5),
        supabase.from('world_messages').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('id', { count: 'exact', head: true }),
        supabase.from('receipts').select('id', { count: 'exact', head: true }),
      ]);

      const usersData = resellersRes.status === 'fulfilled' ? resellersRes.value.data || [] : [];
      setRecentUsers(usersData);

      setStats({
        users: usersData.length,
        messages: msgsRes.status === 'fulfilled' ? msgsRes.value.count || 0 : 0,
        announcements: annRes.status === 'fulfilled' ? annRes.value.count || 0 : 0,
        conversations: receiptsRes.status === 'fulfilled' ? receiptsRes.value.count || 0 : 0,
        openTickets: 0
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to load system telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin glow-cyan" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBadge icon={Users} label="Total Users" value={stats.users} color="#00d4ff" />
        <StatBadge icon={MessageCircle} label="World Msgs" value={stats.messages} color="#00ff64" />
        <StatBadge icon={Megaphone} label="Broadcasts" value={stats.announcements} color="#aa44ff" />
        <StatBadge icon={Activity} label="Chats" value={stats.conversations} color="#ffaa00" />
      </div>

      {/* Support Tickets quick-link */}
      <button onClick={() => navigate('/chat')}
        className="w-full flex items-center gap-4 p-5 rounded-[24px] transition-all hover:scale-[1.01] text-left group relative overflow-hidden"
        style={{ 
          background: stats.openTickets > 0 ? 'rgba(255,170,0,0.1)' : 'rgba(0,15,35,0.4)', 
          border: `1px solid ${stats.openTickets > 0 ? 'rgba(255,170,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: stats.openTickets > 0 ? '0 10px 30px rgba(255,170,0,0.1)' : 'none'
        }}>
        <div className={`absolute inset-0 bg-gradient-to-r ${stats.openTickets > 0 ? 'from-[#ffaa00]/10 to-transparent' : 'from-[#00d4ff]/5 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10"
          style={{ background: stats.openTickets > 0 ? 'rgba(255,170,0,0.2)' : 'rgba(0,212,255,0.1)', border: `1px solid ${stats.openTickets > 0 ? 'rgba(255,170,0,0.4)' : 'rgba(0,212,255,0.2)'}` }}>
          <Ticket className="w-6 h-6" style={{ color: stats.openTickets > 0 ? '#ffaa00' : '#00d4ff' }} />
        </div>
        
        <div className="flex-1 min-w-0 relative z-10">
          <p className="font-orbitron font-black text-sm tracking-widest" style={{ color: stats.openTickets > 0 ? '#ffaa00' : '#00d4ff' }}>
            {stats.openTickets > 0 ? 'ACTION REQUIRED: SUPPORT TICKETS' : 'SUPPORT DESK'}
          </p>
          <p className="font-inter text-sm text-gray-400 mt-0.5">
            {stats.openTickets > 0 ? `${stats.openTickets} critical ticket${stats.openTickets > 1 ? 's' : ''} awaiting response.` : 'All support channels are clear.'}
          </p>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors relative z-10">
          <ArrowRight className={`w-5 h-5 ${stats.openTickets > 0 ? 'text-[#ffaa00]' : 'text-gray-400 group-hover:text-white'} transition-colors`} />
        </div>
      </button>
      
      <div className="rounded-[32px] overflow-hidden bg-black/40 border border-white/10">
        <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 bg-white/5">
          <Activity className="w-5 h-5 text-[#00d4ff]" />
          <p className="font-orbitron font-bold text-sm tracking-widest text-white">RECENT TELEMETRY (NEW REGISTRATIONS)</p>
        </div>
        
        <div className="divide-y divide-white/5">
          {recentUsers.map(u => (
            <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-xl object-cover" alt="" /> : <User className="w-5 h-5 text-[#00d4ff] opacity-80" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-orbitron font-bold text-sm text-white truncate">{u.display_name || u.full_name || 'UNNAMED_ENTITY'}</p>
                <p className="font-inter text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="font-orbitron font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest"
                  style={{ 
                    background: u.role === 'admin' ? 'rgba(255,170,0,0.1)' : 'rgba(0,212,255,0.1)', 
                    color: u.role === 'admin' ? '#ffaa00' : '#00d4ff', 
                    border: `1px solid ${u.role === 'admin' ? 'rgba(255,170,0,0.3)' : 'rgba(0,212,255,0.3)'}` 
                  }}>
                  {u.role || 'user'}
                </span>
              </div>
            </div>
          ))}
          {recentUsers.length === 0 && <div className="p-8 text-center font-orbitron text-sm tracking-widest text-gray-500">NO RECENT REGISTRATIONS</div>}
        </div>
      </div>
    </div>
  );
}
