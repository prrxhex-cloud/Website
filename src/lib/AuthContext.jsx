import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, signOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { secureStorage } from '@/utils/secureStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // 1. Synchronously check cached keyAuthUser for instant 0ms hydration
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

    // 2. Attach onAuthStateChanged synchronously
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          role: 'admin'
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

    // 3. Fallback timeout to ensure app never gets stuck on black screen
    const safetyTimeout = setTimeout(() => {
      setIsLoadingAuth(false);
    }, 1500);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const loginWithKeyAuth = (userData, panelType = 'EXTERNAL') => {
    const keyAuthUser = {
      uid: 'keyauth-' + (userData.username || 'user'),
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
      await signOut(auth);
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
      loginWithKeyAuth
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

