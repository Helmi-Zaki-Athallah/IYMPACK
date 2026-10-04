/**
 * IYMPACK — Contact Page
 * Matches user's exact reference layout:
 * - Top: 3 Glowing Dark Cards (Phone, Email, Head Office)
 * - Middle: Wide Google Maps Embed
 * - Bottom: Contact Form & FAQ
 */

import React, { useState, useMemo } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { siteConfig, faqList } from '../data/iympackData';
import { getSiteSettings } from '../services/settings.service.js';
import { useModal } from '../hooks/useModal.js';
import { validateEmail } from '../lib/utils.js';
import { sanitizeText } from '../lib/security.js';

export default function ContactPage() {
  const { showToast } = useModal();
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const settings = useMemo(() => {
    const s = getSiteSettings();
    return { ...siteConfig, ...s };
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = sanitizeText(formData.name, 100);
    const cleanEmail = sanitizeText(formData.email, 120).toLowerCase().trim();
    const cleanSubject = sanitizeText(formData.subject, 150);
    const cleanMessage = sanitizeText(formData.message, 2500);

    if (!cleanName || cleanName.length < 2) {
      showToast('Nama wajib diisi (minimal 2 karakter).');
      return;
    }
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      showToast('Format email tidak valid.');
      return;
    }
    if (!cleanSubject || cleanSubject.length < 3) {
      showToast('Subjek wajib diisi (minimal 3 karakter).');
      return;
    }
    if (!cleanMessage || cleanMessage.length < 5) {
      showToast('Pesan wajib diisi (minimal 5 karakter).');
      return;
    }

    showToast(`Pesan terkirim! Terima kasih ${cleanName}, tim kami akan segera merespons.`);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactPhone = settings.whatsapp || settings.contactPhone || settings.phone || '+62 812-3456-7890';
  const contactEmail = settings.email || 'iympack.id@gmail.com';
  const contactAddress = settings.address || 'Jl. Pelita 2 No. 32 Tonjong, Tajur Halang, Bogor, Indonesia';

  const mapsEmbedSrc = useMemo(() => {
    if (settings.mapsEmbedUrl && settings.mapsEmbedUrl.trim()) {
      let url = settings.mapsEmbedUrl.trim();
      const match = url.match(/src=["'](.*?)["']/);
      if (match && match[1]) url = match[1];
      return url;
    }
    const q = encodeURIComponent(contactAddress || 'Jl. Pelita 2 No. 32 Tonjong, Tajur Halang, Bogor, Indonesia');
    return `https://maps.google.com/maps?q=${q}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }, [settings.mapsEmbedUrl, contactAddress]);

  return (
    <div className="w-full bg-[#1c241e] text-stone-100 pb-24 relative overflow-hidden">
      {/* Topo Texture & Ambient glow decoration */}
      <div className="absolute inset-0 bg-topo-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Header ───────────────────────────────────── */}
      <section className="relative text-white pt-28 sm:pt-32 pb-16 sm:pb-20 border-b border-white/10 overflow-hidden bg-[#1c241e]">
        <img
          src="/hero-hands.webp"
          alt="Kontak & Sekretariat"
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
            Hubungi Kami
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            Kontak & Sekretariat
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-200 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            Punya gagasan kolaborasi atau pertanyaan seputar program IYMPACK? Tim kami siap berdiskusi dengan Anda.
          </p>
        </div>
      </section>

      {/* ─── 3 Contact Cards & Google Maps Section ─────── */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
          
          {/* 3 Glowing Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Phone */}
            <a
              href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden rounded-3xl bg-[#121914] border border-white/10 p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl group hover:border-[#d8a76d]/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
            >
              {/* Radial Glowing Ambient */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#d8a76d]/20 rounded-full blur-3xl group-hover:bg-[#d8a76d]/30 transition-all pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#819b8e]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-[#d8a76d]/15 border border-[#d8a76d]/30 flex items-center justify-center text-[#d8a76d] shadow-lg group-hover:scale-110 group-hover:bg-[#d8a76d] group-hover:text-[#1c241e] transition-all">
                <Phone className="w-7 h-7" />
              </div>

              <div className="space-y-1.5 relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white group-hover:text-[#faeed4] transition-colors">
                  Phone
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 font-medium">
                  {contactPhone}
                </p>
              </div>
            </a>

            {/* Card 2: Email */}
            <a
              href={`mailto:${contactEmail}`}
              className="relative overflow-hidden rounded-3xl bg-[#121914] border border-white/10 p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl group hover:border-[#d8a76d]/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
            >
              {/* Radial Glowing Ambient */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#d8a76d]/20 rounded-full blur-3xl group-hover:bg-[#d8a76d]/30 transition-all pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#819b8e]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-[#d8a76d]/15 border border-[#d8a76d]/30 flex items-center justify-center text-[#d8a76d] shadow-lg group-hover:scale-110 group-hover:bg-[#d8a76d] group-hover:text-[#1c241e] transition-all">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-1.5 relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white group-hover:text-[#faeed4] transition-colors">
                  Email
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 font-medium">
                  {contactEmail}
                </p>
              </div>
            </a>

            {/* Card 3: Head Office */}
            <div className="relative overflow-hidden rounded-3xl bg-[#121914] border border-white/10 p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl group hover:border-[#d8a76d]/60 hover:-translate-y-1.5 transition-all duration-300">
              {/* Radial Glowing Ambient */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#d8a76d]/20 rounded-full blur-3xl group-hover:bg-[#d8a76d]/30 transition-all pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#819b8e]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-[#d8a76d]/15 border border-[#d8a76d]/30 flex items-center justify-center text-[#d8a76d] shadow-lg group-hover:scale-110 group-hover:bg-[#d8a76d] group-hover:text-[#1c241e] transition-all">
                <MapPin className="w-7 h-7" />
              </div>

              <div className="space-y-1.5 relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white group-hover:text-[#faeed4] transition-colors">
                  Head Office
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 font-medium max-w-[260px]">
                  {contactAddress}
                </p>
              </div>
            </div>

          </div>

          {/* Wide Google Maps Embed */}
          <div className="rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#121914] relative h-[360px] sm:h-[450px] lg:h-[480px]">
            <iframe
              title="Google Maps Sekretariat IYMPACK"
              src={mapsEmbedSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full filter contrast-[1.05] brightness-[0.95]"
            />
          </div>

        </div>
      </section>

      {/* ─── Contact Form & Messaging ─────────────────── */}
      <section className="py-16 sm:py-20 bg-[#222d25] border-t border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#819b8e] font-heading">Formulir Pesan</p>
            <h2 className="text-2xl sm:text-4xl font-bold font-heading text-white">
              Kirim Pesan Langsung
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto font-light">
              Sampaikan penawaran kolaborasi, kemitraan program, atau pertanyaan kepada pengurus kami.
            </p>
          </div>

          <div className="bg-[#1c241e] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-300">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama Lengkap Anda"
                    className="w-full px-4 py-3 border border-white/15 rounded-2xl text-xs sm:text-sm bg-[#252f27] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-300">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3 border border-white/15 rounded-2xl text-xs sm:text-sm bg-[#252f27] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300">Subjek Pesan</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Topik atau tujuan pesan..."
                  className="w-full px-4 py-3 border border-white/15 rounded-2xl text-xs sm:text-sm bg-[#252f27] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300">Pesan Lengkap</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tuliskan detail pesan Anda di sini..."
                  className="w-full px-4 py-3 border border-white/15 rounded-2xl text-xs sm:text-sm bg-[#252f27] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#faeed4] resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#faeed4] hover:bg-white text-[#252f27] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pesan Sekarang</span>
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* ─── FAQ Section ─────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-20 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#819b8e] font-heading">Pertanyaan Umum</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Frequently Asked Questions (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {faqList.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#252f27] rounded-2xl border border-white/10 overflow-hidden shadow-md"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 font-semibold text-sm sm:text-base text-white hover:text-[#faeed4] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-base font-bold text-[#faeed4]">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-stone-300 leading-relaxed border-t border-white/10 pt-3.5 font-light whitespace-pre-line">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
