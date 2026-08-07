import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Globe, Users } from 'lucide-react';
import { format } from 'date-fns';
import MessageBubble from './MessageBubble';

export default function WorldChat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.entities.WorldMessage.list('-created_date', 100).then(msgs => {
      setMessages(msgs.reverse());
      setLoading(false);
    });

    const unsub = base44.entities.WorldMessage.subscribe((event) => {
      if (event.type === 'create') setMessages(prev => [...prev, event.data]);
      if (event.type === 'delete') setMessages(prev => prev.filter(m => m.id !== event.id));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    await base44.entities.WorldMessage.create({
      sender_email: currentUser.email,
      sender_name: currentUser.display_name || currentUser.full_name || currentUser.email,
      sender_avatar: currentUser.avatar_url || '',
      content: text,
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
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-orbitron font-bold text-sm text-primary tracking-wider">WORLD CHAT</p>
          <p className="font-inter text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" /> Public room — everyone can see
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground font-inter text-xs mt-10">
            No messages yet. Be the first to say hello! 🌍
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_email === currentUser.email}
            />
          ))
        )}
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
            placeholder="Message the world..."
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