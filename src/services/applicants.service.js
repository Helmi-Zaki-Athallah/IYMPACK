/**
 * IYMPACK CMS — Applicants Service
 *
 * Handles volunteer registration submissions and admin verification.
 */

import { LS_KEYS, APPLICANT_STATUS } from '../lib/db.constants.js';
import { createApplicant } from '../lib/db.schemas.js';
import {
  getCollection,
  setCollection,
  findById,
  insertItem,
  updateItem,
  deleteItem,
  queryItems,
  countItems,
} from '../lib/storage.js';
import { appendServerCollectionItem, registerServerApplicant } from '../lib/api.js';
import { validateEmail, validateWhatsApp, now, exportToCSV } from '../lib/utils.js';
import { sanitizeText, isSafeImageDataUrl, sanitizeUrl, sanitizeObject } from '../lib/security.js';

/**
 * Submit a volunteer application (public form).
 * Validates input strictly before saving (OWASP A03 / A04 / A08).
 * @param {string} eventId
 * @param {Object} data - { fullName, whatsapp, email, city, reason, ... }
 * @returns {Object} The created applicant record.
 */
export async function submitApplication(eventId, data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Data formulir pendaftaran tidak valid.');
  }

  // ─── Validasi & Sanitasi Input Ketat (OWASP A03/A04) ───────
  const cleanFullName = sanitizeText(data.fullName, 120);
  const cleanWhatsapp = sanitizeText(data.whatsapp, 25);
  const cleanEmail = sanitizeText(data.email, 120).toLowerCase().trim();
  const cleanCity = sanitizeText(data.city, 100);
  const cleanReason = sanitizeText(data.reason, 3000);

  if (!cleanFullName || cleanFullName.length < 2) {
    throw new Error('Nama lengkap wajib diisi (minimal 2 karakter).');
  }
  if (!cleanWhatsapp || !validateWhatsApp(cleanWhatsapp)) {
    throw new Error('Nomor WhatsApp tidak valid. Gunakan format 08xx atau +62xx.');
  }
  if (!cleanEmail || !validateEmail(cleanEmail)) {
    throw new Error('Format alamat email tidak valid.');
  }
  if (!cleanCity || cleanCity.length < 2) {
    throw new Error('Domisili/kota wajib diisi.');
  }

  // Validasi keamanan berkas bukti (Data URL / Image URL)
  let cleanFollowProof = '';
  if (data.followProof) {
    if (typeof data.followProof === 'string' && data.followProof.startsWith('data:image/')) {
      if (isSafeImageDataUrl(data.followProof)) {
        cleanFollowProof = data.followProof;
      }
    } else {
      cleanFollowProof = sanitizeUrl(data.followProof) || '';
    }
  }

  let cleanTiktokProof = '';
  if (data.tiktokProof) {
    if (typeof data.tiktokProof === 'string' && data.tiktokProof.startsWith('data:image/')) {
      if (isSafeImageDataUrl(data.tiktokProof)) {
        cleanTiktokProof = data.tiktokProof;
      }
    } else {
      cleanTiktokProof = sanitizeUrl(data.tiktokProof) || '';
    }
  }

  let cleanPaymentProof = '';
  if (data.paymentProof) {
    if (typeof data.paymentProof === 'string' && data.paymentProof.startsWith('data:image/')) {
      if (isSafeImageDataUrl(data.paymentProof)) {
        cleanPaymentProof = data.paymentProof;
      }
    } else {
      cleanPaymentProof = sanitizeUrl(data.paymentProof) || '';
    }
  }

  // Sanitasi jawaban kustom
  const safeCustomAnswers = {};
  if (data.customAnswers && typeof data.customAnswers === 'object') {
    for (const [key, val] of Object.entries(data.customAnswers)) {
      const safeKey = sanitizeText(key, 100);
      if (typeof val === 'string') {
        safeCustomAnswers[safeKey] = val.startsWith('data:image/')
          ? (isSafeImageDataUrl(val) ? val : '')
          : sanitizeText(val, 1500);
      } else {
        safeCustomAnswers[safeKey] = sanitizeText(String(val ?? ''), 1500);
      }
    }
  }

  // Cek duplikat: apakah email ini sudah mendaftar di event yang sama
  const existing = queryItems(LS_KEYS.APPLICANTS, (a) =>
    a.eventId === eventId && a.email.toLowerCase() === cleanEmail
  );
  if (existing.length > 0) {
    throw new Error('Email ini sudah terdaftar untuk kegiatan ini.');
  }

  // Cek apakah event exists dan masih buka
  const events = getCollection(LS_KEYS.EVENTS);
  const event = events.find((e) => e.id === eventId || e.slug === eventId);
  if (!event) {
    throw new Error('Kegiatan tidak ditemukan.');
  }
  if (event.status === 'closed') {
    throw new Error('Pendaftaran untuk kegiatan ini sudah ditutup.');
  }
  if (event.maxQuota > 0 && event.currentApplicants >= event.maxQuota) {
    throw new Error('KUOTA_PENUH: Kuota pendaftaran untuk kegiatan ini baru saja terpenuhi oleh pendaftar lain.');
  }

  const cleanHoldId = sanitizeText(String(data.holdId || ''), 100);

  // ─── Simpan Applicant ────────────────────────────────────
  const applicant = createApplicant({
    eventId: event.id || eventId,
    teamId: event.teamId || 'pusat',
    fullName: cleanFullName,
    whatsapp: cleanWhatsapp,
    email: cleanEmail,
    city: cleanCity,
    reason: cleanReason,
    followProof: cleanFollowProof,
    tiktokProof: cleanTiktokProof,
    paymentProof: cleanPaymentProof,
    fee: sanitizeText(String(data.fee || event.fee || ''), 50),
    voucherCode: sanitizeText(String(data.voucherCode || ''), 50),
    discountAmount: Number(data.discountAmount) || 0,
    finalFee: sanitizeText(String(data.finalFee || ''), 50),
    customAnswers: sanitizeObject(safeCustomAnswers),
    holdId: cleanHoldId,
  });

  // ─── Validasi & Simpan secara Atomic di MySQL Server ───────
  // Memanfaatkan transaksi row-lock (SELECT ... FOR UPDATE) di MySQL.
  // Jika 2 atau lebih pendaftar menekan tombol bersamaan di slot terakhir,
  // hanya 1 yang lolos dan yang lain otomatis mendapat pesan KUOTA_PENUH.
  try {
    const serverResult = await registerServerApplicant(event.id || eventId, applicant, cleanHoldId);
    if (serverResult?.success) {
      const currentList = getCollection(LS_KEYS.APPLICANTS);
      currentList.push(applicant);

      const idx = events.findIndex((e) => e.id === eventId || e.slug === eventId);
      if (idx !== -1) {
        if (serverResult.updatedEvent) {
          events[idx] = { ...events[idx], ...serverResult.updatedEvent };
        } else {
          events[idx].currentApplicants = (events[idx].currentApplicants || 0) + 1;
        }
      }
      return applicant;
    }
    throw new Error(serverResult?.error || 'Gagal memproses pendaftaran ke database server.');
  } catch (err) {
    if (err.code === 'KUOTA_PENUH' || err.message?.includes('KUOTA_PENUH')) {
      throw err;
    }
    console.error('[applicants] Server atomic registration error:', err);
    throw new Error(err.message || 'Gagal memproses pendaftaran ke server. Silakan muat ulang halaman.');
  }
}

/**
 * Get all applicants for a specific event, optionally filtered.
 * @param {string} eventId
 * @param {Object} [filters] - { status, search }
 */
export function getApplicantsByEvent(eventId, filters = {}) {
  let applicants = queryItems(LS_KEYS.APPLICANTS, (a) => a.eventId === eventId);

  if (filters.status) {
    applicants = applicants.filter((a) => a.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    applicants = applicants.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q)
    );
  }

  // Sort by submittedAt descending (newest first)
  applicants.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  return applicants;
}

/**
 * Get a single applicant by ID.
 */
export function getApplicantById(id) {
  return findById(LS_KEYS.APPLICANTS, id);
}

/**
 * Verify/change an applicant's status.
 * @param {string} id - Applicant ID
 * @param {string} newStatus - 'approved' or 'rejected'
 * @param {string} verifiedBy - Admin user ID
 */
export function verifyApplicant(id, newStatus, verifiedBy) {
  if (!Object.values(APPLICANT_STATUS).includes(newStatus)) {
    throw new Error(`Status tidak valid: ${newStatus}`);
  }

  const updated = updateItem(LS_KEYS.APPLICANTS, id, {
    status: newStatus,
    verifiedBy,
    verifiedAt: now(),
  });
  if (!updated) throw new Error('Pendaftar tidak ditemukan.');
  return updated;
}

/**
 * Bulk verify multiple applicants.
 */
export function bulkVerifyApplicants(ids, newStatus, verifiedBy) {
  const results = [];
  for (const id of ids) {
    try {
      const updated = verifyApplicant(id, newStatus, verifiedBy);
      results.push({ id, success: true, data: updated });
    } catch (err) {
      results.push({ id, success: false, error: err.message });
    }
  }
  return results;
}

/**
 * Delete a single applicant (anti-phishing / spam).
 * Also decrements event.currentApplicants by 1 (min 0).
 * @param {string} id - Applicant ID
 * @returns {Promise<Object>} deleted applicant data
 */
export async function deleteApplicant(id) {
  const applicant = findById(LS_KEYS.APPLICANTS, id);
  if (!applicant) throw new Error('Pendaftar tidak ditemukan atau sudah dihapus.');

  const ok = await deleteItem(LS_KEYS.APPLICANTS, id);
  if (!ok) throw new Error('Gagal menghapus pendaftar.');

  // Koreksi kuota event terkait
  try {
    const events = getCollection(LS_KEYS.EVENTS);
    const idx = events.findIndex((e) => e.id === applicant.eventId);
    if (idx !== -1) {
      events[idx].currentApplicants = Math.max(0, (events[idx].currentApplicants || 1) - 1);
      await setCollection(LS_KEYS.EVENTS, events, true);
    }
  } catch (_) { /* quota correction non-blocking */ }

  return applicant;
}

/**
 * Bulk delete applicants.
 * @param {string[]} ids
 * @returns {Promise<Array>}
 */
export async function bulkDeleteApplicants(ids) {
  const results = [];
  for (const id of ids) {
    try {
      const data = await deleteApplicant(id);
      results.push({ id, success: true, data });
    } catch (err) {
      results.push({ id, success: false, error: err.message });
    }
  }
  return results;
}

/**
 * Export applicants for a specific event as CSV download.
 */
export function exportApplicantsCSV(eventId, eventTitle = 'kegiatan') {
  const applicants = getApplicantsByEvent(eventId);

  const exportData = applicants.map((a) => ({
    'Nama Lengkap': a.fullName,
    'WhatsApp': a.whatsapp,
    'Email': a.email,
    'Kota/Domisili': a.city,
    'Alasan Bergabung': a.reason || '-',
    'Status': a.status,
    'Tanggal Daftar': a.submittedAt,
    'Diverifikasi Oleh': a.verifiedBy || '-',
    'Tanggal Verifikasi': a.verifiedAt || '-',
  }));

  const filename = `pendaftar_${eventTitle.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}`;
  exportToCSV(exportData, filename);
}

/**
 * Count applicants by status for a specific event.
 */
export function countApplicantsByStatus(eventId) {
  const applicants = queryItems(LS_KEYS.APPLICANTS, (a) => a.eventId === eventId);
  return {
    total: applicants.length,
    pending: applicants.filter((a) => a.status === APPLICANT_STATUS.PENDING).length,
    approved: applicants.filter((a) => a.status === APPLICANT_STATUS.APPROVED).length,
    rejected: applicants.filter((a) => a.status === APPLICANT_STATUS.REJECTED).length,
  };
}

/**
 * Count all pending applicants across all events (for dashboard).
 */
export function countPendingApplicantsTotal() {
  return countItems(LS_KEYS.APPLICANTS, (a) => a.status === APPLICANT_STATUS.PENDING);
}

/**
 * Get all applicants across events, optionally filtered by team, event, status, search.
 * @param {Object} [filters] - { teamId, eventId, status, search }
 * @returns {Object[]}
 */
export function getAllApplicants(filters = {}) {
  let applicants = getCollection(LS_KEYS.APPLICANTS) || [];
  const events = getCollection(LS_KEYS.EVENTS) || [];

  if (filters.teamId && filters.teamId !== 'all') {
    const teamEventIds = new Set(events.filter((e) => e.teamId === filters.teamId).map((e) => e.id));
    applicants = applicants.filter((a) => a.teamId === filters.teamId || teamEventIds.has(a.eventId));
  }

  if (filters.eventId && filters.eventId !== 'all') {
    applicants = applicants.filter((a) => a.eventId === filters.eventId);
  }

  if (filters.status && filters.status !== 'all') {
    applicants = applicants.filter((a) => a.status === filters.status);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    applicants = applicants.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.whatsapp.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q)
    );
  }

  applicants.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  return applicants;
}

/**
 * Get recent applicants (all, for dashboard widget).
 */
export function getRecentApplicants(limit = 5, teamId = null) {
  let applicants = getCollection(LS_KEYS.APPLICANTS) || [];
  if (teamId && teamId !== 'all') {
    const events = getCollection(LS_KEYS.EVENTS) || [];
    const teamEventIds = new Set(events.filter((e) => e.teamId === teamId).map((e) => e.id));
    applicants = applicants.filter((a) => a.teamId === teamId || teamEventIds.has(a.eventId));
  }
  applicants.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  return applicants.slice(0, limit);
}

/**
 * Get recent pending applicants (for backward compatibility).
 */
export function getRecentPendingApplicants(limit = 5, teamId = null) {
  return getRecentApplicants(limit, teamId);
}

