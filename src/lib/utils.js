/**
 * IYMPACK CMS — Utility Helpers
 */

import { sanitizeCsvCell } from './security.js';

/**
 * Generate a UUID v4 string.
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a URL-friendly slug from a title string.
 * Example: "Youth Summit 2026!" → "youth-summit-2026"
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // hapus karakter spesial
    .replace(/\s+/g, '-')        // spasi → dash
    .replace(/-+/g, '-')         // multiple dash → single
    .replace(/^-|-$/g, '');      // trim dash di awal/akhir
}

/**
 * Format a Date (or ISO string) to Indonesian locale string.
 * Example: "2026-01-22" → "22 Januari 2026"
 */
export function formatDate(date, options = {}) {
  const d = date instanceof Date ? date : new Date(date);
  const defaults = { day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString('id-ID', { ...defaults, ...options });
}

/**
 * Format a Date to ISO-like local datetime string for <input type="datetime-local">.
 * Example: Date → "2026-01-22T09:00"
 */
export function toDatetimeLocal(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Validate email format.
 * @returns {boolean}
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validate Indonesian WhatsApp/phone format.
 * Accepts: +6281234567890, 6281234567890, 081234567890, 81234567890
 * @returns {boolean}
 */
export function validateWhatsApp(number) {
  const cleaned = String(number).replace(/[\s\-().]/g, '');
  const re = /^(\+?62|0)8[1-9]\d{7,11}$/;
  return re.test(cleaned);
}

/**
 * Export an array of objects to a CSV file and trigger browser download.
 * Mitigates CSV Formula Injection (CWE-1236 / OWASP A03).
 * @param {Object[]} data - Array of flat objects.
 * @param {string} filename - File name (without extension).
 */
export function exportToCSV(data, filename = 'export') {
  if (!data || data.length === 0) {
    console.warn('exportToCSV: No data to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','), // sanitized header row
    ...data.map((row) =>
      headers
        .map((h) => {
          let cell = row[h] ?? '';
          // Sanitize formula injection triggers (=, +, -, @)
          cell = sanitizeCsvCell(cell);
          cell = String(cell).replace(/"/g, '""'); // escape quotes
          return `"${cell}"`;
        })
        .join(',')
    ),
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Truncate a string to max length and add ellipsis.
 */
export function truncate(str, maxLen = 100) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/**
 * Get current ISO timestamp string.
 */
export function now() {
  return new Date().toISOString();
}

/**
 * Format HTM/fee input into standard Indonesian Rupiah ("Rp. ...") or "Bebas Biaya".
 * Examples:
 * - "HTM 75K", "75k", 75, "75000" -> "Rp. 75.000"
 * - 0, "0", "BEBAS BIAYA", "gratis" -> "Bebas Biaya"
 * - "OPEN DONASI" -> "Open Donasi"
 * @param {string|number} fee
 * @returns {string}
 */
export function formatFee(fee) {
  if (!fee && fee !== 0) return 'Bebas Biaya';
  const str = String(fee).trim();
  const lower = str.toLowerCase();

  // Cek gratis / bebas biaya
  if (
    !str ||
    lower === '0' ||
    lower.includes('bebas') ||
    lower.includes('gratis') ||
    lower === 'free'
  ) {
    return 'Bebas Biaya';
  }

  // Cek donasi
  if (lower.includes('donasi')) {
    return 'Open Donasi';
  }

  // Ekstrak angka
  const cleaned = str.replace(/[^0-9]/g, '');
  let num = parseInt(cleaned, 10);

  if (!isNaN(num)) {
    if (num === 0) return 'Bebas Biaya';
    // Jika user ngetik "75" (maksudnya 75k) atau "75K"
    if (num < 1000) {
      num = num * 1000;
    }
    return `Rp. ${num.toLocaleString('id-ID')}`;
  }

  return str;
}

/**
 * Memeriksa secara akurat apakah biaya HTM gratis / bebas biaya
 * @param {string|number} fee
 * @returns {boolean}
 */
export function isFreeFee(fee) {
  if (!fee && fee !== 0) return true;
  const str = String(fee).trim();
  if (!str) return true;
  const lower = str.toLowerCase();

  // Cek kata kunci eksplisit gratis
  if (
    lower === '0' ||
    lower === 'rp 0' ||
    lower === 'rp. 0' ||
    lower === 'free' ||
    lower.includes('bebas') ||
    lower.includes('gratis')
  ) {
    return true;
  }

  // Jika open donasi, bukan gratis (opsional transfer donasi)
  if (lower.includes('donasi')) {
    return false;
  }

  // Ekstrak angka murni
  const cleaned = str.replace(/[^0-9]/g, '');
  if (!cleaned) return false;
  const num = parseInt(cleaned, 10);
  if (!isNaN(num)) {
    return num === 0;
  }

  return false;
}

/**
 * Parse an event object into a comparable timestamp for chronological sorting.
 * Ensures closest date (e.g. date 1) appears first at the top.
 * @param {Object} evt
 * @returns {number} timestamp in milliseconds
 */
export function getEventDateTimestamp(evt) {
  if (!evt) return Infinity;

  // 1. If day is explicitly specified (e.g. "1", "13", "26")
  if (evt.day !== undefined && evt.day !== null && String(evt.day).trim() !== '') {
    const dayNum = parseInt(String(evt.day).trim(), 10);
    if (!isNaN(dayNum)) {
      const monthMap = {
        jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, may: 4,
        jun: 5, jul: 6, agu: 7, aug: 7, sep: 8, okt: 9,
        oct: 9, nov: 10, des: 11, dec: 11,
      };

      let monthIndex = 8; // Default September (0-indexed)
      if (evt.month) {
        const mKey = String(evt.month).toLowerCase().trim().slice(0, 3);
        if (monthMap[mKey] !== undefined) {
          monthIndex = monthMap[mKey];
        }
      }

      let year = 2026;
      if (evt.startDate) {
        const d = new Date(evt.startDate);
        if (!isNaN(d.getTime())) {
          year = d.getFullYear() || 2026;
          if (!evt.month) {
            monthIndex = d.getMonth();
          }
        }
      }

      let hour = 0;
      let minute = 0;
      if (evt.time) {
        const match = String(evt.time).match(/(\d{1,2}):(\d{2})/);
        if (match) {
          hour = parseInt(match[1], 10);
          minute = parseInt(match[2], 10);
        }
      }

      return new Date(year, monthIndex, dayNum, hour, minute).getTime();
    }
  }

  // 2. Fallback to startDate string directly
  if (evt.startDate) {
    const d = new Date(evt.startDate);
    if (!isNaN(d.getTime())) {
      return d.getTime();
    }
  }

  return Infinity;
}

/**
 * Convert raw URLs in plain text into safe HTML anchor tags.
 * Handles http://, https://, and www. links automatically.
 *
 * @param {string} text
 * @returns {string} HTML string with clickable links
 */
export function linkifyToHtml(text) {
  if (!text || typeof text !== 'string') return '';
  // Match URLs starting with http://, https://, or www.
  const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/g;
  return text.replace(urlRegex, (matchedUrl) => {
    // Trim trailing punctuation like ., ;, :, or ) if attached to the URL
    let cleanUrl = matchedUrl;
    let trailingPunct = '';
    const matchPunct = cleanUrl.match(/[.,;:)]+$/);
    if (matchPunct) {
      trailingPunct = matchPunct[0];
      cleanUrl = cleanUrl.slice(0, -trailingPunct.length);
    }
    const href = cleanUrl.startsWith('www.') ? `https://${cleanUrl}` : cleanUrl;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>${trailingPunct}`;
  });
}
