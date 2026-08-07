import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Bot, Plus, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

function AiMessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <Bot className="w-3.5 h-3.5" style={{ color: '#a855f7' }} />
        </div>
      )}
      <div className="max-w-[80%]">
        <div className="rounded-2xl px-4 py-2.5 font-inter text-sm leading-relaxed"
          style={isUser ? {
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            color: '#fff',
            borderRadius: '18px 18px 4px 18px',
          } : {
            background: 'rgba(168,85,247,0.06)',
            border: '1px solid rgba(168,85,247,0.12)',
            color: 'rgba(180,200,220,0.9)',
            borderRadius: '18px 18px 18px 4px',
          }}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                code: ({ children }) => <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(168,85,247,0.15)' }}>{children}</code>,
                a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">{children}</a>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AiChat({ currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const convs = await base44.agents.listConversations({ agent_name: 'prrx_assistant' });
    setConversations(convs || []);
    setLoading(false);
  };

  const createNewChat = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'prrx_assistant',
      metadata: { name: `Chat ${new Date().toLocaleDateString()}` },
    });
    setConversations(prev => [conv, ...prev]);
    openConversation(conv.id);
  };

  const openConversation = async (convId) => {
    setActiveConvId(convId);
    const conv = await base44.agents.getConversation(convId);
    setMessages(conv.messages || []);
  };

  useEffect(() => {
    if (!activeConvId) return;
    const unsub = base44.agents.subscribeToConversation(activeConvId, (data) => {
      const msgs = data.messages || [];
      setMessages(msgs);
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        setSending(false);
      }
    });
    return () => unsub();
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    let convId = activeConvId;
    let isNew = false;
    if (!convId) {
      const conv = await base44.agents.createConversation({
        agent_name: 'prrx_assistant',
        metadata: { name: text.slice(0, 40) },
      });
      setConversations(prev => [conv, ...prev]);
      convId = conv.id;
      setActiveConvId(convId);
      isNew = true;
    }

    // Optimistically show the user message immediately
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
      const conv = await base44.agents.getConversation(convId);
      await base44.agents.addMessage(conv, { role: 'user', content: text });
    } catch (e) {
      setSending(false);
      return;
    }

    // For new conversations, the subscription may not be ready yet — poll for the response
    if (isNew) {
      const pollId = setInterval(async () => {
        try {
          const updated = await base44.agents.getConversation(convId);
          const msgs = updated.messages || [];
          setMessages(msgs);
          const last = msgs[msgs.length - 1];
          if (last && last.role === 'assistant') {
            setSending(false);
            clearInterval(pollId);
          }
        } catch (e) {}
      }, 2000);
      setTimeout(() => clearInterval(pollId), 60000);
    }
    // Safety timeout
    setTimeout(() => setSending(false), 60000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Conversation list view
  if (!activeConvId) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
          <h2 className="font-orbitron font-bold text-sm tracking-wider" style={{ color: '#a855f7' }}>PRRX AI</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={createNewChat}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            <Plus className="w-4 h-4" style={{ color: '#a855f7' }} />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(168,85,247,0.3)', borderTopColor: '#a855f7' }} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <Bot className="w-8 h-8" style={{ color: '#a855f7' }} />
              </div>
              <p className="font-inter text-sm text-muted-foreground text-center">
                Chat with PRRX AI for help, tips, and support.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createNewChat}
                className="font-orbitron font-bold text-xs tracking-widest px-6 py-3 rounded-xl transition-all"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7' }}
              >
                START AI CHAT
              </motion.button>
            </div>
          ) : (
            conversations.map((conv, i) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openConversation(conv.id)}
                className="w-full text-left p-4 border-b transition-all hover:bg-white/5"
                style={{ borderColor: 'rgba(0,212,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <Bot className="w-5 h-5" style={{ color: '#a855f7' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-inter font-semibold text-xs text-foreground">
                      {conv.metadata?.name || 'AI Chat'}
                    </span>
                    <p className="font-inter text-xs text-muted-foreground truncate mt-0.5">
                      {conv.messages?.[conv.messages.length - 1]?.content?.slice(0, 50) || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Active chat view
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(0,212,255,0.1)', background: 'rgba(0,10,25,0.8)' }}>
        <button onClick={() => setActiveConvId(null)} className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <Bot className="w-4 h-4" style={{ color: '#a855f7' }} />
        </div>
        <div>
          <p className="font-orbitron font-bold text-sm" style={{ color: '#a855f7' }}>PRRX AI</p>
          <p className="font-inter text-xs text-muted-foreground">Always online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground font-inter text-xs mt-10">
            Ask PRRX AI anything! 🤖
          </div>
        )}
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <AiMessageBubble key={i} message={msg} />
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
              <Bot className="w-3.5 h-3.5" style={{ color: '#a855f7' }} />
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
        <div className="flex items-center gap-3 rounded-2xl px-4 py-2"
          style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask PRRX AI..."
            className="flex-1 bg-transparent font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: input.trim() ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(168,85,247,0.1)',
              opacity: input.trim() ? 1 : 0.5,
            }}
          >
            <Send className="w-4 h-4" style={{ color: input.trim() ? '#fff' : '#a855f7' }} />
          </button>
        </div>
      </div>
    </div>
  );
}