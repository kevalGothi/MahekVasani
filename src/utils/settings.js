// ============================================================
// Settings utility — retrieves site configuration from the JSON file.
// ============================================================

import configData from '../data/portfolioConfig.json';

const SETTINGS_KEY = 'naturelens_site_settings';

/** Get current settings */
export function getSettings() {
  return configData.siteConfig;
}

/** Save settings locally (as a fallback or for local operations) */
export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Reset settings */
export function resetSettings() {
  localStorage.removeItem(SETTINGS_KEY);
}
