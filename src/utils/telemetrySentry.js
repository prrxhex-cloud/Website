const SENTRY_WEBHOOK_URL = 'https://ptb.discord.com/api/webhooks/1522773386483466331/XQuU4n2bP7NbJdhFe2tG-K74q-EkcbMaudmabGePF-r6Z_TWqT5FENC8HYt7gTprxpZz';

/**
 * PRRX DISTRIBUTED TELEMETRY & ZERO-COST DISCORD SENTRY
 *
 * Real-time synthetic monitoring and automated client crash telemetry.
 * Pipes formatted error traces to your Discord Webhook with automatic rate-limiting.
 */

class TelemetrySentryEngine {
  constructor() {
    this._initialized = false;
    this._errorRateLimit = new Map();
  }

  /**
   * Initializes global unhandled exception and promise rejection listeners.
   */
  init() {
    if (this._initialized || typeof window === 'undefined') return;
    this._initialized = true;

    // Window Error Handler
    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        source: 'window.onerror',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled Promise Rejection Handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason || new Error('Unhandled Promise Rejection'), {
        source: 'window.onunhandledrejection'
      });
    });

    console.log('🛡️ PRRX Sentry Telemetry initialized.');
  }

  /**
   * Captures and reports a client exception to Discord Webhook.
   */
  async captureException(error, context = {}) {
    try {
      const errMessage = String(error?.message || error || 'Unknown Runtime Error');
      
      // Filter noisy benign errors (e.g. extension errors, resized observer)
      if (errMessage.includes('ResizeObserver') || errMessage.includes('Extension context invalidated')) {
        return;
      }

      // Rate limit to prevent flooding: Max 1 report per error type per 5 minutes
      const errKey = errMessage.slice(0, 50);
      const lastSent = this._errorRateLimit.get(errKey);
      if (lastSent && (Date.now() - lastSent) < 5 * 60 * 1000) {
        return;
      }
      this._errorRateLimit.set(errKey, Date.now());

      const payload = {
        embeds: [
          {
            title: "🚨 Client Runtime Telemetry Alert",
            description: `\`\`\`javascript\n${errMessage.slice(0, 500)}\n\`\`\``,
            color: 0xff0055, // Rose / Red
            fields: [
              { name: "📍 URL Route", value: `\`${window.location.hash || '/'}\``, inline: true },
              { name: "💻 Browser / OS", value: `\`${navigator.userAgent.slice(0, 80)}...\``, inline: true },
              { name: "⏱️ Timestamp", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            ],
            footer: { text: "PRRX HEX • Zero-Cost Sentry Engine" },
            timestamp: new Date().toISOString()
          }
        ]
      };

      if (SENTRY_WEBHOOK_URL) {
        fetch(SENTRY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      }
    } catch (e) {
      // Sentry never crashes app
    }
  }

  /**
   * Probes external infrastructure health.
   */
  async probeInfrastructureHealth() {
    const results = {
      firebase: 'checking',
      githubCdn: 'checking',
      timestamp: Date.now()
    };

    try {
      const cdnStart = performance.now();
      await fetch('https://prrxhex-cloud.github.io/Website/logo.jpeg', { method: 'HEAD', mode: 'no-cors' });
      results.githubCdn = `${Math.round(performance.now() - cdnStart)}ms`;
    } catch {
      results.githubCdn = 'online (cached)';
    }

    return results;
  }
}

export const telemetrySentry = new TelemetrySentryEngine();
