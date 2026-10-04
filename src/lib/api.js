/**
 * IYMPACK CMS — API Client Layer for Hostinger MySQL Backend
 *
 * Menghubungkan frontend React dengan PHP REST API di Hostinger menggunakan Axios:
 * - /api/collections.php (CRUD data MySQL)
 * - /api/upload.php (Unggah file ke folder uploads/)
 */

import axios from 'axios';

const API_TIMEOUT_MS = 10000;

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Injeksi otomatis token autentikasi (Bearer Token) untuk operasi admin
apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('iympack_auth_session');
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    }
  } catch {}
  return config;
});
/**
 * Mengambil seluruh koleksi data dari database MySQL Hostinger
 * @returns {Promise<Object|null>} Map koleksi { iympack_events: [...], ... } atau null jika gagal
 */
export async function fetchServerCollections() {
  try {
    const res = await apiClient.get('/collections.php', {
      params: { key: 'all', _t: Date.now() },
    });
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn('[api] Failed to fetch server collections:', err?.message || err);
    return null;
  }
}

/**
 * Mengambil satu koleksi data spesifik dari MySQL Hostinger
 * @param {string} key
 * @returns {Promise<Array|null>}
 */
export async function fetchServerCollection(key) {
  try {
    const res = await apiClient.get('/collections.php', {
      params: { key, _t: Date.now() },
    });
    return res.data?.success ? res.data.data : null;
  } catch (err) {
    console.warn(`[api] Failed to fetch server collection "${key}":`, err?.message || err);
    return null;
  }
}

/**
 * Menyimpan seluruh data koleksi ke MySQL Hostinger (Background Sync)
 * @param {string} key
 * @param {any} data
 */
export async function saveServerCollection(key, data) {
  try {
    const res = await apiClient.post('/collections.php', { key, data });
    return res.data?.success === true;
  } catch (err) {
    console.error(`[api] Gagal sinkronisasi koleksi "${key}" ke database Hostinger:`, err?.response?.data || err?.message || err);
    throw err;
  }
}

/**
 * Menambahkan satu item ke koleksi secara atomic di database MySQL Hostinger.
 * Sangat penting untuk pendaftaran agar tidak saling menimpa jika banyak orang daftar bersamaan.
 * @param {string} key
 * @param {Object} item
 */
export async function appendServerCollectionItem(key, item) {
  try {
    const res = await apiClient.post('/collections.php', { key, item }, {
      params: { action: 'append' },
    });
    return res.data?.success ? res.data.item : null;
  } catch (err) {
    console.error(`[api] Gagal append item ke koleksi "${key}" di Hostinger:`, err?.response?.data || err?.message || err);
    return null;
  }
}

/**
 * Melakukan reservasi / penguncian slot sementara (15 menit) di server
 * sebelum peserta melakukan pembayaran transfer bank.
 * @param {string} eventId
 * @param {{ holdId: string, email: string, fullName: string }} payload
 */
export async function holdServerSlot(eventId, { holdId, email, fullName }) {
  try {
    const res = await apiClient.post('/collections.php', {
      action: 'hold_slot',
      eventId,
      holdId,
      email,
      fullName,
    }, {
      params: { action: 'hold_slot' },
    });
    return res.data;
  } catch (err) {
    const errorData = err?.response?.data;
    const error = new Error(errorData?.message || errorData?.error || 'Gagal mengamankan slot sementara.');
    error.code = errorData?.error || 'HOLD_FAILED';
    throw error;
  }
}

/**
 * Melepaskan reservasi slot sementara jika peserta membatalkan pendaftaran
 * @param {string} holdId
 */
export async function releaseServerSlot(holdId) {
  if (!holdId) return false;
  try {
    const res = await apiClient.post('/collections.php', {
      action: 'release_hold',
      holdId,
    }, {
      params: { action: 'release_hold' },
    });
    return res.data?.success === true;
  } catch {
    return false;
  }
}

/**
 * Mendaftarkan peserta secara atomic dengan validasi kuota langsung di MySQL server.
 * Mencegah race condition ketika 2 atau lebih pendaftar menekan tombol bersamaan di slot terakhir.
 * @param {string} eventId
 * @param {Object} applicant
 * @param {string} [holdId]
 */
export async function registerServerApplicant(eventId, applicant, holdId = '') {
  try {
    const res = await apiClient.post('/collections.php', {
      action: 'register_applicant',
      eventId,
      applicant,
      holdId: holdId || applicant.holdId || '',
    }, {
      params: { action: 'register_applicant' },
    });
    return res.data;
  } catch (err) {
    const errorData = err?.response?.data;
    if (errorData?.error === 'KUOTA_PENUH' || errorData?.message?.includes('KUOTA_PENUH')) {
      const quotaErr = new Error(errorData?.message || 'KUOTA_PENUH: Kuota pendaftaran untuk kegiatan ini baru saja terpenuhi oleh pendaftar lain.');
      quotaErr.code = 'KUOTA_PENUH';
      throw quotaErr;
    }
    throw new Error(errorData?.message || errorData?.error || 'Gagal memproses pendaftaran ke server.');
  }
}

/**
 * Mengirim seluruh data localStorage ke database Hostinger (pertama kali deploy)
 * @param {Object} collectionsMap
 */
export async function bulkSyncToServer(collectionsMap) {
  try {
    const res = await apiClient.post('/collections.php', {
      action: 'bulk_sync',
      collections: collectionsMap,
    }, {
      params: { action: 'bulk_sync' },
    });
    return res.data?.success === true;
  } catch (err) {
    console.error('[api] Gagal bulk sync ke Hostinger:', err?.response?.data || err?.message || err);
    return false;
  }
}
