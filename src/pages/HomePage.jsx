/**
 * IYMPACK — HomePage (Minimalist Edition: No Icons, No Tags)
 */

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowDown, ChevronLeft, ChevronRight, Clock, Users, ArrowRight, MapPin, X, ZoomIn, ZoomOut, RotateCcw, Play } from 'lucide-react';
import { testimonialsData, homeGalleryData } from '../data/iympackData';
import TeamsSection from '../components/TeamsSection';
import { getPublishedEvents } from '../services/events.service.js';
import { getPublishedArticles } from '../services/articles.service.js';
import { getSiteSettings } from '../services/settings.service.js';
import { useData } from '../hooks/useData.js';
import { formatDate, formatFee, getEventDateTimestamp } from '../lib/utils.js';
import { DEFAULT_PAGE_SECTIONS } from '../services/sections.service.js';

/** Lightbox (WordPress-style) — rendered via React Portal into document.body */
function LightboxHome({ selectedImage, photoList, zoomScale, setZoomScale, onClose, onNav, swipeStartX }) {
  const currentIdx = photoList.findIndex(img => img.image === selectedImage.image || img.id === selectedImage.id);
  const total = photoList.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
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
      {/* Close */}
      <button type="button" onClick={onClose}
        className="absolute top-4 right-4 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer active:scale-90"
        aria-label="Tutup"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {total > 1 && (
        <div className="absolute top-4 left-4 z-30 bg-black/60 border border-white/15 rounded-full px-3 py-1 text-xs text-stone-300 font-medium">
          {currentIdx + 1} / {total}
        </div>
      )}

      {/* Arrows */}
      {total > 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onNav('prev'); }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/85 text-white border border-white/20 transition-all cursor-pointer active:scale-90 shadow-xl"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {total > 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onNav('next'); }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/85 text-white border border-white/20 transition-all cursor-pointer active:scale-90 shadow-xl"
          aria-label="Selanjutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Image box */}
      <div className="relative flex flex-col items-center mx-14 sm:mx-20"
        style={{ maxWidth: 'min(92vw, 900px)', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedImage.isVideo ? (
          <video src={selectedImage.videoUrl} controls autoPlay playsInline
            className="block rounded-lg shadow-2xl object-contain"
            style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 64px)' }}
          />
        ) : (
          <img
            src={selectedImage.image}
            alt={selectedImage.title}
            draggable={false}
            className="block rounded-lg shadow-2xl object-contain"
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(90vh - 64px)',
              transform: `scale(${zoomScale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
              cursor: zoomScale > 1 ? 'zoom-out' : 'zoom-in',
            }}
            onClick={() => setZoomScale(prev => prev > 1 ? 1 : 1.8)}
          />
        )}

        {/* Caption bar */}
        <div className="w-full bg-black/70 rounded-b-lg px-4 py-2.5 flex items-center justify-between gap-3 border-t border-white/10">
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">{selectedImage.title}</p>
            {(selectedImage.category || selectedImage.location) && (
              <div className="flex items-center gap-2 mt-0.5">
                {selectedImage.category && <span className="text-[10px] text-[#819b8e] font-semibold uppercase tracking-wide">{selectedImage.category}</span>}
                {selectedImage.location && (
                  <div className="flex items-center gap-1 text-[10px] text-stone-400">
                    <MapPin className="w-3 h-3 text-[#819b8e] shrink-0" />
                    <span>{selectedImage.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {!selectedImage.isVideo && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button type="button" onClick={() => setZoomScale(prev => Math.max(prev - 0.3, 1))} disabled={zoomScale <= 1}
                className="w-7 h-7 flex items-center justify-center rounded text-stone-300 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer" aria-label="Perkecil">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-stone-400 w-8 text-center tabular-nums">{Math.round(zoomScale * 100)}%</span>
              <button type="button" onClick={() => setZoomScale(prev => Math.min(prev + 0.3, 3))} disabled={zoomScale >= 3}
                className="w-7 h-7 flex items-center justify-center rounded text-stone-300 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer" aria-label="Perbesar">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const dataContext = useData();
  const { events, articles, siteSettings, testimonials, gallery, pageSections } = dataContext || {};
  const currentSettings = useMemo(() => siteSettings || getSiteSettings(), [siteSettings]);
  const homeContent = useMemo(() => pageSections?.home || DEFAULT_PAGE_SECTIONS.home, [pageSections]);
  const activeTestimonials = useMemo(() => {
    return Array.isArray(testimonials) ? testimonials : [];
  }, [testimonials]);
  const activeGallery = useMemo(() => {
    return Array.isArray(gallery) ? gallery : [];
  }, [gallery]);

  // Carousel State for 3 Engagement Containers on Mobile
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Scroll Ref & Carousel State for Upcoming Events
  const eventsScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  // Animation Frame references to throttle scroll handlers to 60/120fps display refresh
  const galleryRafRef = useRef(null);
  const testiRafRef = useRef(null);
  const articlesRafRef = useRef(null);
  const carouselRafRef = useRef(null);
  const eventsRafRef = useRef(null);

  // Gallery Showcase & Interactive Zoom/Video Lightbox State
  const galleryTrackRef = useRef(null);
  const [galleryProgress, setGalleryProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
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

  // Auto-hide UI after open
  useEffect(() => {
    if (selectedImage) {
      setUiVisible(true);
      uiHideTimer.current = setTimeout(() => setUiVisible(false), 3000);
    } else {
      clearTimeout(uiHideTimer.current);
      setUiVisible(true);
    }
    return () => clearTimeout(uiHideTimer.current);
  }, [selectedImage]);

  const handleGalleryScroll = () => {
    if (!galleryTrackRef.current || galleryRafRef.current) return;
    galleryRafRef.current = requestAnimationFrame(() => {
      galleryRafRef.current = null;
      if (!galleryTrackRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = galleryTrackRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const nextProgress = (scrollLeft / maxScroll) * 100;
        setGalleryProgress((prev) => (Math.abs(prev - nextProgress) > 0.5 ? nextProgress : prev));
      }
    });
  };

  // Testimonials Carousel State (1.2 view on mobile, 3 view on desktop)
  const testiTrackRef = useRef(null);
  const [canScrollTestiLeft, setCanScrollTestiLeft] = useState(false);
  const [canScrollTestiRight, setCanScrollTestiRight] = useState(true);
  const [testiProgress, setTestiProgress] = useState(0);

  const handleTestiScroll = () => {
    if (!testiTrackRef.current || testiRafRef.current) return;
    testiRafRef.current = requestAnimationFrame(() => {
      testiRafRef.current = null;
      if (!testiTrackRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = testiTrackRef.current;
      const nextCanLeft = scrollLeft > 15;
      const nextCanRight = scrollLeft + clientWidth < scrollWidth - 15;
      setCanScrollTestiLeft((prev) => (prev !== nextCanLeft ? nextCanLeft : prev));
      setCanScrollTestiRight((prev) => (prev !== nextCanRight ? nextCanRight : prev));

      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const nextProgress = (scrollLeft / maxScroll) * 100;
        setTestiProgress((prev) => (Math.abs(prev - nextProgress) > 0.5 ? nextProgress : prev));
      }
    });
  };

  const scrollTesti = (direction) => {
    if (!testiTrackRef.current) return;
    const container = testiTrackRef.current;
    const firstCard = container.firstElementChild;
    const isDesktop = window.innerWidth >= 768;
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : container.clientWidth / 3;
    const scrollAmount = isDesktop ? cardWidth * 3 : Math.max(280, container.clientWidth * 0.85);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth' });
  };

  // Articles Carousel State (1.2 view on mobile, 3 view on desktop)
  const articlesScrollRef = useRef(null);
  const [canScrollArticlesLeft, setCanScrollArticlesLeft] = useState(false);
  const [canScrollArticlesRight, setCanScrollArticlesRight] = useState(true);
  const [activeArticleIndex, setActiveArticleIndex] = useState(0);

  const checkArticlesScroll = () => {
    if (!articlesScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = articlesScrollRef.current;
    const nextCanLeft = scrollLeft > 5;
    const nextCanRight = scrollLeft + clientWidth < scrollWidth - 5;
    setCanScrollArticlesLeft(nextCanLeft);
    setCanScrollArticlesRight(nextCanRight);

    const firstCard = articlesScrollRef.current.firstElementChild;
    if (firstCard) {
      const cardWidth = firstCard.offsetWidth + 24;
      const nextIndex = Math.min(
        Math.max(Math.round(scrollLeft / cardWidth), 0),
        liveArticles.length - 1
      );
      setActiveArticleIndex(nextIndex);
    }
  };

  const scrollArticles = (direction) => {
    if (!articlesScrollRef.current) return;
    const container = articlesScrollRef.current;
    const isDesktop = window.innerWidth >= 1024;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
    
    let scrollAmount = container.clientWidth;
    if (!isDesktop && !isTablet) {
      const firstCard = container.firstElementChild;
      scrollAmount = firstCard ? firstCard.offsetWidth + 24 : container.clientWidth * 0.85;
    }

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth' });
    setTimeout(checkArticlesScroll, 350);
  };

  const scrollToArticleSlide = (index) => {
    if (!articlesScrollRef.current) return;
    const cards = articlesScrollRef.current.children;
    if (cards && cards[index]) {
      const container = articlesScrollRef.current;
      const targetLeft = cards[index].offsetLeft - container.offsetLeft;
      container.scrollTo({
        left: targetLeft,
        behavior: 'smooth' });
      setActiveArticleIndex(index);
      setTimeout(checkArticlesScroll, 350);
    }
  };

  // 8 Staggered Columns Layout for Top Showcase (including Video Item)
  const galleryShowcaseColumns = useMemo(() => {
    const photos = Array.isArray(activeGallery) ? activeGallery : [];

    const colWidths = [
      'w-[150px] sm:w-[180px] lg:w-[200px]',
      'w-[150px] sm:w-[180px] lg:w-[200px]',
      'w-[160px] sm:w-[200px] lg:w-[220px]',
      'w-[170px] sm:w-[220px] lg:w-[240px]',
      'w-[160px] sm:w-[200px] lg:w-[220px]',
      'w-[160px] sm:w-[190px] lg:w-[210px]',
      'w-[150px] sm:w-[180px] lg:w-[200px]',
      'w-[150px] sm:w-[180px] lg:w-[200px]',
    ];

    const columns = [
      { id: 'col-1', widthClass: colWidths[0], items: [] },
      { id: 'col-2', widthClass: colWidths[1], items: [] },
      { id: 'col-3', widthClass: colWidths[2], items: [] },
      { id: 'col-4', widthClass: colWidths[3], items: [] },
      { id: 'col-5', widthClass: colWidths[4], items: [] },
      { id: 'col-6', widthClass: colWidths[5], items: [] },
      { id: 'col-7', widthClass: colWidths[6], items: [] },
      { id: 'col-8', widthClass: colWidths[7], items: [] },
    ];

    const targetCols = [0, 1, 2, 4, 5, 6, 7];
    const heights = ['h-36 sm:h-44', 'h-24 sm:h-28', 'h-[300px] sm:h-[370px]'];

    photos.forEach((p, idx) => {
      const colIdx = targetCols[idx % targetCols.length];
      const heightClass = heights[idx % heights.length];
      columns[colIdx].items.push({
        id: p.id || idx + 1,
        title: p.title || p.caption || 'Aksi Kerelawanan IYMPACK',
        category: p.category || 'Kerelawanan',
        image: p.image || p.url || '/hero-hands.png',
        location: p.location || 'Indonesia',
        heightClass });
    });

    return columns;
  }, [activeGallery, currentSettings]);

  const allShowcasePhotos = useMemo(() => {
    return galleryShowcaseColumns.flatMap((col) => col.items);
  }, [galleryShowcaseColumns]);

  // Lock background body scroll when lightbox modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setZoomScale(1);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedImage]);

  const navigateGallery = (direction) => {
    if (!selectedImage) return;
    const photoList = allShowcasePhotos.length > 0 ? allShowcasePhotos : homeGalleryData;
    const currentIndex = photoList.findIndex((img) => img.image === selectedImage.image || img.id === selectedImage.id);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % photoList.length;
    } else {
      nextIndex = (currentIndex - 1 + photoList.length) % photoList.length;
    }
    setSelectedImage(photoList[nextIndex]);
    setZoomScale(1);
  };

  // Keyboard navigation for Lightbox (Escape to close, Arrow keys to navigate)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') {
        setSelectedImage(null);
        setZoomScale(1);
      } else if (e.key === 'ArrowRight') {
        navigateGallery('next');
      } else if (e.key === 'ArrowLeft') {
        navigateGallery('prev');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, allShowcasePhotos]);

  const engagementPillars = useMemo(() => {
    return homeContent.pillars?.items || DEFAULT_PAGE_SECTIONS.home.pillars.items;
  }, [homeContent]);

  const handleCarouselScroll = () => {
    if (!carouselRef.current || carouselRafRef.current) return;
    carouselRafRef.current = requestAnimationFrame(() => {
      carouselRafRef.current = null;
      if (!carouselRef.current) return;
      const { scrollLeft, clientWidth } = carouselRef.current;
      const firstCard = carouselRef.current.firstElementChild;
      const cardWidth = firstCard ? firstCard.offsetWidth + 20 : clientWidth * 0.85;
      const nextIndex = Math.min(
        Math.max(Math.round(scrollLeft / cardWidth), 0),
        engagementPillars.length - 1
      );
      setActiveSlide((prev) => (prev !== nextIndex ? nextIndex : prev));
    });
  };

  const scrollToSlide = (index) => {
    if (!carouselRef.current) return;
    const cards = carouselRef.current.children;
    if (cards && cards[index]) {
      const container = carouselRef.current;
      const targetLeft = cards[index].offsetLeft - container.offsetLeft;
      container.scrollTo({
        left: Math.max(0, targetLeft - 24),
        behavior: 'smooth' });
    }
    setActiveSlide(index);
  };

  // Events Carousel Helper Functions
  const checkEventsScroll = () => {
    if (!eventsScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = eventsScrollRef.current;
    const nextCanLeft = scrollLeft > 5;
    const nextCanRight = scrollLeft + clientWidth < scrollWidth - 5;
    setCanScrollLeft(nextCanLeft);
    setCanScrollRight(nextCanRight);

    const firstCard = eventsScrollRef.current.firstElementChild;
    if (firstCard) {
      const cardWidth = firstCard.offsetWidth + 24;
      const nextIndex = Math.min(
        Math.max(Math.round(scrollLeft / cardWidth), 0),
        liveEvents.length - 1
      );
      setActiveEventIndex(nextIndex);
    }
  };

  const scrollEvents = (direction) => {
    if (!eventsScrollRef.current) return;
    const container = eventsScrollRef.current;
    const isDesktop = window.innerWidth >= 1024;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
    
    let scrollAmount = container.clientWidth;
    if (!isDesktop && !isTablet) {
      const firstCard = container.firstElementChild;
      scrollAmount = firstCard ? firstCard.offsetWidth + 24 : container.clientWidth * 0.85;
    }

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth' });
    setTimeout(checkEventsScroll, 350);
  };

  const scrollToEventSlide = (index) => {
    if (!eventsScrollRef.current) return;
    const cards = eventsScrollRef.current.children;
    if (cards && cards[index]) {
      const container = eventsScrollRef.current;
      const targetLeft = cards[index].offsetLeft - container.offsetLeft;
      container.scrollTo({
        left: targetLeft,
        behavior: 'smooth' });
      setActiveEventIndex(index);
      setTimeout(checkEventsScroll, 350);
    }
  };

  // Dynamic Events from CMS with reactive updates from DataContext
  const liveEvents = useMemo(() => {
    const source = Array.isArray(events) ? events : [];
    let list = [];
    if (source && source.length > 0) {
      list = source
        .filter((e) => e.status === 'published' || !e.status)
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

    return list.sort((a, b) => getEventDateTimestamp(a) - getEventDateTimestamp(b));
  }, [events]);

  useEffect(() => {
    const timer = setTimeout(checkEventsScroll, 100);
    return () => clearTimeout(timer);
  }, [liveEvents.length]);

  // Dynamic Articles from CMS with reactive updates from DataContext
  const liveArticles = useMemo(() => {
    const source = Array.isArray(articles) ? articles : [];
    if (source && source.length > 0) {
      return source.filter((a) => a.status === 'published' || !a.status);
    }
    return [];
  }, [articles]);

  useEffect(() => {
    const timer = setTimeout(checkArticlesScroll, 100);
    return () => clearTimeout(timer);
  }, [liveArticles.length]);

  // Cleanup pending rAF on unmount
  useEffect(() => {
    return () => {
      const gRaf = galleryRafRef.current;
      const tRaf = testiRafRef.current;
      const aRaf = articlesRafRef.current;
      const cRaf = carouselRafRef.current;
      const eRaf = eventsRafRef.current;

      if (gRaf) cancelAnimationFrame(gRaf);
      if (tRaf) cancelAnimationFrame(tRaf);
      if (aRaf) cancelAnimationFrame(aRaf);
      if (cRaf) cancelAnimationFrame(cRaf);
      if (eRaf) cancelAnimationFrame(eRaf);
    };
  }, []);

  return (
    <div className="flex flex-col w-full bg-[#1c241e] text-white">
      
      {/* ─── 1. HERO SECTION (Full-Screen Edge-to-Edge with Giant Typography) ─── */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#1c241e] text-white pt-24 sm:pt-28 pb-20 sm:pb-12 px-5 sm:px-12 lg:px-16 border-b border-white/10">
        {/* Background Image of Hero Banner (Bisa diubah oleh Super Admin) */}
        <img
          src={
            (homeContent.hero?.bannerUrl || currentSettings.heroBannerUrl || '/hero-hands.webp')
              .replace(/^\/hero-hands\.png$/, '/hero-hands.webp')
          }
          alt="IYMPACK - Gerakan Pemuda Berdampak"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={(e) => {
            if (e.target.src.includes('.webp')) {
              e.target.src = '/hero-hands.png';
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 contrast-105"
        />

        {/* Gradient Overlays for Cinematic Depth and Perfect Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c241e]/95 via-[#1c241e]/50 to-[#1c241e]/35 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#1c241e]/70 pointer-events-none" />

        {/* Top Spacer allowing glass header breathing space */}
        <div className="relative z-10 w-full" />

        {/* Middle Spatial Breathing Room to Showcase the Hands Visual */}
        <div className="relative z-10 flex-1 my-auto pointer-events-none" />

        {/* Bottom Content Area: Giant IYMPACK + Description & Action Button */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 sm:gap-10">
          
          {/* Giant Typography (Left) */}
          <div className="shrink-0">
            <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] xl:text-[13rem] font-black tracking-tighter leading-[0.85] text-white font-heading select-none">
              {homeContent.hero?.headline || 'IYMPACK'}
            </h1>
          </div>

          {/* Text Paragraph & Action Pill (Right) */}
          <div className="max-w-md lg:max-w-lg lg:pb-3 space-y-6">
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light tracking-wide">
              {homeContent.hero?.subheadline || 'Mari bertumbuh bersama, membangun aksi sosial yang berdampak, dan membuka kesempatan pendidikan yang lebih luas bagi anak-anak Indonesia.'}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <Link
                to={homeContent.hero?.buttonUrl || '/event'}
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#faeed4] text-[#252f27] font-semibold text-xs sm:text-sm hover:bg-white hover:text-black hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>{homeContent.hero?.buttonText || 'Ikut Kegiatan'}</span>
                <span className="text-base leading-none">&rarr;</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Tombol Panah Scroll ke Bawah di Pojok Kanan Bawah */}
        <button
          type="button"
          onClick={() => {
            const nextSection = document.getElementById('stats-section');
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            }
          }}
          aria-label="Gulir ke bawah"
          className="absolute bottom-6 sm:bottom-8 right-6 sm:right-10 z-20 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/30 bg-black/30 hover:bg-white/20 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white cursor-pointer group shadow-lg"
        >
          <ArrowDown className="w-5 h-5 text-white transition-transform duration-300 group-hover:translate-y-0.5 animate-bounce" />
        </button>
      </section>

      {/* ─── 2. ABOUT US & STATS SECTION (Dark Forest Theme with Topo Texture & Ambient Glow) ─── */}
      <section id="stats-section" className="py-20 sm:py-28 bg-[#222d25] border-b border-white/10 relative overflow-hidden">
        {/* Topographic Background Texture & Ambient Mesh */}
        <div className="absolute inset-0 bg-topo-pattern opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-mesh pointer-events-none opacity-60" />
        <div className="absolute top-1/2 -right-28 w-96 h-96 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Heading + Descriptive Text */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
                {homeContent.stats?.title || 'Tentang Kami'}
              </h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
                {homeContent.stats?.desc || 'IYMPACK (Indonesia Yuwana Muda Peduli Aksi Cinta Kasih) adalah gerakan pemuda sukarela yang berfokus pada pemerataan pendidikan, aksi sosial kemanusiaan, dan pemberdayaan anak-anak bangsa di berbagai pelosok Indonesia.'}
              </p>
            </div>

            {/* Right Column: Key Numbers & Metrics */}
            <div className="lg:col-span-6 xl:col-span-5 grid grid-cols-3 gap-6 sm:gap-8 pt-1">
              <div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-[#faeed4] tracking-tight drop-shadow-sm">
                  {homeContent.stats?.stat1Value || '100+'}
                </p>
                <p className="text-xs sm:text-sm text-stone-300 mt-1.5 font-normal">
                  {homeContent.stats?.stat1Label || 'Relawan'}
                </p>
              </div>

              <div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-[#faeed4] tracking-tight drop-shadow-sm">
                  {homeContent.stats?.stat2Value || '8'}
                </p>
                <p className="text-xs sm:text-sm text-stone-300 mt-1.5 font-normal">
                  {homeContent.stats?.stat2Label || 'Cabang Kota'}
                </p>
              </div>

              <div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-[#faeed4] tracking-tight drop-shadow-sm">
                  {homeContent.stats?.stat3Value || '1.000+'}
                </p>
                <p className="text-xs sm:text-sm text-stone-300 mt-1.5 font-normal">
                  {homeContent.stats?.stat3Label || 'Penerima Manfaat'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. AKSI & KOLABORASI (Dark Forest Theme with Dots Texture) ─── */}
      <section className="py-20 sm:py-28 border-b border-white/10 bg-[#1c241e] relative overflow-hidden">
        {/* Dotted Texture & Glow */}
        <div className="absolute inset-0 bg-dots-pattern opacity-25 pointer-events-none" />
        <div className="absolute top-1/3 -left-28 w-96 h-96 bg-[#4a6859]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-80 h-80 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-10 sm:space-y-14 relative z-10">
          
          {/* Section Header */}
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#819b8e] font-heading">
              Aksi & Kolaborasi
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight">
              {homeContent.pillars?.title || 'Aksi Nyata & Dedikasi Pemuda'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
              {homeContent.pillars?.subtitle || 'Membuka kesempatan pendidikan dan masa depan yang lebih berdaya bagi anak-anak Indonesia.'}
            </p>
          </div>

          {/* 3 Containers: Desktop 3-Cols Grid | Mobile Responsive Horizontal Carousel */}
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex md:grid md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-6 px-6 sm:-mx-10 sm:px-10 md:mx-0 md:px-0 scroll-pl-6 sm:scroll-pl-10 md:scroll-pl-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {engagementPillars.map((item) => (
              <div
                key={item.id}
                className="w-[76vw] sm:w-[70vw] md:w-auto shrink-0 md:shrink snap-start h-[460px] sm:h-[500px] lg:h-[540px] rounded-[28px] sm:rounded-3xl overflow-hidden relative group shadow-lg cursor-pointer transition-all border border-white/10 hover:border-white/30"
              >
                {/* Background Photo with smooth zoom on hover */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Bottom Frosted Glass Caption Box */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-black/40 backdrop-blur-md border-t border-white/15 p-5 sm:p-6 text-white space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light line-clamp-3">
                    {item.desc}
                  </p>
                  <div className="pt-1.5 w-full">
                    <Link
                      to={item.actionUrl}
                      className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#faeed4] text-[#252f27] text-xs sm:text-sm font-semibold hover:bg-white hover:shadow-lg transition-all duration-300 shadow-sm text-center group/btn"
                    >
                      <span>{item.actionLabel}</span>
                      <span className="text-base leading-none transition-transform duration-300 group-hover/btn:translate-x-1">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Carousel Indicators / Dots */}
          <div className="flex md:hidden items-center justify-center gap-2 pt-2">
            {engagementPillars.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === idx
                    ? 'w-6 bg-[#faeed4]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ─── 4. UPCOMING EVENTS (Dark Forest Theme with Grid Texture & Aurora Glow) ─── */}
      <section className="py-24 sm:py-28 lg:py-32 border-b border-white/10 bg-[#222d25] scroll-mt-28 relative overflow-hidden">
        {/* Grid Texture & Ambient Glows */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-[#4a6859]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-10 sm:space-y-12 relative z-10">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6">
            <div className="max-w-xl space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#819b8e] font-heading">
                Agenda Relawan
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
                {homeContent.eventsHeader?.title || 'Kegiatan Mendatang'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
                {homeContent.eventsHeader?.subtitle || 'Ikuti aksi kerelawanan dan berkontribusi nyata bersama generasi muda.'}
              </p>
            </div>

            {/* Desktop Link & Arrows */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/event"
                className="text-xs font-semibold text-stone-300 underline underline-offset-4 hover:text-[#faeed4] transition-colors"
              >
                Lihat Seluruh Kegiatan &rarr;
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollEvents('left')}
                  disabled={!canScrollLeft}
                  aria-label="Gulir ke kiri"
                  className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                    !canScrollLeft
                      ? 'border-white/10 text-stone-600 bg-white/5 cursor-not-allowed'
                      : 'border-white/20 bg-white/10 text-white hover:bg-[#faeed4] hover:text-[#252f27] hover:border-transparent active:scale-95'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollEvents('right')}
                  disabled={!canScrollRight}
                  aria-label="Gulir ke kanan"
                  className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                    !canScrollRight
                      ? 'border-white/10 text-stone-600 bg-white/5 cursor-not-allowed'
                      : 'border-white/20 bg-white/10 text-white hover:bg-[#faeed4] hover:text-[#252f27] hover:border-transparent active:scale-95'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {liveEvents.length > 0 ? (
            <>
              {/* Carousel Track: 3 cards on desktop, 2 on tablet, peek-a-boo on mobile */}
              <div
                ref={eventsScrollRef}
                onScroll={checkEventsScroll}
                className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth -mx-6 px-6 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0 scroll-pl-6 sm:scroll-pl-10 lg:scroll-pl-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
              >
                {liveEvents.map((evt) => (
                  <Link
                    key={evt.id}
                    to={`/event/${evt.slug || evt.id}`}
                    className="w-[76vw] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] shrink-0 snap-start h-[440px] sm:h-[470px] lg:h-[480px] rounded-[24px] sm:rounded-[26px] overflow-hidden relative group shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer block border border-white/10 hover:border-white/30 hover:-translate-y-1"
                  >
                    {/* Date Badge Top-Left */}
                    <div className="absolute top-4 left-4 z-20 bg-[#1c241e]/95 backdrop-blur-md rounded-2xl px-3 py-2 shadow-md flex flex-col items-center justify-center min-w-[46px] border border-white/20">
                      <span className="text-base sm:text-lg font-black text-[#faeed4] font-heading leading-none">
                        {evt.day || '15'}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1 leading-none">
                        {evt.month || 'FEB'}
                      </span>
                    </div>

                    {/* Background Photo */}
                    <img
                      src={evt.bannerImage || evt.image || '/hero-hands.webp'}
                      alt={evt.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover filter brightness-95"
                    />

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />

                    {/* Card Bottom Details */}
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white flex flex-col justify-end space-y-3.5 z-10">
                      {/* Event Title */}
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold font-heading text-white leading-snug line-clamp-2 drop-shadow-sm group-hover:text-[#faeed4] transition-colors">
                        {evt.title}
                      </h3>

                      {/* Meta Information: Duration/Time & Quota */}
                      <div className="flex items-center gap-4 text-xs text-stone-300 font-medium pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{evt.time ? evt.time.split(' - ')[0] + ' WIB' : '08:00 WIB'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{evt.quota || '50 Relawan'}</span>
                        </div>
                      </div>

                      {/* Bottom Action Row */}
                      <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#faeed4]">
                          {formatFee(evt.fee)}
                        </span>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#faeed4] text-[#252f27] flex items-center justify-center shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                          <ArrowRight className="w-4 h-4 text-[#252f27] transition-transform duration-300 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile Carousel Indicators / Dots & Mobile Link */}
              <div className="flex md:hidden items-center justify-between pt-2">
                {/* Dots Indicator */}
                <div className="flex items-center gap-2">
                  {liveEvents.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToEventSlide(idx)}
                      aria-label={`Ke agenda ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeEventIndex === idx
                          ? 'w-8 bg-[#faeed4]'
                          : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                {/* Mobile Link */}
                <Link
                  to="/event"
                  className="text-xs font-semibold text-stone-300 underline underline-offset-4 hover:text-[#faeed4]"
                >
                  Lihat Semua &rarr;
                </Link>
              </div>
            </>
          ) : (
            <div className="py-16 text-center border border-white/10 rounded-3xl p-8 max-w-md mx-auto bg-white/5 space-y-3">
              <p className="text-base font-bold text-white font-heading">Belum Ada Agenda Terbuka</p>
              <p className="text-xs text-stone-400 font-light leading-relaxed">
                Saat ini semua agenda kegiatan sedang dipersiapkan. Pantau terus kanal resmi kami untuk jadwal kegiatan selanjutnya!
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ─── 5. SHOWCASE & TESTIMONIALS (Dark Forest Theme with Topo Texture & Ambient Glow) ─── */}
      <section className="py-20 sm:py-28 border-b border-white/10 bg-[#1c241e] relative overflow-hidden">
        {/* Topo Texture & Aurora Glow */}
        <div className="absolute inset-0 bg-topo-pattern opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-mesh pointer-events-none opacity-50" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-[#4a6859]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top: Staggered Multi-Column Showcase Photo Grid */}
        {allShowcasePhotos.length > 0 && (
          <>
            <div
              ref={galleryTrackRef}
              onScroll={handleGalleryScroll}
              className="w-full overflow-x-auto no-scrollbar py-4 px-4 sm:px-6 select-none"
            >
              <div className="flex items-center justify-start lg:justify-center gap-3 sm:gap-4 min-w-max mx-auto">
                {galleryShowcaseColumns.map((col) => (
                  <div
                    key={col.id}
                    className={`${col.widthClass} shrink-0 flex flex-col justify-center gap-3 sm:gap-4`}
                  >
                    {col.items.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => {
                          setSelectedImage(photo);
                          setZoomScale(1);
                        }}
                        className={`group relative ${photo.heightClass} w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#252f27] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-white/30`}
                      >
                        <img
                          src={photo.image}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/hero-hands.png';
                          }}
                        />

                        {/* Video Play Icon Overlay */}
                        {photo.isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/50 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:bg-[#faeed4] group-hover:text-[#252f27] transition-all duration-300">
                              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 text-white">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#faeed4] mb-0.5">
                            {photo.category}
                          </span>
                          <p className="text-xs font-semibold leading-tight line-clamp-2">
                            {photo.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Thin, Compact Progress Bar */}
            <div className="flex items-center justify-center pt-5 pb-1">
              <div className="w-16 sm:w-20 h-[2px] bg-white/15 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#faeed4] rounded-full transition-all duration-150"
                  style={{
                    width: '35%',
                    transform: `translateX(${(galleryProgress / 100) * 185}%)` }}
                />
              </div>
            </div>
          </>
        )}

        {/* Middle: Left-Aligned Testimonials Headline + Carousel Navigation Controls */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-12 sm:pt-16 pb-6 sm:pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight leading-[1.15]">
              {homeContent.testimonialsHeader?.title || 'Dipercaya oleh pemuda, mitra & relawan'}
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-stone-400 leading-tight">
              {homeContent.testimonialsHeader?.subtitle || 'dari berbagai penjuru negeri'}
            </p>
          </div>

          {/* Nav Controls: Arrow Buttons on Desktop | Progress Bar on Mobile */}
          <div className="flex items-center gap-4 self-start sm:self-end">
            <div className="w-16 sm:w-20 h-[2px] bg-white/15 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-[#faeed4] rounded-full transition-all duration-150"
                style={{
                  width: '35%',
                  transform: `translateX(${(testiProgress / 100) * 185}%)` }}
              />
            </div>

            {/* Desktop Arrow Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTesti('left')}
                disabled={!canScrollTestiLeft}
                aria-label="Testimonial sebelumnya"
                className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                  !canScrollTestiLeft
                    ? 'border-white/10 text-stone-600 bg-white/5 cursor-not-allowed'
                    : 'border-white/20 bg-white/10 text-white hover:bg-[#faeed4] hover:text-[#252f27] hover:border-transparent active:scale-95'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTesti('right')}
                disabled={!canScrollTestiRight}
                aria-label="Testimonial selanjutnya"
                className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                  !canScrollTestiRight
                    ? 'border-white/10 text-stone-600 bg-white/5 cursor-not-allowed'
                    : 'border-white/20 bg-white/10 text-white hover:bg-[#faeed4] hover:text-[#252f27] hover:border-transparent active:scale-95'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Testimonial Carousel Track: Button-Driven on Desktop (md:overflow-x-hidden) | Swipeable on Mobile */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div
            ref={testiTrackRef}
            onScroll={handleTestiScroll}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory md:snap-none pb-6 pt-2 -mx-6 px-6 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0 scroll-pl-6 sm:scroll-pl-10 lg:scroll-pl-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
          >
            {activeTestimonials && activeTestimonials.length > 0 ? (
              activeTestimonials.map((testi, idx) => (
                <div
                  key={testi.id || idx}
                  className="w-[76vw] sm:w-[60vw] md:w-[calc((100%-2.5rem)/3)] shrink-0 snap-start glass-card bg-[#252f27]/75 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between shadow-xl transition-all duration-300 min-h-[200px]"
                >
                  {/* Quote Text */}
                  <p className="text-xs sm:text-sm md:text-base text-stone-200 leading-relaxed font-light mb-5 flex-1">
                    &ldquo;{testi.quote}&rdquo;
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 pt-3.5 border-t border-white/10">
                    <img
                      src={
                        testi.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          testi.author || 'User'
                        )}&background=252f27&color=faeed4&size=128`
                      }
                      alt={testi.author}
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-xs ring-2 ring-white/20 shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                      }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight truncate">
                        {testi.author}
                      </span>
                      <span className="text-[11px] sm:text-xs text-stone-400 font-medium mt-0.5 truncate">
                        {testi.role || 'Relawan IYMPACK'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-12 text-center border border-white/10 rounded-2xl bg-white/5 text-stone-400 text-sm">
                Belum ada testimoni.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Lightbox (WordPress-style, rendered via React Portal) ─── */}
      {selectedImage && createPortal(
        <LightboxHome
          selectedImage={selectedImage}
          photoList={allShowcasePhotos.length > 0 ? allShowcasePhotos : homeGalleryData}
          zoomScale={zoomScale}
          setZoomScale={setZoomScale}
          onClose={() => { setSelectedImage(null); setZoomScale(1); }}
          onNav={navigateGallery}
          swipeStartX={swipeStartX}
        />,
        document.body
      )}

      {/* ─── 6. CALL TO ACTION (Dark Forest Banner with Photo Background & Clean Overlay) ────────── */}
      <section className="relative py-24 sm:py-28 lg:py-32 overflow-hidden text-white text-center border-y border-white/10 bg-[#1c241e]">
        {/* Background Photo */}
        <img
          src={homeContent.cta?.imageUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1800&auto=format&fit=crop"}
          alt="Berbagi Untuk Bersama"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.08] scale-105"
        />

        {/* Cinematic Gradient Overlay (Clean & Visible, No Blurring) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c241e] via-[#1c241e]/50 to-[#1c241e]/60 pointer-events-none" />
        
        {/* Subtle radial spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.2)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading leading-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            {homeContent.cta?.title || 'Berbagi Untuk Bersama'}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {homeContent.cta?.subtitle || 'Setiap kepedulian yang Anda bagikan membuka pintu harapan baru bagi pendidikan dan masa depan generasi muda Indonesia.'}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 pt-3">
            <Link
              to={homeContent.cta?.buttonUrl && homeContent.cta?.buttonUrl !== '/relawan' ? homeContent.cta.buttonUrl : '/event'}
              className="py-3.5 px-8 rounded-full bg-[#faeed4] text-[#252f27] font-bold text-xs sm:text-sm hover:bg-white hover:text-[#1c241e] hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>{homeContent.cta?.buttonText || 'Gabung Jadi Relawan'}</span>
              <span className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Link>
            <Link
              to="/kontak"
              className="py-3.5 px-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Ajukan Kolaborasi</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 6.5 TIM KAMI & CHAPTER CAROUSEL ─────────────────────────────── */}
      <TeamsSection />

      {/* ─── 7. LATEST NEWS & ARTICLES (Dark Forest Theme with Grid Texture & Carousel) ───────── */}
      <section className="py-24 sm:py-28 bg-[#222d25] relative overflow-hidden border-b border-white/10">
        {/* Grid Texture & Ambient Glows */}
        <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
        <div className="absolute top-1/3 -right-28 w-96 h-96 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-[#4a6859]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-10 sm:space-y-12 relative z-10">
          
          {/* Section Header with Desktop Navigation Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6">
            <div className="max-w-xl space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#819b8e] font-heading">
                Publikasi & Liputan
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
                {homeContent.articlesHeader?.title || 'Berita & Artikel Terkini'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
                {homeContent.articlesHeader?.subtitle || 'Cerita pengabdian, gagasan pemuda, dan liputan aksi sosial dari berbagai pelosok negeri.'}
              </p>
            </div>

            {/* Desktop Link & Arrows */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/berita"
                className="text-xs font-semibold text-stone-300 underline underline-offset-4 hover:text-[#faeed4] transition-colors"
              >
                Lihat Seluruh Berita &rarr;
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollArticles('left')}
                  disabled={!canScrollArticlesLeft}
                  aria-label="Artikel sebelumnya"
                  className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                    !canScrollArticlesLeft
                      ? 'border-white/10 text-stone-600 bg-white/5 cursor-not-allowed'
                      : 'border-white/20 bg-white/10 text-white hover:bg-[#faeed4] hover:text-[#252f27] hover:border-transparent active:scale-95'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollArticles('right')}
                  disabled={!canScrollArticlesRight}
                  aria-label="Artikel selanjutnya"
                  className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                    !canScrollArticlesRight
                      ? 'border-white/10 text-stone-600 bg-white/5 cursor-not-allowed'
                      : 'border-white/20 bg-white/10 text-white hover:bg-[#faeed4] hover:text-[#252f27] hover:border-transparent active:scale-95'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {liveArticles.length > 0 ? (
            <>
              {/* Carousel Track: 3 cards on desktop, 2 on tablet, peek-a-boo on mobile */}
              <div
                ref={articlesScrollRef}
                onScroll={checkArticlesScroll}
                className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth -mx-6 px-6 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0 scroll-pl-6 sm:scroll-pl-10 lg:scroll-pl-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
              >
                {liveArticles.map((art) => (
                  <div
                    key={art.id}
                    className="w-[76vw] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] shrink-0 snap-start glass-card bg-[#252f27]/75 backdrop-blur-md rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between transition-all shadow-xl hover:shadow-2xl group border border-white/10 hover:border-white/30 hover:-translate-y-1"
                  >
                    {/* Photo Header */}
                    <div className="h-52 overflow-hidden bg-black/40 relative">
                      <img
                        src={art.coverImage || art.image}
                        alt={art.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover filter brightness-95"
                        onError={(e) => {
                          e.target.src = '/hero-hands.webp';
                        }}
                      />
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
                        <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed font-light">
                          {art.excerpt || 'Baca tulisan dan cerita dampak sosial selengkapnya.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs text-stone-400 font-light">{art.author || 'Admin'}</span>
                        <Link
                          to={`/berita/${art.slug || art.id}`}
                          className="text-xs font-bold text-[#faeed4] hover:text-white hover:underline transition-colors"
                        >
                          Baca Selengkapnya &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Carousel Indicators / Dots & Mobile Link */}
              <div className="flex md:hidden items-center justify-between pt-2">
                {/* Dots Indicator */}
                <div className="flex items-center gap-2">
                  {liveArticles.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToArticleSlide(idx)}
                      aria-label={`Ke artikel ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeArticleIndex === idx
                          ? 'w-8 bg-[#faeed4]'
                          : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                {/* Mobile Link */}
                <Link
                  to="/berita"
                  className="text-xs font-semibold text-stone-300 underline underline-offset-4 hover:text-[#faeed4]"
                >
                  Lihat Semua &rarr;
                </Link>
              </div>
            </>
          ) : (
            <div className="py-16 text-center border border-white/10 rounded-3xl p-8 max-w-md mx-auto bg-white/5 space-y-3">
              <p className="text-base font-bold text-white font-heading">Belum Ada Artikel Dipublikasikan</p>
              <p className="text-xs text-stone-400 font-light leading-relaxed">
                Cerita pengabdian dan catatan liputan kegiatan relawan akan segera hadir di sini.
              </p>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
