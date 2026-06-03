// ============================================================
// Settings utility — stores site configuration in localStorage.
// Falls back to defaults from portfolioData.js if not set.
// ============================================================

import { SITE_CONFIG } from '../data/portfolioData';

const SETTINGS_KEY = 'naturelens_site_settings';

/** Get current settings merged with defaults */
export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults so new fields always have fallback
      return { ...SITE_CONFIG, ...parsed };
    }
  } catch {
    // corrupted data, ignore
  }
  return { ...SITE_CONFIG };
}

/** Save settings to localStorage */
export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Reset settings to defaults */
export function resetSettings() {
  localStorage.removeItem(SETTINGS_KEY);
}
