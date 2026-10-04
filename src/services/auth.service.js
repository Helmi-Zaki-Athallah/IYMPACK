/**
 * IYMPACK CMS — Auth Service
 *
 * Handles password hashing, login/logout, and session management.
 * Uses Web Crypto API (SHA-256 + salt) for password hashing.
 */

import { LS_KEYS, SESSION_TIMEOUT_MS } from '../lib/db.constants.js';
import { findByField, getObject, setObject, removeKey } from '../lib/storage.js';
import { apiClient } from '../lib/api.js';
import { now } from '../lib/utils.js';
import {
  constantTimeCompare,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  sanitizeText,
} from '../lib/security.js';

// ─── Password Hashing ───────────────────────────────────────

/**
 * Generate a random salt (hex string).
 */
function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password with a salt using SHA-256.
 * @returns {Promise<{hash: string, salt: string}>}
 */
export async function hashPassword(password, salt = null) {
  const usedSalt = salt || generateSalt();
  const data = new TextEncoder().encode(usedSalt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return { hash, salt: usedSalt };
}

/**
 * Verify a password against a stored hash + salt.
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, storedHash, storedSalt) {
  const { hash } = await hashPassword(password, storedSalt);
  return constantTimeCompare(hash, storedHash);
}

// ─── Login / Logout ──────────────────────────────────────────

/**
 * Attempt to log in with email and password.
 * Protected with OWASP A07 Brute-Force Rate Limiting (5 attempts / 15 min lock).
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Session object
 */
export async function login(email, password) {
  const cleanEmail = sanitizeText(email, 120).toLowerCase().trim();

  // Client-side pre-check: rate limiting (defense-in-depth, server juga melakukan ini)
  const rl = checkRateLimit(cleanEmail);
  if (rl.limited) {
    const minutesLeft = Math.ceil(rl.remainingSeconds / 60);
    throw new Error(
      `Terlalu banyak percobaan login gagal. Akun dikunci sementara demi keamanan. Coba lagi dalam ${minutesLeft} menit.`
    );
  }

  // Autentikasi 100% server-side via PHP (BCRYPT + IP Rate Limiting)
  // Tidak ada fallback client-side — jika server gagal, login ditolak.
  try {
    const res = await apiClient.post('/auth.php', { email: cleanEmail, password });
    if (res.data?.success && res.data?.token) {
      resetRateLimit(cleanEmail);
      const session = {
        userId: res.data.user.userId,
        userName: res.data.user.userName,
        userEmail: res.data.user.userEmail,
        userRole: res.data.user.userRole,
        userTeamId: res.data.user.userTeamId,
        token: res.data.token,
        loginAt: now(),
        lastActivity: now(),
      };
      await setObject(LS_KEYS.AUTH_SESSION, session, false);
      return session;
    }
    // Server mengembalikan sukses=false tanpa exception
    recordFailedAttempt(cleanEmail);
    throw new Error('Email atau password salah.');
  } catch (apiErr) {
    const status = apiErr.response?.status;
    const msg = apiErr.response?.data?.error || '';

    if (status === 429) {
      throw new Error(msg || 'Terlalu banyak percobaan. Coba lagi nanti.');
    }
    if (status === 401) {
      recordFailedAttempt(cleanEmail);
      const updatedRl = checkRateLimit(cleanEmail);
      if (updatedRl.limited) {
        throw new Error('Terlalu banyak percobaan login gagal. Akun dikunci sementara selama 15 menit.');
      }
      throw new Error(msg || 'Email atau password salah.');
    }
    if (status === 403) {
      throw new Error(msg || 'Akun Anda telah dinonaktifkan. Hubungi Super Admin.');
    }

    // Error jaringan / server down — tolak login, jangan fallback
    if (!apiErr.response) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif dan coba lagi.');
    }

    throw new Error(msg || 'Terjadi kesalahan server. Coba lagi beberapa saat.');
  }
}

/**
 * Log out the current session.
 */
export function logout() {
  removeKey(LS_KEYS.AUTH_SESSION);
}

// ─── Session Management ─────────────────────────────────────

/**
 * Get the current session, or null if not logged in.
 * @returns {Object|null}
 */
export function getCurrentSession() {
  return getObject(LS_KEYS.AUTH_SESSION);
}

/**
 * Check if the current session is still valid (within timeout).
 * Cross-validates against true storage records to block client-side role tampering (OWASP A01).
 * If expired or tampered, automatically revokes the session.
 * @returns {boolean}
 */
export function isSessionValid() {
  const session = getCurrentSession();
  if (!session || !session.userId) return false;

  const lastActivity = new Date(session.lastActivity).getTime();
  const elapsed = Date.now() - lastActivity;

  if (elapsed > SESSION_TIMEOUT_MS) {
    logout(); // auto-expire
    return false;
  }

  // Integrity Check: Verify against stored user in database/storage
  const user = findByField(LS_KEYS.USERS, 'id', session.userId);
  if (!user || user.status === 'suspended') {
    logout(); // User deleted or suspended
    return false;
  }

  // Privilege Tamper Detection: User cannot elevate role via LocalStorage editing
  if (session.userRole !== user.role) {
    logout(); // Privilege mismatch detected
    return false;
  }

  return true;
}

/**
 * Refresh the "lastActivity" timestamp on the current session.
 * Call this on user interaction to keep the session alive.
 */
export function refreshSession() {
  const session = getCurrentSession();
  if (session) {
    session.lastActivity = now();
    setObject(LS_KEYS.AUTH_SESSION, session);
  }
}

/**
 * Mock "forgot password" — returns generic message to prevent user enumeration (OWASP A07).
 */
export function resetPasswordRequest(email) {
  const _cleanEmail = sanitizeText(email, 120).toLowerCase().trim();
  void _cleanEmail;
  // Generic success message regardless of existence (prevent account enumeration)
  return { success: true, message: 'Jika email terdaftar, tautan reset password telah dikirim.' };
}
