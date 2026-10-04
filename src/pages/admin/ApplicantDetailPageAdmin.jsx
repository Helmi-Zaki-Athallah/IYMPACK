/**
 * IYMPACK CMS — Full Page Applicant Detail & Verification
 *
 * Dedicated full-page interface replacing popup modals.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../../hooks/useData.js';
import { formatDate } from '../../lib/utils.js';
import {  TEAM_LABELS } from '../../lib/db.constants.js';
import {
  ArrowLeft, CheckCircle2, Mail, Phone,
  MapPin, X, ExternalLink, Image as ImageIcon,
  FileText, FileCheck, ZoomIn, Trash2, AlertTriangle
} from 'lucide-react';

const _STATUS_CONFIG = {
  pending: { label: 'Menunggu Verifikasi', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  approved: { label: 'Disetujui (Diterima)', color: 'bg-green-100 text-green-700', border: 'border-green-200' },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-600', border: 'border-red-200' } };

export default function ApplicantDetailPageAdmin() {
  const { id } = useParams();
  const _navigate = useNavigate();
  const { getApplicantById, events, deleteApplicant } = useData();

  const [applicant, setApplicant] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      const data = getApplicantById(id);
      if (data) {
        setApplicant(data);
      }
    }
  }, [id, getApplicantById]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteApplicant(id);
      _navigate('/admin/pendaftar');
    } catch(e) {
      alert(e.message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!applicant) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4 max-w-xl mx-auto my-12">
        <p className="text-gray-600 text-sm">Data pendaftar tidak ditemukan atau telah dihapus.</p>
        <Link
          to="/admin/pendaftar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Data Pendaftar
        </Link>
      </div>
    );
  }

  const currentEvent = events.find((e) => e.id === applicant.eventId);

  const waUrl = applicant.whatsapp
    ? `https://wa.me/${applicant.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* ─── Top Header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/pendaftar"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
            title="Kembali ke Daftar Pendaftar"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 font-heading">
                {applicant.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Terdaftar Resmi
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {TEAM_LABELS[applicant.teamId || currentEvent?.teamId] || 'Pusat'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Peserta kegiatan: <strong className="text-gray-700">{currentEvent?.title || 'Kegiatan IYMPACK'}</strong>
            </p>
          </div>
        </div>

        {/* Quick Contact + Hapus Action */}
        <div className="flex items-center gap-2 flex-wrap">
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Chat WhatsApp Peserta</span>
          </a>
        )}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          title="Hapus pendaftar ini (spam/phising)"
        ><Trash2 className="w-3.5 h-3.5"/> Hapus (Spam/Phising)</button>
        </div>
      </div>

      {/* ─── Detail Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Data Kontak & Pribadi */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100">
            Informasi Pribadi & Kontak
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-gray-400 block">Nama Lengkap</span>
              <span className="font-semibold text-gray-800">{applicant.fullName}</span>
            </div>

            <div>
              <span className="text-xs text-gray-400 block">Email</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${applicant.email}`} className="text-forest hover:underline font-medium">
                  {applicant.email}
                </a>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-400 block">Nomor WhatsApp</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-800">{applicant.whatsapp}</span>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline font-medium bg-green-50 px-2 py-0.5 rounded-md"
                  >
                    Chat WA <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-400 block">Kota / Domisili</span>
              <div className="flex items-center gap-1.5 mt-0.5 text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{applicant.city || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Informasi Kegiatan Terdaftar */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100">
            Kegiatan Terdaftar
          </h2>

          {currentEvent ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Judul Kegiatan</span>
                <span className="font-semibold text-gray-800">{currentEvent.title}</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block">Kategori & Lokasi</span>
                <span className="text-gray-700">{currentEvent.category} • {currentEvent.location}</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block">Jadwal Pelaksanaan</span>
                <span className="text-gray-700">{currentEvent.time || formatDate(currentEvent.startDate)}</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block">Kuota Relawan Saat Ini</span>
                <span className="text-gray-700 font-medium">
                  {currentEvent.currentApplicants} / {currentEvent.maxQuota || '∞'} relawan
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Data kegiatan tidak ditemukan.</p>
          )}
        </div>
      </div>

      {/* Card 3: Alasan & Motivasi Bergabung */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3 shadow-sm">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100">
          Alasan & Motivasi Mendaftar
        </h2>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {applicant.reason || 'Tidak ada catatan motivasi yang disertakan.'}
          </p>
        </div>
      </div>

      {/* Card 3.5: Jawaban Formulir Khusus (Kustom Cabang) */}
      {currentEvent?.customFields && currentEvent.customFields.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-forest" />
              Jawaban Formulir Khusus (Kustom Cabang)
            </h2>
            <span className="text-[11px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
              {currentEvent.customFields.length} Pertanyaan Khusus
            </span>
          </div>

          <div className="space-y-4">
            {currentEvent.customFields.map((field) => {
              if (field.type === 'heading') {
                return (
                  <div key={field.id} className="pt-2 pb-1 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-forest rounded-full"></span>
                      <h3 className="text-sm font-bold text-gray-900 font-heading">{field.label}</h3>
                    </div>
                    {field.helperText && <p className="text-xs text-gray-500 mt-1 pl-3.5">{field.helperText}</p>}
                  </div>
                );
              }

              const answer = applicant.customAnswers?.[field.id];
              const isImage = typeof answer === 'string' && (answer.startsWith('data:image/') || answer.match(/\.(jpeg|jpg|png|webp|gif)(\?.*)?$/i));
              const isFile = typeof answer === 'string' && answer.startsWith('data:');

              return (
                <div key={field.id} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">{field.label}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-gray-200">
                      Tipe: {field.type}
                    </span>
                  </div>

                  {isImage ? (
                    <div className="pt-2 space-y-2">
                      <div 
                        className="relative group overflow-hidden rounded-xl border border-gray-200 bg-white max-w-xs aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-forest/50 transition-colors"
                        onClick={() => setPreviewImage({ url: answer, title: field.label })}
                      >
                        <img
                          src={answer}
                          alt={field.label}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                          <ZoomIn className="w-4 h-4" /> Klik untuk Perbesar
                        </div>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ url: answer, title: field.label })}
                          className="inline-flex items-center gap-1 text-xs text-forest hover:underline font-medium cursor-pointer"
                        >
                          Buka Ukuran Penuh <ZoomIn className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : isFile ? (
                    <div className="pt-1">
                      <a
                        href={answer}
                        download={`berkas_${field.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
                      >
                        <FileCheck className="w-4 h-4 text-forest" />
                        Unduh / Buka Berkas Lampiran
                      </a>
                    </div>
                  ) : Array.isArray(answer) ? (
                    <div className="p-3 bg-white rounded-lg border border-gray-100">
                      {answer.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {answer.map((val, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-1 rounded-md bg-forest/10 text-forest text-xs font-semibold"
                            >
                              ✓ {val}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Tidak ada opsi dipilih</span>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-lg border border-gray-100 text-sm font-medium text-gray-800">
                      {answer !== undefined && answer !== null && String(answer).trim() !== '' ? (
                        <span className="break-words whitespace-pre-wrap">{String(answer)}</span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Tidak ada jawaban / tidak diisi</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Card 3.7: Informasi Voucher Digunakan */}
      {applicant.voucherCode && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3 shadow-sm">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-violet-500" />
            Voucher / Kupon Diskon
          </h2>
          <div className="p-4 bg-violet-50 rounded-xl border border-violet-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Kode Voucher</span>
              <code className="px-2.5 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-lg tracking-wider font-mono">
                {applicant.voucherCode}
              </code>
            </div>
            {applicant.discountAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Diskon</span>
                <span className="text-xs font-bold text-emerald-600">
                  - Rp. {Number(applicant.discountAmount).toLocaleString('id-ID')}
                </span>
              </div>
            )}
            {applicant.finalFee && (
              <div className="flex items-center justify-between pt-1 border-t border-violet-200">
                <span className="text-xs font-semibold text-gray-600">Total Bayar Setelah Diskon</span>
                <span className="text-sm font-bold text-gray-800">
                  {Number(applicant.finalFee) === 0 ? 'GRATIS' : `Rp. ${Number(applicant.finalFee).toLocaleString('id-ID')}`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card 4: Bukti Lampiran (Follow IG & Transfer HTM) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-forest" />
          Lampiran Berkas & Bukti Pendaftaran
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
          {/* Bukti Follow Instagram */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/60 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-semibold text-gray-800 block">
                Bukti Follow Instagram (@{currentEvent?.instagramAccount || 'iympack'})
              </span>
              <span className="text-[11px] text-gray-400">Tangkapan layar follow Instagram</span>
            </div>
            {applicant.followProof ? (
              <div className="space-y-2">
                <div 
                  className="relative group overflow-hidden rounded-xl border border-gray-200 bg-white aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-forest/50 transition-colors"
                  onClick={() => setPreviewImage({ url: applicant.followProof, title: `Bukti Follow Instagram (@${currentEvent?.instagramAccount || 'iympack'})` })}
                >
                  <img
                    src={applicant.followProof}
                    alt="Bukti Follow Instagram"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <ZoomIn className="w-4 h-4" /> Klik untuk Perbesar
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ url: applicant.followProof, title: `Bukti Follow Instagram (@${currentEvent?.instagramAccount || 'iympack'})` })}
                    className="inline-flex items-center gap-1 text-xs text-forest hover:underline font-medium cursor-pointer"
                  >
                    Buka Ukuran Penuh <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400 bg-white">
                Tidak ada bukti follow IG dilampirkan
              </div>
            )}
          </div>

          {/* Bukti Follow TikTok */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/60 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-semibold text-gray-800 block">
                Bukti Follow TikTok (@{currentEvent?.tiktokAccount || 'iympack.id'})
              </span>
              <span className="text-[11px] text-gray-400">Tangkapan layar follow TikTok</span>
            </div>
            {applicant.tiktokProof ? (
              <div className="space-y-2">
                <div 
                  className="relative group overflow-hidden rounded-xl border border-gray-200 bg-white aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-forest/50 transition-colors"
                  onClick={() => setPreviewImage({ url: applicant.tiktokProof, title: `Bukti Follow TikTok (@${currentEvent?.tiktokAccount || 'iympack.id'})` })}
                >
                  <img
                    src={applicant.tiktokProof}
                    alt="Bukti Follow TikTok"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <ZoomIn className="w-4 h-4" /> Klik untuk Perbesar
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ url: applicant.tiktokProof, title: `Bukti Follow TikTok (@${currentEvent?.tiktokAccount || 'iympack.id'})` })}
                    className="inline-flex items-center gap-1 text-xs text-forest hover:underline font-medium cursor-pointer"
                  >
                    Buka Ukuran Penuh <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400 bg-white">
                {currentEvent?.requireTiktokProof ? 'Tidak ada bukti follow TikTok dilampirkan' : 'Tidak diwajibkan oleh kegiatan'}
              </div>
            )}
          </div>

          {/* Bukti Transfer Pembayaran */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/60 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-semibold text-gray-800 block">Bukti Transfer Pembayaran HTM</span>
              <span className="text-[11px] text-gray-400">Tangkapan layar struk/resmi transfer bank</span>
            </div>
            {applicant.paymentProof ? (
              <div className="space-y-2">
                <div 
                  className="relative group overflow-hidden rounded-xl border border-gray-200 bg-white aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-forest/50 transition-colors"
                  onClick={() => setPreviewImage({ url: applicant.paymentProof, title: 'Bukti Transfer Pembayaran HTM' })}
                >
                  <img
                    src={applicant.paymentProof}
                    alt="Bukti Transfer Pembayaran"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <ZoomIn className="w-4 h-4" /> Klik untuk Perbesar
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ url: applicant.paymentProof, title: 'Bukti Transfer Pembayaran HTM' })}
                    className="inline-flex items-center gap-1 text-xs text-forest hover:underline font-medium cursor-pointer"
                  >
                    Buka Ukuran Penuh <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400 bg-white">
                Tidak ada bukti transfer dilampirkan (Bebas Biaya / Belum diupload)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 5: Metadata Registrasi */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <span className="block text-gray-400">Tanggal Mendaftar</span>
          <span className="font-semibold text-gray-700">
            {formatDate(applicant.submittedAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div>
          <span className="block text-gray-400">Cabang Penyelenggara</span>
          <span className="font-semibold text-gray-700">
            {TEAM_LABELS[applicant.teamId || currentEvent?.teamId] || 'Pusat'}
          </span>
        </div>
        <div>
          <span className="block text-gray-400">ID Registrasi</span>
          <code className="text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[11px]">{applicant.id}</code>
        </div>
      </div>

      {/* ─── Modal Lightbox Perbesar Foto ──────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-all duration-300 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] bg-[#1c241e] border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate pr-2">
                {previewImage.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-auto min-h-[260px] max-h-[70vh] bg-black/50 rounded-xl p-2">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-[66vh] object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] sm:text-xs text-stone-400">
                Klik di luar gambar atau tombol ✕ untuk menutup
              </span>
              <button
                type="button"
                onClick={() => {
                  const w = window.open('');
                  if (w) {
                    w.document.write(`<title>${previewImage.title}</title><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${previewImage.url}" style="max-width:100%;max-height:100%;object-fit:contain;" /></body>`);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                <span>Buka di Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Konfirmasi Hapus (Anti-Phising) ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>!isDeleting && setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4" onClick={e=>e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 rounded-xl text-red-600 shrink-0"><AlertTriangle className="w-6 h-6"/></div>
              <div>
                <h3 className="font-bold text-gray-900">Hapus pendaftar ini?</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  Yakin ingin menghapus <strong className="text-gray-800">{applicant.fullName}</strong> ({applicant.email})?<br/>Data akan hilang permanen &amp; kuota <strong>{currentEvent?.title}</strong> akan dikoreksi (-1). Gunakan untuk kasus <strong>spam / phising / data palsu</strong>.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button disabled={isDeleting} onClick={()=>setShowDeleteConfirm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Batal</button>
              <button disabled={isDeleting} onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50 inline-flex items-center gap-1.5">{isDeleting ? 'Menghapus...' : <><Trash2 className="w-4 h-4"/> Ya, Hapus Permanen</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
