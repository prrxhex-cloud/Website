import React, { useEffect, useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Download, MessageCircle, DollarSign, Activity, Store, Shield, LogOut, User, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileEditor from '@/components/dashboard/ProfileEditor';
import DashboardLicenseCard from '@/components/dashboard/DashboardLicenseCard';
import DashboardAnnouncements from '@/components/dashboard/DashboardAnnouncements';
import DashboardServiceStatus from '@/components/dashboard/DashboardServiceStatus';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import appInfo from '../../desktop-app/package.json';

export default function Dashboard() {
  const { user: currentUser, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [discordRPC, setDiscordRPC] = useState(localStorage.getItem('discordRPC') !== 'false');

  useEffect(() => {
    localStorage.setItem('discordRPC', discordRPC.toString());
    if (window.electronAPI && window.electronAPI.toggleDiscordRPC) {
      window.electronAPI.toggleDiscordRPC(discordRPC);
    }
  }, [discordRPC]);

  useEffect(() => {
    if (currentUser && window.electronAPI && window.electronAPI.updateDiscordRPCUser) {
      const displayUsername = currentUser.full_name?.split(' ')[0] || currentUser.username || currentUser.email?.split('@')[0] || 'User';
      window.electronAPI.updateDiscordRPCUser(displayUsername);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  // Background Updater Logic
  useEffect(() => {
    if (!isAuthenticated || !window.electronAPI) return;
    
    const disableAutoUpdate = localStorage.getItem('disableAutoUpdate') === 'true';
    if (disableAutoUpdate) return;

    const checkBackgroundUpdate = async () => {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/prrxhex-cloud/Website/main/version.json?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.version && data.version !== appInfo.version && data.downloadUrl) {
          const result = await window.electronAPI.downloadUpdateBackground(data.downloadUrl);
          if (result && result.success && result.path) {
            toast({
              title: "Update Ready!",
              description: `Version ${data.version} is downloaded.`,
              duration: 999999,
              action: (
                <ToastAction altText="Install" onClick={() => window.electronAPI.installUpdateBackground(result.path)}>
                  Install Now
                </ToastAction>
              ),
            });
          }
        }
      } catch (e) {
        console.error("Background update check failed", e);
      }
    };
    
    setTimeout(checkBackgroundUpdate, 3000);
  }, [isAuthenticated, toast]);

  if (isLoadingAuth || !currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
      <div className="w-10 h-10 border-4 border-[#06b6d4]/20 border-t-[#06b6d4] rounded-full animate-spin" />
    </div>
  );

  const quickActions = [
    { label: 'Download Panel', desc: 'Get the latest PRRX build', icon: Download, action: () => navigate('/') },
    { label: 'Live Chat', desc: 'Chat with users & support', icon: MessageCircle, action: () => navigate('/chat') },
    { label: 'View Prices', desc: 'Browse subscription plans', icon: DollarSign, action: () => navigate('/prices') },
    { label: 'Service Status', desc: 'Check system availability', icon: Activity, action: () => navigate('/status') },
    { label: 'Reseller Portal', desc: 'Manage reseller account', icon: Store, action: () => navigate('/resellers') },
    { label: 'Admin Portal', desc: 'Staff management access', icon: Shield, action: () => navigate('/admin') },
    { label: 'About & Updates', desc: 'Check app version', icon: Info, action: () => navigate('/about') },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter transition-colors duration-300">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 space-y-10">
        
        {/* User Welcome Banner */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#06b6d4] flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#06b6d4]">
                USER CONTROL PANEL
              </span>
              <h1 className="font-outfit font-extrabold text-3xl text-[var(--text-heading)]">
                Welcome back, {currentUser.full_name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="font-inter text-xs text-[var(--text-muted)] mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setDiscordRPC(!discordRPC)}
              className={`px-5 py-2.5 rounded-xl font-inter font-bold text-xs flex items-center gap-2 transition-colors border ${discordRPC ? 'bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/30 hover:bg-[#5865F2]/20' : 'bg-gray-500/10 text-[var(--text-muted)] border-gray-500/30 hover:bg-gray-500/20'}`}
            >
              <Activity className="w-4 h-4" />
              <span>Discord RPC: {discordRPC ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => logout(true)}
              className="px-5 py-2.5 rounded-xl font-inter font-bold text-xs text-rose-500 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* License & Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <DashboardLicenseCard />
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.label}
                  onClick={qa.action}
                  className="clean-card p-5 text-left bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#06b6d4] transition-all flex flex-col justify-between group shadow-sm rounded-2xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[#06b6d4] flex items-center justify-center mb-4 group-hover:bg-[#06b6d4]/15 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-[var(--text-heading)] text-base group-hover:text-[#06b6d4] transition-colors">{qa.label}</h3>
                    <p className="font-inter text-xs text-[var(--text-muted)] mt-0.5">{qa.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Announcements & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardAnnouncements />
          <DashboardServiceStatus />
        </div>

        {/* Profile Editor */}
        <ProfileEditor currentUser={currentUser} />

      </main>

      <Footer />
    </div>
  );
}