/**
 * IYMPACK CMS — Testimonials Management Page (Super Admin)
 *
 * Mengelola seluruh testimonial yang tampil di halaman beranda IYMPACK:
 * - Tambah, Edit, Hapus testimonial
 * - Upload foto avatar relawan / pemberi testimoni
 * - Live preview card testimonial
 */

import React, { useState } from 'react';
import { useData } from '../../hooks/useData.js';
import { validateUploadedFile } from '../../lib/security.js';
import { uploadImage } from '../../lib/upload.js';
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  Edit2,
  Camera,
  Check,
  X,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Quote } from 'lucide-react';

export default function TestimonialsManagePage() {
  const {
    testimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    resetTestimonials } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [_isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    author: '',
    role: '',
    quote: '',
    avatar: '' });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  // Upload image via uploadImage helper
  const handleImageUpload = async (file) => {
    if (!file) return;
    const check = validateUploadedFile(file, { maxBytes: 10 * 1024 * 1024 });
    if (!check.valid) {
      alert(check.error);
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, avatar: url }));
    } catch {
      alert('Gagal mengunggah foto avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      author: '',
      role: 'Relawan IYMPACK',
      quote: '',
      avatar: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      author: item.author || '',
      role: item.role || '',
      quote: item.quote || '',
      avatar: item.avatar || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.quote.trim()) {
      alert('Nama dan isi testimoni wajib diisi.');
      return;
    }

    try {
      if (editingId) {
        updateTestimonial(editingId, formData);
        showNotification('success', `Testimoni dari "${formData.author}" berhasil diperbarui!`);
      } else {
        addTestimonial(formData);
        showNotification('success', `Testimoni dari "${formData.author}" berhasil ditambahkan!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan testimoni.');
    }
  };

  const handleDelete = (item) => {
    if (window.confirm(`Yakin ingin menghapus testimoni dari "${item.author}"?`)) {
      try {
        deleteTestimonial(item.id);
        showNotification('success', `Testimoni dari "${item.author}" berhasil dihapus.`);
      } catch (err) {
        alert(err.message || 'Gagal menghapus testimoni.');
      }
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan seluruh testimoni ke data bawaan IYMPACK?')) {
      try {
        resetTestimonials();
        showNotification('success', 'Data testimoni berhasil direset ke bawaan.');
      } catch {
        alert('Gagal mereset data.');
      }
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
              Super Admin Pusat
            </span>
            <span className="text-xs text-gray-400">
              {testimonials.length} Testimoni Aktif
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading mt-1 flex items-center gap-2.5">
            <MessageSquareQuote className="w-6 h-6 text-forest" />
            <span>Kelola Testimoni & Kata Relawan</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Testimoni ini tampil secara dinamis pada carousel beranda utama dan halaman publik IYMPACK.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Kembalikan data testimoni ke setelan default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest text-white rounded-xl text-xs font-bold shadow-md shadow-forest/20 hover:bg-forest/90 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Testimoni</span>
          </button>
        </div>
      </div>

      {/* ─── Notification Alert ──────────────────────────── */}
      {notification.message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Testimonials Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testi) => (
          <div
            key={testi.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative group"
          >
            {/* Top decorative quote mark */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <Quote className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(testi)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-forest hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Edit testimoni"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(testi)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus testimoni"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quote content */}
            <p className="text-xs text-gray-600 leading-relaxed italic mb-6 line-clamp-4">
              &ldquo;{testi.quote}&rdquo;
            </p>

            {/* Author Profile */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-auto">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-forest/20 shadow-inner bg-gray-50 shrink-0">
                <img
                  src={
                    testi.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      testi.author || 'User'
                    )}&background=252f27&color=faeed4&size=128`
                  }
                  alt={testi.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate">
                  {testi.author}
                </h4>
                <p className="text-[11px] text-gray-400 truncate">
                  {testi.role || 'Relawan IYMPACK'}
                </p>
              </div>
            </div>
          </div>
        ))}

        {testimonials.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
            Belum ada testimoni tersimpan. Klik &quot;Tambah Testimoni&quot; untuk menambahkan testimoni pertama.
          </div>
        )}
      </div>

      {/* ─── Modal Form Tambah / Edit ────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <h3 className="text-base font-bold text-gray-900 font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{editingId ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload & Preview */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-forest/30 shadow-md bg-gray-100 relative group">
                  <img
                    src={
                      formData.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        formData.author || 'User'
                      )}&background=252f27&color=faeed4&size=256`
                    }
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Ubah Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                </div>
                <label className="text-xs text-forest font-semibold cursor-pointer hover:underline">
                  Pilih Foto dari Komputer
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Lengkap / Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                  placeholder="Contoh: Adinda Saraswati"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Peran / Status / Asal Kota
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="Contoh: Relawan Batch 3 • Jakarta / Donatur Tetap"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>


              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Isi Testimoni <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.quote}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))}
                  placeholder="Tuliskan pengalaman atau kata-kata inspiratif relawan di sini..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              {/* Live Preview Card */}
              <div className="pt-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Pratinjau Tampilan Beranda
                </span>
                <div className="bg-[#252f27] text-stone-100 p-4 rounded-2xl border border-white/10 text-xs">
                  <p className="italic text-stone-300 mb-3 line-clamp-3">
                    &ldquo;{formData.quote || 'Isi kutipan testimoni akan tampil seperti ini...'}&rdquo;
                  </p>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10">
                      <img
                        src={
                          formData.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            formData.author || 'User'
                          )}&background=252f27&color=faeed4&size=128`
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white text-[11px] leading-tight">
                        {formData.author || 'Nama Relawan'}
                      </p>
                      <p className="text-[10px] text-[#819b8e]">
                        {formData.role || 'Relawan IYMPACK'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest/90 cursor-pointer shadow-md shadow-forest/20"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Testimoni'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
