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
    // 256-Bit Encrypted Session Loader
    const loadSession = async () => {
      let keyAuthUser = await secureStorage.getItem('prrx_keyauth_user');

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

      return unsubscribe;
    };

    let unsub = null;
    loadSession().then(u => { unsub = u; });
    return () => { if (unsub) unsub(); };
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

