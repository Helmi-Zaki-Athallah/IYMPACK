/**
 * IYMPACK — Articles Directory Page (Minimalist Edition: No Icons, No Tags)
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../hooks/useData.js';
import { getPublishedArticles } from '../services/articles.service.js';
import { formatDate } from '../lib/utils.js';

export default function ArticlesPage() {
  const dataContext = useData();
  const { articles } = dataContext || {};

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const allArticles = useMemo(() => {
    const source = Array.isArray(articles) ? articles : [];
    if (source && source.length > 0) {
      return source.filter((a) => a.status === 'published' || !a.status);
    }
    return [];
  }, [articles]);

  const categories = useMemo(() => {
    const set = new Set(allArticles.map((a) => a.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [allArticles]);

  const filtered = useMemo(() => {
    return allArticles.filter((art) => {
      const matchCategory = categoryFilter === 'all' || art.category === categoryFilter;
      const matchSearch =
        !search ||
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        (art.excerpt && art.excerpt.toLowerCase().includes(search.toLowerCase())) ||
        (art.author && art.author.toLowerCase().includes(search.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [allArticles, categoryFilter, search]);

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 pb-24 relative overflow-hidden">
      {/* Topo Texture & Ambient glow decoration */}
      <div className="absolute inset-0 bg-topo-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Header ───────────────────────────────────── */}
      <section className="relative text-white pt-28 sm:pt-32 pb-16 sm:pb-20 border-b border-white/10 overflow-hidden bg-[#1c241e]">
        {/* Background Image from Hero Section */}
        <img
          src="/hero-hands.webp"
          alt="Berita & Artikel IYMPACK"
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#faeed4] font-heading drop-shadow-sm">
            Publikasi & Liputan
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            Berita & Artikel IYMPACK
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-200 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            Liputan aksi kerelawanan, refleksi pengabdian, dan gagasan pemuda dari berbagai daerah.
          </p>
        </div>
      </section>

      {/* ─── Search & Category Filter ─────────────────── */}
      <section className="py-6 border-b border-white/10 sticky top-16 z-30 bg-[#222d25]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Minimal Category Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto pb-1 text-sm font-medium">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`pb-2 transition-colors whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? 'text-[#faeed4] font-bold border-b-2 border-[#faeed4]'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul artikel..."
              className="px-3.5 py-2 border border-white/15 rounded-xl text-xs bg-[#252f27] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] w-full sm:w-64"
            />
          </div>
        </div>
      </section>

      {/* ─── Articles Grid ────────────────────────────── */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filtered.map((art) => (
                <motion.div
                  key={art.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card bg-[#252f27]/75 backdrop-blur-md rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between transition-all shadow-xl hover:shadow-2xl group"
                >
                  {/* Photo */}
                  <div className="h-52 overflow-hidden bg-black/40 relative">
                    {art.coverImage ? (
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="w-full h-full object-cover filter brightness-95"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/40 text-stone-500 text-xs">
                        IYMPACK Article
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium text-stone-400">
                        {art.category ? `${art.category} · ` : ''}{formatDate(art.createdAt)}
                      </p>

                      <h3 className="text-base sm:text-lg font-bold text-white font-heading leading-snug line-clamp-2 group-hover:text-[#faeed4] transition-colors">
                        <Link to={`/berita/${art.slug || art.id}`}>
                          {art.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed font-light">
                        {art.excerpt || art.bodyContent}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-stone-400 font-light">{art.author || 'Admin'}</span>
                      <Link
                        to={`/berita/${art.slug || art.id}`}
                        className="font-bold text-[#faeed4] hover:text-white hover:underline transition-colors"
                      >
                        Baca Selengkapnya &rarr;
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-white/10 rounded-3xl p-8 max-w-md mx-auto bg-[#252f27] space-y-4">
              <p className="text-base font-bold text-white">Tidak Ada Artikel</p>
              <p className="text-xs text-stone-400 font-light">
                {search || categoryFilter !== 'all'
                  ? 'Tidak ada artikel yang cocok dengan filter atau kata kunci pencarian Anda.'
                  : 'Belum ada artikel yang dipublikasikan saat ini.'}
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
