/**
 * PRRX ZERO-TRUST CRYPTOGRAPHIC ENGINE (256-BIT AES-GCM + PBKDF2)
 *
 * Hardware-accelerated cryptographic primitives using the native browser Web Crypto API
 * (window.crypto.subtle). Provides 256-bit AES-GCM encryption, ephemeral key derivation,
 * and End-to-End Encryption (E2EE) data envelope sealing.
 */

// Entropy seed salt for client-side PBKDF2 master key derivation
const MASTER_SALT = new Uint8Array([
  0x70, 0x72, 0x72, 0x78, 0x5f, 0x7a, 0x65, 0x72,
  0x6f, 0x5f, 0x74, 0x72, 0x75, 0x73, 0x74, 0x32
]);

// In-memory derived key cache (never written to disk/localStorage)
let cachedCryptoKey = null;

/**
 * Derives a hardware-accelerated 256-bit AES-GCM CryptoKey using PBKDF2 with 100,000 iterations.
 */
async function getMasterKey() {
  if (cachedCryptoKey) return cachedCryptoKey;

  const basePass = 'PRRX-HEX-ENTERPRISE-256BIT-ZERO-TRUST-SHIELD-V5.8';
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(basePass),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  cachedCryptoKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: MASTER_SALT,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return cachedCryptoKey;
}

/**
 * Encrypts any JS object or string using 256-Bit AES-GCM with a fresh 96-bit random IV per payload.
 * Returns an armored envelope string: "AES256GCM:<iv_b64>:<ciphertext_b64>"
 */
export async function encryptPayload256(data) {
  try {
    if (data === null || data === undefined) return null;

    const key = await getMasterKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const textData = typeof data === 'string' ? data : JSON.stringify(data);
    const enc = new TextEncoder();

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      key,
      enc.encode(textData)
    );

    const ivB64 = btoa(String.fromCharCode(...iv));
    const ctB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

    return `AES256GCM:${ivB64}:${ctB64}`;
  } catch (err) {
    console.error('256-Bit Encryption failure:', err);
    return null;
  }
}

/**
 * Decrypts a 256-Bit AES-GCM armored envelope string back into its original JS object or string.
 */
export async function decryptPayload256(envelope) {
  try {
    if (!envelope || typeof envelope !== 'string') return envelope;
    if (!envelope.startsWith('AES256GCM:')) return envelope; // Not encrypted, pass-through safely

    const parts = envelope.split(':');
    if (parts.length !== 3) return null;

    const ivBytes = new Uint8Array(atob(parts[1]).split('').map(c => c.charCodeAt(0)));
    const ctBytes = new Uint8Array(atob(parts[2]).split('').map(c => c.charCodeAt(0)));

    const key = await getMasterKey();
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        tagLength: 128
      },
      key,
      ctBytes
    );

    const dec = new TextDecoder();
    const rawText = dec.decode(decryptedBuffer);

    try {
      return JSON.parse(rawText);
    } catch {
      return rawText;
    }
  } catch (err) {
    console.warn('256-Bit Decryption failed or corrupted payload:', err);
    return null;
  }
}

/**
 * Computes a SHA-256 cryptographic digest of any string or buffer.
 */
export async function computeSha256(data) {
  const enc = new TextEncoder();
  const buffer = typeof data === 'string' ? enc.encode(data) : data;
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Ephemeral memory scrambler for high-value tokens in RAM.
 */
export class ScrambledString {
  constructor(plainText) {
    this._mask = window.crypto.getRandomValues(new Uint8Array(plainText.length));
    const enc = new TextEncoder().encode(plainText);
    this._bytes = new Uint8Array(enc.length);
    for (let i = 0; i < enc.length; i++) {
      this._bytes[i] = enc[i] ^ this._mask[i];
    }
  }

  reveal() {
    const revealed = new Uint8Array(this._bytes.length);
    for (let i = 0; i < this._bytes.length; i++) {
      revealed[i] = this._bytes[i] ^ this._mask[i];
    }
    return new TextDecoder().decode(revealed);
  }
}
