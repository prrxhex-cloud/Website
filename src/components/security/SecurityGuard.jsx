/**
 * Security utilities for PRRX portals.
 * - Brute-force lockout (max attempts + cooldown)
 * - Session timeout (auto-logout after inactivity)
 * - Login attempt logger
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity

export function getLoginState(storeKey) {
  try {
    return JSON.parse(localStorage.getItem(`prrx_sec_${storeKey}`)) || { attempts: 0, lockedUntil: null, log: [] };
  } catch {
    return { attempts: 0, lockedUntil: null, log: [] };
  }
}

function saveLoginState(storeKey, state) {
  localStorage.setItem(`prrx_sec_${storeKey}`, JSON.stringify(state));
}

export function isLocked(storeKey) {
  const s = getLoginState(storeKey);
  if (!s.lockedUntil) return false;
  if (Date.now() < s.lockedUntil) return true;
  // Lockout expired — reset
  saveLoginState(storeKey, { ...s, attempts: 0, lockedUntil: null });
  return false;
}

export function getRemainingLockout(storeKey) {
  const s = getLoginState(storeKey);
  if (!s.lockedUntil) return 0;
  return Math.max(0, s.lockedUntil - Date.now());
}

export function recordFailedAttempt(storeKey, username) {
  const s = getLoginState(storeKey);
  const attempts = s.attempts + 1;
  const log = [
    { time: new Date().toISOString(), username, success: false },
    ...(s.log || []),
  ].slice(0, 20);
  const lockedUntil = attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
  saveLoginState(storeKey, { attempts, lockedUntil, log });
  return { attempts, lockedUntil };
}

export function recordSuccess(storeKey, username) {
  const s = getLoginState(storeKey);
  const log = [
    { time: new Date().toISOString(), username, success: true },
    ...(s.log || []),
  ].slice(0, 20);
  saveLoginState(storeKey, { attempts: 0, lockedUntil: null, log });
}

export function getLoginLog(storeKey) {
  return getLoginState(storeKey).log || [];
}

// Session timeout hook — call onTimeout when idle too long
export function startSessionTimeout(onTimeout) {
  let timer = null;

  const reset = () => {
    clearTimeout(timer);
    timer = setTimeout(onTimeout, SESSION_TIMEOUT_MS);
  };

  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
  events.forEach(e => window.addEventListener(e, reset, { passive: true }));
  reset(); // start immediately

  return () => {
    clearTimeout(timer);
    events.forEach(e => window.removeEventListener(e, reset));
  };
}

export function formatMs(ms) {
  const m = Math.ceil(ms / 60000);
  return `${m} minute${m !== 1 ? 's' : ''}`;
}