import React from 'react';
import { format } from 'date-fns';
import { User } from 'lucide-react';

export default function MessageBubble({ message, isOwn, isSystem }) {
  const avatar = message.sender_avatar;
  const name = message.sender_name || message.sender_email;

  // System messages centered
  if (isSystem || message.sender_email === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="font-inter text-xs px-3 py-1.5 rounded-full text-center"
          style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)', color: 'rgba(180,200,220,0.6)' }}>
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center mb-1"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-primary opacity-60" />
          )}
        </div>
      )}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <p className="font-inter text-xs text-primary mb-1 px-1">{name}</p>
        )}
        <div
          className="px-4 py-2.5 font-inter text-sm leading-relaxed"
          style={isOwn ? {
            background: 'linear-gradient(135deg, #00d4ff, #0088aa)',
            color: '#020810',
            borderRadius: '18px 18px 4px 18px',
          } : {
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.1)',
            color: 'rgba(180,200,220,0.9)',
            borderRadius: '18px 18px 18px 4px',
          }}
        >
          {message.content}
        </div>
        <p className={`font-inter text-xs text-muted-foreground mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {message.created_date ? format(new Date(message.created_date), 'HH:mm') : ''}
        </p>
      </div>
      {isOwn && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center mb-1"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-primary opacity-60" />
          )}
        </div>
      )}
    </div>
  );
}