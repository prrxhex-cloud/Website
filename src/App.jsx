import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { SoundProvider } from '@/context/SoundContext';
import { PwaProvider } from '@/context/PwaContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from '@/pages/Home.jsx';
import Functions from '@/pages/Functions';
import NetworkGuard from '@/components/NetworkGuard';

import Dashboard from '@/pages/Dashboard';
import Prices from '@/pages/Prices.jsx';
import Resellers from '@/pages/Resellers';
import Status from '@/pages/Status';
import Admin from '@/pages/Admin';
import Freebies from '@/pages/Freebies';
import Login from '@/pages/Login';
import DesktopLauncher from '@/pages/DesktopLauncher';
import LiveDemo from '@/pages/LiveDemo';
import LiquidLoader from '@/components/ui/LiquidLoader';
import React from 'react';
import TitleBar from '@/components/TitleBar';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="w-10 h-10 border-4 border-[#06b6d4]/20 border-t-[#06b6d4] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // If running in Electron, use the standalone launcher
    if (window.electronAPI) {
      return <Navigate to="/launcher" replace />;
    }
    // Otherwise, use the standard website login
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-main)]">
        <div className="w-10 h-10 border-4 border-[#06b6d4]/20 border-t-[#06b6d4] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // In electron, we also want to intercept standard API redirect requests
      if (window.electronAPI) {
        return <Navigate to="/launcher" replace />;
      }
      navigateToLogin();
      return null;
    }
  }

  // Render routes with explicit Public vs Protected access
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/launcher" element={<DesktopLauncher />} />

      {/* PROTECTED ROUTES (Must login to access) */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/status" element={<ProtectedRoute><Status /></ProtectedRoute>} />
      <Route path="/live-demo" element={<ProtectedRoute><LiveDemo /></ProtectedRoute>} />
      <Route path="/functions" element={<ProtectedRoute><Functions /></ProtectedRoute>} />
      
      <Route path="/prices" element={<ProtectedRoute><Prices /></ProtectedRoute>} />
      <Route path="/resellers" element={<ProtectedRoute><Resellers /></ProtectedRoute>} />
      <Route path="/freebies" element={<ProtectedRoute><Freebies /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  React.useEffect(() => {
    if (window.electronAPI) {
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
    }
  }, []);

  const isElectron = !!window.electronAPI;

  const content = (
    <ThemeProvider>
      <AuthProvider>
        <SoundProvider>
          <PwaProvider>
            <QueryClientProvider client={queryClientInstance}>
              <Router>
                <NetworkGuard>
                  {isInitialLoad ? (
                    <LiquidLoader onComplete={() => setIsInitialLoad(false)} />
                  ) : (
                    <AuthenticatedApp />
                  )}
                </NetworkGuard>
              </Router>
              <Toaster />
            </QueryClientProvider>
          </PwaProvider>
        </SoundProvider>
      </AuthProvider>
    </ThemeProvider>
  );

  if (isElectron) {
    return (
      <div className="min-h-screen w-full bg-[var(--bg-main)] rounded-3xl border border-white/5 relative flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-[99999]">
          <TitleBar />
        </div>
        <style>
          {`
            /* Push fixed elements down to make room for TitleBar in Electron */
            .sticky.top-0, .fixed.top-0 {
              top: 32px !important;
            }
            /* Reset TitleBar to actual top */
            .fixed.top-0.z-\\[99999\\] {
              top: 0 !important;
            }
            /* Hide the body overflow if necessary, or just let it scroll natively */
          `}
        </style>
        <div className="flex-1 w-full pt-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

export default App;