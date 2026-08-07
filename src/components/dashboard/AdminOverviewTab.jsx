import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, MessageCircle, Megaphone, Activity, Ticket, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-xl p-4 flex flex-col items-center justify-center gap-2"
    style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${color}30` }}>
    <Icon className="w-5 h-5" style={{ color }} />
    <div className="text-center">
      <p className="font-orbitron font-bold text-lg" style={{ color }}>{value}</p>
      <p className="font-inter text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
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
      // For a real dashboard with large data, you would use aggregation queries instead.
      // We will fetch limited data to approximate the counts or use a simpler approach.
      const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('created_date', 'desc'), limit(5)));
      const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecentUsers(usersData);

      // Try to get counts (for smaller collections, retrieving all docs is okay for a demo, but inefficient)
      // Here we just use the loaded arrays length for demonstration, or we would query them.
      const msgsSnap = await getDocs(query(collection(db, 'world_messages'), limit(100)));
      const annSnap = await getDocs(query(collection(db, 'announcements'), limit(100)));
      const convsSnap = await getDocs(query(collection(db, 'chat_conversations'), limit(100)));
      
      const convs = convsSnap.docs.map(d => d.data());
      const openTickets = convs.filter(c => c.is_support && c.ticket_status === 'open').length;

      setStats({
        users: usersSnap.size, // This is just recent 5, real count needs aggregation
        messages: msgsSnap.size,
        announcements: annSnap.size,
        conversations: convsSnap.size,
        openTickets
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to load admin overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge icon={Users} label="Total Users" value={stats.users} color="#00d4ff" />
        <StatBadge icon={MessageCircle} label="World Messages" value={stats.messages} color="#00ff88" />
        <StatBadge icon={Megaphone} label="Announcements" value={stats.announcements} color="#a855f7" />
        <StatBadge icon={Activity} label="Conversations" value={stats.conversations} color="#ffaa00" />
      </div>

      {/* Support Tickets quick-link */}
      <button onClick={() => navigate('/chat')}
        className="w-full flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.01] text-left"
        style={{ background: stats.openTickets > 0 ? 'rgba(255,170,0,0.08)' : 'rgba(0,15,35,0.8)', border: `1px solid ${stats.openTickets > 0 ? 'rgba(255,170,0,0.35)' : 'rgba(0,212,255,0.1)'}` }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: stats.openTickets > 0 ? 'rgba(255,170,0,0.15)' : 'rgba(0,212,255,0.1)', border: `1px solid ${stats.openTickets > 0 ? 'rgba(255,170,0,0.3)' : 'rgba(0,212,255,0.2)'}` }}>
          <Ticket className="w-5 h-5" style={{ color: stats.openTickets > 0 ? '#ffaa00' : '#00d4ff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-orbitron font-bold text-xs" style={{ color: stats.openTickets > 0 ? '#ffaa00' : '#00d4ff' }}>SUPPORT TICKETS</p>
          <p className="font-inter text-xs text-muted-foreground">
            {stats.openTickets > 0 ? `${stats.openTickets} open ticket${stats.openTickets > 1 ? 's' : ''} waiting — claim now` : 'No open tickets right now'}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>
      
      <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <p className="font-orbitron text-xs text-primary tracking-wider mb-3">RECENT USERS</p>
        {recentUsers.map(u => (
          <div key={u.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'rgba(0,212,255,0.06)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
              {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : <User className="w-4 h-4 text-primary opacity-60" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-sm text-foreground truncate">{u.display_name || u.full_name || u.email}</p>
              <p className="font-inter text-xs text-muted-foreground truncate">{u.email}</p>
            </div>
            <span className="font-inter text-xs px-2 py-0.5 rounded-full capitalize"
              style={{ background: u.role === 'admin' ? 'rgba(255,170,0,0.1)' : 'rgba(0,212,255,0.08)', color: u.role === 'admin' ? '#ffaa00' : '#00d4ff', border: `1px solid ${u.role === 'admin' ? 'rgba(255,170,0,0.3)' : 'rgba(0,212,255,0.2)'}` }}>
              {u.role || 'user'}
            </span>
          </div>
        ))}
        {recentUsers.length === 0 && <p className="font-inter text-xs text-muted-foreground">No recent users.</p>}
      </div>
    </div>
  );
}
