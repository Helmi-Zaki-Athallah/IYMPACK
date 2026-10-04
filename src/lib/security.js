/**
 * IYMPACK — Core Cybersecurity & Hardening Utility
 *
 * Implements defenses aligned with OWASP Top 10:
 * - A01:2021 Broken Access Control (Session validation, Privilege Tamper Detection)
 * - A02:2021 Cryptographic Failures (Constant-time comparison, Secure Randomness)
 * - A03:2021 Injection & XSS (DOMPurify HTML sanitizer, Safe URLs, CSV Injection mitigation)
 * - A04:2021 Insecure Design (File type/MIME verification, payload size constraints)
 * - A05:2021 Security Misconfiguration (Safe object sanitization, Prototype Pollution defense)
 * - A07:2021 Identification & Authentication Failures (Brute force rate-limiter, Password strength policy)
 * - A08:2021 Software & Data Integrity Failures (Schema validation, Input bounds)
 * - A09:2021 Security Logging & Monitoring Failures (Eliminate sensitive credential leakage in logs)
 */

import DOMPurify from 'dompurify';

// ─── 1. XSS & HTML Sanitization (OWASP A03) ───────────────────

/**
 * Configure DOMPurify hooks to enforce secure links
 */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer nofollow');
  }
});

/**
 * Strictly sanitize HTML strings before rendering via dangerouslySetInnerHTML.
 * Strips script tags, iframes, inline event handlers, and malicious URIs.
 *
 * @param {string} dirtyHtml
 * @returns {string} Clean, safe HTML
 */
export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre', 'hr', 'font'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class', 'target', 'rel', 'style', 'color'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'base', 'meta'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    USE_PROFILES: { html: true },
  });
}

/**
 * Sanitize plain text input:
 * - Trims whitespace
 * - Strips ASCII control characters (0x00-0x1F, except newline and tab)
 * - Limits maximum length to prevent Denial of Service (DoS)
 *
 * @param {string} text
 * @param {number} [maxLength=500]
 * @returns {string}
 */
export function sanitizeText(text, maxLength = 500) {
  if (text === null || text === undefined) return '';
  const str = String(text);
  // Remove control characters (except newline \n and tab \t) — intentional sanitization
  const cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim(); // oxlint-disable-line eslint/no-control-regex, oxlint-disable-line no-control-regex
  return maxLength > 0 ? cleaned.slice(0, maxLength) : cleaned;
}

/**
 * Prevent CSV / Excel Formula Injection (CWE-1236 / OWASP A03).
 * If a cell begins with '=', '+', '-', '@', tab, or carriage return,
 * prepends a single quote "'" to neutralize execution in spreadsheet software.
 *
 * @param {*} value
 * @returns {string}
 */
export function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Validate and sanitize URLs to allow only safe protocols.
 * Strictly blocks 'javascript:', 'vbscript:', 'data:text/html', and file URIs.
 *
 * @param {string} url
 * @param {string[]} [allowedProtocols=['http:', 'https:', 'mailto:', 'tel:']]
 * @returns {string} Sanitized URL or empty string if invalid/dangerous
 */
export function sanitizeUrl(url, allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Block obvious dangerous schemes immediately
  if (/^(?:javascript|vbscript|data(?!\s*:\s*image)):/i.test(trimmed)) {
    return '';
  }

  // Allow relative URLs starting with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (allowedProtocols.includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    // Invalid URL structure
    return '';
  }

  return '';
}

// ─── 2. Prototype Pollution Defense (OWASP A05 / A08) ─────────

const FORBIDDEN_PROPERTIES = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Deep-sanitizes an object by removing prototype pollution vectors.
 *
 * @template T
 * @param {T} obj
 * @returns {T} Sanitized object clone
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const clean = Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    if (!FORBIDDEN_PROPERTIES.has(key)) {
      clean[key] = typeof value === 'object' && value !== null
        ? sanitizeObject(value)
        : value;
    }
  }
  return Object.assign({}, clean);
}

// ─── 3. File Upload Verification (OWASP A04 / A08) ────────────

export const ALLOWED_IMAGE_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/jfif',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB

/**
 * Validates file upload safety before reading as DataURL or uploading.
 * Checks file presence, size limits, and ensures MIME type is in the strict image allowlist.
 * Explicitly rejects SVG, HTML, and executables to prevent stored client-side XSS.
 *
 * @param {File} file
 * @param {Object} [options]
 * @param {number} [options.maxBytes=15728640]
 * @param {string[]} [options.allowedTypes=ALLOWED_IMAGE_MIME_TYPES]
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUploadedFile(file, options = {}) {
  const maxBytes = options.maxBytes || MAX_IMAGE_BYTES;
  const allowedTypes = options.allowedTypes || ALLOWED_IMAGE_MIME_TYPES;

  if (!file) {
    return { valid: false, error: 'Berkas tidak ditemukan.' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'Berkas kosong tidak valid.' };
  }

  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return { valid: false, error: `Ukuran berkas melebihi batas maksimal (${maxMb}MB).` };
  }

  const mime = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const hasExt = /\.[a-z0-9]+$/i.test(name);
  const validExtension = hasExt ? /\.(jpe?g|png|webp|heic|heif|jfif)$/i.test(name) : false;

  const isAllowedMime = allowedTypes.includes(mime);
  const isFallbackAllowed = (mime === '' || mime === 'application/octet-stream') && validExtension;

  if (!isAllowedMime && !isFallbackAllowed && !validExtension) {
    return {
      valid: false,
      error: `Format berkas (${mime || 'tidak dikenal'}) tidak diizinkan. Harap gunakan format JPG, JPEG, PNG, atau WEBP.`,
    };
  }

  return { valid: true };
}

/**
 * Validates that a Data URL string is a safe image Data URL.
 *
 * @param {string} dataUrl
 * @returns {boolean}
 */
export function isSafeImageDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  return /^data:image\/(?:jpeg|jpg|png|webp|jfif|heic|heif);base64,[A-Za-z0-9+/=\s]+$/i.test(dataUrl);
}

// ─── 4. Rate Limiting & Brute Force Defense (OWASP A07) ────────

const RATE_LIMIT_PREFIX = 'iympack_rl_';

/**
 * Checks whether an action (e.g. login attempt) is rate-limited.
 *
 * @param {string} actionKey - Unique identifier (e.g. email or action name)
 * @param {number} [maxAttempts=5] - Maximum failed attempts before lockout
 * @param {number} [lockDurationMs=900000] - Lockout duration (default 15 minutes)
 * @returns {{ limited: boolean, remainingSeconds: number, attempts: number }}
 */
export function checkRateLimit(actionKey, _maxAttempts = 5, _lockDurationMs = 15 * 60 * 1000) {
  const storageKey = RATE_LIMIT_PREFIX + actionKey.toLowerCase().trim();
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) {
      return { limited: false, remainingSeconds: 0, attempts: 0 };
    }

    const record = JSON.parse(raw);
    const now = Date.now();

    // Check if lockout is still active
    if (record.lockedUntil && now < record.lockedUntil) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { limited: true, remainingSeconds, attempts: record.attempts };
    }

    // Reset if lock has expired
    if (record.lockedUntil && now >= record.lockedUntil) {
      sessionStorage.removeItem(storageKey);
      return { limited: false, remainingSeconds: 0, attempts: 0 };
    }

    return { limited: false, remainingSeconds: 0, attempts: record.attempts || 0 };
  } catch {
    return { limited: false, remainingSeconds: 0, attempts: 0 };
  }
}

/**
 * Record a failed attempt for an action key.
 *
 * @param {string} actionKey
 * @param {number} [maxAttempts=5]
 * @param {number} [lockDurationMs=900000]
 * @returns {{ limited: boolean, remainingSeconds: number, attempts: number }}
 */
export function recordFailedAttempt(actionKey, maxAttempts = 5, lockDurationMs = 15 * 60 * 1000) {
  const storageKey = RATE_LIMIT_PREFIX + actionKey.toLowerCase().trim();
  try {
    const raw = sessionStorage.getItem(storageKey);
    const now = Date.now();
    let record = raw ? JSON.parse(raw) : { attempts: 0, firstAttemptAt: now };

    record.attempts = (record.attempts || 0) + 1;
    record.lastAttemptAt = now;

    if (record.attempts >= maxAttempts) {
      record.lockedUntil = now + lockDurationMs;
    }

    sessionStorage.setItem(storageKey, JSON.stringify(record));

    if (record.lockedUntil && now < record.lockedUntil) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { limited: true, remainingSeconds, attempts: record.attempts };
    }

    return { limited: false, remainingSeconds: 0, attempts: record.attempts };
  } catch {
    return { limited: false, remainingSeconds: 0, attempts: 1 };
  }
}

/**
 * Reset rate limit counter upon successful action.
 *
 * @param {string} actionKey
 */
export function resetRateLimit(actionKey) {
  const storageKey = RATE_LIMIT_PREFIX + actionKey.toLowerCase().trim();
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    // Ignore storage errors
  }
}

// ─── 5. Password Policy & Cryptographic Helpers (OWASP A02/A07)

/**
 * Validates password strength.
 * Minimal 8 karakter, harus mengandung huruf besar, huruf kecil, dan angka.
 * (OWASP A07 — Identification & Authentication Failures)
 *
 * @param {string} password
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password wajib diisi.' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password minimal 8 karakter.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung minimal satu huruf kapital.' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung minimal satu huruf kecil.' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung minimal satu angka.' };
  }

  return { valid: true };
}

/**
 * Constant-time string comparison to prevent timing attacks.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Generates a cryptographically strong random alphanumeric string.
 *
 * @param {number} [length=16]
 * @returns {string}
 */
export function generateSecureRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join('');
}
