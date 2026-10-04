import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MapPin, X } from 'lucide-react';
import { galleryPhotos } from '../data/iympackData';
import { useData } from '../hooks/useData.js';
import { getSiteSettings } from '../services/settings.service.js';

/** Lightbox (WordPress-style) — rendered via React Portal into document.body */
function LightboxGallery({ selectedPhoto, filteredPhotos, zoomScale, setZoomScale, onClose, onNav, swipeStartX }) {
  const currentIdx = filteredPhotos.findIndex(p => (p.url || p.image) === (selectedPhoto.url || selectedPhoto.image));
  const total = filteredPhotos.length;
  return (
    <div
      role="dialog" aria-modal="true"
      className="fixed inset-0 flex items-center justify-center select-none"
      style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 99999 }}
      onTouchStart={(e) => { swipeStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (swipeStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - swipeStartX.current;
        swipeStartX.current = null;
        if (Math.abs(dx) > 50) onNav(dx < 0 ? 'next' : 'prev');
      }}
      onClick={onClose}
    >
      <button type="button" onClick={onClose}
        className="absolute top-4 right-4 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer active:scale-90"
        aria-label="Tutup"><X className="w-5 h-5" /></button>
      {total > 1 && (
        <div className="absolute top-4 left-4 z-30 bg-black/60 border border-white/15 rounded-full px-3 py-1 text-xs text-stone-300 font-medium">
          {currentIdx + 1} / {total}
        </div>
      )}
      {total > 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onNav('prev'); }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/85 text-white border border-white/20 transition-all cursor-pointer active:scale-90 shadow-xl"
          aria-label="Sebelumnya"><ChevronLeft className="w-6 h-6" /></button>
      )}
      {total > 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onNav('next'); }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/85 text-white border border-white/20 transition-all cursor-pointer active:scale-90 shadow-xl"
          aria-label="Selanjutnya"><ChevronRight className="w-6 h-6" /></button>
      )}
      <div className="relative flex flex-col items-center mx-14 sm:mx-20"
        style={{ maxWidth: 'min(92vw, 900px)', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={selectedPhoto.url || selectedPhoto.image}
          alt={selectedPhoto.title || selectedPhoto.caption}
          draggable={false}
          className="block rounded-lg shadow-2xl object-contain"
          style={{
            maxWidth: '100%', maxHeight: 'calc(90vh - 64px)',
            transform: `scale(${zoomScale})`, transformOrigin: 'center center',
            transition: 'transform 0.2s ease', cursor: zoomScale > 1 ? 'zoom-out' : 'zoom-in',
          }}
          onClick={() => setZoomScale(prev => prev > 1 ? 1 : 1.8)}
          onError={(e) => { e.target.src = '/hero-hands.webp'; }}
        />
        <div className="w-full bg-black/70 rounded-b-lg px-4 py-2.5 flex items-center justify-between gap-3 border-t border-white/10">
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">{selectedPhoto.title || selectedPhoto.caption || 'Dokumentasi'}</p>
            {(selectedPhoto.category || selectedPhoto.location) && (
              <div className="flex items-center gap-2 mt-0.5">
                {selectedPhoto.category && <span className="text-[10px] text-[#819b8e] font-semibold uppercase tracking-wide">{selectedPhoto.category}</span>}
                {selectedPhoto.location && (
                  <div className="flex items-center gap-1 text-[10px] text-stone-400">
                    <MapPin className="w-3 h-3 text-[#819b8e] shrink-0" /><span>{selectedPhoto.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button type="button" onClick={() => setZoomScale(prev => Math.max(prev - 0.3, 1))} disabled={zoomScale <= 1}
              className="w-7 h-7 flex items-center justify-center rounded text-stone-300 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer" aria-label="Perkecil"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-[10px] text-stone-400 w-8 text-center tabular-nums">{Math.round(zoomScale * 100)}%</span>
            <button type="button" onClick={() => setZoomScale(prev => Math.min(prev + 0.3, 3))} disabled={zoomScale >= 3}
              className="w-7 h-7 flex items-center justify-center rounded text-stone-300 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer" aria-label="Perbesar"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { gallery, siteSettings } = useData();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filter, setFilter] = useState('Semua');
  const [zoomScale, setZoomScale] = useState(1);
  const [uiVisible, setUiVisible] = useState(true);
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);
  const lastTapTime = useRef(0);
  const uiHideTimer = useRef(null);

  const resetUiHideTimer = useCallback(() => {
    setUiVisible(true);
    clearTimeout(uiHideTimer.current);
    uiHideTimer.current = setTimeout(() => setUiVisible(false), 3000);
  }, []);

  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      setUiVisible(true);
      uiHideTimer.current = setTimeout(() => setUiVisible(false), 3000);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      clearTimeout(uiHideTimer.current);
      setUiVisible(true);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      clearTimeout(uiHideTimer.current);
    };
  }, [selectedPhoto]);

  const activePhotos = useMemo(() => {
    return Array.isArray(gallery) ? gallery : [];
  }, [gallery]);

  const categories = ['Semua', 'Pendidikan', 'Relawan', 'Kerelawanan', 'Workshop', 'Sosial', 'Lingkungan', 'Kemanusiaan'];

  const filteredPhotos = filter === 'Semua' 
    ? activePhotos 
    : activePhotos.filter(p => p.category?.toLowerCase() === filter.toLowerCase());

  // Navigate between photos
  const navigatePhoto = useCallback((dir) => {
    if (!selectedPhoto) return;
    const idx = filteredPhotos.findIndex(p => (p.url || p.image) === (selectedPhoto.url || selectedPhoto.image));
    if (idx === -1) return;
    const next = dir === 'next' ? (idx + 1) % filteredPhotos.length : (idx - 1 + filteredPhotos.length) % filteredPhotos.length;
    setSelectedPhoto(filteredPhotos[next]);
    setZoomScale(1);
  }, [selectedPhoto, filteredPhotos]);

  // Keyboard shortcut to close / navigate
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      if (e.key === 'Escape') { setSelectedPhoto(null); setZoomScale(1); }
      if (e.key === 'ArrowRight') navigatePhoto('next');
      if (e.key === 'ArrowLeft') navigatePhoto('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, navigatePhoto]);

  const heroBanner = (siteSettings?.heroBannerUrl || getSiteSettings().heroBannerUrl || '/hero-hands.webp').replace(/^\/hero-hands\.png$/, '/hero-hands.webp');

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 pb-24 relative overflow-hidden">
      {/* Background Ambience & Decorative Elements */}
      <div className="absolute inset-0 bg-dots-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#819b8e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-24 w-96 h-96 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Header ───────────────────────────────────── */}
      <section className="relative text-white pt-28 sm:pt-32 pb-16 sm:pb-20 border-b border-white/10 overflow-hidden bg-[#1c241e]">
        {/* Background Image from Hero Section */}
        <img
          src={heroBanner}
          alt="Galeri Kegiatan IYMPACK"
          loading="eager"
          decoding="async"
          onError={(e) => {
            if (e.target.src.includes('.webp')) {
              e.target.src = '/hero-hands.png';
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.65] contrast-105"
        />

        {/* Cinematic Gradient & Ambient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c241e] via-[#1c241e]/75 to-[#1c241e]/50 pointer-events-none" />
        <div className="absolute inset-0 bg-dots-pattern opacity-20 pointer-events-none" />
        <div className="absolute -bottom-10 -left-20 w-80 h-80 bg-[#819b8e]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#faeed4] font-heading drop-shadow-sm">
            Dokumentasi Visual
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            Galeri Kegiatan IYMPACK
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-200 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            Momen kebersamaan, senyum anak-anak, dan aksi nyata sukarelawan di berbagai daerah.
          </p>
        </div>
      </section>

      {/* ─── Filter & Grid ────────────────────────────── */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-b border-white/10 pb-4 text-sm font-medium">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`pb-2 transition-colors cursor-pointer ${
                  filter === cat
                    ? 'text-[#faeed4] font-bold border-b-2 border-[#faeed4]'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredPhotos && filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  onClick={() => setSelectedPhoto(photo)}
                  className="bg-[#252f27] border border-white/10 rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between hover:border-white/30 transition-all duration-300 shadow-md"
                >
                  <div className="h-64 overflow-hidden bg-[#1c241e]">
                    <img
                      src={photo.url || photo.image}
                      alt={photo.title || photo.caption}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/hero-hands.webp';
                      }}
                    />
                  </div>
                  <div className="p-4 bg-[#252f27]">
                    <p className="text-[10px] text-[#819b8e] uppercase font-semibold">{photo.category}</p>
                    <p className="text-xs font-semibold text-stone-200 mt-1">{photo.title || photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-white/10 rounded-3xl bg-white/5 max-w-md mx-auto p-8 space-y-3">
              <p className="text-base font-bold text-white font-heading">Belum Ada Dokumentasi Foto</p>
              <p className="text-xs text-stone-400 font-light leading-relaxed">
                Dokumentasi foto kegiatan akan ditampilkan di sini.
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedPhoto && createPortal(
        <LightboxGallery
          selectedPhoto={selectedPhoto}
          filteredPhotos={filteredPhotos}
          zoomScale={zoomScale}
          setZoomScale={setZoomScale}
          onClose={() => { setSelectedPhoto(null); setZoomScale(1); }}
          onNav={navigatePhoto}
          swipeStartX={swipeStartX}
        />,
        document.body
      )}
    </div>
  );
}
