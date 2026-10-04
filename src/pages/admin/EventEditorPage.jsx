/**
 * IYMPACK CMS — Full Page Event Editor (Create & Edit)
 *
 * Dedicated full-page interface replacing popup modals.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../hooks/useData.js';
import { toDatetimeLocal, generateSlug } from '../../lib/utils.js';
import { EVENT_STATUS, TEAMS, TEAM_LABELS } from '../../lib/db.constants.js';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Building,
  Banknote,
  CreditCard,
  Sliders,
  Plus,
  Trash2,
  Image,
  Link2,
  RotateCcw,
  MapPin,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor.jsx';
import { validateUploadedFile, sanitizeText, sanitizeHtml, sanitizeUrl } from '../../lib/security.js';
import { uploadImage } from '../../lib/upload.js';
import { resolveGoogleMapsLink, parseClientGoogleMapsUrl } from '../../lib/maps.js';

const EMPTY_FORM = {
  title: '',
  slug: '',
  description: '',
  bannerImage: '',
  category: '',
  teamId: '',
  location: '',
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  maxQuota: '',
  speaker: '',
  time: '',
  fee: 'Bebas Biaya',
  bankName: '',
  accountNumber: '',
  accountHolder: '',
  paymentAccount: '',
  contactPhone: '',
  mapsUrl: '',
  mapsEmbedUrl: '',
  registrationUrl: '',
  status: EVENT_STATUS.PUBLISHED,
  requireFollowProof: true,
  instagramAccount: 'iympack',
  requireTiktokProof: false,
  tiktokAccount: '',
  requireReason: true,
  customFields: [],
};

export default function EventEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const { events, createEvent, updateEvent } = useData();

  const isEditing = Boolean(id);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    teamId: user?.userTeamId || TEAMS.PUSAT,
  }));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isResolvingMap, setIsResolvingMap] = useState(false);
  const [detectedMapInfo, setDetectedMapInfo] = useState(null);

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
        updateField('bannerImage', url);
      } catch (err) {
        alert('Gagal memproses gambar: ' + (err.message || 'Error'));
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleMapsUrlChange = async (rawInput) => {
    let val = (rawInput || '').trim();
    const iframeMatch = val.match(/src=["'](.*?)["']/);
    if (iframeMatch && iframeMatch[1]) {
      val = iframeMatch[1];
    }

    updateField('mapsUrl', val);

    if (!val) {
      updateField('mapsEmbedUrl', '');
      setDetectedMapInfo(null);
      return;
    }

    // 1. Coba parse lokal langsung (0ms)
    const local = parseClientGoogleMapsUrl(val);
    if (local) {
      setDetectedMapInfo(local);
      if (local.embedUrl) {
        updateField('mapsEmbedUrl', local.embedUrl);
      }
      if (local.placeName && (!form.location || form.location.trim() === '')) {
        updateField('location', local.placeName);
      }
    }

    // 2. Jika link pendek (maps.app.goo.gl / goo.gl/maps) atau belum ada placeName
    if (val.includes('maps.app.goo.gl') || val.includes('goo.gl/maps') || (!local?.placeName && val.includes('google.com/maps'))) {
      setIsResolvingMap(true);
      try {
        const resolved = await resolveGoogleMapsLink(val);
        if (resolved) {
          setDetectedMapInfo(resolved);
          if (resolved.embedUrl) {
            updateField('mapsEmbedUrl', resolved.embedUrl);
          }
          if (resolved.placeName && (!form.location || form.location.trim() === '')) {
            updateField('location', resolved.placeName);
          }
        }
      } catch (err) {
        console.warn('[EventEditorPage] Gagal mendeteksi link maps:', err);
      } finally {
        setIsResolvingMap(false);
      }
    }
  };

  useEffect(() => {
    if (isEditing && events.length > 0) {
      const found = events.find((e) => e.id === id);
      if (found) {
        setIsSlugCustomized(Boolean(found.slug));
        setForm({
          title: found.title || '',
          slug: found.slug || generateSlug(found.title || ''),
          description: found.description || '',
          bannerImage: found.bannerImage || '',
          category: found.category || '',
          teamId: found.teamId || (!isSuperAdmin() ? (user?.userTeamId || TEAMS.PUSAT) : TEAMS.PUSAT),
          location: found.location || '',
          startDate: found.startDate ? toDatetimeLocal(found.startDate) : '',
          endDate: found.endDate ? toDatetimeLocal(found.endDate) : '',
          registrationDeadline: found.registrationDeadline ? toDatetimeLocal(found.registrationDeadline) : '',
          maxQuota: found.maxQuota || '',
          speaker: found.speaker || '',
          time: found.time || '',
          fee: found.fee || '',
          bankName: found.bankName || '',
          accountNumber: found.accountNumber || '',
          accountHolder: found.accountHolder || '',
          paymentAccount: found.paymentAccount || '',
          contactPhone: found.contactPhone || '',
          mapsUrl: found.mapsUrl || '',
          mapsEmbedUrl: found.mapsEmbedUrl || '',
          registrationUrl: found.registrationUrl || '',
          status: found.status || EVENT_STATUS.PUBLISHED,
          requireFollowProof: found.requireFollowProof !== false,
          instagramAccount: found.instagramAccount || 'iympack',
          requireTiktokProof: Boolean(found.requireTiktokProof),
          tiktokAccount: found.tiktokAccount || '',
          requireReason: found.requireReason !== false,
          customFields: found.customFields || [],
        });

        if (found.mapsUrl) {
          const initLocal = parseClientGoogleMapsUrl(found.mapsUrl);
          if (initLocal) {
            setDetectedMapInfo({
              ...initLocal,
              embedUrl: found.mapsEmbedUrl || initLocal.embedUrl,
            });
          }
        }
      }
    } else if (!isEditing) {
      setForm((prev) => ({
        ...prev,
        teamId: !isSuperAdmin() ? (user?.userTeamId || TEAMS.PUSAT) : (prev.teamId || TEAMS.PUSAT),
      }));
    }
  }, [id, isEditing, events, isSuperAdmin, user]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Form Builder Helpers ─────────────────────────────────
  const addCustomField = (type = 'text', label = '', options = [], placeholder = '') => {
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      label: label || 'Pertanyaan Baru',
      type, // 'text' | 'textarea' | 'select' | 'radio' | 'file'
      options, // array of strings
      required: false,
      placeholder,
    };
    setForm((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), newField],
    }));
  };

  const updateCustomField = (index, key, value) => {
    setForm((prev) => {
      const list = [...(prev.customFields || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, customFields: list };
    });
  };

  const removeCustomField = (index) => {
    setForm((prev) => {
      const list = [...(prev.customFields || [])];
      list.splice(index, 1);
      return { ...prev, customFields: list };
    });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      let derivedDay = form.day;
      let derivedMonth = form.month;
      let derivedTime = form.time;

      if (form.startDate) {
        const d = new Date(form.startDate);
        if (!isNaN(d.getTime())) {
          derivedDay = String(d.getDate()).padStart(2, '0');
          derivedMonth = d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
          if (!derivedTime) {
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            derivedTime = `${hh}:${mm} WIB`;
          }
        }
      }

      const synthesizedPaymentAccount = [
        form.bankName,
        form.accountNumber,
        form.accountHolder ? `a.n ${form.accountHolder}` : '',
      ].filter(Boolean).join(' ');

      const finalData = {
        ...form,
        title: sanitizeText(form.title, 150),
        location: sanitizeText(form.location, 200),
        description: sanitizeHtml(form.description),
        mapsUrl: sanitizeUrl(form.mapsUrl),
        mapsEmbedUrl: sanitizeUrl(form.mapsEmbedUrl) || '',
        registrationUrl: sanitizeUrl(form.registrationUrl),
        contactPhone: sanitizeText(form.contactPhone, 30),
        speaker: sanitizeText(form.speaker, 100),
        fee: sanitizeText(form.fee, 50),
        paymentAccount: synthesizedPaymentAccount || form.paymentAccount || '',
        day: derivedDay || '',
        month: derivedMonth || '',
        time: derivedTime || '',
        teamId: !isSuperAdmin() ? (user?.userTeamId || TEAMS.PUSAT) : (form.teamId || TEAMS.PUSAT),
      };

      if (isEditing) {
        await updateEvent(id, finalData);
      } else {
        await createEvent(finalData);
      }

      setSavedSuccess(true);
      setTimeout(() => {
        navigate('/admin/kegiatan');
      }, 500);
    } catch (err) {
      console.error('[EventEditorPage] Submit error:', err);
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
            to="/admin/kegiatan"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
            title="Kembali ke Daftar Kegiatan"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 font-heading">
                {isEditing ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                !isSuperAdmin() ? 'bg-forest/10 text-forest' : 'bg-amber-100 text-amber-800'
              }`}>
                {!isSuperAdmin() ? TEAM_LABELS[user?.userTeamId] : 'Super Admin (Pusat)'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing ? `Mengubah data kegiatan "${form.title || '...'}"` : 'Isi formulir lengkap untuk membuat kegiatan baru.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/kegiatan')}
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
            {isSubmitting ? 'Menyimpan ke Server...' : (isEditing ? 'Simpan Perubahan' : 'Terbitkan Kegiatan')}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" /> Perubahan berhasil disimpan ke database! Mengalihkan...
        </div>
      )}

      {submitError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <span>⚠️ {submitError}</span>
        </div>
      )}

      {/* ─── Main Form Grid ───────────────────────────── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Detail Utama */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100">
              Informasi Utama
            </h2>

            {/* Cabang Penyelenggara */}
            {isSuperAdmin() ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cabang / Tim IYMPACK Penyelenggara</span> <span className="text-red-500">*</span>
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
                <p className="text-[11px] text-gray-400 mt-1">Super Admin dapat menetapkan cabang mana yang menyelenggarakan acara ini.</p>
              </div>
            ) : (
              <div className="bg-forest/5 border border-forest/15 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cabang Penyelenggara</span>
                  <span className="text-sm font-bold text-forest">{TEAM_LABELS[user?.userTeamId] || 'IYMPACK Cabang'}</span>
                </div>
                <span className="text-[10px] font-semibold bg-forest/10 text-forest px-2.5 py-1 rounded-full">
                  Hak Akses Terkunci
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Judul Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title: newTitle,
                    slug: isSlugCustomized ? prev.slug : generateSlug(newTitle),
                  }));
                }}
                placeholder="Contoh: Youth Leadership Summit 2026"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>

            {/* Custom Permalink / URL Slug */}
            <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Permalink / URL Kegiatan Kustom</span>
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
                  #/event/
                </span>
                <input
                  type="text"
                  value={form.slug || ''}
                  onChange={(e) => {
                    setIsSlugCustomized(true);
                    updateField('slug', generateSlug(e.target.value));
                  }}
                  placeholder="permalink-kegiatan"
                  className="flex-1 px-3 py-2 text-xs font-mono font-medium text-gray-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                <span>Pratinjau link: <strong className="text-blue-600 font-mono">#/event/{form.slug || 'permalink'}</strong></span>
                <span className="text-[10px] text-gray-400">Gunakan huruf kecil & strip (-)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Deskripsi Lengkap Kegiatan
              </label>
              <RichTextEditor
                value={form.description || ''}
                onChange={(html) => updateField('description', html)}
                placeholder="Tuliskan tujuan, agenda, persyaratan relawan, dan manfaat kegiatan ini... (Bisa ubah warna teks, tebal/bold, daftar poin, dan emoji)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Kategori Kegiatan
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  placeholder="Contoh: Workshop, Edukasi, Sosial"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tim / Penyelenggara Lapangan
                </label>
                <input
                  type="text"
                  value={form.speaker}
                  onChange={(e) => updateField('speaker', e.target.value)}
                  placeholder="Contoh: Tim Relawan IYMPACK Bogor"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>
            </div>
          </div>

          {/* Section: Informasi HTM & Rekening */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Informasi HTM & Pembayaran</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  HTM / Biaya Kegiatan
                </label>
                <input
                  type="text"
                  value={form.fee || ''}
                  onChange={(e) => updateField('fee', e.target.value)}
                  placeholder="Contoh: Bebas Biaya / Rp. 50.000"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
                <p className="text-[11px] text-gray-400 mt-1">Ketik "Bebas Biaya" jika kegiatan gratis.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  WhatsApp Narahubung / Panitia
                </label>
                <input
                  type="text"
                  value={form.contactPhone || ''}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
                <p className="text-[11px] text-gray-400 mt-1">Nomor konfirmasi bukti transfer peserta.</p>
              </div>
            </div>

            {/* Rekening Tujuan Transfer (3 Kolom Terpisah Sesuai Permintaan) */}
            <div className="pt-2">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Rekening Tujuan Transfer
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    3 Kolom Terpisah
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {/* Kolom 1: Nama Bank */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      1. Nama Bank / E-Wallet
                    </label>
                    <input
                      type="text"
                      value={form.bankName || ''}
                      onChange={(e) => updateField('bankName', e.target.value)}
                      placeholder="Contoh: Bank Mandiri"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest font-medium"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Bank Mandiri / BCA / BSI / GoPay, dll.</p>
                  </div>

                  {/* Kolom 2: Nomor Rekening */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      2. Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={form.accountNumber || ''}
                      onChange={(e) => updateField('accountNumber', e.target.value)}
                      placeholder="Contoh: 133 00 2918291 0"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest font-mono font-medium"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Nomor rekening transfer peserta.</p>
                  </div>

                  {/* Kolom 3: Atas Nama */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      3. Atas Nama (Pemilik)
                    </label>
                    <input
                      type="text"
                      value={form.accountHolder || ''}
                      onChange={(e) => updateField('accountHolder', e.target.value)}
                      placeholder="Contoh: Yayasan IYMPACK Peduli Bangsa"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest font-medium"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Nama pemilik yang terdaftar.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pelaksanaan & Lokasi */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100">
              Pelaksanaan & Tempat
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Lokasi Kegiatan
                </label>
                <input
                  type="text"
                  value={form.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Contoh: Balai Sarbini, Jakarta / Online Zoom"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Teks Waktu Pelaksanaan
                </label>
                <input
                  type="text"
                  value={form.time || ''}
                  onChange={(e) => updateField('time', e.target.value)}
                  placeholder="Contoh: 08:30 - 16:00 WIB"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Link / Embed Google Maps Lokasi (Opsional)
                </label>
                {isResolvingMap && (
                  <span className="flex items-center gap-1 text-[11px] text-forest font-medium animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Mendeteksi detail link...</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                value={form.mapsUrl || ''}
                onChange={(e) => handleMapsUrlChange(e.target.value)}
                placeholder="Paste link apa saja: https://maps.app.goo.gl/..., https://google.com/maps/..., atau <iframe>"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Cukup copy-paste link Google Maps (bisa link share pendek dari HP, link browser, atau embed). Sistem otomatis mengekstrak nama tempat dan titik koordinat presisi.
              </p>

              {/* Rekomendasi Nama Tempat Otomatis */}
              {detectedMapInfo?.placeName && detectedMapInfo.placeName !== form.location && (
                <div className="mt-2.5 flex items-center justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200/90 rounded-xl text-xs text-emerald-900 shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      Nama tempat terdeteksi: <strong>{detectedMapInfo.placeName}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('location', detectedMapInfo.placeName)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-[11px] transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Terapkan ke Lokasi</span>
                  </button>
                </div>
              )}

              {/* Live Map Preview Box */}
              {(form.mapsEmbedUrl || detectedMapInfo?.embedUrl) && (
                <div className="mt-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="font-semibold flex items-center gap-1.5 text-stone-800">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Preview Peta Lokasi (Pin Presisi)
                    </span>
                    {form.mapsUrl && (
                      <a
                        href={form.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-forest hover:underline flex items-center gap-1 text-[11px] font-medium"
                      >
                        <span>Buka Link Asli</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="w-full h-48 sm:h-52 rounded-lg overflow-hidden border border-stone-200 shadow-inner bg-stone-100">
                    <iframe
                      title="Preview Peta Lokasi"
                      src={form.mapsEmbedUrl || detectedMapInfo?.embedUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>
                      {detectedMapInfo?.lat && detectedMapInfo?.lng
                        ? `Koordinat: ${detectedMapInfo.lat}, ${detectedMapInfo.lng}`
                        : 'Titik pin peta terverifikasi'}
                    </span>
                    <span className="text-emerald-700 font-medium">✓ Sesuai dengan tampilan peserta</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Link Pendaftaran Eksternal (Opsional)
              </label>
              <input
                type="url"
                value={form.registrationUrl || ''}
                onChange={(e) => updateField('registrationUrl', e.target.value)}
                placeholder="Contoh: https://forms.gle/... atau https://bit.ly/..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
              <p className="text-[11px] text-gray-400 mt-1">Jika diisi, tombol "Daftar Kegiatan" akan membuka tautan form ini. Jika kosong, akan diarahkan ke WhatsApp koordinator tim.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Waktu Mulai
                </label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Waktu Selesai
                </label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Batas Pendaftaran
                </label>
                <input
                  type="datetime-local"
                  value={form.registrationDeadline}
                  onChange={(e) => updateField('registrationDeadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Kustomisasi Formulir Pendaftaran Relawan (Form Builder) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-heading flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-forest" />
                  <span>Kustomisasi Formulir Pendaftaran Relawan</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sesuaikan pertanyaan atau data tambahan apa saja yang wajib/opsional diisi pendaftar khusus kegiatan ini.
                </p>
              </div>
              <span className="text-[11px] font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-full w-fit">
                {form.customFields?.length || 0} Kolom Kustom
              </span>
            </div>

            {/* Standar Field Toggles */}
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/60 space-y-3">
              <span className="block text-xs font-bold text-gray-700">
                Pengaturan Kolom Standar Platform:
              </span>

              <div className="space-y-3 text-xs">
                {/* Instagram Follow */}
                <div className="p-3 bg-white rounded-xl border border-gray-200/80 space-y-2">
                  <label className="flex items-center gap-2 text-gray-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.requireFollowProof}
                      onChange={(e) => updateField('requireFollowProof', e.target.checked)}
                      className="rounded text-forest focus:ring-forest w-4 h-4"
                    />
                    <span>Wajib upload bukti follow Instagram</span>
                  </label>
                  {form.requireFollowProof && (
                    <div className="pl-6 flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-gray-400 font-bold">@</span>
                      <input
                        type="text"
                        value={form.instagramAccount || ''}
                        onChange={(e) => updateField('instagramAccount', e.target.value.replace('@', '').trim())}
                        placeholder="iympack (atau akun cabang: iympack.bandung)"
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                      />
                      <span className="text-[11px] text-gray-400">Akun Instagram yang wajib di-follow</span>
                    </div>
                  )}
                </div>

                {/* TikTok Follow */}
                <div className="p-3 bg-white rounded-xl border border-gray-200/80 space-y-2">
                  <label className="flex items-center gap-2 text-gray-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.requireTiktokProof}
                      onChange={(e) => updateField('requireTiktokProof', e.target.checked)}
                      className="rounded text-forest focus:ring-forest w-4 h-4"
                    />
                    <span>Wajib upload bukti follow TikTok</span>
                  </label>
                  {form.requireTiktokProof && (
                    <div className="pl-6 flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-gray-400 font-bold">@</span>
                      <input
                        type="text"
                        value={form.tiktokAccount || ''}
                        onChange={(e) => updateField('tiktokAccount', e.target.value.replace('@', '').trim())}
                        placeholder="Contoh: iympack_bandung atau iympack_official"
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                      />
                      <span className="text-[11px] text-gray-400">Akun TikTok cabang yang wajib di-follow</span>
                    </div>
                  )}
                </div>

                {/* Motivasi & Alasan */}
                <div className="p-3 bg-white rounded-xl border border-gray-200/80">
                  <label className="flex items-center gap-2 text-gray-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.requireReason}
                      onChange={(e) => updateField('requireReason', e.target.checked)}
                      className="rounded text-forest focus:ring-forest w-4 h-4"
                    />
                    <span>Wajib mengisi alasan & motivasi mendaftar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Questions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Daftar Pertanyaan Tambahan:
                </h3>
              </div>

              {form.customFields && form.customFields.length > 0 ? (
                <div className="space-y-3">
                  {form.customFields.map((field, idx) => (
                    <div
                      key={field.id || idx}
                      className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3 relative group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Pertanyaan #{idx + 1}
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateCustomField(idx, 'label', e.target.value)}
                            placeholder="Contoh: Ukuran Kaos Relawan / Riwayat Penyakit / Akun Medsos"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeCustomField(idx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors mt-5 cursor-pointer"
                          title="Hapus pertanyaan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                            Tipe Jawaban
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) => updateCustomField(idx, 'type', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                          >
                            <option value="text">Teks Singkat</option>
                            <option value="textarea">Teks Panjang / Paragraf</option>
                            <option value="select">Pilihan Dropdown</option>
                            <option value="radio">Pilihan Ganda (Radio)</option>
                            <option value="file">Upload File / Gambar / Berkas</option>
                          </select>
                        </div>

                        <div className="flex items-center pt-4 sm:pt-0">
                          <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateCustomField(idx, 'required', e.target.checked)}
                              className="rounded text-forest focus:ring-forest w-3.5 h-3.5"
                            />
                            <span className="font-semibold text-xs">Wajib Diisi (Required)</span>
                          </label>
                        </div>
                      </div>

                      {(field.type === 'select' || field.type === 'radio') && (
                        <div className="pt-1 border-t border-gray-100">
                          <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                            Pilihan Opsi (pisahkan dengan koma)
                          </label>
                          <input
                            type="text"
                            value={Array.isArray(field.options) ? field.options.join(', ') : (field.options || '')}
                            onChange={(e) => {
                              const opts = e.target.value.split(',').map((s) => s.trim());
                              updateCustomField(idx, 'options', opts);
                            }}
                            placeholder="Contoh: S, M, L, XL, XXL atau Ya, Tidak"
                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                  Belum ada pertanyaan kustom. Klik template cepat atau tombol tambah di bawah untuk menyesuaikan form sesuai kebutuhan cabang Anda.
                </div>
              )}

              {/* Quick Template Presets */}
              <div className="pt-2">
                <span className="block text-[11px] font-bold text-gray-500 mb-2">
                  Template Pertanyaan Siap Pakai:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addCustomField('select', 'Ukuran Kaos Relawan', ['S', 'M', 'L', 'XL', 'XXL'])}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-forest/10 hover:text-forest rounded-lg text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
                  >
                    + Ukuran Kaos (S, M, L, XL, XXL)
                  </button>
                  <button
                    type="button"
                    onClick={() => addCustomField('text', 'Username Akun TikTok / Medsos Peserta', [], '@username')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-forest/10 hover:text-forest rounded-lg text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
                  >
                    + Akun TikTok Peserta
                  </button>
                  <button
                    type="button"
                    onClick={() => addCustomField('file', 'Upload Bukti Screenshot Follow TikTok (@akun_cabang)')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-forest/10 hover:text-forest rounded-lg text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
                  >
                    + Bukti Follow TikTok Cabang
                  </button>
                  <button
                    type="button"
                    onClick={() => addCustomField('textarea', 'Riwayat Penyakit / Alergi Khusus', [], 'Tuliskan jika ada')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-forest/10 hover:text-forest rounded-lg text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
                  >
                    + Riwayat Kesehatan / Alergi
                  </button>
                  <button
                    type="button"
                    onClick={() => addCustomField('textarea', 'Pengalaman Kerelawanan Sebelumnya', [], 'Ceritakan secara singkat')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-forest/10 hover:text-forest rounded-lg text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
                  >
                    + Pengalaman Relawan
                  </button>
                  <button
                    type="button"
                    onClick={() => addCustomField('file', 'Upload CV / KTM / Portofolio')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-forest/10 hover:text-forest rounded-lg text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
                  >
                    + Upload Berkas / CV / KTM
                  </button>
                </div>
              </div>

              {/* Add Blank Question Button */}
              <button
                type="button"
                onClick={() => addCustomField('text', 'Pertanyaan Tambahan')}
                className="w-full py-2.5 border-2 border-dashed border-forest/30 hover:border-forest text-forest hover:bg-forest/5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pertanyaan Kustom Sendiri</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Settings) */}
        <div className="space-y-6">
          {/* Status & Quota Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100">
              Pengaturan Status
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Status Kegiatan
              </label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 bg-white"
              >
                <option value={EVENT_STATUS.PUBLISHED}>Sedang Buka (Published)</option>
                <option value={EVENT_STATUS.DRAFT}>Draft (Belum Tampil)</option>
                <option value={EVENT_STATUS.CLOSED}>Selesai / Ditutup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kuota Maksimal Relawan
              </label>
              <input
                type="number"
                min="0"
                value={form.maxQuota}
                onChange={(e) => updateField('maxQuota', e.target.value)}
                placeholder="Contoh: 50"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
              <p className="text-[11px] text-gray-400 mt-1">Kosongkan jika kuota tidak terbatas.</p>
            </div>
          </div>

          {/* Banner Media Card (Upload File Only) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading">
                Poster / Banner Kegiatan
              </h2>
              {form.bannerImage && (
                <button
                  type="button"
                  onClick={() => updateField('bannerImage', '')}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Foto</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Upload File Poster (dari Perangkat/HP)</span>
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
                Pratinjau Poster:
              </span>
              {form.bannerImage ? (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 p-2 flex items-center justify-center">
                  <img
                    src={form.bannerImage}
                    alt="Pratinjau Banner"
                    className="w-full h-auto max-h-72 object-contain rounded-lg shadow-sm"
                  />
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 h-32 flex flex-col items-center justify-center text-gray-400 text-xs text-center p-3">
                  <Image className="w-6 h-6 mb-1 text-gray-300" />
                  <span>Silakan upload foto poster kegiatan</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 space-y-2 shadow-sm">
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="w-full py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-forest/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan ke Database...' : (isUploadingImage ? 'Sedang Mengunggah Gambar...' : (isEditing ? 'Simpan Perubahan' : 'Terbitkan Kegiatan'))}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/kegiatan')}
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
