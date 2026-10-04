/**
 * IYMPACK — Article Detail Page (Minimalist Edition: No Icons, No Tags)
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { getArticleBySlug, getPublishedArticles } from '../services/articles.service.js';
import { formatDate, linkifyToHtml } from '../lib/utils.js';
import { sanitizeHtml } from '../lib/security.js';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setLoading(true);
    const found = getArticleBySlug(slug);
    if (found) {
      setArticle(found);
      const all = getPublishedArticles();
      setRelatedArticles(all.filter((a) => a.id !== found.id).slice(0, 3));
    }
    setLoading(false);
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return <LoadingScreen message="Memuat artikel IYMPACK..." dark={true} />;
  }

  if (!article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 font-heading">Berita Tidak Ditemukan</h2>
        <p className="text-xs text-gray-500 max-w-sm">
          Berita yang Anda tuju mungkin telah dihapus atau tautan sudah tidak berlaku.
        </p>
        <Link
          to="/berita"
          className="inline-block px-6 py-2.5 border border-black text-black rounded-full text-xs font-semibold"
        >
          Kembali ke Daftar Berita
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 pb-24 relative overflow-hidden">
      {/* Ambient glow decoration */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#819b8e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Header ───────────────────────────────────── */}
      <section className="relative text-white pt-28 sm:pt-32 pb-16 sm:pb-20 border-b border-white/10 overflow-hidden bg-[#1c241e]">
        {/* Background Image from Hero Section */}
        <img
          src="/hero-hands.webp"
          alt={article.title}
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

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-2">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link to="/" className="hover:text-[#faeed4] transition-colors">Beranda</Link>
              </li>
              <span className="text-stone-600">/</span>
              <li>
                <Link to="/berita" className="hover:text-[#faeed4] transition-colors">Berita</Link>
              </li>
              <span className="text-stone-600">/</span>
              <li className="text-[#faeed4] truncate max-w-[280px]" aria-current="page">
                {article.title}
              </li>
            </ol>
          </nav>

          <Link
            to="/berita"
            className="inline-block text-xs text-stone-400 hover:text-[#faeed4] transition-colors"
          >
            &larr; Kembali ke Semua Berita
          </Link>

          <p className="text-xs uppercase tracking-widest text-[#faeed4] font-bold font-heading drop-shadow-sm">
            {article.category || 'Inspirasi'} &bull; {formatDate(article.createdAt)}
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white leading-tight drop-shadow-md">
            {article.title}
          </h1>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-stone-300">
            <span>Ditulis oleh <strong className="text-white font-medium">{article.author || 'Admin IYMPACK'}</strong></span>
            <button
              onClick={handleShare}
              className="underline underline-offset-4 hover:text-[#faeed4] cursor-pointer text-[#faeed4]"
            >
              {copiedLink ? 'Tautan Disalin ✓' : 'Bagikan Artikel'}
            </button>
          </div>
        </div>
      </section>

      {/* ─── Article Body ─────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 relative">
        {/* Cover Image */}
        {article.coverImage && (
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-xl relative">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-auto max-h-[500px] object-cover filter brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Excerpt Highlight */}
        {article.excerpt && (
          <div className="p-6 border-l-2 border-[#819b8e] bg-[#252f27] text-sm sm:text-base italic text-stone-200 leading-relaxed rounded-r-2xl border border-white/10 shadow-md">
            "{article.excerpt}"
          </div>
        )}

        {/* Body Text */}
        {article.bodyContent && /<[a-z][\s\S]*>/i.test(article.bodyContent) ? (
          <div
            className="prose prose-invert max-w-none text-sm sm:text-base text-stone-200 leading-relaxed space-y-4 font-light prose-headings:text-white prose-a:text-[#faeed4] prose-a:underline hover:prose-a:text-white prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.bodyContent) }}
          />
        ) : (
          <div
            className="prose prose-invert max-w-none text-sm sm:text-base text-stone-300 leading-relaxed space-y-4 whitespace-pre-line font-light prose-a:text-[#faeed4] prose-a:underline hover:prose-a:text-white"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(linkifyToHtml(article.bodyContent || '')) }}
          />
        )}

        {/* Closing CTA */}
        <div className="mt-12 p-8 border border-white/10 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#252f27] shadow-lg">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-white font-heading">
              Ingin Bergabung dalam Aksi Kebaikan Ini?
            </h4>
            <p className="text-xs text-stone-400 font-light">
              Daftarkan diri Anda sebagai relawan dan jadilah bagian dari perubahan nyata.
            </p>
          </div>
          <Link
            to="/event"
            className="px-6 py-3 rounded-full bg-[#faeed4] hover:bg-white text-[#252f27] text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
          >
            Lihat Agenda Kegiatan &rarr;
          </Link>
        </div>

        {/* ─── Related Articles ───────────────────────── */}
        {relatedArticles.length > 0 && (
          <div className="pt-12 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
                Berita Terkait
              </h3>
              <Link to="/berita" className="text-xs text-stone-400 hover:text-[#faeed4] underline underline-offset-4">
                Semua Berita &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <motion.div
                  key={rel.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Link
                    to={`/berita/${rel.slug || rel.id}`}
                    className="bg-[#252f27] border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all flex flex-col justify-between shadow-md hover:shadow-xl group h-full"
                  >
                    {rel.coverImage && (
                      <div className="h-32 overflow-hidden bg-black/40 relative">
                        <img src={rel.coverImage} alt={rel.title} className="w-full h-full object-cover filter brightness-95" />
                      </div>
                    )}
                    <div className="p-4 space-y-1.5 flex-1">
                      <p className="text-[10px] text-[#819b8e] font-bold uppercase tracking-wider">{rel.category}</p>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-[#faeed4] transition-colors leading-snug">
                        {rel.title}
                      </h4>
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
