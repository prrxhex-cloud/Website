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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--page-bg)' }}>
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-24 pb-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="font-inter text-xs text-primary tracking-widest uppercase mb-1">Dashboard</p>
              <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-foreground tracking-wide">
                Welcome, {currentUser.full_name?.split(' ')[0] || 'User'}
              </h1>
              <p className="font-inter text-sm text-muted-foreground mt-1">{currentUser.email}</p>
            </div>
            <button
              onClick={() => logout(true)}
              className="flex items-center gap-2 font-inter text-xs text-muted-foreground hover:text-destructive transition-colors px-4 py-2 rounded-lg border"
              style={{ borderColor: 'rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.05)' }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* License Status + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-1">
              <DashboardLicenseCard />
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map((qa, i) => {
                const Icon = qa.icon;
                return (
                  <motion.button
                    key={qa.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={qa.action}
                    className="rounded-2xl p-4 text-left transition-all hover:scale-[1.03] group"
                    style={{ background: 'rgba(0,15,35,0.8)', border: `1px solid ${qa.color}18` }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{ background: `${qa.color}15`, border: `1px solid ${qa.color}30` }}>
                      <Icon className="w-5 h-5" style={{ color: qa.color }} />
                    </div>
                    <p className="font-orbitron font-bold text-xs text-foreground mb-0.5">{qa.label}</p>
                    <p className="font-inter text-xs text-muted-foreground leading-snug">{qa.desc}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Announcements + Service Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <DashboardAnnouncements />
            <DashboardServiceStatus />
          </div>

          {/* Profile Editor */}
          <div className="mb-8">
            <ProfileEditor currentUser={currentUser} />
          </div>

          {/* Footer banner */}
          <div className="rounded-2xl p-6 flex items-center gap-4 flex-wrap"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(170,68,255,0.06))', border: '1px solid rgba(0,212,255,0.15)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-orbitron font-bold text-sm text-foreground">Need a license key?</p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5">Contact us on WhatsApp or visit a reseller to get instant activation</p>
            </div>
            <a href="https://wa.me/94761386077" target="_blank" rel="noopener noreferrer"
              className="font-orbitron font-bold text-xs tracking-widest px-5 py-2.5 rounded-xl transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', color: '#fff' }}>
              GET KEY
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}