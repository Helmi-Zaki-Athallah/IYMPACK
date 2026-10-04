/**
 * IYMPACK — Programs Page (Minimalist Dark Forest Green Edition)
 */

import React, { useState } from 'react';
import { programsData } from '../data/iympackData';
import { useModal } from '../hooks/useModal.js';

export default function ProgramsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const { openDonation } = useModal();

  const categories = ['Semua', 'Pendidikan', 'Sosial & Gizi', 'Pemberdayaan', 'Lingkungan'];

  const filtered = selectedCategory === 'Semua'
    ? programsData
    : programsData.filter(p => p.category === selectedCategory);

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 pb-24 relative overflow-hidden">
      {/* Ambient background decorations */}
      <div className="absolute inset-0 bg-dots-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#819b8e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-24 w-96 h-96 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Header ───────────────────────────────────── */}
      <section className="relative text-white pt-28 sm:pt-32 pb-16 sm:pb-20 border-b border-white/10 overflow-hidden bg-[#1c241e]">
        {/* Background Image from Hero Section */}
        <img
          src="/hero-hands.webp"
          alt="Program Kebaikan & Inisiatif Sosial"
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
            Aksi & Penyaluran
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            Program Kebaikan & Inisiatif Sosial
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-200 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            Dukungan Anda disalurkan secara transparan dan bertanggung jawab untuk pendidikan, nutrisi anak, dan konservasi alam.
          </p>
        </div>
      </section>

      {/* ─── Filter & Grid ────────────────────────────── */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-b border-white/10 pb-4 text-sm font-medium">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`pb-2 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'text-[#faeed4] font-bold border-b-2 border-[#faeed4]'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filtered.map((prog) => (
              <div
                key={prog.id}
                className="bg-[#252f27] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/30 transition-all duration-300 shadow-md group"
              >
                <div className="h-52 overflow-hidden bg-[#1c241e] relative">
                  <img
                    src={prog.image}
                    alt={prog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#252f27] via-transparent to-transparent opacity-60" />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#819b8e] uppercase font-medium">{prog.category} &bull; {prog.location}</p>
                    <h3 className="text-base font-bold text-white font-heading leading-snug">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">
                      {prog.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex justify-between text-xs text-stone-300">
                      <span>Terkumpul: <strong className="text-[#faeed4]">Rp {new Intl.NumberFormat('id-ID').format(prog.raised)}</strong></span>
                      <span className="text-stone-400">Target: Rp {new Intl.NumberFormat('id-ID').format(prog.target)}</span>
                    </div>

                    <button
                      onClick={() => openDonation(prog.title)}
                      className="w-full py-2.5 rounded-full bg-[#faeed4] hover:bg-white text-[#252f27] text-xs font-semibold transition-colors cursor-pointer shadow-md"
                    >
                      Donasi untuk Program Ini
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
