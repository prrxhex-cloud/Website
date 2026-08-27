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
import NetworkGuard from '@/components/NetworkGuard';
import LiquidLoader from '@/components/ui/LiquidLoader';
import React, { Suspense } from 'react';
import TitleBar from '@/components/TitleBar';
import FpsOverlay from '@/components/ui/FpsOverlay';
import AiSupportWidget from '@/components/support/AiSupportWidget';
import { telemetrySentry } from '@/utils/telemetrySentry';

import DesktopLauncher from '@/pages/DesktopLauncher';

// Lazy load other heavy components
const Home = React.lazy(() => import('@/pages/Home.jsx'));
const Functions = React.lazy(() => import('@/pages/Functions'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Prices = React.lazy(() => import('@/pages/Prices.jsx'));
const Resellers = React.lazy(() => import('@/pages/Resellers'));
const Status = React.lazy(() => import('@/pages/Status'));
const Admin = React.lazy(() => import('@/pages/Admin'));
const Freebies = React.lazy(() => import('@/pages/Freebies'));
const Login = React.lazy(() => import('@/pages/Login'));
const LiveDemo = React.lazy(() => import('@/pages/LiveDemo'));
const About = React.lazy(() => import('@/pages/About'));
const AppLauncher = React.lazy(() => import('@/pages/AppLauncher'));

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth && !window.electronAPI) {
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

// Restricted Route for Desktop App (Removed only from application, kept on website)
const DesktopRestrictedRoute = ({ children }) => {
  if (window.electronAPI) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth (ONLY for website, bypassed on desktop)
  if ((isLoadingPublicSettings || isLoadingAuth) && !window.electronAPI) {
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
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-main)]">
        <div className="w-10 h-10 border-4 border-[#06b6d4]/20 border-t-[#06b6d4] rounded-full animate-spin"></div>
      </div>
    }>
      <Routes>
        {/* PUBLIC STOREFRONT ROUTES (Accessible to all visitors) */}
        <Route path="/" element={<Home />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/status" element={<Status />} />
        <Route path="/live-demo" element={<DesktopRestrictedRoute><LiveDemo /></DesktopRestrictedRoute>} />
        <Route path="/functions" element={<DesktopRestrictedRoute><Functions /></DesktopRestrictedRoute>} />
        <Route path="/resellers" element={<DesktopRestrictedRoute><Resellers /></DesktopRestrictedRoute>} />
        <Route path="/freebies" element={<Freebies />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/launcher" element={<DesktopLauncher />} />

        {/* AUTHENTICATED & PROTECTED ROUTES (Requires Login) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/app-launcher" element={<ProtectedRoute><AppLauncher /></ProtectedRoute>} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

import { useLocation } from 'react-router-dom';

const ElectronLayout = ({ children }) => {
  const location = useLocation();
  const isLauncher = location.pathname === '/launcher';
  
  if (!window.electronAPI || isLauncher) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-full bg-[var(--bg-main)] flex flex-col overflow-hidden">
      <div className="flex-none w-full z-[99999]">
        <TitleBar />
      </div>
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar relative">
        {children}
      </div>
    </div>
  );
};

function App() {
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  React.useEffect(() => {
    // 1. Initialize Distributed Zero-Cost Telemetry Sentry
    telemetrySentry.init();

    if (window.electronAPI) {
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
    }
  }, []);

  const content = (
    <ThemeProvider>
      <AuthProvider>
        <SoundProvider>
          <PwaProvider>
            <QueryClientProvider client={queryClientInstance}>
              <Router>
                <ElectronLayout>
                  <NetworkGuard>
                    {isInitialLoad ? (
                      <LiquidLoader onComplete={() => setIsInitialLoad(false)} />
                    ) : (
                      <>
                        <AuthenticatedApp />
                        <AiSupportWidget />
                      </>
                    )}
                  </NetworkGuard>
                </ElectronLayout>
                <FpsOverlay />
              </Router>
              <Toaster />
            </QueryClientProvider>
          </PwaProvider>
        </SoundProvider>
      </AuthProvider>
    </ThemeProvider>
  );

  return content;
}

export default App;