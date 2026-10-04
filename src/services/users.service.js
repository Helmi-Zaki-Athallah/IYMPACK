/**
 * IYMPACK CMS — Users Service
 *
 * CRUD operations for internal Admin & Super Admin users.
 */

import { LS_KEYS, USER_STATUS } from '../lib/db.constants.js';
import { createUser } from '../lib/db.schemas.js';
import {
  getCollection,
  findById,
  findByField,
  insertItem,
  updateItem,
  deleteItem,
} from '../lib/storage.js';
import { hashPassword } from './auth.service.js';
import { now, validateEmail } from '../lib/utils.js';
import { validatePasswordStrength, generateSecureRandomString, sanitizeText } from '../lib/security.js';

/**
 * Get all users, optionally filtered.
 * @param {Object} [filters] - { role, status, search }
 */
export function getUsers(filters = {}) {
  let users = getCollection(LS_KEYS.USERS);

  if (filters.role) {
    users = users.filter((u) => u.role === filters.role);
  }
  if (filters.status) {
    users = users.filter((u) => u.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    users = users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  // Jangan kembalikan passwordHash & salt ke caller
  return users.map(({ passwordHash: _passwordHash, salt: _salt, ...rest }) => rest);
}

/**
 * Get a single user by ID (tanpa password fields).
 */
export function getUserById(id) {
  const user = findById(LS_KEYS.USERS, id);
  if (!user) return null;
  const { passwordHash: _passwordHash, salt: _salt, ...rest } = user;
  return rest;
}

/**
 * Create a new user account.
 * @param {Object} data - { name, email, role }
 * @param {string} [tempPassword] - Temporary password. If not provided, generates one.
 * @returns {Promise<Object>} Created user (without password fields) + tempPassword for display.
 */
export async function createNewUser(data, tempPassword = null) {
  if (!data || typeof data !== 'object') {
    throw new Error('Data pengguna tidak valid.');
  }

  const cleanName = sanitizeText(data.name, 100);
  const cleanEmail = sanitizeText(data.email, 120).toLowerCase().trim();

  if (!cleanName || cleanName.length < 2) {
    throw new Error('Nama pengguna wajib diisi (minimal 2 karakter).');
  }

  if (!cleanEmail || !validateEmail(cleanEmail)) {
    throw new Error('Format alamat email tidak valid.');
  }

  // Validasi email unik
  const existing = findByField(LS_KEYS.USERS, 'email', cleanEmail);
  if (existing) {
    throw new Error('Email sudah digunakan oleh akun lain.');
  }

  // Generate strong random password if not supplied
  const password = tempPassword || `Iym@${generateSecureRandomString(8)}9#`;
  const pwdCheck = validatePasswordStrength(password);
  if (!pwdCheck.valid) {
    throw new Error(pwdCheck.message);
  }

  const { hash, salt } = await hashPassword(password);

  const user = createUser({
    name: cleanName,
    email: cleanEmail,
    role: data.role,
    teamId: data.role === 'super_admin' ? 'pusat' : (data.teamId || 'jakarta'),
    passwordHash: hash,
    salt,
  });

  insertItem(LS_KEYS.USERS, user);

  const { passwordHash: _h, salt: _s, ...safeUser } = user;
  // OWASP A09: Never output plaintext credentials or secrets to browser console
  return { ...safeUser, tempPassword: password };
}

/**
 * Update user info (name, role).
 */
export function updateUser(id, updates) {
  // Sanitize: don't allow password changes via this function
  const { passwordHash: _passwordHash, salt: _salt, ...safeUpdates } = updates;
  if (safeUpdates.name) {
    safeUpdates.name = sanitizeText(safeUpdates.name, 100);
  }
  safeUpdates.updatedAt = now();

  const updated = updateItem(LS_KEYS.USERS, id, safeUpdates);
  if (!updated) throw new Error('User tidak ditemukan.');

  const { passwordHash: _h, salt: _s, ...rest } = updated;
  return rest;
}

/**
 * Change a user's password (by admin or self).
 * Enforces relaxed policy (min 6 chars).
 */
export async function changePassword(id, newPassword) {
  const user = findById(LS_KEYS.USERS, id);
  if (!user) throw new Error('User tidak ditemukan.');

  const pwdCheck = validatePasswordStrength(newPassword);
  if (!pwdCheck.valid) {
    throw new Error(pwdCheck.message);
  }

  const { hash, salt } = await hashPassword(newPassword);
  const updated = await updateItem(LS_KEYS.USERS, id, {
    passwordHash: hash,
    salt,
    updatedAt: now(),
  });
  if (!updated) throw new Error('Gagal memperbarui password.');

  return true;
}

/**
 * Suspend a user account.
 */
export function suspendUser(id) {
  const updated = updateItem(LS_KEYS.USERS, id, {
    status: USER_STATUS.SUSPENDED,
    updatedAt: now(),
  });
  if (!updated) throw new Error('User tidak ditemukan.');
  return true;
}

/**
 * Activate (unsuspend) a user account.
 */
export function activateUser(id) {
  const updated = updateItem(LS_KEYS.USERS, id, {
    status: USER_STATUS.ACTIVE,
    updatedAt: now(),
  });
  if (!updated) throw new Error('User tidak ditemukan.');
  return true;
}

/**
 * Delete a user account.
 */
export function deleteUser(id) {
  const deleted = deleteItem(LS_KEYS.USERS, id);
  if (!deleted) throw new Error('User tidak ditemukan.');
  return true;
}

/**
 * Mock "resend set-password link" for a user.
 */
export function resendSetPassword(id) {
  const user = findById(LS_KEYS.USERS, id);
  if (!user) throw new Error('User tidak ditemukan.');
  console.log(`[users] 📧 Resent set-password link to: ${user.email} (mock)`);
  return { success: true, message: `Tautan set password dikirim ulang ke ${user.email}.` };
}
