/**
 * IYMPACK CMS — 100% Pure MySQL Server Database Architecture
 *
 * Kebijakan Penyimpanan:
 * - Data konten (events, articles, applicants, teams, gallery, faqs, vouchers, settings, dll.)
 *   100% DISIMPAN DI DATABASE MYSQL SERVER (/api/collections.php).
 * - TIDAK ADA lagi data konten yang disimpan ke localStorage browser.
 * - localStorage HANYA digunakan khusus untuk sesi autentikasi admin (iympack_auth_session).
 * - Di sisi browser, data hanya disimpan di in-memory cache (_memoryStore) selama sesi runtime.
 */

import { sanitizeObject } from './security.js';
import {
  saveServerCollection,
  fetchServerCollections,
} from './api.js';

// In-Memory store untuk runtime React SPA
const _memoryStore = {};

const AUTH_KEY = 'iympack_auth_session';

// Pembersihan otomatis: Hapus seluruh cache konten lama dari localStorage pengguna
// agar browser bebas beban kuota 5MB dan 100% bergantung pada server MySQL.
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('iympack_') && k !== AUTH_KEY) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
} catch {}

/**
 * Retrieve a collection (array) from in-memory store.
 * Returns empty array if key doesn't exist.
 */
export function getCollection(key) {
  try {
    if (_memoryStore[key] !== undefined) {
      const val = _memoryStore[key];
      return Array.isArray(val) ? val : [];
    }
    return [];
  } catch (err) {
    console.error(`[storage] Gagal mengambil koleksi "${key}":`, err);
    return [];
  }
}

/**
 * Persist a collection (array) to in-memory store and sync directly to Hostinger MySQL.
 */
export async function setCollection(key, data, syncToServer = true) {
  const safeData = Array.isArray(data) ? data.map((item) => sanitizeObject(item)) : [];
  _memoryStore[key] = safeData;

  // Khusus AUTH_KEY jika berupa array
  if (key === AUTH_KEY) {
    try {
      localStorage.setItem(key, JSON.stringify(safeData));
    } catch {}
  }

  // Simpan langsung ke database MySQL Hostinger
  if (syncToServer) {
    try {
      return await saveServerCollection(key, safeData);
    } catch (e) {
      console.warn(`[storage] Sinkronisasi server untuk "${key}" gagal:`, e);
      return false;
    }
  }
  return true;
}

/**
 * Retrieve a single object from in-memory store or localStorage (hanya untuk AUTH_SESSION).
 */
export function getObject(key) {
  try {
    if (_memoryStore[key] !== undefined) {
      return _memoryStore[key] ? sanitizeObject(_memoryStore[key]) : null;
    }
    if (key === AUTH_KEY) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const safe = sanitizeObject(parsed);
        _memoryStore[key] = safe;
        return safe;
      }
    }
    return null;
  } catch (err) {
    console.error(`[storage] Gagal membaca objek "${key}":`, err);
    return null;
  }
}

/**
 * Persist a single object to in-memory store and sync with Hostinger MySQL (kecuali AUTH_SESSION disimpan di localStorage).
 */
export async function setObject(key, data, syncToServer = true) {
  const safeData = sanitizeObject(data);
  if (safeData && typeof safeData === 'object' && !Array.isArray(safeData)) {
    safeData._updatedAt = new Date().toISOString();
  }
  _memoryStore[key] = safeData;

  if (key === AUTH_KEY) {
    try {
      localStorage.setItem(key, JSON.stringify(safeData));
    } catch {}
    return true;
  }

  // Simpan langsung ke database MySQL Hostinger
  if (syncToServer) {
    try {
      return await saveServerCollection(key, safeData);
    } catch (e) {
      console.warn(`[storage] Sinkronisasi server untuk "${key}" gagal:`, e);
      return false;
    }
  }
  return true;
}

/**
 * Remove a key from in-memory store and localStorage.
 */
export function removeKey(key) {
  delete _memoryStore[key];
  if (key === AUTH_KEY) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

/**
 * Find a single item by ID within a collection.
 * @returns {Object|null}
 */
export function findById(key, id) {
  const items = getCollection(key);
  return items.find((item) => item.id === id) || null;
}

/**
 * Find a single item by a custom field value.
 * @returns {Object|null}
 */
export function findByField(key, field, value) {
  const items = getCollection(key);
  return items.find((item) => item[field] === value) || null;
}

/**
 * Insert a new item into a collection and persist to MySQL.
 * @returns {Promise<Object>} The inserted item.
 */
export async function insertItem(key, item) {
  const items = getCollection(key);
  const safeItem = sanitizeObject(item);
  const currentTime = new Date().toISOString();
  if (!safeItem.createdAt) safeItem.createdAt = currentTime;
  safeItem.updatedAt = currentTime;
  items.push(safeItem);
  await setCollection(key, items, true);
  return safeItem;
}

/**
 * Update an existing item in a collection by ID and persist to MySQL.
 * @returns {Promise<Object|null>} The updated item, or null if not found.
 */
export async function updateItem(key, id, updates) {
  const items = getCollection(key);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const safeUpdates = sanitizeObject(updates);
  safeUpdates.updatedAt = new Date().toISOString();
  items[index] = { ...items[index], ...safeUpdates };
  await setCollection(key, items, true);
  return items[index];
}

/**
 * Delete an item from a collection by ID and persist to MySQL.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
export async function deleteItem(key, id) {
  const items = getCollection(key);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;

  await setCollection(key, filtered, true);
  return true;
}

/**
 * Query items from a collection using a predicate function.
 * @param {string} key - LS key.
 * @param {Function} filterFn - Predicate `(item) => boolean`.
 * @returns {Object[]} Filtered items.
 */
export function queryItems(key, filterFn) {
  const items = getCollection(key);
  return typeof filterFn === 'function' ? items.filter(filterFn) : items;
}

/**
 * Count items in a collection, optionally filtered.
 */
export function countItems(key, filterFn) {
  return queryItems(key, filterFn).length;
}

/**
 * Sinkronisasi data dari database MySQL Hostinger (Server as Single Source of Truth).
 * - Mengambil data langsung dari MySQL Hostinger via collections.php
 * - Mengisi cache in-memory _memoryStore
 * - Mengembalikan true jika ada perubahan agar React state langsung di-refresh
 * @returns {Promise<boolean>}
 */
export async function syncWithHostingerDatabase() {
  try {
    const serverCollections = await fetchServerCollections();
    if (!serverCollections || typeof serverCollections !== 'object') {
      return false;
    }

    const serverKeys = Object.keys(serverCollections);
    let hasChanges = false;

    serverKeys.forEach((k) => {
      const serverVal = serverCollections[k];
      if (serverVal === undefined || serverVal === null) return;

      const currentMemory = JSON.stringify(_memoryStore[k]);
      const serverStr = JSON.stringify(serverVal);

      if (currentMemory !== serverStr) {
        _memoryStore[k] = serverVal;
        hasChanges = true;
      }
    });

    return hasChanges;
  } catch (err) {
    console.warn('[storage] Revalidasi data dari database Hostinger gagal:', err);
    return false;
  }
}
