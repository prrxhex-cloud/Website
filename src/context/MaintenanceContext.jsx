import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

export const DEFAULT_MAINTENANCE_CONFIG = {
  id: 'maintenance',
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

  // Admin status check
  const isAdminUser = useMemo(() => {
    const sessionAdmin = typeof window !== 'undefined' ? sessionStorage.getItem('prrx_admin_logged_in') : null;
    if (sessionAdmin) return true;
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.email && KNOWN_ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
    return false;
  }, [user]);

  // Real-time Supabase synchronization on table 'system_config'
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('*')
          .eq('id', 'maintenance')
          .single();

        if (data && !error) {
          const merged = {
            ...DEFAULT_MAINTENANCE_CONFIG,
            ...data,
            page_maintenance: {
              ...DEFAULT_MAINTENANCE_CONFIG.page_maintenance,
              ...(typeof data.page_maintenance === 'string' ? JSON.parse(data.page_maintenance) : (data.page_maintenance || {})),
            },
          };
          setMaintenanceConfig(merged);
          try {
            localStorage.setItem('prrx_maintenance_config', JSON.stringify(merged));
          } catch {}
        }
      } catch (err) {
        console.warn('Supabase maintenance fetch warning (using cache):', err);
      } finally {
        setIsLoadingMaintenance(false);
      }
    };

    loadConfig();

    // Supabase Realtime channel subscription
    const channel = supabase
      .channel('system_config_maintenance_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_config', filter: 'id=eq.maintenance' },
        (payload) => {
          if (payload.new) {
            const data = payload.new;
            const merged = {
              ...DEFAULT_MAINTENANCE_CONFIG,
              ...data,
              page_maintenance: {
                ...DEFAULT_MAINTENANCE_CONFIG.page_maintenance,
                ...(typeof data.page_maintenance === 'string' ? JSON.parse(data.page_maintenance) : (data.page_maintenance || {})),
              },
            };
            setMaintenanceConfig(merged);
            try {
              localStorage.setItem('prrx_maintenance_config', JSON.stringify(merged));
            } catch {}
          }
        }
      )
      .subscribe();

    const fallbackTimer = setTimeout(() => {
      setIsLoadingMaintenance(false);
    }, 1200);

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const isGlobalMaintenance = Boolean(maintenanceConfig.global_maintenance);
  const allowAdminBypass = maintenanceConfig.allow_admin_bypass !== false;
  const isAdminBypassed = Boolean(isAdminUser && allowAdminBypass);

  const isPageInMaintenance = useCallback((pathOrKey) => {
    if (!pathOrKey) return isGlobalMaintenance;
    const normalizedKey = ROUTE_KEY_MAP[pathOrKey] || pathOrKey.replace(/^\//, '').replace(/-/g, '_').toLowerCase();
    if (isGlobalMaintenance) return true;
    return Boolean(maintenanceConfig.page_maintenance?.[normalizedKey]);
  }, [isGlobalMaintenance, maintenanceConfig.page_maintenance]);

  const updateMaintenanceConfig = useCallback(async (newConfig, adminIdentifier) => {
    const adminEmail = adminIdentifier || user?.email || (typeof window !== 'undefined' ? sessionStorage.getItem('prrx_admin_logged_in') : null) || 'System Admin';
    const payload = {
      ...maintenanceConfig,
      ...newConfig,
      id: 'maintenance',
      page_maintenance: {
        ...maintenanceConfig.page_maintenance,
        ...(newConfig.page_maintenance || {}),
      },
      updated_at: new Date().toISOString(),
      updated_by: adminEmail,
    };

    // 1. Immediately persist to localStorage & state
    try {
      localStorage.setItem('prrx_maintenance_config', JSON.stringify(payload));
    } catch {}
    setMaintenanceConfig(payload);

    // 2. Broadcast to Supabase
    try {
      await supabase.from('system_config').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase maintenance broadcast warning (persisted locally):', err);
    }

    return payload;
  }, [maintenanceConfig, user?.email]);

  const toggleGlobalMaintenance = useCallback(async (enabled, reason, timerEnd) => {
    return await updateMaintenanceConfig({
      global_maintenance: enabled,
      ...(reason !== undefined ? { reason } : {}),
      ...(timerEnd !== undefined ? { timer_end: timerEnd } : {}),
    });
  }, [updateMaintenanceConfig]);

  const togglePageMaintenance = useCallback(async (pageKey, enabled) => {
    const updatedPages = {
      ...maintenanceConfig.page_maintenance,
      [pageKey]: enabled,
    };
    return await updateMaintenanceConfig({
      page_maintenance: updatedPages,
    });
  }, [maintenanceConfig.page_maintenance, updateMaintenanceConfig]);

  return (
    <MaintenanceContext.Provider
      value={{
        maintenanceConfig,
        isLoadingMaintenance,
        isGlobalMaintenance,
        allowAdminBypass,
        isAdminBypassed,
        isPageInMaintenance,
        updateMaintenanceConfig,
        toggleGlobalMaintenance,
        togglePageMaintenance,
      }}
    >
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
