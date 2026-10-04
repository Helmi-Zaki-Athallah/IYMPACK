/**
 * IYMPACK CMS — FAQ Management Page (Super Admin)
 *
 * Mengelola daftar pertanyaan dan jawaban resmi IYMPACK yang tampil di:
 * - Halaman /faq
 * - Halaman /kontak
 * - Widget FAQ di bagian bawah beranda
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../hooks/useData.js';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function FaqManagePage() {
  const { isSuperAdmin: _isSuperAdmin } = useAuth();
  const { faqs, addFaq, updateFaq, deleteFaq, resetFaqs } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    q: '',
    a: '',
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      q: '',
      a: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setEditingId(faq.id);
    setFormData({
      q: faq.q || '',
      a: faq.a || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.q.trim() || !formData.a.trim()) {
      alert('Pertanyaan dan jawaban wajib diisi.');
      return;
    }

    try {
      if (editingId) {
        updateFaq(editingId, formData);
        showNotification('success', 'FAQ berhasil diperbarui!');
      } else {
        addFaq(formData);
        showNotification('success', 'Pertanyaan baru berhasil ditambahkan ke FAQ!');
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan FAQ.');
    }
  };

  const handleDelete = (faq) => {
    if (window.confirm(`Yakin ingin menghapus pertanyaan "${faq.q}"?`)) {
      try {
        deleteFaq(faq.id);
        showNotification('success', 'Pertanyaan FAQ berhasil dihapus.');
      } catch (err) {
        alert(err.message || 'Gagal menghapus FAQ.');
      }
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan daftar pertanyaan ke 8 FAQ resmi bawaan IYMPACK?')) {
      try {
        resetFaqs();
        showNotification('success', 'Daftar FAQ berhasil direset ke setelan bawaan.');
      } catch {
        alert('Gagal mereset FAQ.');
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
              Super Admin Pusat
            </span>
            <span className="text-xs text-gray-400">
              {faqs.length} Pertanyaan Terdaftar
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading mt-1 flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-forest" />
            <span>Kelola Pertanyaan & Jawaban (FAQ)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Pertanyaan dan jawaban resmi ini otomatis tampil pada halaman Cara Kerja / FAQ dan Pusat Bantuan IYMPACK.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Kembalikan FAQ ke 8 pertanyaan resmi bawaan"
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
            <span>Tambah Pertanyaan</span>
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

      {/* ─── FAQ Accordion List ──────────────────────────── */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = expandedId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm transition-all"
            >
              <div
                onClick={() => toggleExpand(faq.id)}
                className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-gray-50/70"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-forest/10 text-forest text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">
                    {faq.q}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(faq);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-forest hover:bg-gray-100 transition-colors"
                    title="Edit pertanyaan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(faq);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus pertanyaan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-gray-400 pl-1">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40 whitespace-pre-line">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}

        {faqs.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
            Belum ada pertanyaan di FAQ. Klik &quot;Tambah Pertanyaan&quot; di atas.
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
                <span>{editingId ? 'Edit Pertanyaan FAQ' : 'Tambah Pertanyaan FAQ Baru'}</span>
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
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pertanyaan (Question) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.q}
                  onChange={(e) => setFormData((prev) => ({ ...prev, q: e.target.value }))}
                  placeholder="Contoh: Apa itu IYMPACK?"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Jawaban (Answer) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.a}
                  onChange={(e) => setFormData((prev) => ({ ...prev, a: e.target.value }))}
                  placeholder="Tuliskan jawaban lengkap. Anda dapat menggunakan baris baru atau penomoran..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Gunakan tombol Enter untuk membuat daftar langkah-langkah bertingkat.
                </p>
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
                  {editingId ? 'Simpan Perubahan' : 'Terbitkan FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
