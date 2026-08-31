import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_META = {
  '/': {
    title: 'PRRX HEX — Undetected Free Fire VIP Cheats & Windows Emulator Panels',
    description: 'Dominate Free Fire with PRRX HEX VIP Cheats. 100% Undetected External & Internal Panels for Windows 10/11 Emulators (v7a APK). Auto-aim, ESP radar, and sub-10s automated key delivery.'
  },
  '/prices': {
    title: 'VIP Prices & Key Store | PRRX HEX',
    description: 'Browse wholesale and retail VIP key pricing for PRRX External and Internal Panels. Instant activation keys with automated dispensing.'
  },
  '/status': {
    title: 'Live Anti-Cheat Patch Radar & Sentinel | PRRX HEX',
    description: 'Real-time telemetry and detection status for Free Fire OB46 / OB47 v7a on Windows 10/11 emulators. 100% Undetected bypass verification.'
  },
  '/functions': {
    title: 'Panel Functions & In-Game Features | PRRX HEX',
    description: 'Explore full feature suite of PRRX HEX: 100% Headshot Aimbot, ESP Wallhack, Location Radar, Streamproof Overlays, and Magic Bullet.'
  },
  '/freebies': {
    title: 'Free Trial Panels & V7a APK Dumps | PRRX HEX',
    description: 'Download free trial demo panels and optimized Free Fire v7a 32-bit APKs for SmartGaaga, LDPlayer, and Bluestacks.'
  },
  '/resellers': {
    title: 'Reseller Portal & Wholesale Key Batches | PRRX HEX',
    description: 'Join the PRRX HEX VIP Reseller Network. Wholesale license discounts up to 40%, custom branding, and instant sub-account management.'
  },
  '/about': {
    title: 'About PRRX HEX — Global Infrastructure & Edge Nodes',
    description: 'Learn about the engineering architecture behind PRRX HEX, our global low-latency CDN server nodes, and memory cloaking research.'
  },
  '/privacy': {
    title: 'Privacy Policy & Terms of Service | PRRX HEX',
    description: 'PRRX HEX platform privacy policy, cookie disclosures, data protection protocols, and software terms of service.'
  },
  '/dashboard': {
    title: 'VIP Customer Dashboard | PRRX HEX',
    description: 'Manage active subscriptions, download panel updates, and access VIP support.'
  },
  '/admin': {
    title: 'Admin Command Center | PRRX HEX',
    description: 'PRRX HEX platform administrative operations.'
  },
  '/login': {
    title: 'VIP Member Login | PRRX HEX',
    description: 'Sign in to access your PRRX HEX account and license dashboard.'
  }
};

export default function PageMeta() {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname || '/';
    const meta = ROUTE_META[currentPath] || {
      title: 'PRRX HEX — Undetected Free Fire VIP Cheats',
      description: '100% Undetected Free Fire External & Internal Panels for Windows 10/11.'
    };

    // 1. Update Title
    document.title = meta.title;

    // 2. Update Meta Description
    let descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
      descTag.setAttribute('content', meta.description);
    }

    // 3. Track Page View in Google Analytics (if available)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: meta.title,
        page_location: window.location.href,
        page_path: location.pathname
      });
    }

    // 4. Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return null;
}
