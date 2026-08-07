import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Shield, CheckCircle, UserCheck, XCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import MessageBubble from './MessageBubble';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  open:    { label: 'Open',    color: '#00d4ff', icon: Clock },
  claimed: { label: 'Claimed', color: '#ffaa00', icon: UserCheck },
  closed:  { label: 'Closed',  color: '#888',    icon: CheckCircle },
};

export default function TicketChatWindow({ ticket, currentUser, isAdmin, onBack, onTicketUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [closing, setClosing] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.entities.ChatMessage.filter({ conversation_id: ticket.id }, 'created_date', 100)
      .then(setMessages);

    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.conversation_id !== ticket.id) return;
      if (event.type === 'create') setMessages(prev => [...prev, event.data]);
      if (event.type === 'update') setMessages(prev => prev.map(m => m.id === event.id ? event.data : m));
      if (event.type === 'delete') setMessages(prev => prev.filter(m => m.id !== event.id));
    });

    const unsubConv = base44.entities.ChatConversation.subscribe((event) => {
      if (event.id !== ticket.id) return;
      if (event.type === 'update') {
        const updated = event.data;
        setCurrentTicket(updated);
        onTicketUpdate?.(updated);
        // Collision prevention: if another admin claimed this ticket, kick this admin out
        if (isAdmin && updated.ticket_status === 'claimed' && updated.claimed_by && updated.claimed_by !== currentUser.email) {
          onBack();
        }
      }
    });

    return () => { unsub(); unsubConv(); };
  }, [ticket.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending || currentTicket.ticket_status === 'closed') return;
    const text = input.trim();
    setInput('');
    setSending(true);
    await base44.entities.ChatMessage.create({
      conversation_id: ticket.id,
      sender_email: currentUser.email,
      sender_name: currentUser.display_name || currentUser.full_name || currentUser.email,
      content: text,
    });
    await base44.entities.ChatConversation.update(ticket.id, {
      last_message: text,
      last_message_time: new Date().toISOString(),
    });
    setSending(false);
  };

  const claimTicket = async () => {
    setClaiming(true);
    const updated = await base44.entities.ChatConversation.update(ticket.id, {
      ticket_status: 'claimed',
      claimed_by: currentUser.email,
      claimed_by_name: currentUser.display_name || currentUser.full_name || currentUser.email,
      participants: [currentTicket.customer_email, currentUser.email],
      participant_names: [currentTicket.customer_name, currentUser.display_name || currentUser.full_name || currentUser.email],
    });
    // Send system message
    await base44.entities.ChatMessage.create({
      conversation_id: ticket.id,
      sender_email: 'system',
      sender_name: 'System',
      content: `✅ Ticket claimed by ${currentUser.display_name || currentUser.full_name || currentUser.email}. You can now chat.`,
    });
    setCurrentTicket(prev => ({ ...prev, ticket_status: 'claimed', claimed_by: currentUser.email, claimed_by_name: currentUser.display_name || currentUser.full_name || currentUser.email }));
    setClaiming(false);
  };

  const closeTicket = async () => {
    setClosing(true);
    await base44.entities.ChatConversation.update(ticket.id, { ticket_status: 'closed' });
    await base44.entities.ChatMessage.create({
      conversation_id: ticket.id,
      sender_email: 'system',
      sender_name: 'System',
      content: '🔒 This ticket has been closed.',
    });
    setCurrentTicket(prev => ({ ...prev, ticket_status: 'closed' }));
    setClosing(false);
  };

  const deleteTicket = async () => {
    if (!window.confirm('Delete this support ticket? This cannot be undone.')) return;
    try {
      await base44.entities.ChatMessage.deleteMany({ conversation_id: ticket.id });
      await base44.entities.ChatConversation.delete(ticket.id);
      onBack();
    } catch (e) {
      toast.error('Failed to delete ticket');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const st = STATUS_CONFIG[currentTicket.ticket_status] || STATUS_CONFIG.open;
  const StIcon = st.icon;
  const isClosed = currentTicket.ticket_status === 'closed';
  const isOpen = currentTicket.ticket_status === 'open';
  const isClaimed = currentTicket.ticket_status === 'claimed';
  const claimedByMe = currentTicket.claimed_by === currentUser.email;

  // Can admin claim? Only if ticket is open
  const canClaim = isAdmin && isOpen;
  // Can close? Admin who claimed it, or the customer
  const canClose = !isClosed && (
    (isAdmin && (isClaimed && claimedByMe)) ||
    (!isAdmin && isClaimed)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(0,212,255,0.1)', background: 'rgba(0,10,25,0.8)' }}>
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,150,0,0.15)', border: '1px solid rgba(255,150,0,0.3)' }}>
          <Shield className="w-4 h-4" style={{ color: '#ffaa00' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-orbitron font-bold text-sm text-foreground">
            {isAdmin ? (currentTicket.customer_name || currentTicket.customer_email || 'Support Ticket') : 'Admin Support'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StIcon className="w-3 h-3" style={{ color: st.color }} />
            <p className="font-inter text-xs" style={{ color: st.color }}>{st.label}</p>
            {isClaimed && currentTicket.claimed_by_name && (
              <span className="font-inter text-xs text-muted-foreground">
                · {isAdmin ? 'You' : currentTicket.claimed_by_name}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {canClaim && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={claimTicket}
              disabled={claiming}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50 transition-all"
              style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}
            >
              <UserCheck className="w-3.5 h-3.5" />
              {claiming ? 'Claiming...' : 'Claim'}
            </motion.button>
          )}
          {canClose && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={closeTicket}
              disabled={closing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50 transition-all"
              style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff4444' }}
            >
              <XCircle className="w-3.5 h-3.5" />
              {closing ? 'Closing...' : 'Close'}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={deleteTicket}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-orbitron text-xs font-bold transition-all"
            style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff4444' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </motion.button>
        </div>
      </div>

      {/* Claim prompt for admins on open tickets */}
      {isAdmin && isOpen && (
        <div className="mx-4 mt-3 mb-1 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
          <Shield className="w-4 h-4 flex-shrink-0" style={{ color: '#00d4ff' }} />
          <p className="font-inter text-xs text-muted-foreground">
            Claim this ticket to start helping the customer. Once claimed, other admins won't see it.
          </p>
        </div>
      )}

      {/* Closed banner */}
      {isClosed && (
        <div className="mx-4 mt-3 mb-1 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(100,100,100,0.08)', border: '1px solid rgba(100,100,100,0.2)' }}>
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          <p className="font-inter text-xs text-muted-foreground">This ticket is closed. Open a new ticket if you need more help.</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground font-inter text-xs mt-10">
            {isAdmin ? 'Claim this ticket to begin assisting the customer.' : 'Describe your issue and an admin will claim your ticket shortly.'}
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_email === currentUser.email}
            isSystem={msg.sender_email === 'system'}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input — only if not closed, and for customers only if claimed */}
      {!isClosed && (!isAdmin ? isClaimed : claimedByMe) && (
        <div className="p-4 border-t" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-2"
            style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #00d4ff, #0088aa)' : 'rgba(0,212,255,0.1)',
                opacity: input.trim() ? 1 : 0.5,
              }}
            >
              <Send className="w-4 h-4" style={{ color: input.trim() ? '#020810' : '#00d4ff' }} />
            </button>
          </div>
        </div>
      )}

      {/* Customer waiting for claim message */}
      {!isClosed && !isAdmin && isOpen && (
        <div className="p-4 border-t flex items-center gap-3" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
          <div className="flex-1 px-4 py-3 rounded-xl text-center font-inter text-xs text-muted-foreground"
            style={{ background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.15)' }}>
            ⏳ Waiting for an admin to claim your ticket...
          </div>
        </div>
      )}
    </div>
  );
}