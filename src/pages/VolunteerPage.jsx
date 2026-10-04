/**
 * IYMPACK — Volunteer Portal Page (Minimalist Edition: No Icons, No Tags)
 */

import React, { useState, useMemo } from 'react';
import { useModal } from '../hooks/useModal.js';
import { useData } from '../hooks/useData.js';
import { DEFAULT_PAGE_SECTIONS } from '../services/sections.service.js';

export default function VolunteerPage() {
  const { showToast } = useModal();
  const { pageSections, siteSettings } = useData();
  const volunteerContent = useMemo(() => pageSections?.volunteer || DEFAULT_PAGE_SECTIONS.volunteer, [pageSections]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    division: 'pengajaran',
    motivation: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast(`Terima kasih, ${formData.name}! Formulir pendaftaran relawan IYMPACK telah kami terima.`);
    setFormData({ name: '', email: '', phone: '', city: '', division: 'pengajaran', motivation: '' });
  };

  const activeDivisions = useMemo(() => {
    return volunteerContent.divisions && volunteerContent.divisions.length > 0
      ? volunteerContent.divisions
      : DEFAULT_PAGE_SECTIONS.volunteer.divisions;
  }, [volunteerContent]);

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 pb-24 relative overflow-hidden">
      {/* Topo Texture & Ambient glow decoration */}
      <div className="absolute inset-0 bg-topo-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Banner ───────────────────────────────────── */}
      <section className="relative text-white pt-28 sm:pt-32 pb-16 sm:pb-20 border-b border-white/10 overflow-hidden bg-[#1c241e]">
        <img
          src={(volunteerContent.banner?.imageUrl || siteSettings?.heroBannerUrl || '/hero-hands.webp').replace(/^\/hero-hands\.png$/, '/hero-hands.webp')}
          alt="Portal Relawan IYMPACK"
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
            {volunteerContent.banner?.tag || 'Pemberdayaan Pemuda'}
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            {volunteerContent.banner?.title || 'Portal Relawan IYMPACK'}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-200 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            {volunteerContent.banner?.desc || 'Jadilah bagian dari jejaring pemuda Indonesia yang mendedikasikan energi positif dan kepedulian untuk sesama.'}
          </p>
        </div>
      </section>

      {/* ─── Main Content ─────────────────────────────── */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Divisi Pilihan (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#819b8e] font-heading">
                {volunteerContent.divisionsHeader?.subtitle || 'Bidang Kontribusi'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                {volunteerContent.divisionsHeader?.title || 'Pilih Peran Sesuai Minat & Keahlian Anda'}
              </h2>
            </div>

            <div className="space-y-4">
              {activeDivisions.map((div) => (
                <div key={div.id} className="glass-card bg-[#252f27]/75 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 space-y-2 shadow-lg">
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading">{div.title}</h3>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">{div.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Registration Form (6 cols) */}
          <div className="lg:col-span-6 sticky top-24">
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white font-heading">
                  Formulir Relawan Umum
                </h3>
                <p className="text-xs text-stone-400 font-light">
                  Daftarkan diri Anda untuk masuk ke dalam database relawan IYMPACK.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama lengkap Anda"
                    className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">Nomor WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">Domisili / Kota *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Contoh: Bandung"
                      className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">Pilihan Divisi *</label>
                    <select
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white focus:outline-none focus:border-[#faeed4] cursor-pointer"
                    >
                      {divisions.map((d) => (
                        <option key={d.id} value={d.id} className="bg-[#252f27]">{d.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">Motivasi Bergabung</label>
                  <textarea
                    rows={3}
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Ceritakan latar belakang atau harapan Anda..."
                    className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl text-sm sm:text-xs bg-[#1c241e] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#faeed4] hover:bg-white text-[#252f27] font-bold text-xs transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                >
                  Kirim Formulir Relawan &rarr;
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
