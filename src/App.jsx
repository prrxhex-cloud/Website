import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { SoundProvider } from '@/context/SoundContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from '@/pages/Home.jsx';
import Functions from '@/pages/Functions';

import Dashboard from '@/pages/Dashboard';
import Prices from '@/pages/Prices.jsx';
import Resellers from '@/pages/Resellers';
import Status from '@/pages/Status';
import Admin from '@/pages/Admin';
import Freebies from '@/pages/Freebies';
import Login from '@/pages/Login';
import LiquidLoader from '@/components/ui/LiquidLoader';
import React from 'react';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/functions" element={<Functions />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/prices" element={<Prices />} />
      <Route path="/resellers" element={<Resellers />} />
      <Route path="/status" element={<Status />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/freebies" element={<Freebies />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SoundProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              {isInitialLoad ? (
                <LiquidLoader onComplete={() => setIsInitialLoad(false)} />
              ) : (
                <AuthenticatedApp />
              )}
            </Router>
            <Toaster />
          </QueryClientProvider>
        </SoundProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App