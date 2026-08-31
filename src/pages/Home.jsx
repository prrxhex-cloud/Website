import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import HeroSection from '@/components/landing/HeroSection';
import FunctionsTeaserSection from '@/components/landing/FunctionsTeaserSection';
import DeepDiveSection from '@/components/landing/DeepDiveSection';
import AnnouncementsSection from '@/components/landing/AnnouncementsSection';
import CaseStudiesSection from '@/components/landing/CaseStudiesSection';
import FaqSection from '@/components/landing/FaqSection';
import DownloadSection from '@/components/landing/DownloadSection';
import CommunityPopup from '@/components/landing/CommunityPopup';

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--page-bg)' }}>
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <AnnouncementsSection />
        <div id="functions">
          <FunctionsTeaserSection />
        </div>
        <CaseStudiesSection />
        <DeepDiveSection />
        <FaqSection />
        <div id="download">
          <DownloadSection />
        </div>
        <Footer />
      </div>
      <CommunityPopup />
    </div>
  );
}