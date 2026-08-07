import React from 'react';
import Navbar from '@/components/landing/Navbar';
import FunctionsSection from '@/components/landing/FunctionsSection';
import Footer from '@/components/landing/Footer';

export default function Functions() {
  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--page-bg)' }}>
      <div className="relative z-10">
        <Navbar />
        <div className="pt-20">
          <FunctionsSection />
        </div>
        <Footer />
      </div>
    </div>
  );
}