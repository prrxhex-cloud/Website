import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';

export const DEFAULT_MAINTENANCE_CONFIG = {
  global_maintenance: false,
  page_maintenance: {
    prices: false,
    downloads: false,
    freebies: false,
    resellers: false,
    dashboard: false,
    status: false,
    functions: false,
    live_demo: false,
    about: false,
  },
  reason: 'Scheduled System Upgrade & Security Protocol Calibration in Progress. VIP services will resume shortly.',
  timer_end: null,
  allow_admin_bypass: true,
  updated_at: null,
  updated_by: null,
};

const KNOWN_ADMIN_EMAILS = [
  'sayurujayani123@gmail.com',
  'admin@prrxhex.com',
  'sayuru@prrxhex.com'
];

export const ROUTE_KEY_MAP = {
  '/': 'home',
  '/prices': 'prices',
  '/downloads': 'downloads',
  '/download': 'downloads',
  '/freebies': 'freebies',
  '/resellers': 'resellers',
  '/dashboard': 'dashboard',
  '/status': 'status',
  '/live-demo': 'live_demo',
  '/functions': 'functions',
  '/about': 'about',
};

const MaintenanceContext = createContext(null);

export const MaintenanceProvider = ({ children }) => {
  const [maintenanceConfig, setMaintenanceConfig] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('prrx_maintenance_config') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_MAINTENANCE_CONFIG,
          ...parsed,
          page_maintenance: {
            ...DEFAULT_MAINTENANCE_CONFIG.page_maintenance,
            ...(parsed.page_maintenance || {}),
          },
        };
      }
    } catch {}
    return DEFAULT_MAINTENANCE_CONFIG;
  });
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(true);
  const { user } = useAuth();

  // Admin status check across Firebase Auth, email whitelist, and active session storage
  const isAdminUser = useMemo(() => {
    const sessionAdmin = typeof window !== 'undefined' ? sessionStorage.getItem('prrx_admin_logged_in') : null;
    if (sessionAdmin) return true;
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.email && KNOWN_ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
    return false;
  }, [user]);

  // Real-time Firestore synchronization on doc(db, 'system_config', 'maintenance')
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const docRef = doc(db, 'system_config', 'maintenance');
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const merged = {
              ...DEFAULT_MAINTENANCE_CONFIG,
              ...data,
              page_maintenance: {
                ...DEFAULT_MAINTENANCE_CONFIG.page_maintenance,
                ...(data.page_maintenance || {}),
              },
            };
            setMaintenanceConfig(merged);
            try {
              localStorage.setItem('prrx_maintenance_config', JSON.stringify(merged));
            } catch {}
          }
          setIsLoadingMaintenance(false);
        },
        (error) => {
          console.warn('Maintenance config snapshot warning (using cached/default):', error);
          setIsLoadingMaintenance(false);
        }
      );
    } catch (e) {
      console.warn('Maintenance listener init error:', e);
      setIsLoadingMaintenance(false);
    }

    // Safety fallback timeout
    const fallbackTimer = setTimeout(() => {
      setIsLoadingMaintenance(false);
    }, 1200);

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const isGlobalMaintenance = Boolean(maintenanceConfig.global_maintenance);
  const allowAdminBypass = maintenanceConfig.allow_admin_bypass !== false;
  const isAdminBypassed = Boolean(isAdminUser && allowAdminBypass);

  // Helper to determine if a specific path or key is under maintenance
  const isPageInMaintenance = useCallback((pathOrKey) => {
    if (!pathOrKey) return isGlobalMaintenance;
    const normalizedKey = ROUTE_KEY_MAP[pathOrKey] || pathOrKey.replace(/^\//, '').replace(/-/g, '_').toLowerCase();
    
    // If global maintenance is active, every visitor route is under maintenance
    if (isGlobalMaintenance) return true;
    
    // Check granular page maintenance
    return Boolean(maintenanceConfig.page_maintenance?.[normalizedKey]);
  }, [isGlobalMaintenance, maintenanceConfig.page_maintenance]);

  // Update full config
  const updateMaintenanceConfig = useCallback(async (newConfig, adminIdentifier) => {
    const adminEmail = adminIdentifier || user?.email || (typeof window !== 'undefined' ? sessionStorage.getItem('prrx_admin_logged_in') : null) || 'System Admin';
    const payload = {
      ...maintenanceConfig,
      ...newConfig,
      page_maintenance: {
        ...maintenanceConfig.page_maintenance,
        ...(newConfig.page_maintenance || {}),
      },
      updated_at: new Date().toISOString(),
      updated_by: adminEmail,
    };

    // 1. Immediately persist to localStorage & React state so it never resets on refresh
    try {
      localStorage.setItem('prrx_maintenance_config', JSON.stringify(payload));
    } catch {}
    setMaintenanceConfig(payload);

    // 2. Broadcast to Firestore for all connected users
    try {
      const docRef = doc(db, 'system_config', 'maintenance');
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      console.warn('Firestore maintenance sync warning (persisted locally):', err);
    }

    return payload;
  }, [maintenanceConfig, user?.email]);

  // Helper to toggle Global Kill Switch
  const toggleGlobalMaintenance = useCallback(async (enabled, reason, timerEnd) => {
    return await updateMaintenanceConfig({
      global_maintenance: enabled,
      ...(reason !== undefined ? { reason } : {}),
      ...(timerEnd !== undefined ? { timer_end: timerEnd } : {}),
    });
  }, [updateMaintenanceConfig]);

  // Helper to toggle granular page status
  const togglePageMaintenance = useCallback(async (pageKey, enabled) => {
    const updatedPages = {
      ...maintenanceConfig.page_maintenance,
      [pageKey]: enabled,
    };
    return await updateMaintenanceConfig({
      page_maintenance: updatedPages,
    });
  }, [maintenanceConfig.page_maintenance, updateMaintenanceConfig]);

  const value = useMemo(() => ({
    maintenanceConfig,
    isLoadingMaintenance,
    isGlobalMaintenance,
    pageMaintenance: maintenanceConfig.page_maintenance || {},
    reason: maintenanceConfig.reason || DEFAULT_MAINTENANCE_CONFIG.reason,
    timerEnd: maintenanceConfig.timer_end,
    allowAdminBypass,
    isAdminUser,
    isAdminBypassed,
    isPageInMaintenance,
    updateMaintenanceConfig,
    toggleGlobalMaintenance,
    togglePageMaintenance,
  }), [
    maintenanceConfig,
    isLoadingMaintenance,
    isGlobalMaintenance,
    allowAdminBypass,
    isAdminUser,
    isAdminBypassed,
    isPageInMaintenance,
    updateMaintenanceConfig,
    toggleGlobalMaintenance,
    togglePageMaintenance,
  ]);

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};

export default MaintenanceContext;
