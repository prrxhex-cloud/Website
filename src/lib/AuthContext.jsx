import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from './supabase';
import { secureStorage } from '@/utils/secureStorage';

const AuthContext = createContext();

const ADMIN_EMAILS = [
  'sayurujayani123@gmail.com',
  'admin@prrxhex.com',
  'sayuru@prrxhex.com'
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // 1. Synchronously check cached keyAuthUser for instant hydration
    let keyAuthUser = secureStorage.getItemSync('prrx_keyauth_user');
    if (!keyAuthUser) {
      const legacy = localStorage.getItem('prrx_keyauth_user');
      if (legacy) {
        try { keyAuthUser = JSON.parse(legacy); } catch {}
      }
    }

    if (keyAuthUser) {
      setUser(keyAuthUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    }

    // 2. Hydrate initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || '';
        const isAdminUser = ADMIN_EMAILS.includes(email.toLowerCase());
        setUser({
          uid: session.user.id,
          id: session.user.id,
          email: email,
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
          role: isAdminUser ? 'admin' : 'user',
        });
        setIsAuthenticated(true);
      } else if (keyAuthUser) {
        setUser(keyAuthUser);
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
    }).catch(() => {
      setIsLoadingAuth(false);
    });

    // 3. Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const isAdminUser = ADMIN_EMAILS.includes(email.toLowerCase());
        setUser({
          uid: session.user.id,
          id: session.user.id,
          email: email,
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
          role: isAdminUser ? 'admin' : 'user',
        });
        setIsAuthenticated(true);
      } else if (keyAuthUser) {
        setUser(keyAuthUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });

    // 4. Safety fallback timeout
    const safetyTimeout = setTimeout(() => {
      setIsLoadingAuth(false);
    }, 1500);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) throw error;
  };

  const loginWithKeyAuth = (userData, panelType = 'EXTERNAL') => {
    const keyAuthUser = {
      uid: 'keyauth-' + (userData.username || 'user'),
      id: 'keyauth-' + (userData.username || 'user'),
      email: userData.username || 'KeyAuth User',
      displayName: userData.username || 'KeyAuth User',
      role: panelType.toLowerCase() === 'internal' ? 'internal' : 'external',
      panelType: panelType.toUpperCase(),
      isKeyAuth: true,
      keyAuthData: userData
    };
    secureStorage.setItem('prrx_keyauth_user', keyAuthUser);
    secureStorage.setItem('prrx_panel_type', panelType.toUpperCase());
    setUser(keyAuthUser);
    setIsAuthenticated(true);
  };

  const logout = async (shouldRedirect = true) => {
    try {
      secureStorage.removeItem('prrx_keyauth_user');
      secureStorage.removeItem('prrx_panel_type');
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      if (shouldRedirect) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToLogin = () => {
    window.location.hash = '#/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      logout,
      navigateToLogin,
      loginWithKeyAuth,
      loginWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
