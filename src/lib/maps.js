/**
 * IYMPACK — Google Maps URL & Embed Parser Utility
 * 
 * Mengonversi link Google Maps (biasa, pendek maps.app.goo.gl, koordinat, atau <iframe>)
 * menjadi:
 * 1. Nama tempat otomatis (Place Name)
 * 2. URL Embed resmi yang presisi (100% akurat ke titik lokasi)
 * 3. Link navigasi bersih untuk peserta
 */

import { apiClient } from './api.js';

/**
 * Parsing lokal cepat di browser (0ms)
 */
export function parseClientGoogleMapsUrl(input) {
  if (!input || typeof input !== 'string') return null;
  let url = input.trim();

  // Jika input berupa tag <iframe src="...">
  const iframeMatch = url.match(/src=["'](.*?)["']/);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1];
  }

  let placeName = '';
  let lat = '';
  let lng = '';

  // Ekstrak nama tempat dari /place/Nama+Tempat/
  const placeMatch = url.match(/\/place\/([^/@?]+)/);
  if (placeMatch && placeMatch[1]) {
    try {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    } catch {}
  } else {
    const qMatch = url.match(/[?&]q=([^&]+)/);
    if (qMatch && qMatch[1]) {
      try {
        placeName = decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
      } catch {}
    }
  }

  // Ekstrak koordinat latitude & longitude
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    lat = coordMatch[1];
    lng = coordMatch[2];
  } else {
    const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) {
      lat = llMatch[1];
      lng = llMatch[2];
    }
  }

  let embedUrl = '';
  if (url.includes('google.com/maps/embed')) {
    embedUrl = url;
  } else if (lat && lng) {
    const q = placeName ? encodeURIComponent(placeName) : `${lat},${lng}`;
    embedUrl = `https://maps.google.com/maps?q=${q}&ll=${lat},${lng}&z=16&output=embed`;
  } else if (placeName) {
    embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&z=16&output=embed`;
  }

  return {
    placeName,
    lat,
    lng,
    embedUrl,
    cleanUrl: url,
  };
}

/**
 * Resolve link Google Maps secara mendalam via backend (termasuk shortlink maps.app.goo.gl)
 */
export async function resolveGoogleMapsLink(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  // Coba parse lokal dulu
  const local = parseClientGoogleMapsUrl(rawUrl);

  // Jika URL adalah link pendek maps.app.goo.gl atau goo.gl, kirim ke backend untuk follow redirect
  if (rawUrl.includes('maps.app.goo.gl') || rawUrl.includes('goo.gl/maps')) {
    try {
      const res = await apiClient.get('/collections.php', {
        params: { action: 'parse_maps', url: rawUrl, _t: Date.now() },
        timeout: 6000,
      });
      if (res.data?.success) {
        return {
          placeName: res.data.placeName || local?.placeName || '',
          embedUrl: res.data.embedUrl || local?.embedUrl || '',
          lat: res.data.lat || local?.lat || '',
          lng: res.data.lng || local?.lng || '',
          cleanUrl: res.data.resolvedUrl || rawUrl,
        };
      }
    } catch {
      // Fallback lokal jika backend cURL timeout
    }
  }

  return local;
}
