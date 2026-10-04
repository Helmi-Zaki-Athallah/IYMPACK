/**
 * IYMPACK CMS — Site Settings Service
 *
 * Manages global site configuration (org name, contact info, socials, etc.)
 */

import { LS_KEYS } from '../lib/db.constants.js';
import { createSiteSettings } from '../lib/db.schemas.js';
import { getObject, setObject } from '../lib/storage.js';

/**
 * Get current site settings.
 * Returns defaults if nothing is stored yet.
 * @returns {Object}
 */
export function getSiteSettings() {
  const stored = getObject(LS_KEYS.SITE_SETTINGS);
  if (stored) return stored;

  // Return defaults
  return createSiteSettings();
}

/**
 * Update site settings (partial update).
 * @param {Object} updates - Fields to update.
 * @returns {Object} The merged settings.
 */
export function updateSiteSettings(updates) {
  const current = getSiteSettings();
  const merged = { ...current, ...updates };
  setObject(LS_KEYS.SITE_SETTINGS, merged);
  return merged;
}

/**
 * Reset site settings to factory defaults.
 */
export function resetSiteSettings() {
  const defaults = createSiteSettings();
  setObject(LS_KEYS.SITE_SETTINGS, defaults);
  return defaults;
}
