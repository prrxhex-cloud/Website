import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import ChatTabs from '@/components/chat/ChatTabs';
import AdminChat from '@/components/chat/AdminChat';
import WorldChat from '@/components/chat/WorldChat';
import AiChat from '@/components/chat/AiChat';


export default function Chat() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('world');
  const [keyauthUser, setKeyauthUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('prrx_keyauth_user');
    if (stored) { try { setKeyauthUser(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {
      base44.auth.redirectToLogin('/chat');
    });
  }, []);

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--page-bg)' }}>
      <div className="relative z-10 flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col pt-16 sm:pt-20 overflow-hidden">
          {/* Tabs */}
          <div style={{ background: 'rgba(2,8,20,0.7)', backdropFilter: 'blur(20px)' }}>
            <ChatTabs active={activeTab} onChange={setActiveTab} />
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden" style={{ background: 'rgba(2,8,20,0.5)' }}>
            {activeTab === 'admin' && (
              <AdminChat currentUser={currentUser} isAdmin={!!keyauthUser} />
            )}
            {activeTab === 'world' && <WorldChat currentUser={currentUser} />}
            {activeTab === 'ai' && <AiChat currentUser={currentUser} />}
          </div>
        </div>
      </div>
    </div>
  );
}