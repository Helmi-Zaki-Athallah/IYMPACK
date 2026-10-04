/**
 * IYMPACK — Team Chapter Detail Page
 * Matches user's exact specification:
 * - Top: Team Group Photo (Banner) + Title & Instagram pill
 * - Below: Members grouped neatly by division with circular portraits,
 *   Role title on top, circular photo in middle, Name in warm gold below.
 * - Activity Gallery & Chapter-to-chapter navigation.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Sparkles,
  Image as ImageIcon,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ExternalLink } from 'lucide-react';
import { teamsData as initialTeamsData } from '../data/teamsData';
import { getTeamBySlug as getCmsTeamBySlug, getTeams } from '../services/teams.service.js';
import { useData } from '../hooks/useData.js';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

/** Lightbox (WordPress-style) — rendered via React Portal into document.body, identical to HomePage */
function LightboxTeam({ selectedImage, photoList, zoomScale, setZoomScale, onClose, onNav, swipeStartX, teamName }) {
  const currentUrl = typeof selectedImage === 'string' ? selectedImage : (selectedImage?.image || selectedImage?.url);
  const currentIdx = photoList.findIndex(img => (typeof img === 'string' ? img : (img.image || img.url)) === currentUrl);
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
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer active:scale-90"
        aria-label="Tutup"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {total > 1 && (
        <div className="absolute top-4 left-4 z-30 bg-black/60 border border-white/15 rounded-full px-3 py-1 text-xs text-stone-300 font-medium">
          {currentIdx >= 0 ? currentIdx + 1 : 1} / {total}
        </div>
      )}

      {/* Arrows */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNav('prev'); }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/85 text-white border border-white/20 transition-all cursor-pointer active:scale-90 shadow-xl"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNav('next'); }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/85 text-white border border-white/20 transition-all cursor-pointer active:scale-90 shadow-xl"
          aria-label="Selanjutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Image box */}
      <div
        className="relative flex flex-col items-center mx-14 sm:mx-20"
        style={{ maxWidth: 'min(92vw, 900px)', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentUrl}
          alt={`Gallery ${teamName || 'Tim'}`}
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
          onClick={() => setZoomScale(prev => (prev > 1 ? 1 : 1.8))}
          onError={(e) => {
            if (e.target.src !== '/hero-hands.webp') {
              e.target.src = '/hero-hands.webp';
            }
          }}
        />

        {/* Caption bar */}
        <div className="w-full bg-black/70 rounded-b-lg px-4 py-2.5 flex items-center justify-between gap-3 border-t border-white/10">
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">
              Gallery {teamName}
            </p>
            <p className="text-[11px] text-[#819b8e] font-medium mt-0.5">
              Foto {currentIdx >= 0 ? currentIdx + 1 : 1} dari {total}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setZoomScale(prev => Math.max(prev - 0.3, 1))}
              disabled={zoomScale <= 1}
              className="w-7 h-7 flex items-center justify-center rounded text-stone-300 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Perkecil"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-stone-400 w-8 text-center tabular-nums">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale(prev => Math.min(prev + 0.3, 3))}
              disabled={zoomScale >= 3}
              className="w-7 h-7 flex items-center justify-center rounded text-stone-300 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Perbesar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const swipeStartX = useRef(null);

  const data = useData();
  const cmsTeams = (data?.teams && data.teams.length > 0) ? data.teams : null;

  const allTeams = useMemo(() => {
    if (cmsTeams && cmsTeams.length > 0) return cmsTeams;
    const fromStorage = getTeams();
    if (fromStorage && fromStorage.length > 0) return fromStorage;
    return initialTeamsData;
  }, [cmsTeams]);

  const team = useMemo(() => {
    if (!slug) return null;
    const lower = slug.toLowerCase().trim();
    return allTeams.find(t => t.slug?.toLowerCase() === lower || t.id?.toLowerCase() === lower) || getCmsTeamBySlug(slug);
  }, [slug, allTeams]);

  // Current team index in allTeams
  const currentTeamIndex = useMemo(() => {
    if (!team || !allTeams || allTeams.length === 0) return -1;
    const teamSlug = (team.slug || team.id || '').toLowerCase().trim();
    return allTeams.findIndex(t => {
      const s = (t.slug || t.id || '').toLowerCase().trim();
      return s === teamSlug;
    });
  }, [team, allTeams]);

  // Find previous and next team objects safely (cyclic navigation through all available chapters)
  const { prevTeamObj, nextTeamObj } = useMemo(() => {
    if (!allTeams || allTeams.length <= 1 || !team) {
      return { prevTeamObj: null, nextTeamObj: null };
    }

    // Try finding by explicit prevTeam/nextTeam first if valid
    let prev = team.prevTeam ? allTeams.find(t => t.slug?.toLowerCase() === team.prevTeam.toLowerCase() || t.id?.toLowerCase() === team.prevTeam.toLowerCase()) : null;
    let next = team.nextTeam ? allTeams.find(t => t.slug?.toLowerCase() === team.nextTeam.toLowerCase() || t.id?.toLowerCase() === team.nextTeam.toLowerCase()) : null;

    // If not found or not specified, use cyclic index navigation
    if (currentTeamIndex !== -1) {
      if (!prev) {
        const prevIdx = (currentTeamIndex - 1 + allTeams.length) % allTeams.length;
        prev = allTeams[prevIdx];
      }
      if (!next) {
        const nextIdx = (currentTeamIndex + 1) % allTeams.length;
        next = allTeams[nextIdx];
      }
    }

    return { prevTeamObj: prev, nextTeamObj: next };
  }, [team, allTeams, currentTeamIndex]);

  const navigateGallery = (direction) => {
    if (!selectedImage || !team?.gallery || team.gallery.length === 0) return;
    const photoList = team.gallery;
    const currentUrl = typeof selectedImage === 'string' ? selectedImage : (selectedImage?.image || selectedImage?.url);
    const currentIndex = photoList.findIndex(img => (typeof img === 'string' ? img : (img.image || img.url)) === currentUrl);
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

  // Keyboard navigation for Lightbox and Member Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedMember) setSelectedMember(null);
        if (selectedImage) {
          setSelectedImage(null);
          setZoomScale(1);
        }
      } else if (selectedImage) {
        if (e.key === 'ArrowRight') {
          navigateGallery('next');
        } else if (e.key === 'ArrowLeft') {
          navigateGallery('prev');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedMember, team?.gallery]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedImage || selectedMember) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedImage, selectedMember]);

  // Group members into logical divisions/tiers
  const divisionGroups = useMemo(() => {
    if (!team) return [];
    const list = team.members || [];
    if (list.length === 0) return [];

    // 1. Check if members have explicit divisions or custom categories
    const hasExplicitDivision = list.some(
      (m) =>
        (m.division && m.division.trim() !== '') ||
        (m.category && !['Pengurus', 'Pengurus Inti'].includes(m.category.trim()))
    );

    if (hasExplicitDivision) {
      const groupsMap = new Map();
      list.forEach((m) => {
        const divName = (m.division || m.category || 'Pengurus Harian').trim();
        if (!groupsMap.has(divName)) {
          groupsMap.set(divName, []);
        }
        groupsMap.get(divName).push(m);
      });

      return Array.from(groupsMap.entries()).map(([name, members]) => ({
        name,
        members }));
    }

    // 2. Check if team has special categories (like IYMPACK Mengajar legacy data)
    const hasSpecialCategories = list.some(m => ['MANAJEMEN', 'BPH', 'PENGAJAR SD'].includes(m.category));
    
    if (hasSpecialCategories) {
      const cats = ['MANAJEMEN', 'BPH', 'PENGAJAR SD'];
      const result = [];
      cats.forEach(c => {
        const mems = list.filter(m => m.category === c);
        if (mems.length > 0) {
          result.push({ name: c === 'PENGAJAR SD' ? 'Pengajar & Fasilitator' : c, members: mems });
        }
      });
      const rem = list.filter(m => !cats.includes(m.category));
      if (rem.length > 0) result.push({ name: 'Pengurus Lainnya', members: rem });
      return result;
    }

    // 3. Fallback: Standard organizational hierarchy tiers
    const tiers = [
      {
        name: 'Dewan Pendiri',
        filter: (r) => (r || '').toLowerCase().includes('founder') },
      {
        name: 'Ketua & Wakil Ketua',
        filter: (r) => {
          const l = (r || '').toLowerCase();
          return (l.includes('ketua') || l.includes('korwil') || l.includes('wakil')) && !l.includes('sekretaris') && !l.includes('bendahara');
        } },
      {
        name: 'Sekretaris',
        filter: (r) => (r || '').toLowerCase().includes('sekretaris') },
      {
        name: 'Bendahara',
        filter: (r) => (r || '').toLowerCase().includes('bendahara') },
      {
        name: 'Divisi Hubungan Masyarakat (Humas)',
        filter: (r) => {
          const l = (r || '').toLowerCase();
          return l.includes('humas') || l.includes('publik relation') || l.includes('public relation') || l.includes('media sosial');
        } },
      {
        name: 'Divisi Project Management (PM)',
        filter: (r) => {
          const l = (r || '').toLowerCase();
          return l.includes('project manager') || l.includes('pm') || l.includes('project');
        } },
      {
        name: 'Divisi Publikasi, Dokumentasi & Desain (PDD)',
        filter: (r) => {
          const l = (r || '').toLowerCase();
          return l.includes('pdd') || l.includes('desain') || l.includes('dokumentasi');
        } },
      {
        name: 'Divisi Logistik & Operasional',
        filter: (r) => {
          const l = (r || '').toLowerCase();
          return l.includes('logistik') || l.includes('operasional') || l.includes('logis');
        } },
      {
        name: 'Divisi Website & IT',
        filter: (r) => {
          const l = (r || '').toLowerCase();
          return l.includes('web developer') || l.includes('developer') || l.includes('it') || l.includes('website');
        } },
      {
        name: 'Divisi Human Resources (HR)',
        filter: (r) => {
          const l = (r || '').toLowerCase();
          return l.includes('hr') || l.includes('human resource');
        } },
      {
        name: 'Divisi Pendidikan & Kurikulum',
        filter: (r) => {
          const l = (r || '').toLowerCase();
          return l.includes('pendidikan') || l.includes('kurikulum');
        } },
    ];

    const result = [];
    const usedIndices = new Set();

    tiers.forEach(tier => {
      const matched = [];
      list.forEach((m, idx) => {
        if (!usedIndices.has(idx) && tier.filter(m.role || '')) {
          matched.push(m);
          usedIndices.add(idx);
        }
      });
      if (matched.length > 0) {
        if (tier.name === 'Ketua & Wakil Ketua') {
          matched.sort((a, b) => {
            const aIsWakil = (a.role || '').toLowerCase().includes('wakil');
            const bIsWakil = (b.role || '').toLowerCase().includes('wakil');
            if (!aIsWakil && bIsWakil) return -1;
            if (aIsWakil && !bIsWakil) return 1;
            return 0;
          });
        }
        result.push({ name: tier.name, members: matched });
      }
    });

    // Remainder
    const remaining = list.filter((_, idx) => !usedIndices.has(idx));
    if (remaining.length > 0) {
      result.push({ name: 'Anggota Pengurus', members: remaining });
    }

    return result;
  }, [team]);

  if (!team) {
    return <Navigate to="/tentang-kami" replace />;
  }

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 min-h-screen pb-24 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-topo-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-80 h-80 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── 1. Top Group Photo (Full Screen Banner) ─────────────────────────── */}
      <section 
        className="relative w-full h-screen min-h-[100dvh] overflow-hidden bg-black/50 border-b border-white/10 group select-none"
      >
        <img
          src={getOptimizedImageUrl(team.coverImage, { width: 1400, quality: 80 })}
          alt={team.displayName}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="w-full h-full object-cover object-center filter brightness-[0.95]"
          onError={(e) => {
            if (e.target.src !== team.coverImage) {
              e.target.src = team.coverImage;
            } else {
              e.target.src = '/hero-hands.webp';
            }
          }}
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c241e] via-transparent to-[#1c241e]/60 pointer-events-none" />

        {/* Scroll Down Arrow Indicator */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const el = document.getElementById('team-content-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity animate-bounce cursor-pointer group/btn"
          aria-label="Scroll ke bawah"
        >
          <span className="text-[11px] uppercase tracking-widest text-[#faeed4] font-medium drop-shadow">Scroll ke bawah</span>
          <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-[#faeed4]/40 flex items-center justify-center text-[#faeed4] shadow-lg group-hover/btn:bg-[#faeed4] group-hover/btn:text-[#1c241e] transition-colors">
            <ChevronDown className="w-5 h-5 stroke-[2.5]" />
          </div>
        </button>
      </section>

      {/* ─── 2. Title & Social Badges (Placed Below Group Photo) ───────────── */}
      <section id="team-content-section" className="relative py-10 sm:py-14 text-center space-y-4 max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-[#d8a76d] tracking-tight">
          {team.displayName}
        </h1>

        {/* Social Badges */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {team.igUrl && (
            <a
              href={team.igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#252f27]/90 hover:bg-[#819b8e]/30 text-[#faeed4] text-xs sm:text-sm font-medium border border-white/15 backdrop-blur-md transition-all hover:scale-105 shadow-md"
            >
              <InstagramIcon className="w-4 h-4 text-[#faeed4]" />
              <span>{team.ig}</span>
            </a>
          )}
          {team.tiktok && (
            <a
              href={team.tiktokUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#252f27]/90 hover:bg-[#819b8e]/30 text-[#faeed4] text-xs sm:text-sm font-medium border border-white/15 backdrop-blur-md transition-all hover:scale-105 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#faeed4]" />
              <span>{team.tiktok}</span>
            </a>
          )}
        </div>
      </section>

      {/* ─── 3. Individual Member Photos by Division ────────────────── */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20">
          {divisionGroups.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-[#252f27]/40 border border-white/5 max-w-lg mx-auto">
              <Users className="w-10 h-10 text-[#819b8e] mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-[#faeed4] mb-1">Daftar Pengurus Belum Tersedia</h3>
              <p className="text-xs text-[#819b8e]">Data anggota dan pengurus untuk chapter {team.displayName || team.name} akan segera diperbarui.</p>
            </div>
          ) : (
            divisionGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-10" style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 300px' }}>
                {/* Division Header Banner (Enlarged) */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2.5 px-6 py-2 sm:px-8 sm:py-2.5 rounded-full bg-[#252f27] border border-[#819b8e]/40 text-[#faeed4] text-sm sm:text-base md:text-lg font-bold uppercase tracking-widest shadow-lg">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#d8a76d]" />
                    <span>{group.name}</span>
                  </div>
                  <div className="w-24 sm:w-32 h-0.5 bg-[#d8a76d]/50 mx-auto rounded-full mt-2 sm:mt-3" />
                </div>

                {/* Circular Member Grid (Side-by-side on mobile & desktop) */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-10 lg:gap-14 max-w-5xl mx-auto px-2">
                  {group.members.map((member, mIdx) => (
                    <div
                      key={mIdx}
                      className="flex flex-col items-center text-center space-y-2.5 sm:space-y-3 group w-[130px] sm:w-[170px] md:w-[200px] transition-transform duration-300 hover:-translate-y-1.5"
                    >
                      {/* Circular Photo */}
                      <div
                        className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-3 sm:border-4 border-[#819b8e]/30 group-hover:border-[#faeed4] shadow-2xl transition-all duration-500 bg-black/40 cursor-pointer"
                        onClick={() =>
                          setSelectedMember({
                            photo: member.photo,
                            name: member.name,
                            role: member.role,
                            division: group.name,
                          })
                        }
                        title={`Perbesar foto ${member.name}`}
                      >
                        <img
                          src={getOptimizedImageUrl(member.photo, { width: 360, quality: 80 })}
                          alt={member.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            if (e.target.src !== member.photo) {
                              e.target.src = member.photo;
                            } else {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=252f27&color=faeed4&size=256`;
                            }
                          }}
                        />
                      </div>

                      {/* Member Name (Warm Gold below) */}
                      <h4 className="text-xs sm:text-base md:text-lg font-bold text-[#d8a76d] font-heading leading-snug group-hover:text-white transition-colors max-w-full break-words">
                        {member.name}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ─── 4. Activity Gallery Section ───────────────────────────── */}
      {team.gallery && team.gallery.length > 0 && (
        <section className="py-16 sm:py-20 bg-[#222d25] border-t border-b border-white/10 relative overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 300px' }}>
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-4xl font-bold font-heading text-white">
                Gallery {team.displayName}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {team.gallery.map((imgUrl, gIdx) => (
                <div
                  key={gIdx}
                  onClick={() => {
                    setSelectedImage(imgUrl);
                    setZoomScale(1);
                  }}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-lg cursor-pointer hover:border-[#faeed4]/40 transition-all duration-300"
                >
                  <img
                    src={getOptimizedImageUrl(imgUrl, { width: 600, quality: 80 })}
                    alt={`${team.displayName} Foto ${gIdx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (e.target.src !== imgUrl) {
                        e.target.src = imgUrl;
                      } else {
                        e.target.src = '/hero-hands.webp';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-white px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
                      Perbesar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 5. Chapter Navigation (Kembali / Selanjutnya) ─────────── */}
      <section className="py-8 sm:py-12 relative bg-[#222d25]/40 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-6">
            {/* KEMBALI */}
            {prevTeamObj ? (
              <Link
                to={`/tim/${prevTeamObj.slug}`}
                className="group flex flex-col items-start text-left transition-transform duration-200 hover:-translate-x-1"
              >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#d8a76d] font-heading">
                  KEMBALI
                </span>
                <span className="text-sm sm:text-base font-normal text-[#819b8e] group-hover:text-white transition-colors mt-0.5">
                  {prevTeamObj.displayName || prevTeamObj.name}
                </span>
              </Link>
            ) : <div />}

            {/* SEMUA TIM CHAPTER (Desktop Center Pill) */}
            <Link
              to="/tentang-kami"
              className="hidden md:inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white border border-white/10 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <span>Semua Tim Chapter</span>
            </Link>

            {/* SELANJUTNYA */}
            {nextTeamObj ? (
              <Link
                to={`/tim/${nextTeamObj.slug}`}
                className="group flex flex-col items-end text-right transition-transform duration-200 hover:translate-x-1"
              >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#d8a76d] font-heading">
                  SELANJUTNYA
                </span>
                <span className="text-sm sm:text-base font-normal text-[#819b8e] group-hover:text-white transition-colors mt-0.5">
                  {nextTeamObj.displayName || nextTeamObj.name}
                </span>
              </Link>
            ) : <div />}
          </div>

          {/* SEMUA TIM CHAPTER (Mobile bottom button) */}
          <div className="flex md:hidden justify-center pt-6">
            <Link
              to="/tentang-kami"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white border border-white/10 text-xs font-semibold transition-all"
            >
              <span>Semua Tim Chapter</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Lightbox (WordPress-style, rendered via React Portal) ─── */}
      {selectedImage && createPortal(
        <LightboxTeam
          selectedImage={selectedImage}
          photoList={team.gallery || []}
          zoomScale={zoomScale}
          setZoomScale={setZoomScale}
          onClose={() => {
            setSelectedImage(null);
            setZoomScale(1);
          }}
          onNav={navigateGallery}
          swipeStartX={swipeStartX}
          teamName={team.displayName}
        />,
        document.body
      )}

      {/* ─── Modal Pratinjau Foto Anggota (Perbesar Foto & Detail Pengurus) ─── */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overscroll-contain"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative bg-[#1c241e] border border-[#819b8e]/40 rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full shadow-2xl flex flex-col items-center text-center text-stone-100 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
              aria-label="Tutup"
              title="Tutup (ESC)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Division Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#819b8e]/20 border border-[#819b8e]/40 text-[#faeed4] text-xs font-bold uppercase tracking-wider mb-5">
              <Users className="w-3.5 h-3.5 text-[#d8a76d]" />
              <span>{selectedMember.division}</span>
            </div>

            {/* High-Resolution Portrait Photo */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-[#819b8e]/50 shadow-[0_0_35px_rgba(250,238,212,0.25)] bg-[#252f27] mb-5">
              <img
                src={selectedMember.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=252f27&color=faeed4&size=512`}
                alt={selectedMember.name}
                className="w-full h-full object-cover object-center select-none"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=252f27&color=faeed4&size=512`;
                }}
              />
            </div>

            {/* Name */}
            <h3 className="text-xl sm:text-2xl font-black text-[#d8a76d] font-heading leading-tight">
              {selectedMember.name}
            </h3>

            {/* Role / Jabatan (tampil jika ada perbedaan khusus dengan divisi) */}
            {selectedMember.role && selectedMember.role.trim().toLowerCase() !== (selectedMember.division || '').trim().toLowerCase() && (
              <p className="text-sm sm:text-base text-stone-300 font-medium mt-1.5">
                {selectedMember.role}
              </p>
            )}

            {/* Footer Hint */}
            <p className="text-[11px] text-stone-400 mt-5 pt-4 border-t border-white/10 w-full">
              Anggota Resmi {team.displayName}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
