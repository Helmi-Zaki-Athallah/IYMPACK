/**
 * IYMPACK CMS — Full Page Article Editor (Create & Edit)
 *
 * Dedicated full-page interface replacing popup modals.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../hooks/useData.js';
import { ARTICLE_STATUS, TEAMS, TEAM_LABELS } from '../../lib/db.constants.js';
import { generateSlug } from '../../lib/utils.js';
import { ArrowLeft, Save, Image, CheckCircle2, Building, Link2, RotateCcw, Trash2 } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor.jsx';
import { validateUploadedFile, sanitizeText, sanitizeHtml } from '../../lib/security.js';
import { uploadImage } from '../../lib/upload.js';

const CATEGORY_OPTIONS = ['Inspirasi', 'Pendidikan', 'Komunitas', 'Sosial', 'Lingkungan'];

const EMPTY_FORM = {
  title: '',
  slug: '',
  category: 'Inspirasi',
  teamId: '',
  coverImage: '',
  excerpt: '',
  bodyContent: '',
  status: ARTICLE_STATUS.DRAFT };

export default function ArticleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const { articles, createArticle, updateArticle } = useData();

  const isEditing = Boolean(id);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    teamId: user?.userTeamId || TEAMS.PUSAT }));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const check = validateUploadedFile(file, { maxBytes: 15 * 1024 * 1024 });
      if (!check.valid) {
        alert(check.error);
        return;
      }
      setIsUploadingImage(true);
      try {
        const url = await uploadImage(file);
        updateField('coverImage', url);
      } catch (err) {
        alert('Gagal memproses gambar: ' + (err.message || 'Error'));
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  useEffect(() => {
    if (isEditing && articles.length > 0) {
      const found = articles.find((a) => a.id === id);
      if (found) {
        setIsSlugCustomized(Boolean(found.slug));
        setForm({
          title: found.title || '',
          slug: found.slug || generateSlug(found.title || ''),
          category: found.category || 'Inspirasi',
          teamId: found.teamId || (!isSuperAdmin() ? (user?.userTeamId || TEAMS.PUSAT) : TEAMS.PUSAT),
          coverImage: found.coverImage || '',
          excerpt: found.excerpt || '',
          bodyContent: found.bodyContent || '',
          status: found.status || ARTICLE_STATUS.DRAFT });
      }
    } else if (!isEditing) {
      setForm((prev) => ({
        ...prev,
        teamId: !isSuperAdmin() ? (user?.userTeamId || TEAMS.PUSAT) : (prev.teamId || TEAMS.PUSAT) }));
    }
  }, [id, isEditing, articles, isSuperAdmin, user]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    updateField('title', newTitle);
    if (!isSlugCustomized) {
      updateField('slug', generateSlug(newTitle));
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const finalData = {
        ...form,
        title: sanitizeText(form.title, 150),
        excerpt: sanitizeText(form.excerpt, 500),
        bodyContent: sanitizeHtml(form.bodyContent),
        teamId: !isSuperAdmin() ? (user?.userTeamId || TEAMS.PUSAT) : (form.teamId || TEAMS.PUSAT)
      };

      if (isEditing) {
        await updateArticle(id, finalData);
      } else {
        await createArticle(finalData);
      }

      setSavedSuccess(true);
      setTimeout(() => {
        navigate('/admin/artikel');
      }, 500);
    } catch (err) {
      console.error('[ArticleEditorPage] Submit error:', err);
      setSubmitError(err?.message || 'Gagal menyimpan ke database server. Pastikan koneksi internet stabil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* ─── Top Bar / Header ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/artikel"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
            title="Kembali ke Daftar Artikel"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 font-heading">
                {isEditing ? 'Edit Artikel' : 'Tulis Artikel Baru'}
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                !isSuperAdmin() ? 'bg-forest/10 text-forest' : 'bg-amber-100 text-amber-800'
              }`}>
                {!isSuperAdmin() ? TEAM_LABELS[user?.userTeamId] : 'Super Admin (Pusat)'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing ? `Mengubah artikel "${form.title || '...'}"` : 'Tulis artikel, berita, atau cerita dampak positif.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/artikel')}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 bg-white transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImage}
            className="inline-flex items-center gap-2 px-5 py-2 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-semibold shadow-md shadow-forest/20 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan ke Server...' : (isEditing ? 'Simpan Perubahan' : 'Terbitkan Artikel')}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" /> Artikel berhasil disimpan ke database! Mengalihkan...
        </div>
      )}

      {submitError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <span>⚠️ {submitError}</span>
        </div>
      )}

      {/* ─── Main Form Grid ───────────────────────────── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Content Editor - 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-5 shadow-sm">
            {/* Cabang Penerbit Artikel */}
            {isSuperAdmin() ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cabang / Tim Penerbit Artikel</span> <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.teamId}
                  onChange={(e) => updateField('teamId', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                >
                  {Object.entries(TEAM_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-forest/5 border border-forest/15 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cabang Penerbit</span>
                  <span className="text-sm font-bold text-forest">{TEAM_LABELS[user?.userTeamId] || 'IYMPACK Cabang'}</span>
                </div>
                <span className="text-[10px] font-semibold bg-forest/10 text-forest px-2.5 py-1 rounded-full">
                  Hak Akses Terkunci
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Judul Artikel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Masukkan judul artikel yang menarik..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>

            {/* Custom Permalink / Slug URL */}
            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Permalink / Slug URL Kustom</span>
                </label>
                {isSlugCustomized && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSlugCustomized(false);
                      updateField('slug', generateSlug(form.title));
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Ikuti Judul</span>
                  </button>
                )}
              </div>

              <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-forest/20 focus-within:border-forest">
                <span className="px-3 py-2 text-xs font-semibold text-gray-400 bg-gray-50 border-r border-gray-200 select-none">
                  #/artikel/
                </span>
                <input
                  type="text"
                  value={form.slug || ''}
                  onChange={(e) => {
                    setIsSlugCustomized(true);
                    updateField('slug', generateSlug(e.target.value));
                  }}
                  placeholder="permalink-artikel"
                  className="flex-1 px-3 py-2 text-xs font-mono font-medium text-gray-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                <span>Pratinjau link: <strong className="text-blue-600 font-mono">#/artikel/{form.slug || 'permalink'}</strong></span>
                <span className="text-[10px] text-gray-400">Gunakan huruf kecil & strip (-)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Ringkasan / Kutipan (Excerpt)
              </label>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
                placeholder="Ringkasan singkat 1-2 kalimat yang akan tampil di kartu pratinjau..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Isi Lengkap Konten Artikel / Berita <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={form.bodyContent || ''}
                onChange={(html) => updateField('bodyContent', html)}
                placeholder="Tuliskan isi artikel Anda secara lengkap di sini... (Bisa tambahkan tautan/link, format tebal, daftar poin, kutipan, dan warna)"
                minHeight="min-h-[360px]"
              />
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Publishing & Media) */}
        <div className="space-y-6">
          {/* Status & Kategori Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100">
              Penerbitan
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Status Publikasi
              </label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 bg-white"
              >
                <option value={ARTICLE_STATUS.DRAFT}>Draft (Simpan Sementara)</option>
                <option value={ARTICLE_STATUS.PUBLISHED}>Dipublikasikan (Tampil di Web)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kategori Artikel
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 bg-white"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image Card (Upload File Only) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading">
                Gambar Sampul (Cover)
              </h2>
              {form.coverImage && (
                <button
                  type="button"
                  onClick={() => updateField('coverImage', '')}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Sampul</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Upload File Sampul (dari Perangkat/HP)</span>
                {isUploadingImage && (
                  <span className="text-amber-600 font-bold animate-pulse text-[11px]">
                    Mengunggah ke server...
                  </span>
                )}
              </label>
              <input
                type="file"
                accept="image/*"
                disabled={isUploadingImage}
                onChange={handleFileUpload}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-forest/10 file:text-forest hover:file:bg-forest/20 cursor-pointer disabled:opacity-50"
              />
              <p className="text-[11px] text-gray-400 mt-1">Pilih file foto/gambar dari komputer atau galeri HP.</p>
            </div>

            {/* Live Preview */}
            <div>
              <span className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                Pratinjau Sampul:
              </span>
              {form.coverImage ? (
                <div className="rounded-xl overflow-hidden border border-gray-200 h-40 bg-gray-50">
                  <img
                    src={form.coverImage}
                    alt="Pratinjau Sampul"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=80';
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 h-32 flex flex-col items-center justify-center text-gray-400 text-xs text-center p-3">
                  <Image className="w-6 h-6 mb-1 text-gray-300" />
                  <span>Unggah file foto untuk melihat pratinjau</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 space-y-2 shadow-sm">
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="w-full py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-forest/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan ke Database...' : (isUploadingImage ? 'Sedang Mengunggah Sampul...' : (isEditing ? 'Simpan Perubahan' : 'Terbitkan Artikel'))}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/artikel')}
              className="w-full py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Kembali ke Daftar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
