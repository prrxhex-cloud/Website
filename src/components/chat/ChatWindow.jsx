import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Shield, MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { base44 } from '@/api/base44Client';

export default function ChatWindow({ conversation, currentUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const getOtherName = () => {
    const idx = conversation.participants.findIndex(p => p !== currentUser.email);
    return conversation.participant_names?.[idx] || conversation.participants[idx] || 'Unknown';
  };

  useEffect(() => {
    // Initial load
    base44.entities.ChatMessage.filter({ conversation_id: conversation.id }, 'created_date', 100)
      .then(setMessages);

    // Real-time subscription
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.conversation_id !== conversation.id) return;
      if (event.type === 'create') setMessages(prev => [...prev, event.data]);
      if (event.type === 'update') setMessages(prev => prev.map(m => m.id === event.id ? event.data : m));
      if (event.type === 'delete') setMessages(prev => prev.filter(m => m.id !== event.id));
    });

    return () => unsub();
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    await base44.entities.ChatMessage.create({
      conversation_id: conversation.id,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email,
      content: text,
    });
    // Update conversation last message
    await base44.entities.ChatConversation.update(conversation.id, {
      last_message: text,
      last_message_time: new Date().toISOString(),
    });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(0,212,255,0.1)', background: 'rgba(0,10,25,0.8)' }}>
        <button onClick={onBack} className="md:hidden text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: conversation.is_support ? 'rgba(255,150,0,0.15)' : 'rgba(0,212,255,0.1)', border: `1px solid ${conversation.is_support ? 'rgba(255,150,0,0.3)' : 'rgba(0,212,255,0.2)'}` }}>
          {conversation.is_support
            ? <Shield className="w-4 h-4" style={{ color: '#ffaa00' }} />
            : <MessageCircle className="w-4 h-4 text-primary" />}
        </div>
        <div>
          <p className="font-orbitron font-bold text-sm text-foreground">
            {conversation.is_support ? 'Admin Support' : getOtherName()}
          </p>
          <p className="font-inter text-xs text-primary">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground font-inter text-xs mt-10">
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_email === currentUser.email}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
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
    </div>
  );
}