/**
 * IYMPACK — Events Directory Page (Minimalist Edition: No Icons, No Tags)
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../hooks/useData.js';
import { getEvents } from '../services/events.service.js';
import { formatFee, getEventDateTimestamp } from '../lib/utils.js';

export default function EventsPage() {
  const dataContext = useData();
  const { events } = dataContext || {};

  const [statusFilter, setStatusFilter] = useState('published');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const allEvents = useMemo(() => {
    const source = Array.isArray(events) ? events : [];
    let list = [];

    if (source && source.length > 0) {
      list = source
        .filter((e) => e.status !== 'draft')
        .map((e) => {
          const d = e.startDate ? new Date(e.startDate) : null;
          const validDate = d && !isNaN(d.getTime());
          return {
            ...e,
            day: e.day || (validDate ? String(d.getDate()).padStart(2, '0') : '26'),
            month: e.month || (validDate ? d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase() : 'SEP'),
            fee: e.fee || 'BEBAS BIAYA',
            quota: e.quota || `${e.maxQuota || 50} Relawan` };
        });
    }

    // Urutkan kegiatan: tanggal paling dekat di paling atas (closest date first)
    return list.sort((a, b) => getEventDateTimestamp(a) - getEventDateTimestamp(b));
  }, [events]);

  const counts = useMemo(() => {
    const pub = allEvents.filter((e) => e.status === 'published').length;
    const cls = allEvents.filter((e) => e.status === 'closed').length;
    return { published: pub, closed: cls };
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      const matchStatus = evt.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || evt.category === categoryFilter;
      const matchSearch =
        !search ||
        evt.title.toLowerCase().includes(search.toLowerCase()) ||
        (evt.location && evt.location.toLowerCase().includes(search.toLowerCase())) ||
        (evt.description && evt.description.toLowerCase().includes(search.toLowerCase()));

      return matchStatus && matchCategory && matchSearch;
    });
  }, [allEvents, statusFilter, categoryFilter, search]);

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 pb-28 relative overflow-hidden min-h-screen">
      {/* Topo Texture & Ambient glow decoration */}
      <div className="absolute inset-0 bg-topo-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Header (with Hero Background Photo & Cinematic Overlays) ─── */}
      <section className="relative text-white pt-28 sm:pt-32 pb-16 sm:pb-20 border-b border-white/10 overflow-hidden bg-[#1c241e]">
        {/* Background Image from Hero Section */}
        <img
          src="/hero-hands.webp"
          alt="Agenda Kerelawanan IYMPACK"
          loading="eager"
          decoding="async"
          onError={(e) => {
            e.target.src = '/hero-hands.png';
          }}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.65] contrast-105"
        />

        {/* Cinematic Gradient & Ambient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c241e] via-[#1c241e]/75 to-[#1c241e]/50 pointer-events-none" />
        <div className="absolute inset-0 bg-dots-pattern opacity-20 pointer-events-none" />
        <div className="absolute -bottom-10 -left-20 w-80 h-80 bg-[#819b8e]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#faeed4] font-heading drop-shadow-sm">
            Agenda & Kegiatan
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            Program Kerelawanan IYMPACK
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-stone-200 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            Temukan ragam kegiatan aksi sosial, kelas mengajar, dan kemanusiaan yang membuka kesempatan belajar dan berdampak bagi generasi muda.
          </p>
        </div>
      </section>

      {/* ─── Events Content Area (Matching Reference Photo Layout) ─── */}
      <section className="py-10 sm:py-14 relative">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-8">
          
          {/* Section Header & Status Filter Tabs */}
          <div className="pb-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-white">
                {statusFilter === 'published'
                  ? 'Kegiatan Mendatang'
                  : 'Riwayat Kegiatan (Telah Selesai)'}
              </h2>
              <p className="text-xs text-stone-400 font-light mt-0.5">
                Menampilkan {filteredEvents.length} kegiatan
              </p>
            </div>

            {/* Status Filter Tabs (Hanya Sedang Buka & Selesai) */}
            <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-full shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter('published')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'published'
                    ? 'bg-[#faeed4] text-[#1c241e] shadow-sm font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Sedang Dibuka ({counts.published})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('closed')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'closed'
                    ? 'bg-red-500/25 text-red-200 border border-red-500/40 shadow-sm font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Selesai ({counts.closed})
              </button>
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="divide-y divide-white/10"
              >
                {filteredEvents.map((evt) => {
                  const isClosed = evt.status === 'closed';

                  return (
                    <div
                      key={evt.id}
                      className="py-10 sm:py-12 group transition-colors"
                    >
                      <div className="flex flex-col md:flex-row items-start gap-6 sm:gap-8 lg:gap-12">
                        
                        {/* 1. Date Column (Left) */}
                        <div className="w-20 sm:w-24 shrink-0 flex flex-col items-start pt-1 select-none">
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#819b8e] font-heading">
                            {evt.month || 'SEP'}
                          </span>
                          <div className="w-6 h-[2px] bg-white/20 my-2" />
                          <span className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-white tracking-tight leading-none group-hover:text-[#faeed4] transition-colors">
                            {evt.day || '26'}
                          </span>
                        </div>

                        {/* 2. Image Column (Middle) */}
                        <div className="w-full md:w-[320px] lg:w-[390px] shrink-0">
                          <Link
                            to={`/event/${evt.slug || evt.id}`}
                            className="block rounded-2xl sm:rounded-3xl overflow-hidden group/img shadow-xl border border-white/10 hover:border-white/30 transition-all"
                          >
                            <div className="aspect-[16/10] overflow-hidden bg-black/40 relative">
                              <img
                                src={evt.bannerImage || evt.image || '/hero-hands.webp'}
                                alt={evt.title}
                                className="w-full h-full object-cover filter brightness-95"
                                onError={(e) => {
                                  e.target.src = '/hero-hands.webp';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                            </div>
                          </Link>
                        </div>

                        {/* 3. Details & Action Column (Right) */}
                        <div className="flex-1 flex flex-col justify-between self-stretch space-y-4">
                          <div className="space-y-2.5">
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-white hover:text-[#faeed4] transition-colors leading-snug">
                              <Link to={`/event/${evt.slug || evt.id}`}>
                                {evt.title}
                              </Link>
                            </h3>

                            {/* Meta: Location, Time & Fee */}
                            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs sm:text-sm text-stone-400 font-normal">
                              {evt.location && (
                                <span>{evt.location}</span>
                              )}
                              {evt.location && evt.time && <span>&bull;</span>}
                              {evt.time && (
                                <span>{evt.time}</span>
                              )}
                              {evt.fee && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-[#faeed4] font-semibold">{formatFee(evt.fee)}</span>
                                </>
                              )}
                              {evt.quota && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-stone-300">{evt.quota}</span>
                                </>
                              )}
                            </div>

                            {/* Description Excerpt */}
                            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed line-clamp-3 pt-1">
                              {evt.description
                                ? evt.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
                                : 'Program pengabdian sosial dan kerelawanan bersama generasi muda untuk Indonesia yang lebih cerah.'}
                            </p>
                          </div>

                          {/* Action Link (View Event Details ->) */}
                          <div className="pt-2">
                            <Link
                              to={`/event/${evt.slug || evt.id}`}
                              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#faeed4] hover:text-white group/link transition-colors cursor-pointer"
                            >
                              <span>Lihat Detail Kegiatan</span>
                              <span className="text-base leading-none transition-transform duration-300 group-hover/link:translate-x-1">&rarr;</span>
                            </Link>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </motion.div>
          ) : (
            <div className="py-20 text-center border border-white/10 rounded-3xl p-8 max-w-md mx-auto bg-[#252f27] space-y-4 my-8">
              <p className="text-base font-bold text-white">
                {statusFilter === 'closed' ? 'Tidak Ada Riwayat Kegiatan' : 'Tidak Ada Kegiatan'}
              </p>
              <p className="text-xs text-stone-400 font-light">
                {search || categoryFilter !== 'all'
                  ? 'Tidak ada agenda yang cocok dengan kata kunci atau filter pencarian Anda.'
                  : statusFilter === 'closed'
                  ? 'Belum ada riwayat agenda kegiatan yang telah selesai.'
                  : 'Belum ada agenda kegiatan yang dibuka saat ini.'}
              </p>
              {(search || categoryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setSearch('');
                  }}
                  className="px-5 py-2.5 bg-[#faeed4] text-[#252f27] text-xs font-bold rounded-full hover:bg-white transition-all cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
