/**
 * IYMPACK — FAQ Page (Minimalist Edition: No Icons, No Tags)
 */

import React, { useState, useMemo } from 'react';
import { faqList, siteConfig } from '../data/iympackData';
import { useData } from '../hooks/useData.js';
import { getSiteSettings } from '../services/settings.service.js';

export default function FaqPage() {
  const { faqs, siteSettings } = useData();
  const [openFaq, setOpenFaq] = useState(0);

  const activeFaqs = useMemo(() => {
    return Array.isArray(faqs) ? faqs : [];
  }, [faqs]);

  const heroBanner = (siteSettings?.heroBannerUrl || getSiteSettings().heroBannerUrl || '/hero-hands.webp').replace(/^\/hero-hands\.png$/, '/hero-hands.webp');
  const waContact = siteSettings?.whatsapp || siteConfig.whatsapp;

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

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
          src={heroBanner}
          alt="Pertanyaan yang Sering Diajukan"
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
            Pusat Informasi
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-200 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            Temukan jawaban lengkap seputar cara kerja, pendaftaran relawan, penyaluran donasi, dan program IYMPACK.
          </p>
        </div>
      </section>

      {/* ─── FAQ List ─────────────────────────────────── */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          {activeFaqs && activeFaqs.length > 0 ? (
            activeFaqs.map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="glass-card bg-[#252f27]/75 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 font-semibold text-sm sm:text-base text-white cursor-pointer hover:text-[#faeed4] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-base font-bold text-[#faeed4]">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-stone-300 leading-relaxed border-t border-white/10 pt-4 font-light whitespace-pre-line">
                    {faq.a}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-16 text-center border border-white/10 rounded-2xl bg-white/5 text-stone-400 text-sm">
              Belum ada FAQ yang ditambahkan.
            </div>
          )}

          {/* Assistance CTA Card */}
          <div className="mt-12 p-8 glass-panel rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                Masih Memiliki Pertanyaan Lain?
              </h3>
              <p className="text-xs text-stone-400 font-light">
                Tim narahubung kami siap membantu Anda secara langsung.
              </p>
            </div>
            <a
              href={`https://wa.me/${waContact}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full bg-[#faeed4] hover:bg-white text-[#252f27] text-xs font-bold transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              Hubungi via WhatsApp &rarr;
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
