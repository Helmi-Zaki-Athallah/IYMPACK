/**
 * IYMPACK CMS — Full Page Event Detail for Admin
 *
 * Dedicated full-page interface replacing popup modals.
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../../hooks/useData.js';
import { formatDate } from '../../lib/utils.js';
import { sanitizeHtml, sanitizeUrl } from '../../lib/security.js';
import {
  ArrowLeft, Edit, ExternalLink
} from 'lucide-react';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  published: { label: 'Sedang Buka', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Selesai / Tutup', color: 'bg-red-100 text-red-700' } };

export default function EventDetailAdminPage() {
  const { id } = useParams();
  const _navigate = useNavigate();
  const { events, getApplicantsByEvent } = useData();

  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4 max-w-xl mx-auto my-12">
        <p className="text-gray-600 text-sm">Data kegiatan tidak ditemukan.</p>
        <Link
          to="/admin/kegiatan"
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kegiatan
        </Link>
      </div>
    );
  }

  const applicants = getApplicantsByEvent(event.id);
  const statusInfo = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* ─── Top Header ───────────────────────────────── */}
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 font-heading">
                {event.title}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {event.category || 'Umum'} • {event.location || 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/kegiatan/${event.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Lihat di Web
          </Link>
          <Link
            to={`/admin/kegiatan/edit/${event.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-semibold shadow-md shadow-forest/20 transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit Kegiatan Ini
          </Link>
        </div>
      </div>

      {/* ─── Hero Banner & Overview ───────────────────── */}
      {event.bannerImage && (
        <div className="rounded-2xl overflow-hidden border border-gray-200 h-64 bg-gray-100 shadow-sm">
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* ─── Details Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2 Cols) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100">
            Deskripsi Kegiatan
          </h2>
          {event.description && /<[a-z][\s\S]*>/i.test(event.description) ? (
            <div
              className="prose max-w-none text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
            />
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.description || 'Tidak ada deskripsi yang tersedia untuk kegiatan ini.'}
            </p>
          )}

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading mb-3">
              Pendaftar Relawan ({applicants.length})
            </h3>
            {applicants.length === 0 ? (
              <p className="text-xs text-gray-400">Belum ada relawan yang mendaftar pada kegiatan ini.</p>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                {applicants.slice(0, 5).map((app) => (
                  <div key={app.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <span className="font-semibold text-gray-800 block">{app.fullName}</span>
                      <span className="text-gray-400 text-[11px]">{app.city} • {app.whatsapp}</span>
                    </div>
                    <Link
                      to={`/admin/pendaftar/${app.id}`}
                      className="text-forest hover:underline font-semibold"
                    >
                      Buka Profil →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3.5 shadow-sm text-xs">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-heading pb-2 border-b border-gray-100">
              Ringkasan Info
            </h2>

            <div>
              <span className="text-gray-400 block">Lokasi</span>
              <span className="font-semibold text-gray-700 text-sm">{event.location || '-'}</span>
              {sanitizeUrl(event.mapsUrl) && (
                <a
                  href={sanitizeUrl(event.mapsUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest hover:underline text-[11px] font-semibold block mt-0.5"
                >
                  Buka di Google Maps ↗
                </a>
              )}
            </div>

            <div>
              <span className="text-gray-400 block">Jadwal / Waktu Display</span>
              <span className="font-semibold text-gray-700">{event.time || '-'}</span>
            </div>

            <div>
              <span className="text-gray-400 block">Tim / Penyelenggara</span>
              <span className="font-semibold text-gray-700">{event.speaker || '-'}</span>
            </div>

            <div>
              <span className="text-gray-400 block">HTM / Biaya</span>
              <span className="font-semibold text-forest font-bold">{event.fee || 'BEBAS BIAYA'}</span>
            </div>

            <div>
              <span className="text-gray-400 block">Kuota Pendaftar</span>
              <span className="font-semibold text-gray-700">
                {applicants.length} / {event.maxQuota || '∞'} Relawan
              </span>
            </div>

            <div>
              <span className="text-gray-400 block">Deadline Pendaftaran</span>
              <span className="font-semibold text-gray-700">
                {event.registrationDeadline ? formatDate(event.registrationDeadline) : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
