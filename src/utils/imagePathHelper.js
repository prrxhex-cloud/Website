/**
 * Helper utility to safely resolve image paths across GitHub Pages and Localhost.
 */
export function resolveImageUrl(src, fallbackUrl = '') {
  if (!src) return fallbackUrl;

  const trimmed = String(src).trim();

  // If already absolute URL or data URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Clean leading slash
  const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return `${cleanBase}${cleanPath}`;
}

export const REPO_PANEL_PRESETS = [
  { label: 'External Panel Main UI', path: 'panels/external_panel.png' },
  { label: 'Internal Panel Main UI', path: 'panels/internal_panel.png' },
  { label: 'Hero HUD Showcase', path: 'panels/hero_hud.png' },
  { label: 'Aimbot & Bullet Track', path: 'panels/aimbot_preview.png' },
  { label: 'ESP Skeleton & Box Preview', path: 'panels/esp_preview.png' },
  { label: 'Stream Safe / OBS Bypass', path: 'panels/stream_safe.png' },
];
