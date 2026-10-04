/**
 * IYMPACK — Teams & Chapters Carousel Section
 * Fully robust 3-card sliding on desktop with zero cutoff and reliable Prev/Next buttons.
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Users, ArrowRight } from 'lucide-react';
import { teamsData as initialTeamsData } from '../data/teamsData';
import { getTeams } from '../services/teams.service.js';
import { useData } from '../hooks/useData.js';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

export default function TeamsSection({
  className = '',
  title = 'Tim & Chapter IYMPACK',
  subtitle = 'Kenali tim penggerak dan divisi regional IYMPACK yang tersebar di berbagai wilayah.'
}) {
  const teamsScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Dynamic live teams from CMS with fallback
  const data = useData();
  const cmsTeams = (data?.teams && data.teams.length > 0) ? data.teams : null;

  const activeTeams = useMemo(() => {
    if (cmsTeams && cmsTeams.length > 0) return cmsTeams;
    const fromStorage = getTeams();
    if (fromStorage && fromStorage.length > 0) return fromStorage;
    return initialTeamsData;
  }, [cmsTeams]);

  const updateScrollButtons = useCallback(() => {
    if (!teamsScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = teamsScrollRef.current;
    // Buffer of 5px for subpixel rounding
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);

    // Active dot index calculation
    const firstCard = teamsScrollRef.current.firstElementChild;
    if (firstCard) {
      const cardWidth = firstCard.offsetWidth + 24;
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(idx, 0), activeTeams.length - 1));
    }
  }, [activeTeams]);

  useEffect(() => {
    const timer = setTimeout(updateScrollButtons, 100);
    window.addEventListener('resize', updateScrollButtons, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const scrollTeams = (direction) => {
    if (!teamsScrollRef.current) return;
    const container = teamsScrollRef.current;
    const isDesktop = window.innerWidth >= 1024;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
    
    // Amount to scroll: exactly the width of the container visible area
    // (which shows 3 cards on desktop, 2 on tablet, 1 on mobile)
    let scrollAmount = container.clientWidth;
    if (!isDesktop && !isTablet) {
      const firstCard = container.firstElementChild;
      scrollAmount = firstCard ? firstCard.offsetWidth + 24 : container.clientWidth * 0.85;
    }

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });

    // Update buttons after smooth animation
    setTimeout(updateScrollButtons, 350);
  };

  const scrollToTeamSlide = (index) => {
    if (!teamsScrollRef.current) return;
    const cards = teamsScrollRef.current.children;
    if (cards && cards[index]) {
      const container = teamsScrollRef.current;
      const targetLeft = cards[index].offsetLeft - container.offsetLeft;
      container.scrollTo({
        left: targetLeft,
        behavior: 'smooth',
      });
      setActiveIndex(index);
      setTimeout(updateScrollButtons, 350);
    }
  };

  return (
    <section className={`py-20 sm:py-24 bg-[#222d25] relative overflow-hidden border-b border-white/10 ${className}`}>
      {/* Grid Texture & Ambient Glows */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 -right-28 w-96 h-96 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-[#4a6859]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 relative z-10">
        
        {/* Section Header with Desktop Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6">
          <div className="max-w-xl space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#819b8e] font-heading">
              Tim Kami
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Desktop Navigation Links & Arrows */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/tentang-kami"
              className="text-xs font-semibold text-stone-300 underline underline-offset-4 hover:text-[#faeed4] transition-colors"
            >
              Tentang IYMPACK &rarr;
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTeams('left')}
                disabled={!canScrollLeft}
                aria-label="Gulir ke kiri"
                className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                  !canScrollLeft
                    ? 'border-white/10 text-stone-600 bg-white/5 cursor-not-allowed opacity-50'
                    : 'border-white/20 bg-white/10 text-white hover:bg-[#faeed4] hover:text-[#252f27] hover:border-transparent active:scale-95'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTeams('right')}
                disabled={!canScrollRight}
                aria-label="Gulir ke kanan"
                className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                  !canScrollRight
                    ? 'border-white/10 text-stone-600 bg-white/5 cursor-not-allowed opacity-50'
                    : 'border-white/20 bg-white/10 text-white hover:bg-[#faeed4] hover:text-[#252f27] hover:border-transparent active:scale-95'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Track: Exactly 3 cards per row on lg, 2 cards on sm, peek-a-boo on mobile */}
        <div
          ref={teamsScrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 scroll-pl-4 sm:scroll-pl-6 lg:scroll-pl-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
        >
          {activeTeams.map((team) => (
            <div
              key={team.id}
              className="w-[76vw] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] shrink-0 snap-start h-[440px] sm:h-[470px] lg:h-[480px] rounded-[24px] sm:rounded-[26px] overflow-hidden relative group shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-end border border-white/10 hover:border-white/30 hover:-translate-y-1 bg-[#252f27]"
            >
              {/* Background Photo */}
              <img
                src={getOptimizedImageUrl(team.coverImage, { width: 700, quality: 80 })}
                alt={team.displayName}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover filter brightness-95"
                onError={(e) => {
                  if (e.target.src !== team.coverImage) {
                    e.target.src = team.coverImage;
                  } else {
                    e.target.src = '/hero-hands.webp';
                  }
                }}
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />

              {/* Card Bottom Details */}
              <div className="relative p-5 sm:p-6 text-white flex flex-col justify-end space-y-3.5 z-10">
                {/* Chapter Title */}
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white leading-snug line-clamp-1 drop-shadow-sm group-hover:text-[#faeed4] transition-colors">
                  {team.displayName}
                </h3>

                {/* Member Count & Location */}
                <div className="flex items-center gap-4 text-xs text-stone-300 font-medium pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{team.membersCount || (team.members || []).length} Pengurus</span>
                  </div>
                  <span className="text-stone-400">•</span>
                  <span className="truncate text-stone-300">{team.ig}</span>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#faeed4]">
                    IYMPACK Chapter
                  </span>
                  <Link
                    to={`/tim/${team.slug}`}
                    className="py-2 px-5 rounded-full bg-[#faeed4] hover:bg-white text-[#252f27] font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Lihat Tim</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
            {activeTeams.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToTeamSlide(idx)}
                aria-label={`Ke tim ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx
                    ? 'w-8 bg-[#faeed4]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Mobile Link */}
          <Link
            to="/tentang-kami"
            className="text-xs font-semibold text-stone-300 underline underline-offset-4 hover:text-[#faeed4]"
          >
            Lihat Semua &rarr;
          </Link>
        </div>

      </div>
    </section>
  );
}
