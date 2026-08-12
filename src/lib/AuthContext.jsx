import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, signOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Check local storage for KeyAuth session
    const storedKeyAuth = localStorage.getItem('prrx_keyauth_user');
    let keyAuthUser = null;
    if (storedKeyAuth) {
      try {
        keyAuthUser = JSON.parse(storedKeyAuth);
      } catch (e) {
        console.error('Failed to parse stored KeyAuth user', e);
      }
    }

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
        // Fallback to KeyAuth if Firebase is null but KeyAuth session exists
        setUser(keyAuthUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithKeyAuth = (userData) => {
    const keyAuthUser = {
      uid: 'keyauth-' + (userData.username || 'user'),
      email: userData.username || 'KeyAuth User',
      displayName: userData.username || 'KeyAuth User',
      role: 'external',
      isKeyAuth: true,
      keyAuthData: userData
    };
    localStorage.setItem('prrx_keyauth_user', JSON.stringify(keyAuthUser));
    setUser(keyAuthUser);
    setIsAuthenticated(true);
  };

  const logout = async (shouldRedirect = true) => {
    try {
      localStorage.removeItem('prrx_keyauth_user');
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

