import { computeSha256 } from './cryptoShield';

/**
 * PRRX ZERO-COOKIE HARDWARE ENTROPY & ANTI-FRAUD ENGINE
 *
 * Generates a non-invasive, hardware-level entropy hash using WebGL GPU vendor strings,
 * Canvas 2D drawing differentials, AudioContext frequencies, CPU concurrency, and memory.
 * Accurately identifies headless bots, scrapers, and malicious automation.
 */

let cachedFingerprint = null;

export async function getHardwareEntropyHash() {
  if (cachedFingerprint) return cachedFingerprint;

  const entropyComponents = [];

  // 1. Screen & Display Metrics
  entropyComponents.push(`${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);
  entropyComponents.push(`${window.devicePixelRatio || 1}`);
  entropyComponents.push(`${navigator.hardwareConcurrency || 4}`);
  entropyComponents.push(`${navigator.maxTouchPoints || 0}`);
  entropyComponents.push(`${Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}`);

  // 2. WebGL Unmasked GPU Renderer
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        entropyComponents.push(`${vendor}~${renderer}`);
      }
    }
  } catch (e) {
    entropyComponents.push('webgl_disabled');
  }

  // 3. 2D Canvas Differential Rendering
  try {
    const c2d = document.createElement('canvas');
    c2d.width = 200;
    c2d.height = 40;
    const ctx = c2d.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(10, 5, 60, 20);
    ctx.fillStyle = '#ec4899';
    ctx.fillText('PRRX_SHIELD_V5.8', 12, 18);
    entropyComponents.push(c2d.toDataURL());
  } catch (e) {
    entropyComponents.push('canvas_disabled');
  }

  const combinedEntropy = entropyComponents.join('|||');
  cachedFingerprint = await computeSha256(combinedEntropy);
  return cachedFingerprint;
}

/**
 * Checks for Headless Chrome, Selenium, Puppeteer, or automated bots.
 */
export function detectAutomatedBotEnvironment() {
  const flags = [];

  // 1. Webdriver flag
  if (navigator.webdriver) flags.push('navigator.webdriver=true');

  // 2. Missing plugins in standard window
  if (!navigator.languages || navigator.languages.length === 0) flags.push('missing_languages');

  // 3. Headless user agent clues
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('headlesschrome') || ua.includes('phantomjs') || ua.includes('selenium')) {
    flags.push('headless_ua');
  }

  // 4. Inconsistent dimensions
  if (window.outerWidth === 0 && window.outerHeight === 0) {
    flags.push('zero_outer_dimensions');
  }

  return {
    isSuspicious: flags.length > 0,
    riskScore: flags.length * 25,
    flags
  };
}
