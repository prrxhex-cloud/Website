import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Plus, Ticket, CheckCircle, XCircle, Clock, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import TicketChatWindow from './TicketChatWindow';
import { sendTicketNotification } from '@/utils/discordNotifier';
import { toast } from 'sonner';

// isAdmin: true if this user is a KeyAuth admin
export default function AdminChat({ currentUser, isAdmin = false }) {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.ChatConversation.list('-last_message_time', 100);
      const support = all.filter(c => c.is_support);

      if (isAdmin) {
        setTickets(support.filter(c =>
          c.ticket_status === 'open' ||
          c.claimed_by === currentUser.email ||
          c.ticket_status === 'closed' && c.claimed_by === currentUser.email
        ));
      } else {
        setTickets(support.filter(c => c.customer_email === currentUser.email));
      }
    } catch (e) {
      console.error('Failed to load tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    const unsub = base44.entities.ChatConversation.subscribe((event) => {
      if (!event.data?.is_support) return;
      if (event.type === 'create') {
        const t = event.data;
        const show = isAdmin
          ? t.ticket_status === 'open'
          : t.customer_email === currentUser.email;
        if (show) setTickets(prev => [t, ...prev]);
      }
      if (event.type === 'update') {
        setTickets(prev => {
          const updated = event.data;
          // Admins: remove if claimed by someone else
          if (isAdmin && updated.claimed_by && updated.claimed_by !== currentUser.email && updated.ticket_status === 'claimed') {
            return prev.filter(t => t.id !== event.id);
          }
          // Check if this ticket belongs to us
          const exists = prev.find(t => t.id === event.id);
          if (exists) return prev.map(t => t.id === event.id ? updated : t);
          // Customer always keeps theirs
          if (!isAdmin && updated.customer_email === currentUser.email) return [updated, ...prev];
          // Admin: if now open and not in list, add it
          if (isAdmin && updated.ticket_status === 'open') return [updated, ...prev];
          return prev;
        });
        setActiveTicket(prev => prev?.id === event.id ? event.data : prev);
      }
      if (event.type === 'delete') {
        setTickets(prev => prev.filter(t => t.id !== event.id));
        setActiveTicket(prev => prev?.id === event.id ? null : prev);
      }
    });
    return () => unsub();
  }, []);

  const createTicket = async () => {
    if (creating) return;
    // Check if customer already has an open ticket
    const existing = tickets.find(t => t.customer_email === currentUser.email && t.ticket_status !== 'closed');
    if (existing) { setActiveTicket(existing); return; }
    setCreating(true);
    try {
      const ticket = await base44.entities.ChatConversation.create({
        participants: [currentUser.email],
        participant_names: [currentUser.display_name || currentUser.full_name || currentUser.email],
        is_support: true,
        ticket_status: 'open',
        customer_email: currentUser.email,
        customer_name: currentUser.display_name || currentUser.full_name || currentUser.email,
        last_message_time: new Date().toISOString(),
      });
      setActiveTicket(ticket);
      sendTicketNotification({ customerName: ticket.customer_name, customerEmail: ticket.customer_email });
    } catch (e) {
      console.error('Failed to create ticket:', e);
    } finally {
      setCreating(false);
    }
  };

  const deleteTicket = async (ticket) => {
    if (!window.confirm('Delete this support ticket? This cannot be undone.')) return;
    try {
      await base44.entities.ChatMessage.deleteMany({ conversation_id: ticket.id });
      await base44.entities.ChatConversation.delete(ticket.id);
      setTickets(prev => prev.filter(t => t.id !== ticket.id));
      setActiveTicket(null);
      toast.success('Ticket deleted');
    } catch (e) {
      toast.error('Failed to delete ticket');
    }
  };

  if (activeTicket) {
    return (
      <TicketChatWindow
        ticket={activeTicket}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onBack={() => { setActiveTicket(null); loadTickets(); }}
        onTicketUpdate={(updated) => setActiveTicket(updated)}
      />
    );
  }

  const STATUS = {
    open:    { label: 'Open',    color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',    icon: Clock },
    claimed: { label: 'Claimed', color: '#ffaa00', bg: 'rgba(255,170,0,0.1)',    icon: User },
    closed:  { label: 'Closed',  color: '#888',    bg: 'rgba(100,100,100,0.1)', icon: CheckCircle },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4" style={{ color: '#ffaa00' }} />
          <h2 className="font-orbitron font-bold text-sm tracking-wider" style={{ color: '#ffaa00' }}>
            {isAdmin ? 'SUPPORT TICKETS' : 'MY TICKETS'}
          </h2>
        </div>
        {isAdmin && (
          <span className="font-inter text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', color: '#ffaa00' }}>
            Admin View
          </span>
        )}
      </div>

      {/* Ticket list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,150,0,0.08)', border: '1px solid rgba(255,150,0,0.2)' }}>
              <Shield className="w-8 h-8" style={{ color: '#ffaa00' }} />
            </div>
            <p className="font-inter text-sm text-muted-foreground text-center">
              {isAdmin ? 'No open tickets right now.' : 'Need help? Open a support ticket.'}
            </p>
            {!isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createTicket}
                disabled={creating}
                className="font-orbitron font-bold text-xs tracking-widest px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                style={{ background: 'rgba(255,150,0,0.1)', border: '1px solid rgba(255,150,0,0.4)', color: '#ffaa00' }}
              >
                {creating ? 'CREATING...' : 'OPEN TICKET'}
              </motion.button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {tickets.map((ticket, i) => {
              const st = STATUS[ticket.ticket_status] || STATUS.open;
              const Icon = st.icon;
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setActiveTicket(ticket)}
                  className="group w-full text-left p-4 border-b transition-all hover:bg-white/5 cursor-pointer"
                  style={{ borderColor: 'rgba(0,212,255,0.06)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,150,0,0.1)', border: '1px solid rgba(255,150,0,0.3)' }}>
                      <Shield className="w-5 h-5" style={{ color: '#ffaa00' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-inter font-semibold text-xs text-foreground truncate">
                          {isAdmin
                            ? (ticket.customer_name || ticket.customer_email || 'User')
                            : 'Support Ticket'}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="font-inter text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}40` }}>
                            <Icon className="w-2.5 h-2.5" />
                            {st.label}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTicket(ticket); }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="font-inter text-xs text-muted-foreground truncate mt-0.5">
                        {ticket.last_message || 'No messages yet'}
                      </p>
                      {ticket.claimed_by_name && ticket.ticket_status === 'claimed' && (
                        <p className="font-inter text-xs mt-0.5" style={{ color: '#ffaa00' }}>
                          Claimed by {ticket.claimed_by_name}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer: Create new ticket button for customers */}
      {!isAdmin && tickets.length > 0 && (
        <div className="p-3 border-t" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
          <button
            onClick={createTicket}
            disabled={creating || tickets.some(t => t.ticket_status !== 'closed')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-inter font-semibold text-xs transition-all hover:bg-white/5 disabled:opacity-40"
            style={{ border: '1px solid rgba(255,150,0,0.2)', color: '#ffaa00' }}
          >
            <Plus className="w-4 h-4" />
            {tickets.some(t => t.ticket_status !== 'closed') ? 'Ticket already open' : 'Open New Ticket'}
          </button>
        </div>
      )}
    </div>
  );
}