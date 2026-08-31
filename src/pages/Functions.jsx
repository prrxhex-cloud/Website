import React from 'react';
import Navbar from '@/components/landing/Navbar';
import FunctionsSection from '@/components/landing/FunctionsSection';
import Footer from '@/components/landing/Footer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function Functions() {
  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--page-bg)' }}>
      <div className="relative z-10">
        <Navbar />
        <div className="pt-24 max-w-[1240px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={[{ label: 'Panel Functions & Memory Cloaking Features', path: '/functions' }]} />
        </div>
        <div>
          <FunctionsSection />
        </div>
        <Footer />
      </div>
    </div>
  );
}