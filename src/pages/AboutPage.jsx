/**
 * IYMPACK — About Us Page (Dark Forest Theme with Ambient Decorations)
 */

import React, { useMemo } from 'react';
import TeamsSection from '../components/TeamsSection';
import { useData } from '../hooks/useData.js';
import { DEFAULT_PAGE_SECTIONS } from '../services/sections.service.js';

export default function AboutPage() {
  const { pageSections, siteSettings } = useData();
  const aboutContent = useMemo(() => pageSections?.about || DEFAULT_PAGE_SECTIONS.about, [pageSections]);

  const missions = aboutContent.visionMission?.missions || [
    'Meningkatkan kesadaran dan kepedulian sosial di kalangan anak muda.',
    'Mengadakan kegiatan sosial dan edukatif yang berdampak nyata bagi masyarakat.',
    'Membangun jaringan kolaboratif dengan berbagai pihak untuk memperluas manfaat kegiatan.',
    'Menumbuhkan jiwa kepemimpinan dan semangat gotong royong dalam komunitas.',
  ];

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 pb-24 relative overflow-hidden">
      
      {/* Ambient background decoration & Topo texture */}
      <div className="absolute inset-0 bg-topo-pattern opacity-25 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-80 h-80 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Header Banner ────────────────────────────── */}
      <section className="relative text-white pt-28 sm:pt-32 pb-16 sm:pb-20 border-b border-white/10 overflow-hidden bg-[#1c241e]">
        <img
          src={(aboutContent.banner?.imageUrl || siteSettings?.heroBannerUrl || '/hero-hands.webp').replace(/^\/hero-hands\.png$/, '/hero-hands.webp')}
          alt="Mengenal Indonesia Yuwana Muda"
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
            {aboutContent.banner?.tag || 'Tentang Kami'}
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            {aboutContent.banner?.title || 'Tentang Kami'}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-200 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            {aboutContent.banner?.desc || 'Mengenal profil, sejarah, visi, dan misi Yayasan Indonesia Yuwana Muda Peduli Aksi Cinta Kasih.'}
          </p>
        </div>
      </section>

      {/* ─── Story & Values (Tentang, Sejarah, Fokus, Nilai & Harapan) ─── */}
      <section className="py-20 sm:py-24 border-b border-white/10 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          
          {/* Tentang Yayasan IYMPACK */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-heading leading-tight">
              {aboutContent.story?.aboutTitle || 'Tentang Yayasan IYMPACK'}
            </h2>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
              {aboutContent.story?.aboutText || 'Yayasan IYMPACK (Indonesia Yuwana Muda Peduli Aksi Cinta Kasih) merupakan organisasi kepemudaan dan yayasan sosial yang diinisiasi oleh Melisania Suardi dan resmi berdiri pada 4 November 2024.'}
            </p>
          </div>

          {/* Sejarah Berdirinya */}
          <div className="space-y-3 pt-8 border-t border-white/10">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-heading">
              {aboutContent.story?.historyTitle || 'Sejarah Berdirinya'}
            </h3>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
              {aboutContent.story?.historyText || 'Lahirnya IYMPACK berawal dari pengalaman pribadi sang pendiri ketika berada di titik terpuruk dan merasa kehilangan arah.'}
            </p>
          </div>

          {/* Fokus dan Kegiatan */}
          <div className="space-y-3 pt-8 border-t border-white/10">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-heading">
              {aboutContent.story?.focusTitle || 'Fokus dan Kegiatan'}
            </h3>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
              {aboutContent.story?.focusText || 'Berlandaskan kepedulian dan semangat untuk bangkit bersama, IYMPACK aktif menjalankan berbagai program di bidang sosial, edukasi, kemanusiaan, dan pengabdian masyarakat.'}
            </p>
          </div>

          {/* Nilai dan Harapan */}
          <div className="space-y-3 pt-8 border-t border-white/10">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-heading">
              {aboutContent.story?.valuesTitle || 'Nilai dan Harapan'}
            </h3>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
              {aboutContent.story?.valuesText || 'Kami percaya bahwa menolong orang lain adalah cara terbaik untuk menemukan kembali harapan dan rasa syukur.'}
            </p>
          </div>
          
        </div>
      </section>

      {/* ─── Vision & Mission (Visi & Misi) ───────────── */}
      <section className="py-20 sm:py-24 border-b border-white/10 bg-[#222d25] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            
            {/* Visi */}
            <div className="md:col-span-5 glass-card bg-[#252f27]/75 backdrop-blur-md rounded-2xl sm:rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl border border-white/10">
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                  {aboutContent.visionMission?.visionTitle || 'Visi'}
                </h3>
                <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-light">
                  {aboutContent.visionMission?.visionText || 'Menjadi komunitas kepemudaan yang berkontribusi secara aktif dalam menciptakan perubahan sosial yang positif melalui aksi kemanusiaan dan edukasi.'}
                </p>
              </div>
            </div>

            {/* Misi */}
            <div className="md:col-span-7 glass-card bg-[#252f27]/75 backdrop-blur-md rounded-2xl sm:rounded-3xl p-8 sm:p-10 space-y-5 shadow-xl border border-white/10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                {aboutContent.visionMission?.missionTitle || 'Misi'}
              </h3>
              <ul className="space-y-3.5 text-sm sm:text-base text-stone-300 font-light">
                {missions.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#819b8e]/20 text-[#faeed4] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      {idx + 1}
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>



      {/* ─── Teams & Chapters Carousel Section ────────────────────────────── */}
      <TeamsSection title="Tim & Chapter IYMPACK" />
    </div>
  );
}
