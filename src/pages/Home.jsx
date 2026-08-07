import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import HeroSection from '@/components/landing/HeroSection';
import FunctionsTeaserSection from '@/components/landing/FunctionsTeaserSection';
import AnnouncementsSection from '@/components/landing/AnnouncementsSection';
import DownloadSection from '@/components/landing/DownloadSection';
import PageLoader from '@/components/effects/PageLoader';
import CommunityPopup from '@/components/landing/CommunityPopup';

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--page-bg)' }}>
      <PageLoader onDone={() => setLoaded(true)} />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <AnnouncementsSection />
        <div id="functions">
          <FunctionsTeaserSection />
        </div>
        <div id="download">
          <DownloadSection />
        </div>
        <Footer />
      </div>
      <CommunityPopup />
    </div>
  );
}