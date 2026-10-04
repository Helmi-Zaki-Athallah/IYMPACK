/**
 * IYMPACK CMS — Gallery Management Page (Super Admin)
 *
 * Mengelola seluruh foto dokumentasi kegiatan visual IYMPACK:
 * - Menambah foto baru (upload file komputer atau input URL gambar)
 * - Mengedit judul, kategori (Pendidikan, Kerelawanan, Lingkungan, dll), dan lokasi kegiatan
 * - Menghapus foto galeri
 * - Sinkronisasi otomatis ke Beranda (Showcase Grid) dan Halaman Galeri Publik
 */

import React, { useState } from 'react';
import { useData } from '../../hooks/useData.js';
import { validateUploadedFile } from '../../lib/security.js';
import { uploadImage } from '../../lib/upload.js';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Camera,
  Check,
  X,
  AlertCircle,
  RotateCcw,
  Sparkles,
  MapPin,
  Eye,
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Semua',
  'Pendidikan',
  'Kerelawanan',
  'Workshop',
  'Sosial',
  'Lingkungan',
  'Kemanusiaan',
];

export default function GalleryManagePage() {
  const {
    gallery,
    addGalleryPhoto,
    updateGalleryPhoto,
    deleteGalleryPhoto,
    resetGalleryPhotos,
  } = useData();

  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [_isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Pendidikan',
    url: '',
    location: 'Jabodetabek',
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  // Upload image via uploadImage helper
  const handleImageUpload = async (file) => {
    if (!file) return;
    const check = validateUploadedFile(file, { maxBytes: 15 * 1024 * 1024 });
    if (!check.valid) {
      alert(check.error);
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, url }));
    } catch {
      alert('Gagal mengunggah foto galeri.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Pendidikan',
      url: '',
      location: 'Jabodetabek',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (photo) => {
    setEditingId(photo.id);
    setFormData({
      title: photo.title || photo.caption || '',
      category: photo.category || 'Pendidikan',
      url: photo.url || photo.image || '',
      location: photo.location || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul atau keterangan foto wajib diisi.');
      return;
    }
    if (!formData.url.trim()) {
      alert('Silakan unggah file foto terlebih dahulu.');
      return;
    }

    try {
      if (editingId) {
        updateGalleryPhoto(editingId, formData);
        showNotification('success', `Foto "${formData.title}" berhasil diperbarui!`);
      } else {
        addGalleryPhoto(formData);
        showNotification('success', `Foto "${formData.title}" berhasil ditambahkan ke galeri!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan foto galeri.');
    }
  };

  const handleDelete = (photo) => {
    if (window.confirm(`Yakin ingin menghapus foto "${photo.title || photo.caption}" dari galeri?`)) {
      try {
        deleteGalleryPhoto(photo.id);
        showNotification('success', `Foto galeri berhasil dihapus.`);
      } catch (err) {
        alert(err.message || 'Gagal menghapus foto.');
      }
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan seluruh foto galeri ke data bawaan IYMPACK?')) {
      try {
        resetGalleryPhotos();
        showNotification('success', 'Galeri berhasil direset ke foto bawaan.');
      } catch {
        alert('Gagal mereset foto galeri.');
      }
    }
  };

  const filteredPhotos = selectedCategory === 'Semua'
    ? gallery
    : gallery.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

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
              {gallery.length} Foto Terbit
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading mt-1 flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-forest" />
            <span>Kelola Galeri Foto & Dokumentasi Visual</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Seluruh foto dokumentasi kegiatan ini langsung tampil di Showcase Beranda dan Halaman Galeri IYMPACK.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Kembalikan galeri foto ke setelan default"
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
            <span>Tambah Foto Baru</span>
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

      {/* ─── Category Filter Tabs ────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {DEFAULT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-forest text-white shadow-md shadow-forest/20'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── Gallery Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow group relative"
          >
            {/* Image Thumbnail */}
            <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
              <img
                src={photo.url || photo.image}
                alt={photo.title}
                className="w-full h-full object-cover"
              />

              {/* Category Badge */}
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white">
                {photo.category || 'Kerelawanan'}
              </span>

              {/* Action Buttons Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(photo)}
                  className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-white shadow-sm cursor-pointer"
                  title="Lihat ukuran penuh"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(photo)}
                  className="p-1.5 rounded-lg bg-white/90 text-forest hover:bg-white shadow-sm cursor-pointer"
                  title="Edit foto"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(photo)}
                  className="p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-white shadow-sm cursor-pointer"
                  title="Hapus foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="p-4 flex flex-col flex-1 justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2">
                  {photo.title || photo.caption}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-50">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[130px]">{photo.location || 'Indonesia'}</span>
                </span>
                <span className="text-[10px] text-gray-400">
                  {photo.category}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredPhotos.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
            Tidak ada foto yang ditemukan untuk kategori &quot;{selectedCategory}&quot;.
          </div>
        )}
      </div>

      {/* ─── Modal Form Tambah / Edit Foto ────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <h3 className="text-base font-bold text-gray-900 font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{editingId ? 'Edit Foto Galeri' : 'Tambah Foto Galeri Baru'}</span>
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
              {/* Photo Upload & Preview Box */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Foto Dokumentasi Kegiatan <span className="text-red-500">*</span>
                </label>
                <div className="w-full h-52 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 relative group flex items-center justify-center">
                  {formData.url ? (
                    <>
                      <img
                        src={formData.url}
                        alt="Preview Foto"
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer">
                        <Camera className="w-6 h-6 mb-1" />
                        <span>Ganti Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:text-forest p-4 text-center">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-xs font-bold">Klik untuk Unggah Foto dari Komputer</span>
                      <span className="text-[10px] text-gray-400 mt-1">Mendukung JPG, PNG, WebP (Maks. 5 MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>


              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Judul / Keterangan Foto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Senyum Ceria Belajar Bersama Siswa Pelosok"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Kategori Kegiatan
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                  >
                    <option value="Pendidikan">Pendidikan</option>
                    <option value="Kerelawanan">Kerelawanan</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Sosial">Sosial</option>
                    <option value="Lingkungan">Lingkungan</option>
                    <option value="Kemanusiaan">Kemanusiaan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Lokasi Pelaksanaan
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Contoh: The Yatim Village, Bogor"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                  />
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
                  {editingId ? 'Simpan Perubahan' : 'Terbitkan ke Galeri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Lightbox Modal Preview ──────────────────────── */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-[#252f27] rounded-3xl overflow-hidden border border-white/20 shadow-2xl text-stone-100"
          >
            <div className="relative max-h-[70vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={previewPhoto.url || previewPhoto.image}
                alt={previewPhoto.title}
                className="max-h-[70vh] w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#819b8e]">
                {previewPhoto.category} • {previewPhoto.location || 'Indonesia'}
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                {previewPhoto.title || previewPhoto.caption}
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
