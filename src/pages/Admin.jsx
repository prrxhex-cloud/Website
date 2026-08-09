import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import AdminPortal from '@/components/dashboard/AdminPortal';
import { ShieldAlert } from 'lucide-react';

export default function Admin() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-inter transition-colors duration-300">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold font-outfit">
            <ShieldAlert className="w-4 h-4" /> RESTRICTED STAFF ACCESS
          </div>
          <h1 className="font-outfit font-extrabold text-3xl sm:text-4xl text-[var(--text-heading)] tracking-tight">
            PRRX ADMIN MANAGEMENT PORTAL
          </h1>
          <p className="font-inter text-[var(--text-muted)] text-xs">
            Authorized personnel only. System logs active.
          </p>
        </div>

        <AdminPortal />
      </main>

      <Footer />
    </div>
  );
}