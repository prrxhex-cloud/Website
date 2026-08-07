import React, { useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import { Download, MessageCircle, DollarSign, Activity, Store, Shield, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-inter">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 space-y-10">
        
        {/* User Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#06b6d4] flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#06b6d4]">
                USER CONTROL PANEL
              </span>
              <h1 className="font-outfit font-extrabold text-3xl text-slate-900">
                Welcome back, {currentUser.full_name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="font-inter text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={() => logout(true)}
            className="btn-secondary-white px-5 py-2.5 font-inter font-bold text-xs text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* License & Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <DashboardLicenseCard />
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((qa, i) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.label}
                  onClick={qa.action}
                  className="clean-card p-5 text-left bg-white border border-slate-200 hover:border-[#06b6d4] transition-all flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-[#06b6d4] flex items-center justify-center mb-4 group-hover:bg-cyan-50 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-slate-900 text-base group-hover:text-[#06b6d4] transition-colors">{qa.label}</h3>
                    <p className="font-inter text-xs text-slate-500 mt-0.5">{qa.desc}</p>
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
    </div>
  );
}