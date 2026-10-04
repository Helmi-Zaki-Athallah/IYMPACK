/**
 * Fast & Lightweight Image Optimizer Utility
 * Uses Cloudflare-backed global CDN (wsrv.nl) to resize, compress,
 * and convert heavy raw DSLR/WordPress photos into lightweight WebP images.
 */

export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url;

  // Don't modify local assets, data URIs, SVG, or UI Avatars
  if (
    url.startsWith('/') ||
    url.startsWith('data:') ||
    url.endsWith('.svg') ||
    url.includes('ui-avatars.com') ||
    url.includes('wsrv.nl')
  ) {
    return url;
  }

  const { width = 400, quality = 80, fit = 'cover' } = options;

  try {
    // Check if valid http/https URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const cleanUrl = url.trim();
      return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&q=${quality}&fit=${fit}&output=webp`;
    }
  } catch {
    return url;
  }

  return url;
}
