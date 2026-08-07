import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Shield, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function ConversationList({ conversations, activeId, onSelect, onNewChat, currentUser }) {
  const getOtherName = (conv) => {
    const idx = conv.participants.findIndex(p => p !== currentUser.email);
    if (idx === -1) return 'Unknown';
    return conv.participant_names?.[idx] || conv.participants[idx];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
        <h2 className="font-orbitron font-bold text-sm text-primary tracking-wider">CHATS</h2>
        <button
          onClick={onNewChat}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}
        >
          <Plus className="w-4 h-4 text-primary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <div className="p-6 text-center text-muted-foreground font-inter text-xs">
            No conversations yet. Start a new chat!
          </div>
        )}
        {conversations.map((conv, i) => (
          <motion.button
            key={conv.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(conv)}
            className="w-full text-left p-4 transition-all border-b"
            style={{
              borderColor: 'rgba(0,212,255,0.06)',
              background: activeId === conv.id ? 'rgba(0,212,255,0.07)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: conv.is_support ? 'rgba(255,150,0,0.15)' : 'rgba(0,212,255,0.1)', border: `1px solid ${conv.is_support ? 'rgba(255,150,0,0.3)' : 'rgba(0,212,255,0.2)'}` }}>
                {conv.is_support
                  ? <Shield className="w-5 h-5" style={{ color: '#ffaa00' }} />
                  : <MessageCircle className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-inter font-semibold text-xs text-foreground truncate">
                    {conv.is_support ? 'Support' : getOtherName(conv)}
                  </span>
                  {conv.last_message_time && (
                    <span className="font-inter text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {format(new Date(conv.last_message_time), 'HH:mm')}
                    </span>
                  )}
                </div>
                <p className="font-inter text-xs text-muted-foreground truncate mt-0.5">
                  {conv.last_message || 'No messages yet'}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}