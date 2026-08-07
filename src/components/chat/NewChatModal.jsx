import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Shield, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewChatModal({ onClose, onCreate, currentUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list().then(list => {
      setUsers(list.filter(u => u.email !== currentUser.email));
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'rgba(2,10,25,0.98)', border: '1px solid rgba(0,212,255,0.2)' }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
          <h3 className="font-orbitron font-bold text-sm text-primary">New Chat</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
        </div>

        {/* Support option */}
        <button
          onClick={() => onCreate(null, true)}
          className="w-full flex items-center gap-3 p-4 border-b hover:bg-white/5 transition-colors"
          style={{ borderColor: 'rgba(0,212,255,0.06)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,150,0,0.1)', border: '1px solid rgba(255,150,0,0.3)' }}>
            <Shield className="w-5 h-5" style={{ color: '#ffaa00' }} />
          </div>
          <div className="text-left">
            <p className="font-inter font-semibold text-sm text-foreground">Admin Support</p>
            <p className="font-inter text-xs text-muted-foreground">Chat with our support team</p>
          </div>
        </button>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-transparent border rounded-lg pl-9 pr-3 py-2 font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ borderColor: 'rgba(0,212,255,0.2)' }}
            />
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {loading && <p className="text-center text-xs text-muted-foreground p-4">Loading users...</p>}
          {filtered.map(u => (
            <button
              key={u.id}
              onClick={() => onCreate(u)}
              className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-bold text-sm"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
                {(u.full_name || u.email)[0].toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-inter font-semibold text-sm text-foreground">{u.full_name || u.email}</p>
                <p className="font-inter text-xs text-muted-foreground">{u.email}</p>
              </div>
            </button>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-xs text-muted-foreground p-4">No users found</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}