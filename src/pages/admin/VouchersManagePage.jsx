/**
 * IYMPACK CMS — Kelola Voucher (Super Admin Only)
 *
 * CRUD halaman voucher/kupon diskon.
 * Fitur: buat, edit, hapus, lihat usage, toggle aktif/nonaktif.
 */

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Check,
  Copy,
  Users,
  Eye,
  ToggleLeft,
  ToggleRight,
  Sparkles } from 'lucide-react';
import {
  getVouchers,
  addVoucher,
  updateVoucherData,
  deleteVoucherData,
  formatRupiah } from '../../services/vouchers.service.js';
import { getEvents } from '../../services/events.service.js';
import { VOUCHER_TYPES, VOUCHER_TYPE_LABELS } from '../../lib/db.constants.js';
import { formatDate } from '../../lib/utils.js';

// ─── Generate random voucher code ────────────────────────────
function generateCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function VouchersManagePage() {
  const [vouchers, setVouchers] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [showUsageModal, setShowUsageModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    code: '',
    type: VOUCHER_TYPES.PERCENTAGE,
    value: '',
    maxUsage: '1',
    eventIds: [],
    expiresAt: '',
    isActive: true });

  const loadData = () => {
    setVouchers(getVouchers());
    setEvents(getEvents().filter((e) => e.status === 'published'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({
      code: '',
      type: VOUCHER_TYPES.PERCENTAGE,
      value: '',
      maxUsage: '1',
      eventIds: [],
      expiresAt: '',
      isActive: true });
    setError('');
    setEditingVoucher(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setForm((prev) => ({ ...prev, code: generateCode() }));
    setShowModal(true);
  };

  const handleOpenEdit = (voucher) => {
    setEditingVoucher(voucher);
    setForm({
      code: voucher.code,
      type: voucher.type,
      value: String(voucher.value),
      maxUsage: String(voucher.maxUsage),
      eventIds: voucher.eventIds || [],
      expiresAt: voucher.expiresAt || '',
      isActive: voucher.isActive });
    setError('');
    setShowModal(true);
  };

  const handleSave = () => {
    setError('');
    try {
      if (editingVoucher) {
        updateVoucherData(editingVoucher.id, form);
      } else {
        addVoucher(form);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus voucher ini secara permanen?')) {
      deleteVoucherData(id);
      loadData();
    }
  };

  const handleToggleActive = (voucher) => {
    updateVoucherData(voucher.id, { isActive: !voucher.isActive });
    loadData();
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const toggleEventId = (eventId) => {
    setForm((prev) => ({
      ...prev,
      eventIds: prev.eventIds.includes(eventId)
        ? prev.eventIds.filter((id) => id !== eventId)
        : [...prev.eventIds, eventId] }));
  };

  const filtered = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsed = vouchers.reduce((s, v) => s + v.usedCount, 0);
  const totalQuota = vouchers.reduce((s, v) => s + v.maxUsage, 0);

  return (
    <div className="space-y-6">
      {/* ─── Stats Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Voucher" value={vouchers.length} icon={Ticket} color="text-violet-400" />
        <StatCard label="Aktif" value={vouchers.filter((v) => v.isActive).length} icon={Sparkles} color="text-emerald-400" />
        <StatCard label="Terpakai" value={`${totalUsed} / ${totalQuota}`} icon={Users} color="text-amber-400" />
        <StatCard
          label="Habis Terpakai"
          value={vouchers.filter((v) => v.usedCount >= v.maxUsage).length}
          icon={ToggleLeft}
          color="text-red-400"
        />
      </div>

      {/* ─── Header & Actions ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kode voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
          />
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-forest hover:bg-forest-dark text-white text-sm font-bold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Buat Voucher
        </button>
      </div>

      {/* ─── Voucher Table ────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Kode</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Diskon</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Pemakaian</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Scope</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Expired</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    {searchTerm ? 'Tidak ada voucher yang cocok.' : 'Belum ada voucher. Buat voucher pertama!'}
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const isExpired = v.expiresAt && new Date(v.expiresAt) < new Date();
                  const isFull = v.usedCount >= v.maxUsage;
                  const usagePercent = v.maxUsage > 0 ? Math.round((v.usedCount / v.maxUsage) * 100) : 0;

                  return (
                    <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Kode */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <code className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg tracking-wider">
                            {v.code}
                          </code>
                          <button
                            onClick={() => handleCopy(v.code)}
                            className="text-gray-400 hover:text-forest transition-colors"
                            title="Copy kode"
                          >
                            {copiedCode === v.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Diskon */}
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-gray-800">
                          {v.type === VOUCHER_TYPES.PERCENTAGE
                            ? `${v.value}%`
                            : formatRupiah(v.value)}
                        </span>
                        <span className="block text-[11px] text-gray-400">
                          {VOUCHER_TYPE_LABELS[v.type]}
                        </span>
                      </td>

                      {/* Pemakaian */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs ${isFull ? 'text-red-500' : 'text-gray-700'}`}>
                            {v.usedCount}/{v.maxUsage}
                          </span>
                          {v.usedCount > 0 && (
                            <button
                              onClick={() => setShowUsageModal(v)}
                              className="text-gray-400 hover:text-forest transition-colors"
                              title="Lihat detail pemakaian"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1">
                          <div
                            className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      </td>

                      {/* Scope */}
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-xs text-gray-500">
                          {v.eventIds && v.eventIds.length > 0
                            ? `${v.eventIds.length} kegiatan`
                            : 'Semua kegiatan'}
                        </span>
                      </td>

                      {/* Expired */}
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        {v.expiresAt ? (
                          <span className={`text-xs ${isExpired ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                            {isExpired ? 'Expired' : formatDate(v.expiresAt)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleActive(v)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            v.isActive && !isExpired && !isFull
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {v.isActive ? (
                            <ToggleRight className="w-3.5 h-3.5" />
                          ) : (
                            <ToggleLeft className="w-3.5 h-3.5" />
                          )}
                          {!v.isActive ? 'Nonaktif' : isExpired ? 'Expired' : isFull ? 'Habis' : 'Aktif'}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="p-2 text-gray-400 hover:text-forest hover:bg-forest/5 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Create / Edit Modal ──────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 font-heading">
                {editingVoucher ? 'Edit Voucher' : 'Buat Voucher Baru'}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                  {error}
                </div>
              )}

              {/* Kode Voucher */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Kode Voucher <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="IYMPACK50"
                    className="flex-grow px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, code: generateCode() }))}
                    className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-all whitespace-nowrap"
                  >
                    Acak
                  </button>
                </div>
              </div>

              {/* Tipe & Nilai Diskon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Tipe Diskon <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
                  >
                    <option value={VOUCHER_TYPES.PERCENTAGE}>Persentase (%)</option>
                    <option value={VOUCHER_TYPES.FIXED}>Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Nilai Diskon <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                      {form.type === VOUCHER_TYPES.PERCENTAGE ? '%' : 'Rp'}
                    </span>
                    <input
                      type="number"
                      value={form.value}
                      onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                      placeholder={form.type === VOUCHER_TYPES.PERCENTAGE ? '50' : '25000'}
                      min="1"
                      max={form.type === VOUCHER_TYPES.PERCENTAGE ? '100' : undefined}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                    />
                  </div>
                </div>
              </div>

              {/* Batas Pemakaian */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Batas Pemakaian (Kuota)
                </label>
                <input
                  type="number"
                  value={form.maxUsage}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxUsage: e.target.value }))}
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
                <p className="text-[11px] text-gray-400 mt-1">Berapa kali voucher ini bisa dipakai oleh peserta berbeda.</p>
              </div>

              {/* Masa Berlaku */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Masa Berlaku (Opsional)
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
                <p className="text-[11px] text-gray-400 mt-1">Kosongkan jika tidak ada batas waktu.</p>
              </div>

              {/* Scope Kegiatan */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Berlaku Untuk Kegiatan
                </label>
                <div className="border border-gray-200 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.eventIds.length === 0}
                      onChange={() => setForm((prev) => ({ ...prev, eventIds: [] }))}
                      className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest/30"
                    />
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-forest">
                      Semua Kegiatan
                    </span>
                  </label>
                  {events.length > 0 && <hr className="border-gray-100" />}
                  {events.map((evt) => (
                    <label key={evt.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.eventIds.includes(evt.id)}
                        onChange={() => toggleEventId(evt.id)}
                        disabled={form.eventIds.length === 0}
                        className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest/30 disabled:opacity-40"
                      />
                      <span className="text-xs text-gray-600 group-hover:text-forest truncate">
                        {evt.title}
                      </span>
                    </label>
                  ))}
                  {events.length === 0 && (
                    <p className="text-[11px] text-gray-400">Belum ada kegiatan yang dipublikasikan.</p>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Centang "Semua Kegiatan" agar berlaku universal.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-forest hover:bg-forest-dark text-white text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                {editingVoucher ? 'Simpan Perubahan' : 'Buat Voucher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Usage Detail Modal ───────────────────────── */}
      {showUsageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800 font-heading">Detail Pemakaian</h3>
                <code className="text-xs font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                  {showUsageModal.code}
                </code>
              </div>
              <button
                onClick={() => setShowUsageModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {showUsageModal.usedBy && showUsageModal.usedBy.length > 0 ? (
                <div className="space-y-3">
                  {showUsageModal.usedBy.map((usage, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs font-semibold text-gray-700">Pemakaian #{idx + 1}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {usage.usedAt ? formatDate(usage.usedAt) : '-'}
                        </p>
                      </div>
                      <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-semibold">
                        Terpakai
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada pemakaian.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card Component ─────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-xl font-black text-gray-800">{value}</p>
    </div>
  );
}
