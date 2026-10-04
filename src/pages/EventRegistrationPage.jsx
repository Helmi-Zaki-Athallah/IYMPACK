/**
 * IYMPACK — Event Registration Page
 *
 * Dedicated volunteer registration page with:
 * - Event summary & breadcrumbs
 * - Personal details (Nama, Email, WhatsApp, Domisili)
 * - Alasan ikut volunteer IYMPACK
 * - Upload bukti follow Instagram (@iympack) with preview
 * - Informasi Rekening HTM (Bank BCA, Mandiri) with copy buttons
 * - Upload bukti transfer pembayaran with preview
 * - Confirmation & success view
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen.jsx';
import {
  Home,
  ChevronRight,
  Upload,
  Check,
  Copy,
  Calendar,
  Clock,
  MapPin,
  Banknote,
  FileCheck,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Ticket,
  ShieldCheck,
} from 'lucide-react';
import { getEventBySlug, getEvents, checkEventQuota } from '../services/events.service.js';
import { useData } from '../hooks/useData.js';
import { eventsData } from '../data/iympackData.js';
import { submitApplication } from '../services/applicants.service.js';
import { validateVoucher, calculateDiscount, redeemVoucher, formatRupiah } from '../services/vouchers.service.js';
import { formatDate, formatFee, isFreeFee, validateEmail, validateWhatsApp } from '../lib/utils.js';
import { validateUploadedFile } from '../lib/security.js';
import { uploadImage } from '../lib/upload.js';
import { holdServerSlot, releaseServerSlot } from '../lib/api.js';

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.02 2.94.01 5.88-.02 8.82-.09 2.06-.89 4.11-2.34 5.59-1.92 2.02-4.78 2.87-7.51 2.37-2.67-.44-5.06-2.28-6.12-4.78-1.18-2.67-.73-5.94 1.13-8.17 1.77-2.18 4.67-3.15 7.42-2.48.01 1.44-.01 2.89.01 4.33-.87-.27-1.85-.23-2.69.13-.99.4-1.77 1.25-2.09 2.28-.39 1.2-.18 2.59.56 3.59.73.99 1.95 1.53 3.19 1.46 1.29-.03 2.5-.78 2.99-1.97.28-.65.34-1.37.34-2.08V.02h2.78z"/>
  </svg>
);

export default function EventRegistrationPage() {
  const { slug } = useParams();
  const { events } = useData() || {};

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    city: '',
    reason: '',
    followProof: '',
    tiktokProof: '',
    paymentProof: '',
    agreement: true,
  });
  const [customAnswers, setCustomAnswers] = useState({});

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Copy bank state
  const [copiedBank, setCopiedBank] = useState('');

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherResult, setVoucherResult] = useState(null); // { valid, voucher, message }
  const [voucherDiscount, setVoucherDiscount] = useState(null); // { discountAmount, finalFee }
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  // Multi-step form state (1: Data Diri & Follow IG, 2: Pembayaran HTM & Konfirmasi)
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidatingQuota, setIsValidatingQuota] = useState(false);
  const [quotaValidationResult, setQuotaValidationResult] = useState(null);
  const [isQuotaFullError, setIsQuotaFullError] = useState(false);

  // Kunci Slot Sementara (15 Menit Reservasi Server)
  const [slotHold, setSlotHold] = useState(null); // { holdId, expiresAt, remainingSlots }
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(0);
  const [isHoldExpired, setIsHoldExpired] = useState(false);

  useEffect(() => {
    const all = (events && events.length > 0) ? events : getEvents();
    const match = all.find((e) => e.slug === slug || e.id === slug) || getEventBySlug(slug);
    if (match) {
      setEvent(match);
      // Pulihkan slot hold dari sessionStorage jika masih aktif
      try {
        const raw = sessionStorage.getItem(`iympack_hold_${match.id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.expiresAt && new Date(parsed.expiresAt).getTime() > Date.now()) {
            setSlotHold(parsed);
          } else {
            sessionStorage.removeItem(`iympack_hold_${match.id}`);
          }
        }
      } catch {
        // ignore
      }
    } else {
      setEvent(null);
    }
    setLoading(false);
  }, [slug, events]);

  // Live countdown timer untuk kunci slot sementara
  useEffect(() => {
    if (!slotHold?.expiresAt) {
      setHoldSecondsLeft(0);
      setIsHoldExpired(false);
      return;
    }

    const updateTimer = () => {
      const diffMs = new Date(slotHold.expiresAt).getTime() - Date.now();
      const diffSec = Math.max(0, Math.floor(diffMs / 1000));
      setHoldSecondsLeft(diffSec);
      if (diffSec <= 0) {
        setIsHoldExpired(true);
      } else {
        setIsHoldExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [slotHold]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading && !event) {
    return <LoadingScreen message="Menyiapkan formulir pendaftaran relawan..." dark={true} />;
  }

  if (!event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4 bg-[#1c241e] text-white">
        <h2 className="text-2xl font-bold font-heading">Kegiatan Tidak Ditemukan</h2>
        <p className="text-xs text-stone-400 max-w-sm">
          Agenda kegiatan yang Anda cari mungkin telah dipindahkan atau tautan sudah tidak berlaku.
        </p>
        <Link
          to="/event"
          className="inline-block px-6 py-2.5 border border-white/30 text-white rounded-full text-xs font-semibold hover:bg-white/10 transition-colors"
        >
          Kembali ke Daftar Kegiatan
        </Link>
      </div>
    );
  }

  // Jika kegiatan telah selesai / ditutup, tidak bisa mendaftar
  if (event.status === 'closed') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-20 text-center space-y-6 bg-[#1c241e] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-topo-pattern opacity-15 pointer-events-none" />
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-lg relative z-10">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-3 max-w-md relative z-10">
          <span className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Pendaftaran Telah Ditutup
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Kegiatan Telah Selesai
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
            Mohon maaf, pendaftaran relawan untuk kegiatan <strong className="text-[#faeed4] font-semibold">"{event.title}"</strong> telah ditutup karena periode kegiatan telah selesai dilaksanakan.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 relative z-10">
          <Link
            to={`/event/${event.slug || event.id}`}
            className="px-6 py-3 bg-[#faeed4] hover:bg-white text-[#1c241e] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer"
          >
            Lihat Detail Kegiatan
          </Link>
          <Link
            to="/event"
            className="px-6 py-3 border border-white/20 hover:border-white text-stone-200 hover:text-white font-semibold text-xs sm:text-sm rounded-xl transition-all bg-white/5 cursor-pointer"
          >
            Jelajahi Kegiatan Lainnya
          </Link>
        </div>
      </div>
    );
  }

  const getTeamOrganizer = (evt) => {
    if (!evt) return 'Tim IYMPACK Pusat';
    const textToCheck = `${evt.speaker || ''} ${evt.location || ''} ${evt.title || ''}`.toLowerCase();
    if (textToCheck.includes('jakarta')) return 'Tim IYMPACK Jakarta';
    if (textToCheck.includes('bogor')) return 'Tim IYMPACK Bogor';
    if (textToCheck.includes('depok')) return 'Tim IYMPACK Depok';
    if (textToCheck.includes('tangerang')) return 'Tim IYMPACK Tangerang';
    if (textToCheck.includes('bekasi')) return 'Tim IYMPACK Bekasi';
    if (textToCheck.includes('bandung')) return 'Tim IYMPACK Bandung';
    return 'Tim IYMPACK Pusat';
  };

  const isFreeEvent = isFreeFee(event?.fee);

  // Jika peserta menggunakan voucher yang membuat biaya menjadi 0
  const isEffectivelyFree = isFreeEvent || (voucherResult?.valid && voucherDiscount && voucherDiscount.finalFee === 0);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = async (field, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const check = validateUploadedFile(file, { maxBytes: 10 * 1024 * 1024 });
      if (!check.valid) {
        setFormErrors((prev) => ({ ...prev, [field]: check.error }));
        return;
      }
      try {
        const urlOrBase64 = await uploadImage(file);
        setFormData((prev) => ({ ...prev, [field]: urlOrBase64 }));
        if (formErrors[field]) {
          setFormErrors((prev) => ({ ...prev, [field]: '' }));
        }
      } catch {
        setFormErrors((prev) => ({ ...prev, [field]: 'Gagal memproses gambar.' }));
      }
    }
  };

  const handleCustomAnswerChange = (fieldId, value) => {
    setCustomAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (formErrors['custom_' + fieldId]) {
      setFormErrors((prev) => ({ ...prev, ['custom_' + fieldId]: '' }));
    }
  };

  const handleCustomFileChange = async (fieldId, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const check = validateUploadedFile(file, { maxBytes: 10 * 1024 * 1024 });
      if (!check.valid) {
        setFormErrors((prev) => ({ ...prev, ['custom_' + fieldId]: check.error }));
        return;
      }
      try {
        const urlOrBase64 = await uploadImage(file);
        setCustomAnswers((prev) => ({ ...prev, [fieldId]: urlOrBase64 }));
        if (formErrors['custom_' + fieldId]) {
          setFormErrors((prev) => ({ ...prev, ['custom_' + fieldId]: '' }));
        }
      } catch {
        setFormErrors((prev) => ({ ...prev, ['custom_' + fieldId]: 'Gagal memproses berkas.' }));
      }
    }
  };

  const handleCopyText = (text, bankName) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bankName);
    setTimeout(() => setCopiedBank(''), 2500);
  };

  // ─── Voucher Handlers ────────────────────────────────────
  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) return;
    setIsValidatingVoucher(true);
    setVoucherResult(null);
    setVoucherDiscount(null);

    setTimeout(() => {
      const result = validateVoucher(voucherCode, event.id);
      setVoucherResult(result);

      if (result.valid && result.voucher) {
        const discount = calculateDiscount(result.voucher, event.fee);
        setVoucherDiscount(discount);
      }
      setIsValidatingVoucher(false);
    }, 300);
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setVoucherResult(null);
    setVoucherDiscount(null);
  };

  // Helper format nomor WhatsApp ke format internasional 62
  const formatWaNumber = (phone) => {
    if (!phone) return '';
    let clean = String(phone).replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (clean.startsWith('8')) {
      clean = '62' + clean;
    }
    return clean;
  };

  const cleanPhone = formatWaNumber(event?.contactPhone) || '6281234567890';
  const organizerName = getTeamOrganizer(event);
  const contactWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo ${organizerName}, saya ingin konfirmasi status kuota / pendaftaran kegiatan "${event?.title || ''}".`
  )}`;
  const confirmRegistrationWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo ${organizerName}, saya sudah mendaftar sebagai relawan untuk kegiatan "${event?.title || ''}".\n\nNama: ${formData.fullName}\nNo. WhatsApp: ${formData.whatsapp}\nDomisili: ${formData.city}\n\nSaya ingin mengonfirmasi pendaftaran saya. Mohon informasi untuk langkah selanjutnya. Terima kasih!`
  )}`;

  const validateStep1And2 = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi.';
    if (!formData.whatsapp.trim()) {
      errors.whatsapp = 'Nomor WhatsApp wajib diisi.';
    } else if (!validateWhatsApp(formData.whatsapp)) {
      errors.whatsapp = 'Nomor WhatsApp tidak valid (contoh: 08123456789 atau +628123456789).';
    }
    if (!formData.email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Format alamat email tidak valid.';
    }
    if (!formData.city.trim()) {
      errors.city = 'Kota/domisili asal wajib diisi.';
    }

    // Cek Alasan Ikut (Jika diwajibkan oleh cabang/pusat)
    if (event.requireReason !== false) {
      if (!formData.reason.trim() || formData.reason.trim().length < 10) {
        errors.reason = 'Ceritakan alasan Anda bergabung minimal 10 karakter.';
      }
    }

    // Cek Bukti Follow IG (Jika diwajibkan oleh cabang/pusat)
    if (event.requireFollowProof !== false) {
      if (!formData.followProof) {
        errors.followProof = `Silakan unggah screenshot bukti follow Instagram @${(event.instagramAccount || 'iympack').replace('@', '')}.`;
      }
    }

    // Cek Bukti Follow TikTok (Jika diwajibkan oleh cabang/pusat)
    if (event.requireTiktokProof) {
      if (!formData.tiktokProof) {
        errors.tiktokProof = `Silakan unggah screenshot bukti follow TikTok @${(event.tiktokAccount || 'iympack.id').replace('@', '')}.`;
      }
    }


    // Cek Pertanyaan Kustom Cabang / Penyelenggara
    if (Array.isArray(event.customFields)) {
      event.customFields.forEach((field) => {
        if (field.type === 'heading') return;
        if (field.required) {
          const val = customAnswers[field.id];
          if (
            val === undefined ||
            val === null ||
            (typeof val === 'string' && !val.trim()) ||
            (Array.isArray(val) && val.length === 0)
          ) {
            errors['custom_' + field.id] = `"${field.label}" wajib diisi / dipilih.`;
          }
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToStep2 = async () => {
    setSubmitError('');
    setIsQuotaFullError(false);

    // 1. Validasi dulu data no. 1 dan no. 2 serta field kustom
    if (!validateStep1And2()) {
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    setIsValidatingQuota(true);

    try {
      // 2. Kunci 1 slot sementara di server selama 15 menit
      const holdId = slotHold?.holdId || `hold_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const holdRes = await holdServerSlot(event.id, {
        holdId,
        email: formData.email,
        fullName: formData.fullName,
      });

      if (holdRes?.success) {
        const holdData = {
          holdId: holdRes.holdId,
          expiresAt: holdRes.expiresAt,
          remainingSlots: holdRes.remainingSlots,
        };
        setSlotHold(holdData);
        setIsHoldExpired(false);
        try {
          sessionStorage.setItem(`iympack_hold_${event.id}`, JSON.stringify(holdData));
        } catch {
          // ignore
        }

        setIsQuotaFullError(false);
        setQuotaValidationResult({
          isAvailable: true,
          remainingSlots: holdRes.remainingSlots,
          message: 'Slot berhasil diamankan untuk Anda selama 15 menit.',
        });

        // Pindah ke Langkah 2 (Pembayaran HTM)
        setCurrentStep(2);
        window.scrollTo({ top: 220, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('[hold_slot error]', err);
      setIsQuotaFullError(true);
      if (err.code === 'SLOT_SEDANG_DITAHAN' || err.message?.includes('SLOT_SEDANG_DITAHAN')) {
        setSubmitError(
          'Slot pendaftaran terakhir saat ini sedang dikunci sementara oleh pendaftar lain yang sedang melakukan proses transfer pembayaran (batas waktu 15 menit). Silakan coba lagi beberapa saat lagi jika peserta tersebut tidak menyelesaikan pembayaran.'
        );
      } else if (err.code === 'KUOTA_PENUH' || err.message?.includes('KUOTA_PENUH')) {
        setSubmitError('Mohon maaf, seluruh kuota pendaftaran untuk kegiatan ini telah habis terisi penuh.');
      } else {
        setSubmitError(err.message || 'Gagal mengamankan kuota slot pendaftaran.');
      }
    } finally {
      setIsValidatingQuota(false);
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  const validateStep3 = () => {
    const errors = {};
    if (!isEffectivelyFree && !formData.paymentProof) {
      errors.paymentProof = 'Silakan unggah bukti transfer pembayaran HTM.';
    }
    if (!formData.agreement) {
      errors.agreement = 'Anda harus menyetujui pernyataan komitmen pendaftaran.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsQuotaFullError(false);

    // Pastikan langkah 1 & 2 tetap valid
    if (!validateStep1And2()) {
      setCurrentStep(1);
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    // Validasi langkah 2 (Pembayaran)
    if (!validateStep3()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const appliedVoucher = voucherResult?.valid ? voucherResult.voucher : null;
      const discount = voucherDiscount || { discountAmount: 0, finalFee: 0 };

      const result = await submitApplication(event.id, {
        fullName: formData.fullName,
        whatsapp: formData.whatsapp,
        email: formData.email,
        city: formData.city,
        reason: formData.reason,
        followProof: formData.followProof,
        tiktokProof: formData.tiktokProof,
        paymentProof: formData.paymentProof,
        fee: event.fee,
        voucherCode: appliedVoucher ? appliedVoucher.code : '',
        discountAmount: appliedVoucher ? discount.discountAmount : 0,
        finalFee: appliedVoucher ? String(discount.finalFee) : '',
        customAnswers: { ...customAnswers },
        holdId: slotHold?.holdId || '',
      });

      // Bersihkan reservasi slot setelah berhasil
      try {
        sessionStorage.removeItem(`iympack_hold_${event.id}`);
      } catch {}
      setSlotHold(null);

      // Redeem voucher setelah submit berhasil
      if (appliedVoucher) {
        try {
          redeemVoucher(appliedVoucher.code, result.id, event.id);
        } catch {
          // Voucher redeem gagal tapi pendaftaran sudah berhasil, lanjut saja
        }
      }

      setSubmitSuccess(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err.message && (err.message.includes('KUOTA_PENUH') || err.message.toLowerCase().includes('kuota'))) {
        setIsQuotaFullError(true);
        setSubmitError(
          'Mohon maaf, waktu penguncian slot Anda telah kedaluwarsa atau kuota kegiatan ini baru saja habis terisi oleh pendaftar lain. Jika Anda sudah terlanjur melakukan transfer biaya, jangan khawatir! Silakan langsung hubungi panitia melalui WhatsApp di bawah dengan menyertakan bukti transfer Anda untuk verifikasi manual / slot cadangan.'
        );
      } else {
        setSubmitError(err.message || 'Terjadi kesalahan saat memproses formulir.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 pb-36 sm:pb-32 relative overflow-hidden">
      {/* Ambient decorative glow */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#819b8e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Top Header Banner ─────────────────────────── */}
      <section className="relative text-white pt-28 sm:pt-32 pb-12 border-b border-white/10 overflow-hidden bg-[#1c241e]">
        <img
          src="/hero-hands.webp"
          alt={event.title}
          loading="eager"
          decoding="async"
          onError={(e) => {
            e.target.src = '/hero-hands.png';
          }}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.6] contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c241e] via-[#1c241e]/85 to-[#1c241e]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-dots-pattern opacity-20 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-300 font-medium overflow-x-auto scrollbar-none py-1">
            <Link to="/" className="flex items-center gap-1.5 text-stone-400 hover:text-[#faeed4] transition-colors shrink-0">
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <Link to="/event" className="text-stone-400 hover:text-[#faeed4] transition-colors shrink-0">
              Semua Kegiatan
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <Link to={`/event/${event.slug || event.id}`} className="text-stone-400 hover:text-[#faeed4] transition-colors truncate max-w-[160px] sm:max-w-xs shrink-0">
              {event.title}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span className="text-[#faeed4] font-semibold shrink-0">
              Formulir Pendaftaran
            </span>
          </nav>

          <h1 className="text-2xl sm:text-4xl font-bold font-heading text-white leading-tight">
            Formulir Pendaftaran Relawan
          </h1>
          <p className="text-sm text-stone-300 font-light">
            Silakan lengkapi biodata diri, motivasi, dan bukti persyaratan di bawah ini untuk bergabung.
          </p>
        </div>
      </section>

      {/* ─── Main Content Area ─────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative">
        
        {/* ─── Success Screen ──────────────────────────── */}
        <AnimatePresence mode="wait">
        {submitSuccess ? (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-[#252f27] border border-white/15 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-950/60 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg"
            >
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </motion.div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#faeed4]">
                Pendaftaran Berhasil Dikirim
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                Terima Kasih, {formData.fullName}!
              </h2>
              <p className="text-sm text-stone-300 max-w-lg mx-auto leading-relaxed font-light">
                Data pendaftaran dan berkas Anda telah berhasil kami terima di sistem resmi IYMPACK.
              </p>
            </div>

            {/* Registration Summary Card */}
            <div className="bg-[#1c241e] border border-white/10 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-stone-400">Kegiatan:</span>
                <span className="font-semibold text-white text-right">{event.title}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-stone-400">Penyelenggara:</span>
                <span className="font-semibold text-[#faeed4]">{organizerName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-stone-400">Kontak Panitia:</span>
                <span className="font-semibold text-white">+62 812-3456-7890</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-stone-400">Nomor WhatsApp Anda:</span>
                <span className="font-semibold text-white">{formData.whatsapp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Status Pendaftaran:</span>
                <span className="font-semibold text-emerald-400">Terdaftar Resmi</span>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-w-lg mx-auto text-xs text-stone-300 leading-relaxed font-light text-left space-y-1.5">
              <p className="font-semibold text-white">Langkah Selanjutnya:</p>
              <p>&bull; Data pendaftaran Anda telah berhasil dicatat di sistem kegiatan ini.</p>
              <p>&bull; Silakan klik tombol di bawah untuk konfirmasi dan terhubung langsung ke narahubung panitia WhatsApp.</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={confirmRegistrationWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#faeed4] hover:bg-white text-[#1c241e] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md text-center block cursor-pointer"
              >
                Konfirmasi ke Penyelenggara
              </a>
              <Link
                to="/event"
                className="w-full sm:w-auto px-6 py-3.5 border border-white/20 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all text-center block"
              >
                Lihat Agenda Lainnya
              </Link>
            </div>

            <div className="pt-1 text-center">
              <Link
                to={`/event/${event.slug || event.id}`}
                className="text-xs text-stone-400 hover:text-[#faeed4] transition-colors inline-block py-1"
              >
                Kembali ke Detail Kegiatan
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ─── Multi-Step Registration Form ─────────────── */
          <div className="space-y-8">

            {/* Stepper Progress Bar */}
            <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between relative max-w-md mx-auto">
                {/* Connecting Line */}
                <div className="absolute top-4 sm:top-5 left-12 right-12 sm:left-16 sm:right-16 h-0.5 bg-white/10 -z-0">
                  <div
                    className="h-full bg-[#faeed4] transition-all duration-500"
                    style={{ width: currentStep === 2 ? '100%' : '0%' }}
                  />
                </div>

                {/* Step 1 Indicator */}
                <button
                  type="button"
                  onClick={() => currentStep === 2 && handleBackToStep1()}
                  className={`flex flex-col items-center gap-2 relative z-10 ${
                    currentStep === 2 ? 'cursor-pointer group' : 'cursor-default'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === 1
                        ? 'bg-[#faeed4] text-[#1c241e] ring-4 ring-[#faeed4]/20 shadow-lg scale-105'
                        : 'bg-emerald-600 text-white shadow-md'
                    }`}
                  >
                    {currentStep === 2 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <div className="text-center">
                    <span
                      className={`text-xs font-bold block ${
                        currentStep === 1 ? 'text-[#faeed4]' : 'text-stone-300'
                      }`}
                    >
                      Langkah 1
                    </span>
                    <span className="text-[11px] text-stone-400 font-light hidden sm:block">
                      Data Diri & Syarat
                    </span>
                  </div>
                </button>

                {/* Step 2 Indicator */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === 2
                        ? 'bg-[#faeed4] text-[#1c241e] ring-4 ring-[#faeed4]/20 shadow-lg scale-105'
                        : 'bg-[#1c241e] border border-white/20 text-stone-400'
                    }`}
                  >
                    2
                  </div>
                  <div className="text-center">
                    <span
                      className={`text-xs font-bold block ${
                        currentStep === 2 ? 'text-[#faeed4]' : 'text-stone-500'
                      }`}
                    >
                      Langkah 2
                    </span>
                    <span className="text-[11px] text-stone-500 font-light hidden sm:block">
                      Pembayaran HTM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {submitError && (
              <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span>{submitError}</span>
              </div>
            )}

            {/* ══════════════ LANGKAH 1: DATA DIRI & FOLLOW IG ══════════════ */}
            <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="space-y-8"
              >
                {/* 1. Event Summary Card */}
                <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  {event.bannerImage && (
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      className="w-full sm:w-32 h-24 object-cover rounded-xl border border-white/10 shrink-0"
                    />
                  )}
                  <div className="space-y-2 flex-grow">
                    <span className="text-[11px] font-semibold text-[#faeed4] uppercase tracking-wider">
                      Mendaftar Untuk Kegiatan:
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white font-heading leading-snug">
                      {event.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-300 font-light">
                      {event.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#faeed4]" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                      )}
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#faeed4]" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#faeed4]" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5 text-[#faeed4]" />
                        <span className="font-semibold text-[#faeed4]">{formatFee(event.fee)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Biodata Diri & Kontak */}
                <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-lg font-bold text-white font-heading">
                      1. Informasi Pribadi & Kontak
                    </h3>
                    <p className="text-xs text-stone-400 font-light mt-0.5">
                      Pastikan nomor WhatsApp dan email aktif untuk koordinasi grup relawan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Nama Lengkap <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Contoh: Muhammad Rizky Pratama"
                        className="w-full px-4 py-3 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] focus:ring-1 focus:ring-[#faeed4]"
                      />
                      {formErrors.fullName && (
                        <p className="text-[11px] text-red-400 mt-1">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Alamat Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full px-4 py-3 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] focus:ring-1 focus:ring-[#faeed4]"
                      />
                      {formErrors.email && (
                        <p className="text-[11px] text-red-400 mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Nomor WhatsApp <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full px-4 py-3 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] focus:ring-1 focus:ring-[#faeed4]"
                      />
                      {formErrors.whatsapp && (
                        <p className="text-[11px] text-red-400 mt-1">{formErrors.whatsapp}</p>
                      )}
                      <p className="text-[10px] text-stone-400 mt-1">Nomor yang terhubung dengan akun WhatsApp aktif.</p>
                    </div>

                    {/* Kota Domisili */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Kota Domisili / Tempat Tinggal <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Contoh: Jakarta Selatan, Bogor, dll."
                        className="w-full px-4 py-3 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] focus:ring-1 focus:ring-[#faeed4]"
                      />
                      {formErrors.city && (
                        <p className="text-[11px] text-red-400 mt-1">{formErrors.city}</p>
                      )}
                    </div>
                  </div>

                  {/* Alasan Mengikuti Volunteer */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Alasan Mengikuti Volunteer IYMPACK ?{' '}
                      {event.requireReason !== false ? (
                        <span className="text-red-400">*</span>
                      ) : (
                        <span className="text-stone-400 font-normal text-[11px]">(Opsional)</span>
                      )}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      placeholder={
                        event.requireReason !== false
                            ? 'Ceritakan mengapa Anda tertarik bergabung sebagai relawan pada kegiatan ini, pengalaman Anda, atau apa yang ingin Anda kontribusikan...'
                            : 'Ceritakan motivasi atau alasan Anda (opsional)...'
                      }
                      className="w-full px-4 py-3 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] focus:ring-1 focus:ring-[#faeed4] leading-relaxed resize-none"
                    />
                    {formErrors.reason && (
                      <p className="text-[11px] text-red-400 mt-1">{formErrors.reason}</p>
                    )}
                  </div>
                </div>

                {/* Bukti Follow Instagram */}
                {event.requireFollowProof !== false && (
                  <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                    <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white font-heading">
                          Bukti Follow Instagram
                        </h3>
                        <p className="text-xs text-stone-400 font-light mt-0.5">
                          Wajib follow akun Instagram resmi{' '}
                          <strong className="text-[#faeed4]">
                            @{((event.instagramAccount || 'iympack').replace('@', ''))}
                          </strong>{' '}
                          untuk update informasi kegiatan.
                        </p>
                      </div>
                      <a
                        href={`https://instagram.com/${(event.instagramAccount || 'iympack').replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-[#faeed4] text-stone-200 hover:text-[#1c241e] text-xs font-semibold transition-all self-start shadow-sm group"
                      >
                        <InstagramIcon className="w-3.5 h-3.5 text-[#faeed4] group-hover:text-[#1c241e] transition-colors shrink-0" />
                        <span>Buka @{(event.instagramAccount || 'iympack').replace('@', '')}</span>
                      </a>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-2">
                        Unggah Tangkapan Layar (Screenshot) Bukti Follow Instagram <span className="text-red-400">*</span>
                      </label>

                      {formData.followProof ? (
                        <div className="relative inline-block border border-white/20 rounded-2xl overflow-hidden p-2 bg-[#1c241e]">
                          <img
                            src={formData.followProof}
                            alt="Bukti Follow Instagram"
                            className="w-full max-w-xs max-h-56 object-contain rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, followProof: '' }))}
                            className="absolute top-4 right-4 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                            title="Hapus Bukti Follow"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-white/20 hover:border-[#faeed4] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer bg-[#1c241e]/50 hover:bg-[#1c241e] transition-all">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-stone-300">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-[#faeed4]">Pilih file gambar screenshot</span>
                            <p className="text-[11px] text-stone-400 mt-0.5">Format JPG, PNG, atau WEBP (Maks 5MB)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('followProof', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                      {formErrors.followProof && (
                        <p className="text-[11px] text-red-400 mt-1.5">{formErrors.followProof}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Bukti Follow TikTok */}
                {event.requireTiktokProof && (
                  <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                    <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white font-heading">
                          Bukti Follow TikTok
                        </h3>
                        <p className="text-xs text-stone-400 font-light mt-0.5">
                          Wajib follow akun TikTok resmi{' '}
                          <strong className="text-[#faeed4]">
                            @{((event.tiktokAccount || 'iympack.id').replace('@', ''))}
                          </strong>{' '}
                          untuk update video dan konten kegiatan.
                        </p>
                      </div>
                      <a
                        href={`https://tiktok.com/@${(event.tiktokAccount || 'iympack.id').replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-[#faeed4] text-stone-200 hover:text-[#1c241e] text-xs font-semibold transition-all self-start shadow-sm group"
                      >
                        <TikTokIcon className="w-3.5 h-3.5 text-[#faeed4] group-hover:text-[#1c241e] transition-colors shrink-0" />
                        <span>Buka @{(event.tiktokAccount || 'iympack.id').replace('@', '')}</span>
                      </a>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-2">
                        Unggah Tangkapan Layar (Screenshot) Bukti Follow TikTok <span className="text-red-400">*</span>
                      </label>

                      {formData.tiktokProof ? (
                        <div className="relative inline-block border border-white/20 rounded-2xl overflow-hidden p-2 bg-[#1c241e]">
                          <img
                            src={formData.tiktokProof}
                            alt="Bukti Follow TikTok"
                            className="w-full max-w-xs max-h-56 object-contain rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, tiktokProof: '' }))}
                            className="absolute top-4 right-4 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                            title="Hapus Bukti Follow TikTok"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-white/20 hover:border-[#faeed4] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer bg-[#1c241e]/50 hover:bg-[#1c241e] transition-all">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-stone-300">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-[#faeed4]">Pilih file screenshot TikTok</span>
                            <p className="text-[11px] text-stone-400 mt-0.5">Format JPG, PNG, atau WEBP (Maks 5MB)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('tiktokProof', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                      {formErrors.tiktokProof && (
                        <p className="text-[11px] text-red-400 mt-1.5">{formErrors.tiktokProof}</p>
                      )}
                    </div>
                  </div>
                )}


                {/* ─── Kuesioner / Formulir Khusus Cabang ────── */}
                {Array.isArray(event.customFields) && event.customFields.length > 0 && (
                  <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                    <div className="border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#faeed4]/20 text-[#faeed4] border border-[#faeed4]/30">
                          Formulir Khusus Cabang
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white font-heading mt-1">
                        Informasi Tambahan dari Penyelenggara
                      </h3>
                      <p className="text-xs text-stone-400 font-light mt-0.5">
                        Harap lengkapi pertanyaan khusus berikut yang disiapkan oleh panitia {organizerName}.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {event.customFields.map((field, idx) => {
                        // Section heading break
                        if (field.type === 'heading') {
                          return (
                            <div key={field.id || idx} className="pt-4 pb-2 border-b border-white/15">
                              <h4 className="text-sm sm:text-base font-bold text-[#faeed4] font-heading">
                                {field.label}
                              </h4>
                              {field.helperText && (
                                <p className="text-xs text-stone-400 mt-1">{field.helperText}</p>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div key={field.id || idx} className="space-y-1.5">
                            <label className="block text-xs font-semibold text-stone-200">
                              {field.label}{' '}
                              {field.required ? (
                                <span className="text-red-400">*</span>
                              ) : (
                                <span className="text-stone-400 font-normal text-[11px]">(Opsional)</span>
                              )}
                            </label>

                            {field.helperText && (
                              <p className="text-[11px] text-stone-400 font-light">{field.helperText}</p>
                            )}

                            {/* Render sesuai tipe */}
                            {field.type === 'text' && (
                              <input
                                type="text"
                                value={customAnswers[field.id] || ''}
                                onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                                placeholder={field.placeholder || `Ketikkan ${field.label.toLowerCase()}...`}
                                className="w-full px-4 py-3 border border-white/15 rounded-xl text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] focus:ring-1 focus:ring-[#faeed4]"
                              />
                            )}

                            {field.type === 'number' && (
                              <input
                                type="number"
                                value={customAnswers[field.id] || ''}
                                onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                                placeholder={field.placeholder || `Ketikkan angka...`}
                                className="w-full px-4 py-3 border border-white/15 rounded-xl text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] focus:ring-1 focus:ring-[#faeed4]"
                              />
                            )}

                            {field.type === 'date' && (
                              <input
                                type="date"
                                value={customAnswers[field.id] || ''}
                                onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                                className="w-full px-4 py-3 border border-white/15 rounded-xl text-xs bg-[#1c241e] text-white focus:outline-none focus:border-[#faeed4] focus:ring-1 focus:ring-[#faeed4]"
                              />
                            )}

                            {field.type === 'textarea' && (
                              <textarea
                                rows={3}
                                value={customAnswers[field.id] || ''}
                                onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                                placeholder={field.placeholder || `Tuliskan ${field.label.toLowerCase()}...`}
                                className="w-full px-4 py-3 border border-white/15 rounded-xl text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] focus:ring-1 focus:ring-[#faeed4] resize-none leading-relaxed"
                              />
                            )}

                            {field.type === 'select' && (
                              <select
                                value={customAnswers[field.id] || ''}
                                onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                                className="w-full px-4 py-3 border border-white/15 rounded-xl text-xs bg-[#1c241e] text-white focus:outline-none focus:border-[#faeed4] focus:ring-1 focus:ring-[#faeed4]"
                              >
                                <option value="">-- Pilih {field.label} --</option>
                                {(field.options || []).map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            )}

                            {field.type === 'radio' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {(field.options || []).map((opt) => (
                                  <label
                                    key={opt}
                                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                      customAnswers[field.id] === opt
                                        ? 'bg-[#faeed4]/15 border-[#faeed4] text-[#faeed4] font-semibold'
                                        : 'bg-[#1c241e] border-white/15 text-stone-300 hover:bg-white/5'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`custom_${field.id}`}
                                      value={opt}
                                      checked={customAnswers[field.id] === opt}
                                      onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                                      className="text-[#faeed4] focus:ring-0"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {field.type === 'checkbox' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {(field.options || []).map((opt) => {
                                  const selectedArr = Array.isArray(customAnswers[field.id]) ? customAnswers[field.id] : [];
                                  const isChecked = selectedArr.includes(opt);
                                  return (
                                    <label
                                      key={opt}
                                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                        isChecked
                                          ? 'bg-[#faeed4]/15 border-[#faeed4] text-[#faeed4] font-semibold'
                                          : 'bg-[#1c241e] border-white/15 text-stone-300 hover:bg-white/5'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        value={opt}
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            handleCustomAnswerChange(field.id, [...selectedArr, opt]);
                                          } else {
                                            handleCustomAnswerChange(
                                              field.id,
                                              selectedArr.filter((item) => item !== opt)
                                            );
                                          }
                                        }}
                                        className="rounded text-[#faeed4] focus:ring-0"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                          {field.type === 'file' && (
                            <div>
                              {customAnswers[field.id] ? (
                                <div className="flex items-center justify-between p-3 border border-white/20 rounded-xl bg-[#1c241e]">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    {customAnswers[field.id].startsWith('data:image/') ? (
                                      <img
                                        src={customAnswers[field.id]}
                                        alt={field.label}
                                        className="w-12 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[#faeed4] shrink-0">
                                        <FileCheck className="w-5 h-5" />
                                      </div>
                                    )}
                                    <div className="truncate">
                                      <span className="text-xs font-semibold text-white block truncate">
                                        Berkas telah terunggah
                                      </span>
                                      <span className="text-[10px] text-stone-400">Siap dikirim bersama formulir</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCustomAnswerChange(field.id, '')}
                                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus berkas"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <label className="border-2 border-dashed border-white/20 hover:border-[#faeed4] rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer bg-[#1c241e]/50 hover:bg-[#1c241e] transition-all">
                                  <Upload className="w-4 h-4 text-stone-400" />
                                  <span className="text-xs text-[#faeed4] font-medium">
                                    Pilih berkas untuk {field.label}
                                  </span>
                                  <span className="text-[10px] text-stone-500">Maksimal 5MB (Gambar / Dokumen)</span>
                                  <input
                                    type="file"
                                    onChange={(e) => handleCustomFileChange(field.id, e)}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                          )}

                          {formErrors['custom_' + field.id] && (
                            <p className="text-[11px] text-red-400 mt-1">{formErrors['custom_' + field.id]}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  </div>
                )}

                {/* Status Peringatan: Kuota Habis / Penuh */}
                {isQuotaFullError && (
                  <div className="p-5 rounded-2xl bg-red-950/80 border border-red-500/70 text-red-200 text-xs space-y-3 animate-shake">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="block text-white font-bold text-sm">
                          Mohon Maaf, Kuota Baru Saja Penuh!
                        </strong>
                        <p className="leading-relaxed text-red-300">
                          Seluruh kuota relawan untuk kegiatan ini baru saja habis terisi oleh pendaftar lain. Anda tidak perlu melanjutkan ke tahap transfer pembayaran.
                        </p>
                      </div>
                    </div>
                    <div className="pt-1 flex flex-wrap items-center gap-3">
                      <a
                        href={contactWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        <span>Hubungi Panitia via WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Link
                        to="/event"
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors"
                      >
                        Lihat Agenda Lainnya
                      </Link>
                    </div>
                  </div>
                )}

                {/* Tombol Lanjut ke Langkah 2 */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    disabled={isValidatingQuota}
                    className="w-full sm:w-auto px-8 py-4 bg-[#faeed4] hover:bg-white text-[#1c241e] font-bold text-sm sm:text-base rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tracking-wide"
                  >
                    {isValidatingQuota ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#1c241e]" />
                        <span>Memvalidasi Kuota Real-time...</span>
                      </>
                    ) : (
                      <>
                        <span>Validasi Kuota & Lanjut ke Pembayaran</span>
                        <ArrowRight className="w-4 h-4 text-[#1c241e]" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ══════════════ LANGKAH 2: PEMBAYARAN HTM & KONFIRMASI ══════════════ */
              <motion.form
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* ─── Kunci Slot Sementara (15 Menit) & Status Kuota Banner ─── */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border text-xs shadow-xl transition-all ${
                    isHoldExpired
                      ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
                      : 'bg-gradient-to-r from-emerald-950/70 via-[#202b23] to-emerald-950/70 border-emerald-500/50 text-emerald-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                          isHoldExpired
                            ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
                        }`}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-white text-sm sm:text-base font-bold">
                            {isHoldExpired
                              ? 'Waktu Penguncian Slot Berakhir'
                              : '1 Slot Berhasil Dikunci Khusus Untuk Anda!'}
                          </strong>
                          {!isHoldExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                              Uang Transfer Aman
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                              Kedaluwarsa
                            </span>
                          )}
                        </div>
                        <p className="text-stone-300 text-[11px] sm:text-xs leading-relaxed max-w-xl">
                          {isHoldExpired
                            ? 'Batas waktu 15 menit penguncian slot Anda telah habis. Slot telah dilepaskan kembali ke publik. Silakan kunci ulang slot Anda sebelum melakukan transfer agar pembayaran tetap aman.'
                            : 'Slot pendaftaran Anda dikunci di sistem server selama timer berjalan dan tidak dapat direbut oleh peserta lain. Silakan selesaikan pembayaran HTM dan unggah bukti transfer dengan tenang.'}
                        </p>
                      </div>
                    </div>

                    {/* Timer Box / Refresh Hold Button */}
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {!isHoldExpired ? (
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/50 border border-[#dfb15b]/40 text-[#faeed4] font-mono font-bold text-xs shadow-inner">
                          <Clock className="w-4 h-4 text-[#dfb15b] animate-pulse" />
                          <div className="flex flex-col">
                            <span className="text-[9px] text-stone-400 uppercase font-sans tracking-wider leading-none">
                              Sisa Waktu Kunci
                            </span>
                            <span className="tracking-wider text-sm text-[#dfb15b] leading-tight">
                              {formatTimer(holdSecondsLeft)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleProceedToStep2}
                          disabled={isValidatingQuota}
                          className="px-4 py-2.5 bg-[#faeed4] hover:bg-white text-[#1c241e] font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${isValidatingQuota ? 'animate-spin' : ''}`}
                          />
                          <span>Kunci Ulang Slot</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Informasi Pembayaran & HTM (Styled to match reference) */}
                <div className="bg-[#202b23] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
                      Informasi Pembayaran &amp; HTM
                    </h3>
                    {/* Aksen garis emas horizontal elegan sesuai screenshot referensi */}
                    <div className="h-[2px] w-full bg-[#dfb15b] mt-2.5 mb-5 rounded-full" />
                  </div>

                  {isFreeEvent ? (
                    /* Free Event Notice */
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <strong className="block text-white font-semibold">Kegiatan Ini Bebas Biaya (Gratis)</strong>
                        <span>Anda tidak perlu melakukan transfer biaya. Bukti transfer tidak diwajibkan untuk agenda ini.</span>
                      </div>
                    </div>
                  ) : (
                    /* Paid Event Bank Details */
                    <div className="space-y-5">
                      {/* Biaya Pendaftaran (HTM): */}
                      <div>
                        <span className="text-xs text-stone-300 font-medium block">
                          Biaya Pendaftaran (HTM):
                        </span>
                        <p className="text-2xl sm:text-3xl font-bold text-[#dfb15b] font-heading mt-1">
                          {formatFee(event.fee)}
                        </p>
                      </div>

                      {/* Dotted divider line */}
                      <div className="border-b border-dotted border-white/20" />

                      {/* Transfer ke Rekening Tujuan: */}
                      <div>
                        <span className="text-xs text-stone-300 font-medium block mb-3">
                          Transfer ke Rekening Tujuan:
                        </span>

                        {/* Kotak Rekening Tujuan yang rapi dan elegan */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#171f1a] border border-white/15 space-y-1.5 relative group">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold text-[#dfb15b] uppercase tracking-wider">
                              {event.bankName || 'DANA'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText((event.accountNumber || '081398341485').replace(/\s+/g, ''), 'account')}
                              className="px-2.5 py-1 bg-white/10 hover:bg-[#dfb15b] text-stone-200 hover:text-[#1c241e] text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Salin No. Rekening"
                            >
                              {copiedBank === 'account' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Salin</span>
                                </>
                              )}
                            </button>
                          </div>

                          <p className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wider">
                            {event.accountNumber || '081398341485'}
                          </p>

                          <p className="text-xs text-stone-300 uppercase tracking-wide">
                            {event.accountHolder ? `a.n. ${event.accountHolder.replace(/^a\.n\.\s*/i, '')}` : 'a.n. FEBRINA AULIA SUBAGIO'}
                          </p>
                        </div>

                        <p className="text-[11px] text-stone-400 italic mt-2.5">
                          *Harap simpan bukti transfer untuk diunggah pada kolom Bukti Pembayaran.
                        </p>
                      </div>

                      {/* ─── Voucher / Kupon Diskon (Compact & Mobile-Friendly) ─── */}
                      <div className="p-3.5 rounded-xl bg-[#171f1a] border border-white/10 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-3.5 h-3.5 text-[#dfb15b]" />
                          <span className="text-xs font-semibold text-stone-300">Punya Kode Voucher?</span>
                        </div>

                        {voucherResult?.valid && voucherDiscount ? (
                          /* Voucher Applied Successfully */
                          <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-300">Voucher Diterapkan!</span>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveVoucher}
                                className="text-[11px] text-red-400 hover:text-red-300 font-semibold transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <div>
                                <code className="text-xs font-mono font-bold text-[#faeed4] bg-[#faeed4]/10 px-2 py-0.5 rounded">
                                  {voucherResult.voucher.code}
                                </code>
                                <span className="text-[11px] text-emerald-300 ml-2">
                                  Diskon {formatRupiah(voucherDiscount.discountAmount)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20">
                              <span className="text-[11px] text-stone-400">Total Bayar:</span>
                              <span className="text-sm font-bold text-[#dfb15b]">
                                {voucherDiscount.finalFee === 0 ? 'GRATIS' : formatRupiah(voucherDiscount.finalFee)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* Voucher Input */
                          <div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={voucherCode}
                                onChange={(e) => {
                                  setVoucherCode(e.target.value.toUpperCase());
                                  if (voucherResult) setVoucherResult(null);
                                }}
                                placeholder="Kode voucher (opsional)"
                                className="flex-1 min-w-0 px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white font-mono uppercase placeholder:text-stone-500 focus:outline-none focus:border-[#dfb15b] focus:ring-1 focus:ring-[#dfb15b]/30"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleApplyVoucher();
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleApplyVoucher}
                                disabled={!voucherCode.trim() || isValidatingVoucher}
                                className="px-4 py-2 bg-[#dfb15b] hover:bg-[#faeed4] text-[#1c241e] text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                              >
                                {isValidatingVoucher ? 'Cek...' : 'Terapkan'}
                              </button>
                            </div>
                            {voucherResult && !voucherResult.valid && (
                              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {voucherResult.message}
                              </p>
                            )}
                            <p className="text-[10px] text-stone-500 mt-1">Kosongkan jika tidak memiliki kode voucher.</p>
                          </div>
                        )}
                      </div>

                      {/* ─── Upload Bukti Pembayaran (Matching Screenshot 2) ─── */}
                      <div className="pt-1">
                        <label className="block text-xs font-semibold text-stone-200 mb-2">
                          Upload Bukti Pembayaran{' '}
                          {isEffectivelyFree ? (
                            <span className="text-emerald-400 font-normal text-[11px]">(Opsional - Terpotong Voucher 100%)</span>
                          ) : (
                            <span className="text-red-400">*</span>
                          )}
                        </label>

                        {formData.paymentProof ? (
                          <div className="relative inline-block border border-white/20 rounded-2xl overflow-hidden p-2 bg-[#171f1a]">
                            <img
                              src={formData.paymentProof}
                              alt="Bukti Transfer Pembayaran"
                              className="w-full max-w-xs max-h-56 object-contain rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, paymentProof: '' }))}
                              className="absolute top-4 right-4 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                              title="Hapus Bukti Transfer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-emerald-900/60 hover:border-[#dfb15b] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer bg-[#171f1a]/70 hover:bg-[#171f1a] transition-all group">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-stone-400 group-hover:text-[#dfb15b] group-hover:scale-110 transition-all">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-semibold text-stone-200 group-hover:text-[#dfb15b] transition-colors">
                                Drag &amp; Drop Files, Choose Files to Upload
                              </span>
                              <p className="text-[11px] text-stone-400 mt-1">
                                Format JPG, PNG, atau WEBP (Maks 5MB)
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange('paymentProof', e)}
                              className="hidden"
                            />
                          </label>
                        )}
                        {formErrors.paymentProof && (
                          <p className="text-[11px] text-red-400 mt-1.5">{formErrors.paymentProof}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Komitmen & Persetujuan */}
                <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 space-y-4 shadow-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreement}
                      onChange={(e) => handleInputChange('agreement', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-white/30 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-[#1c241e] cursor-pointer"
                    />
                    <span className="text-xs text-stone-300 leading-relaxed font-light">
                      Saya menyatakan bahwa informasi yang saya cantumkan adalah benar dan saya bersedia mengikuti arahan serta tata tertib relawan yang ditetapkan oleh panitia resmi IYMPACK.
                    </span>
                  </label>
                  {formErrors.agreement && (
                    <p className="text-[11px] text-red-400">{formErrors.agreement}</p>
                  )}

                  {/* Tombol Navigasi: Kembali & Kirim */}
                  <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleBackToStep1}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3.5 border border-white/20 hover:bg-white/10 text-stone-200 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali ke Langkah 1</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-4 bg-[#faeed4] hover:bg-white text-[#1c241e] font-bold text-sm sm:text-base rounded-xl transition-all shadow-xl disabled:opacity-50 cursor-pointer tracking-wide text-center"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-[#1c241e]/30 border-t-[#1c241e] rounded-full inline-block"
                          />
                          <span>Memproses Pendaftaran...</span>
                        </span>
                      ) : (
                        'Kirim Pendaftaran & Kunci Slot Relawan'
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-400 text-center font-light pt-1">
                    Data pribadi Anda dijaga kerahasiaannya dan hanya digunakan untuk keperluan koordinasi resmi kegiatan IYMPACK.
                  </p>
                </div>
              </motion.form>
            )}
            </AnimatePresence>

          </div>
        )}
        </AnimatePresence>

      </div>
    </div>
  );
}
