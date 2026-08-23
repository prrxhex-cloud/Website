/**
 * PRRX ADAPTIVE NETWORK & LOW-BANDWIDTH DATA SAVER ENGINE
 *
 * Senses network connection quality (3G, 4G, 5G, metered, slow-2g)
 * and adjusts asset quality, background polling, and data consumption.
 */

class NetworkOptimizerEngine {
  constructor() {
    this._connection = typeof navigator !== 'undefined' ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection) : null;
    this._listeners = new Set();
    this._init();
  }

  _init() {
    if (this._connection) {
      this._connection.addEventListener('change', () => {
        const status = this.getNetworkStatus();
        this._listeners.forEach(cb => cb(status));
      });
    }
  }

  getNetworkStatus() {
    if (!this._connection) {
      return {
        effectiveType: '4g',
        saveData: false,
        downlink: 10,
        rtt: 50,
        isSlow: false
      };
    }

    const effectiveType = this._connection.effectiveType || '4g';
    const saveData = Boolean(this._connection.saveData);
    const downlink = this._connection.downlink || 10; // Mbps
    const rtt = this._connection.rtt || 50; // ms latency
    const isSlow = effectiveType === '2g' || effectiveType === 'slow-2g' || effectiveType === '3g' || downlink < 1.5 || rtt > 400;

    return {
      effectiveType,
      saveData,
      downlink,
      rtt,
      isSlow
    };
  }

  isSlowNetwork() {
    return this.getNetworkStatus().isSlow;
  }

  isDataSaverActive() {
    const status = this.getNetworkStatus();
    return status.saveData || status.isSlow;
  }

  onNetworkChange(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }
}

export const networkOptimizer = new NetworkOptimizerEngine();
