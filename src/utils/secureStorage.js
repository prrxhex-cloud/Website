import { encryptPayload256, decryptPayload256 } from './cryptoShield';

/**
 * 256-BIT END-TO-END ENCRYPTED CLIENT-SIDE STORAGE
 *
 * Automatically wraps all sensitive user session tokens, KeyAuth keys,
 * and security parameters in hardware AES-256-GCM ciphertexts before writing to localStorage.
 */
class SecureStorageEngine {
  constructor() {
    this._memoryCache = new Map();
  }

  /**
   * Stores value encrypted with 256-bit AES-GCM.
   */
  async setItem(key, value) {
    try {
      this._memoryCache.set(key, value);
      const encrypted = await encryptPayload256(value);
      if (encrypted) {
        localStorage.setItem(`prrx_sec_${key}`, encrypted);
      }
    } catch (err) {
      console.warn(`SecureStorage set error for key [${key}]:`, err);
    }
  }

  /**
   * Retrieves and decrypts 256-bit AES-GCM value.
   */
  async getItem(key, defaultValue = null) {
    try {
      if (this._memoryCache.has(key)) {
        return this._memoryCache.get(key);
      }

      const encrypted = localStorage.getItem(`prrx_sec_${key}`);
      if (!encrypted) {
        // Fallback check for unmigrated plain legacy keys
        const legacy = localStorage.getItem(key);
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            // Opportunistically migrate to encrypted
            this.setItem(key, parsed);
            return parsed;
          } catch {
            this.setItem(key, legacy);
            return legacy;
          }
        }
        return defaultValue;
      }

      const decrypted = await decryptPayload256(encrypted);
      const result = decrypted !== null ? decrypted : defaultValue;
      this._memoryCache.set(key, result);
      return result;
    } catch (err) {
      console.warn(`SecureStorage get error for key [${key}]:`, err);
      return defaultValue;
    }
  }

  /**
   * Synchronous get from memory cache with optional legacy fallback.
   */
  getItemSync(key, defaultValue = null) {
    if (this._memoryCache.has(key)) {
      return this._memoryCache.get(key);
    }
    const legacy = localStorage.getItem(key);
    if (legacy) {
      try { return JSON.parse(legacy); } catch { return legacy; }
    }
    return defaultValue;
  }

  /**
   * Removes item from memory and disk.
   */
  removeItem(key) {
    this._memoryCache.delete(key);
    localStorage.removeItem(`prrx_sec_${key}`);
    localStorage.removeItem(key);
  }

  /**
   * Clears all encrypted items.
   */
  clear() {
    this._memoryCache.clear();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('prrx_sec_') || k.startsWith('prrx_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
}

export const secureStorage = new SecureStorageEngine();
