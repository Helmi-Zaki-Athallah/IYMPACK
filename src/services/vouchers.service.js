/**
 * IYMPACK CMS — Voucher Service
 *
 * CRUD, validasi, dan redeem voucher/kupon diskon.
 * Data disimpan di LocalStorage via storage utilities.
 */

import { LS_KEYS, VOUCHER_TYPES } from '../lib/db.constants.js';
import { createVoucher } from '../lib/db.schemas.js';
import { now } from '../lib/utils.js';
import {
  getCollection,
  findById,
  insertItem,
  updateItem,
  deleteItem,
} from '../lib/storage.js';

const KEY = LS_KEYS.VOUCHERS;

// ─── CRUD ────────────────────────────────────────────────────

/**
 * Ambil semua voucher.
 */
export function getVouchers() {
  return getCollection(KEY);
}

/**
 * Ambil voucher berdasarkan ID.
 */
export function getVoucherById(id) {
  return findById(KEY, id);
}

/**
 * Ambil voucher berdasarkan kode (case-insensitive).
 */
export function getVoucherByCode(code) {
  const normalized = (code || '').toUpperCase().trim();
  const vouchers = getCollection(KEY);
  return vouchers.find((v) => v.code === normalized) || null;
}

/**
 * Buat voucher baru. Validasi kode unik.
 */
export function addVoucher(data) {
  const code = (data.code || '').toUpperCase().trim();

  if (!code) {
    throw new Error('Kode voucher wajib diisi.');
  }

  // Cek duplikat kode
  const existing = getVoucherByCode(code);
  if (existing) {
    throw new Error(`Kode voucher "${code}" sudah digunakan. Gunakan kode lain.`);
  }

  if (!data.value || Number(data.value) <= 0) {
    throw new Error('Nilai diskon harus lebih dari 0.');
  }

  if (data.type === VOUCHER_TYPES.PERCENTAGE && Number(data.value) > 100) {
    throw new Error('Diskon persentase tidak boleh lebih dari 100%.');
  }

  const voucher = createVoucher({
    ...data,
    code,
    value: Number(data.value),
    maxUsage: Number(data.maxUsage) || 1,
  });

  return insertItem(KEY, voucher);
}

/**
 * Update voucher yang ada.
 */
export function updateVoucherData(id, updates) {
  const existing = findById(KEY, id);
  if (!existing) {
    throw new Error('Voucher tidak ditemukan.');
  }

  // Jika kode berubah, cek duplikat
  if (updates.code && updates.code.toUpperCase().trim() !== existing.code) {
    const dup = getVoucherByCode(updates.code);
    if (dup) {
      throw new Error(`Kode voucher "${updates.code.toUpperCase()}" sudah digunakan.`);
    }
    updates.code = updates.code.toUpperCase().trim();
  }

  if (updates.value !== undefined) {
    updates.value = Number(updates.value);
  }
  if (updates.maxUsage !== undefined) {
    updates.maxUsage = Number(updates.maxUsage);
  }

  return updateItem(KEY, id, { ...updates, updatedAt: now() });
}

/**
 * Hapus voucher.
 */
export function deleteVoucherData(id) {
  return deleteItem(KEY, id);
}

// ─── Validasi & Redeem ───────────────────────────────────────

/**
 * Validasi kode voucher untuk event tertentu.
 * Returns: { valid: boolean, voucher?: object, message: string }
 */
export function validateVoucher(code, eventId) {
  const normalized = (code || '').toUpperCase().trim();

  if (!normalized) {
    return { valid: false, message: 'Masukkan kode voucher.' };
  }

  const voucher = getVoucherByCode(normalized);

  if (!voucher) {
    return { valid: false, message: 'Kode voucher tidak ditemukan.' };
  }

  if (!voucher.isActive) {
    return { valid: false, message: 'Voucher ini sudah tidak aktif.' };
  }

  // Cek expired
  if (voucher.expiresAt) {
    const expiryDate = new Date(voucher.expiresAt);
    if (new Date() > expiryDate) {
      return { valid: false, message: 'Voucher ini sudah melewati masa berlaku.' };
    }
  }

  // Cek kuota
  if (voucher.usedCount >= voucher.maxUsage) {
    return { valid: false, message: 'Voucher ini sudah habis terpakai.' };
  }

  // Cek event scope
  if (voucher.eventIds && voucher.eventIds.length > 0) {
    if (!voucher.eventIds.includes(eventId)) {
      return { valid: false, message: 'Voucher ini tidak berlaku untuk kegiatan ini.' };
    }
  }

  return { valid: true, voucher, message: 'Voucher valid!' };
}

/**
 * Hitung diskon berdasarkan voucher dan fee asli.
 * Returns: { discountAmount: number, finalFee: number }
 */
export function calculateDiscount(voucher, originalFee) {
  const fee = parseFeeToNumber(originalFee);

  if (fee <= 0 || !voucher) {
    return { discountAmount: 0, finalFee: fee };
  }

  let discountAmount = 0;

  if (voucher.type === VOUCHER_TYPES.PERCENTAGE) {
    discountAmount = Math.round((fee * voucher.value) / 100);
  } else if (voucher.type === VOUCHER_TYPES.FIXED) {
    discountAmount = Math.min(voucher.value, fee); // Diskon tidak boleh melebihi fee
  }

  const finalFee = Math.max(0, fee - discountAmount);

  return { discountAmount, finalFee };
}

/**
 * Tandai voucher sebagai terpakai.
 */
export function redeemVoucher(code, applicantId, eventId) {
  const normalized = (code || '').toUpperCase().trim();
  const voucher = getVoucherByCode(normalized);

  if (!voucher) {
    throw new Error('Voucher tidak ditemukan.');
  }

  const updatedUsedBy = [
    ...(voucher.usedBy || []),
    { applicantId, eventId, usedAt: now() },
  ];

  return updateItem(KEY, voucher.id, {
    usedCount: voucher.usedCount + 1,
    usedBy: updatedUsedBy,
    updatedAt: now(),
  });
}

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Parse fee string ke number (e.g. "Rp 25.000" → 25000, "25000" → 25000).
 */
function parseFeeToNumber(fee) {
  if (typeof fee === 'number') return fee;
  if (!fee) return 0;

  const str = fee.toString().toLowerCase();

  // Cek gratis / bebas biaya
  if (str.includes('bebas') || str.includes('gratis') || str === '0') {
    return 0;
  }

  // Hapus karakter non-angka kecuali titik dan koma
  const cleaned = str.replace(/[^\d]/g, '');
  let num = parseInt(cleaned, 10) || 0;
  if (num > 0 && num < 1000) {
    num = num * 1000;
  }
  return num;
}

/**
 * Format angka ke format Rupiah.
 */
export function formatRupiah(num) {
  if (!num && num !== 0) return 'Rp. 0';
  return 'Rp. ' + Number(num).toLocaleString('id-ID');
}

/**
 * Get voucher usage stats.
 */
export function getVoucherStats() {
  const vouchers = getVouchers();
  const totalVouchers = vouchers.length;
  const activeVouchers = vouchers.filter((v) => v.isActive).length;
  const totalUsed = vouchers.reduce((sum, v) => sum + v.usedCount, 0);
  const totalQuota = vouchers.reduce((sum, v) => sum + v.maxUsage, 0);

  return { totalVouchers, activeVouchers, totalUsed, totalQuota };
}
