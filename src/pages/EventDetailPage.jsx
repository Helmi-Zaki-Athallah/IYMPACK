/**
 * IYMPACK — Event Detail Page
 * Features:
 * - Breadcrumb navigation
 * - Desktop Layout:
 *   - Left column: Poster, Action buttons (Daftar & Kontak), Quota, and Google Maps below it
 *   - Right column: EXCLUSIVELY Description
 * - Mobile Layout:
 *   - Poster -> Description -> Action buttons (Daftar & Kontak Tim di bawah deskripsi) -> Quota -> Google Maps
 * - Rich text / formatted HTML description support
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen.jsx';
import {
  Home,
  ChevronRight,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Share2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { getEventBySlug, getEvents } from '../services/events.service.js';
import { useData } from '../hooks/useData.js';
import { eventsData } from '../data/iympackData.js';
import { formatDate, formatFee, getEventDateTimestamp, linkifyToHtml } from '../lib/utils.js';
import { sanitizeHtml, sanitizeUrl } from '../lib/security.js';
import { parseClientGoogleMapsUrl } from '../lib/maps.js';

export default function EventDetailPage() {
  const { slug } = useParams();
  const { events } = useData() || {};
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    const all = (events && events.length > 0) ? events : getEvents();
    const match = all.find((e) => e.slug === slug || e.id === slug) || getEventBySlug(slug);
    if (match) {
      setEvent(match);

      // Hanya tampilkan kegiatan terkait yang status pendaftarannya SEDANG BUKA
      const now = new Date();
      const openEvents = all.filter((e) => {
        if (!e || e.id === match.id) return false;

        // 1. Status harus published / buka (bukan closed atau draft)
        if (e.status === 'closed' || e.status === 'draft') return false;
        if (e.status && e.status !== 'published') return false;

        // 2. Kuota belum penuh
        if (e.maxQuota > 0 && Number(e.currentApplicants || 0) >= Number(e.maxQuota)) {
          return false;
        }

        // 3. Batas akhir pendaftaran belum terlewati
        if (e.registrationDeadline) {
          const dl = new Date(e.registrationDeadline);
          if (!isNaN(dl.getTime())) {
            dl.setHours(23, 59, 59, 999);
            if (dl < now) return false;
          }
        }

        return true;
      });

      // Urutkan berdasarkan kesamaan kategori/cabang, lalu tanggal terdekat
      const sorted = openEvents.sort((a, b) => {
        const aCat = a.category && match.category && a.category === match.category ? 1 : 0;
        const bCat = b.category && match.category && b.category === match.category ? 1 : 0;
        if (bCat !== aCat) return bCat - aCat;
        return getEventDateTimestamp(a) - getEventDateTimestamp(b);
      });

      setRelatedEvents(sorted.slice(0, 3));
    } else {
      setEvent(null);
      setRelatedEvents([]);
    }
    setLoading(false);
  }, [slug, events]);

  if (loading && !event) {
    return <LoadingScreen message="Memuat detail agenda kegiatan..." dark={true} />;
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

  const isQuotaFull = event.maxQuota > 0 && event.currentApplicants >= event.maxQuota;
  const quotaPercent = event.maxQuota > 0
    ? Math.min(100, Math.round((event.currentApplicants / event.maxQuota) * 100))
    : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description?.replace(/<[^>]+>/g, ' ').slice(0, 100),
        url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyAddress = () => {
    if (event.location) {
      navigator.clipboard.writeText(event.location);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
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

  // Menentukan tim cabang IYMPACK penyelenggara
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

  const organizerName = getTeamOrganizer(event);
  const cleanPhone = formatWaNumber(event.contactPhone) || '6281234567890'; // Menggunakan nomor panitia di kegiatan
  const contactWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo ${organizerName}, saya ingin bertanya mengenai agenda kegiatan "${event.title}".`
  )}`;
  const registerWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo ${organizerName}, saya ingin mendaftar sebagai relawan/peserta untuk kegiatan "${event.title}".`
  )}`;
  const safeRegistrationUrl = sanitizeUrl(event.registrationUrl);
  const _finalRegistrationUrl = safeRegistrationUrl || registerWaUrl;

  // Link navigasi Google Maps (Sanitized)
  const rawMapsLink = event.mapsUrl || (event.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}` : '');
  const mapsLink = sanitizeUrl(rawMapsLink);

  // Query embed Google Maps iframe yang 100% akurat
  const parsedMap = parseClientGoogleMapsUrl(event.mapsUrl);
  const mapEmbedQuery = event.location ? encodeURIComponent(event.location) : encodeURIComponent(event.title || 'Indonesia');
  const rawEmbedSrc = event.mapsEmbedUrl || parsedMap?.embedUrl || (event.mapsUrl && event.mapsUrl.includes('google.com/maps/embed') ? event.mapsUrl : `https://maps.google.com/maps?q=${mapEmbedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`);
  const embedSrc = sanitizeUrl(rawEmbedSrc);

  const isClosed = event.status === 'closed';

  // ─── Sub-Komponen Aksi (Tombol Daftar & Kontak) ────────────────
  const ActionCard = (
    <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      {isClosed ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-red-300 font-bold text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Kegiatan Telah Selesai</span>
          </div>
          <p className="text-xs text-stone-300 font-light leading-relaxed">
            Pendaftaran untuk agenda kegiatan ini telah ditutup dan tidak menerima relawan baru.
          </p>
        </div>
      ) : isQuotaFull ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Kuota Penuh</span>
          </div>
          <p className="text-xs text-stone-300 font-light leading-relaxed">
            Kuota pendaftaran relawan untuk kegiatan ini sudah terpenuhi.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {safeRegistrationUrl ? (
            <a
              href={safeRegistrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 bg-[#faeed4] hover:bg-white text-[#1c241e] font-bold text-sm sm:text-base rounded-xl transition-all shadow-md text-center block cursor-pointer tracking-wide"
            >
              Daftar Kegiatan Ini
            </a>
          ) : (
            <Link
              to={`/event/${event.slug || event.id}/daftar`}
              className="w-full py-3.5 px-6 bg-[#faeed4] hover:bg-white text-[#1c241e] font-bold text-sm sm:text-base rounded-xl transition-all shadow-md text-center block cursor-pointer tracking-wide"
            >
              Daftar Kegiatan Ini
            </Link>
          )}
        </div>
      )}

      {/* Tombol Kontak Tim */}
      <a
        href={contactWaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3.5 px-6 border border-white/20 hover:border-[#faeed4]/60 bg-white/5 hover:bg-white/10 text-stone-200 hover:text-[#faeed4] font-semibold text-xs sm:text-sm rounded-xl transition-all text-center block cursor-pointer tracking-wide"
      >
        Hubungi {organizerName}
      </a>
    </div>
  );

  // ─── Sub-Komponen Kuota Relawan ───────────────────────────────
  const QuotaCard = (
    <div className="bg-[#252f27] border border-white/10 rounded-2xl p-5 space-y-3 shadow-md">
      <div className="flex justify-between text-xs font-semibold text-stone-300">
        <span>{isClosed ? 'Status Pendaftaran' : 'Kapasitas Relawan Terisi'}</span>
        <span className={isClosed ? 'text-red-300 font-bold' : 'text-[#faeed4]'}>
          {isClosed
            ? 'Telah Ditutup / Selesai'
            : `${event.currentApplicants || 0} dari ${event.maxQuota || 'Bebas'} Relawan`}
        </span>
      </div>
      <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isClosed ? 'bg-red-400' : 'bg-[#faeed4]'
          }`}
          style={{ width: isClosed ? '100%' : `${quotaPercent}%` }}
        />
      </div>
      {isClosed ? (
        <p className="text-xs text-red-300 font-light">Agenda kegiatan ini telah selesai dilaksanakan.</p>
      ) : isQuotaFull ? (
        <p className="text-xs text-amber-300">Kuota untuk kegiatan ini telah terpenuhi.</p>
      ) : null}
    </div>
  );

  // ─── Sub-Komponen Peta Google Maps ────────────────────────────
  const MapCard = (
    <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
      {/* Header Box */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[#faeed4]">
          <MapPin className="w-4 h-4" />
          <span className="text-xs uppercase font-bold tracking-wider font-heading">Lokasi Kegiatan</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
          Peta & Petunjuk Arah
        </h3>
      </div>

      {/* Location Card */}
      <div className="bg-[#1c241e] border border-white/10 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span className="font-semibold uppercase tracking-wider">Titik Lokasi / Alamat</span>
          {event.location && (
            <button
              type="button"
              onClick={handleCopyAddress}
              className="text-[#faeed4] hover:text-white flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
              title="Salin Alamat"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Alamat</span>
                </>
              )}
            </button>
          )}
        </div>
        <p className="text-sm sm:text-base font-bold text-white leading-snug">
          {event.location || 'Lokasi akan diumumkan oleh panitia'}
        </p>
      </div>

      {/* Interactive Google Maps Embed */}
      <div className="w-full h-52 sm:h-56 rounded-2xl overflow-hidden border border-white/10 bg-[#1c241e] relative shadow-inner">
        <iframe
          title={`Peta Lokasi ${event.title}`}
          src={embedSrc}
          className="w-full h-full border-0 filter contrast-[1.05]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Direct Maps Action Button */}
      {mapsLink ? (
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 bg-white/10 hover:bg-[#faeed4] text-white hover:text-[#252f27] border border-white/15 hover:border-transparent font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Buka Navigasi di Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      ) : (
        <div className="text-center py-2 text-xs text-stone-400">
          Link Google Maps belum dimasukkan oleh admin.
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 pb-24 relative overflow-hidden">
      {/* Ambient glow decoration */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#819b8e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Header ───────────────────────────────────── */}
      <section className="relative text-white pt-28 sm:pt-32 pb-14 sm:pb-16 border-b border-white/10 overflow-hidden bg-[#1c241e]">
        <img
          src="/hero-hands.webp"
          alt={event.title}
          loading="eager"
          decoding="async"
          onError={(e) => {
            e.target.src = '/hero-hands.png';
          }}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.65] contrast-105"
        />

        {/* Cinematic Gradient & Ambient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c241e] via-[#1c241e]/80 to-[#1c241e]/50 pointer-events-none" />
        <div className="absolute inset-0 bg-dots-pattern opacity-20 pointer-events-none" />
        <div className="absolute -bottom-10 -left-20 w-80 h-80 bg-[#819b8e]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          
          {/* ─── Breadcrumb Navigation ─────────────────── */}
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
            <span className="text-[#faeed4] font-semibold truncate max-w-[200px] sm:max-w-md">
              {event.title}
            </span>
          </nav>

          {/* Judul Event */}
          <div className="space-y-2 pt-1">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading text-white leading-tight drop-shadow-md">
              {event.title}
            </h1>
          </div>

          {/* Tim Penyelenggara (Misal: Tim IYMPACK Jakarta) */}
          <p className="text-sm sm:text-base font-medium text-[#faeed4]">
            Diselenggarakan oleh: <span className="font-bold text-white">{organizerName}</span>
          </p>

          {/* Tanggal, Waktu, Lokasi, HTM */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm sm:text-base md:text-lg font-semibold text-white">
            {event.startDate && (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-normal text-stone-400 uppercase tracking-wider">Tanggal:</span>
                <span className="text-[#faeed4]">{formatDate(event.startDate)}</span>
              </div>
            )}
            {event.time && (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-normal text-stone-400 uppercase tracking-wider">Waktu:</span>
                <span>{event.time}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-normal text-stone-400 uppercase tracking-wider">Lokasi:</span>
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-normal text-stone-400 uppercase tracking-wider">HTM:</span>
              <span className="text-[#faeed4] font-bold bg-[#faeed4]/10 border border-[#faeed4]/30 px-3 py-1 rounded-xl">
                {formatFee(event.fee)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content ─────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ─── LEFT COLUMN: Poster, Tombol & Map Di Bawah Poster (5 cols) ─── */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-6"
          >
            
            {/* Poster Kegiatan (Ukuran Asli Sesuai Yang Di-upload Admin, Tanpa Pemotongan) */}
            {event.bannerImage && (
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 flex items-center justify-center p-1 sm:p-2">
                <img
                  src={event.bannerImage}
                  alt={event.title}
                  className="w-full h-auto object-contain rounded-xl sm:rounded-2xl"
                />
              </div>
            )}

            {/* Desktop Only: Action Buttons under Poster */}
            <div className="hidden lg:block">
              {ActionCard}
            </div>

            {/* Quota & Google Maps (Di Bawah Poster) */}
            {QuotaCard}
            {MapCard}

          </motion.div>

          {/* ─── RIGHT COLUMN: HANYA UNTUK DESKRIPSI (7 cols) ─── */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.08 }}
            className="lg:col-span-7 space-y-6"
          >
            
            {/* Description Card (Sebelah Poster di Desktop) */}
            <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 shadow-md sticky top-28">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
                  Deskripsi Kegiatan
                </h3>
                <button
                  type="button"
                  onClick={handleShare}
                  className="text-xs text-[#faeed4] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Tautan Tersalin!' : 'Bagikan'}</span>
                </button>
              </div>

              {/* Render HTML / Rich Text formatting */}
              {event.description && /<[a-z][\s\S]*>/i.test(event.description) ? (
                <div
                  className="prose prose-invert max-w-none text-stone-200 leading-relaxed font-light text-sm sm:text-base space-y-3 prose-headings:text-white prose-a:text-[#faeed4] prose-a:underline hover:prose-a:text-white"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
                />
              ) : (
                <div
                  className="prose prose-invert prose-sm sm:prose-base text-stone-300 leading-relaxed font-light whitespace-pre-line prose-a:text-[#faeed4] prose-a:underline hover:prose-a:text-white"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(linkifyToHtml(event.description || 'Informasi lengkap kegiatan akan diumumkan secara berkala oleh tim panitia.'))
                  }}
                />
              )}
            </div>

            {/* Mobile Only: HANYA Tombol Daftar & Kontak Tim di bawah Deskripsi */}
            <div className="block lg:hidden pt-1">
              {ActionCard}
            </div>

          </motion.div>

        </div>

        {/* ─── Kegiatan Terkait (Hanya yang Sedang Buka Pendaftaran) ───────────────────────── */}
        {relatedEvents.length > 0 && (
          <div className="pt-10 mt-4 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
                  Kegiatan Terkait
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Agenda kerelawanan yang saat ini sedang membuka pendaftaran
                </p>
              </div>
              <Link to="/event" className="text-xs text-stone-400 hover:text-[#faeed4] underline underline-offset-4 shrink-0">
                Semua Kegiatan &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedEvents.map((rel) => (
                <motion.div
                  key={rel.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Link
                    to={`/event/${rel.slug || rel.id}`}
                    className="bg-[#252f27] border border-white/10 rounded-2xl overflow-hidden hover:border-[#faeed4]/40 transition-all flex flex-col shadow-md hover:shadow-xl group h-full"
                  >
                    <div className="h-36 overflow-hidden bg-black/40 relative">
                      <img
                        src={rel.bannerImage || '/hero-hands.webp'}
                        alt={rel.title}
                        className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          if (e.target.src !== '/hero-hands.webp') {
                            e.target.src = '/hero-hands.webp';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                    <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] text-[#819b8e] font-bold uppercase tracking-wider">
                          {rel.category || rel.location || 'Kegiatan'}
                        </p>
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-[#faeed4] transition-colors leading-snug">
                          {rel.title}
                        </h4>
                        <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                          {rel.description ? String(rel.description).replace(/<[^>]*>/g, '').slice(0, 80) + '…' : 'Lihat detail kegiatan selengkapnya.'}
                        </p>
                      </div>
                      <div className="pt-2.5 flex items-center justify-between text-[11px] border-t border-white/5 text-[#faeed4] font-medium">
                        <span>{rel.fee || 'Bebas Biaya'}</span>
                        <span className="text-xs text-stone-400 group-hover:text-white transition-colors">Daftar &rarr;</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
