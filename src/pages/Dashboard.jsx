import React, { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import { Download, MessageCircle, DollarSign, Activity, Store, Shield, LogOut, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProfileEditor from '@/components/dashboard/ProfileEditor';
import DashboardLicenseCard from '@/components/dashboard/DashboardLicenseCard';
import DashboardAnnouncements from '@/components/dashboard/DashboardAnnouncements';
import DashboardServiceStatus from '@/components/dashboard/DashboardServiceStatus';
import { useAuth } from '@/lib/AuthContext';

export default function Dashboard() {
  const { user: currentUser, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  if (isLoadingAuth || !currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-[#00020a]">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-32 h-32 bg-[#00d4ff] rounded-full blur-[80px] animate-pulse"></div>
        <div className="w-12 h-12 border-4 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full animate-spin relative z-10" />
      </div>
    </div>
  );

  const quickActions = [
    { label: 'Download Panel', desc: 'Get the latest PRRX build', icon: Download, color: '#00d4ff', action: () => navigate('/') },
    { label: 'Live Chat', desc: 'Chat with users & support', icon: MessageCircle, color: '#00ff88', action: () => navigate('/chat') },
    { label: 'View Prices', desc: 'Browse subscription plans', icon: DollarSign, color: '#ffaa00', action: () => navigate('/prices') },
    { label: 'Service Status', desc: 'Check system availability', icon: Activity, color: '#22c55e', action: () => navigate('/status') },
    { label: 'Reseller Portal', desc: 'Manage reseller account', icon: Store, color: '#aa44ff', action: () => navigate('/resellers') },
    { label: 'Admin Portal', desc: 'Staff management access', icon: Shield, color: '#ff6b6b', action: () => navigate('/admin') },
  ];

  return (
    <div className="min-h-screen bg-[#00020a] text-white overflow-x-hidden selection:bg-[#00d4ff]/30 relative font-inter">
      {/* Liquid fluid animated blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#001833] blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#1a0033] blur-[150px] mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-[#003322] blur-[130px] mix-blend-screen animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-32 pb-24 relative">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-orbitron text-xs font-bold text-[#00d4ff] tracking-[0.3em] uppercase mb-3 drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">Mission Control</p>
              <h1 className="font-orbitron font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-wider">
                WELCOME, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#aa44ff] drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">{currentUser.full_name?.split(' ')[0] || 'USER'}</span>
              </h1>
              <p className="font-inter text-gray-400 mt-3 text-lg">{currentUser.email}</p>
            </div>
            <button
              onClick={() => logout(true)}
              className="flex items-center gap-3 font-orbitron text-xs font-bold text-red-400 hover:text-white transition-all duration-300 px-6 py-3 rounded-2xl border group relative overflow-hidden flex-shrink-0 self-start md:self-auto"
              style={{ borderColor: 'rgba(255,80,80,0.3)', background: 'rgba(255,80,80,0.1)', boxShadow: '0 10px 30px -10px rgba(255,80,80,0.2)' }}
            >
              <div className="absolute inset-0 bg-red-500/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <LogOut className="w-4 h-4 relative z-10 group-hover:-translate-x-1 transition-transform" />
              <span className="relative z-10 tracking-widest">DISCONNECT</span>
            </button>
          </motion.div>

          {/* License Status + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            <div className="lg:col-span-4 flex flex-col">
              <DashboardLicenseCard />
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {quickActions.map((qa, i) => {
                const Icon = qa.icon;
                return (
                  <motion.button
                    key={qa.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={qa.action}
                    className="rounded-[32px] p-6 text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,212,255,0.3)] group relative overflow-hidden h-full flex flex-col justify-between border"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none"></div>
                    
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10 shadow-lg"
                      style={{ background: `${qa.color}15`, border: `1px solid ${qa.color}40`, boxShadow: `0 0 20px ${qa.color}30` }}>
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity blur-md" style={{ background: qa.color }}></div>
                      <Icon className="w-7 h-7 relative z-10 drop-shadow-[0_0_8px_currentColor]" style={{ color: qa.color }} />
                    </div>
                    
                    <div className="relative z-10 mt-auto">
                      <p className="font-orbitron font-black text-lg text-white mb-2 tracking-wide group-hover:text-[#00d4ff] transition-colors">{qa.label}</p>
                      <p className="font-inter text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{qa.desc}</p>
                    </div>
                    
                    {/* Hover sweep effect */}
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-sweep bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Announcements + Service Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <DashboardAnnouncements />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <DashboardServiceStatus />
            </motion.div>
          </div>

          {/* Profile Editor */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <ProfileEditor currentUser={currentUser} />
          </motion.div>

          {/* Footer banner */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] border border-white/10"
            style={{ background: 'rgba(0,15,35,0.4)', backdropFilter: 'blur(20px)' }}>
            
            {/* Liquid Background elements for Banner */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#00d4ff] to-[#aa44ff] opacity-10 rounded-full blur-[100px] group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="w-20 h-20 rounded-[28px] flex items-center justify-center flex-shrink-0 relative z-10 transition-transform duration-500 group-hover:scale-110"
              style={{ background: 'rgba(0,212,255,0.1)', border: '2px solid rgba(0,212,255,0.3)', boxShadow: '0 0 30px rgba(0,212,255,0.2)' }}>
              <div className="absolute inset-0 bg-[#00d4ff] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-[28px]"></div>
              <Zap className="w-10 h-10 text-[#00d4ff] relative z-10" />
            </div>
            
            <div className="flex-1 min-w-0 text-center md:text-left relative z-10">
              <p className="font-orbitron font-black text-3xl text-white tracking-wider glow-cyan mb-2">NEED A LICENSE KEY?</p>
              <p className="font-inter text-lg text-gray-300">Contact us on WhatsApp or visit a reseller to get instant activation.</p>
            </div>
            
            <a href="https://wa.me/94761386077" target="_blank" rel="noopener noreferrer"
              className="font-orbitron font-black text-sm tracking-[0.2em] px-10 py-5 rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,211,102,0.4)] relative z-10 overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="relative z-10 flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                GET KEY NOW
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  );
}