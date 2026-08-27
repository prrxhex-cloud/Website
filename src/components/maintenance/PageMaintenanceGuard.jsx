import React from 'react';
import { useMaintenance } from '@/context/MaintenanceContext';
import MaintenanceScreen from './MaintenanceScreen';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function PageMaintenanceGuard({ pageKey, pageTitle, children }) {
  const { isPageInMaintenance, isGlobalMaintenance, isAdminBypassed } = useMaintenance();

  const isLocked = isPageInMaintenance(pageKey);

  if (isLocked && !isAdminBypassed) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-between font-inter">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-6">
          <MaintenanceScreen 
            isGlobal={isGlobalMaintenance} 
            pageKey={pageKey} 
            pageTitle={pageTitle} 
          />
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
