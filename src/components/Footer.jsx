/**
 * IYMPACK — Footer Component (Modern Community & Landscape Style - Bahasa Indonesia)
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../data/iympackData';
import { getSiteSettings } from '../services/settings.service.js';

// Clean SVG Brand Icons matching the reference style
const LinkedInIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.02 2.94.01 5.88-.02 8.82-.09 2.06-.89 4.11-2.34 5.59-1.92 2.02-4.78 2.87-7.51 2.37-2.67-.44-5.06-2.28-6.12-4.78-1.18-2.67-.73-5.94 1.13-8.17 1.77-2.18 4.67-3.15 7.42-2.48.01 1.44-.01 2.89.01 4.33-.87-.27-1.85-.23-2.69.13-.99.4-1.77 1.25-2.09 2.28-.39 1.2-.18 2.59.56 3.59.73.99 1.95 1.53 3.19 1.46 1.29-.03 2.5-.78 2.99-1.97.28-.65.34-1.37.34-2.08V.02h2.78z"/>
  </svg>
);

const WhatsAppIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.04 7.61C8.86 7.61 8.56 7.68 8.31 7.95C8.06 8.22 7.36 8.88 7.36 10.22C7.36 11.56 8.34 12.85 8.47 13.03C8.61 13.21 10.36 15.91 13.05 17.07C15.28 18.04 15.74 17.84 16.22 17.8C16.71 17.75 17.79 17.16 18.01 16.53C18.24 15.91 18.24 15.37 18.17 15.26C18.1 15.15 17.92 15.08 17.65 14.95C17.38 14.81 16.05 14.16 15.8 14.07C15.56 13.98 15.38 13.93 15.2 14.2C15.02 14.47 14.51 15.08 14.35 15.26C14.2 15.44 14.05 15.46 13.78 15.33C13.51 15.19 12.64 14.91 11.6 13.99C10.79 13.27 10.24 12.38 10.08 12.11C9.93 11.84 10.06 11.69 10.2 11.56C10.32 11.44 10.47 11.25 10.61 11.09C10.74 10.93 10.79 10.82 10.88 10.64C10.97 10.46 10.92 10.3 10.86 10.17C10.79 10.03 10.25 8.71 10.02 8.17C9.8 7.64 9.58 7.71 9.41 7.7C9.26 7.7 9.08 7.69 8.9 7.69L9.04 7.61Z"/>
  </svg>
);

export default function Footer() {
  const settings = useMemo(() => {
    const s = getSiteSettings();
    return {
      ...siteConfig,
      ...s,
      socials: {
        whatsappCommunity: s.whatsappCommunity || siteConfig.socials?.whatsappCommunity,
        whatsapp: s.whatsapp || siteConfig.whatsapp,
        instagram: s.instagram || siteConfig.socials?.instagram,
        linkedin: s.linkedin || siteConfig.socials?.linkedin,
        tiktok: s.tiktok || siteConfig.socials?.tiktok || 'https://tiktok.com/@iympack',
      },
    };
  }, []);

  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: LinkedInIcon,
      url: settings.socials.linkedin || 'https://linkedin.com/company/iympack',
    },
    {
      name: 'Instagram',
      icon: InstagramIcon,
      url: settings.socials.instagram || 'https://instagram.com/iympack',
    },
    {
      name: 'TikTok',
      icon: TikTokIcon,
      url: settings.socials.tiktok || 'https://tiktok.com/@iympack',
    },
    {
      name: 'Komunitas WA',
      icon: WhatsAppIcon,
      url: settings.socials.whatsappCommunity || `https://wa.me/${(settings.socials.whatsapp || '6281234567890').replace(/[^0-9]/g, '')}`,
    },
  ];

  return (
    <footer className="relative bg-[#1c241e] text-stone-300 pt-20 pb-10 border-t border-white/10 overflow-hidden select-none">
      
      {/* ─── Background Landscape Silhouettes & Ambient Glow ─── */}
      <div className="absolute inset-0 bg-radial-mesh pointer-events-none opacity-40" />
      <div className="absolute -bottom-10 inset-x-0 h-72 opacity-15 pointer-events-none bg-repeat-x bg-bottom [background-image:radial-gradient(ellipse_at_bottom,rgba(129,155,142,0.3)_0%,transparent_70%)]" />
      
      {/* SVG Forest Trees Silhouette at the bottom (Matching Reference Image) */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none opacity-20 flex justify-between overflow-hidden">
        <svg className="w-full h-40 text-[#819b8e]" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,120 L0,80 L30,40 L60,80 L90,30 L120,80 L160,20 L200,90 L240,40 L280,100 L320,35 L360,95 L400,15 L440,85 L480,45 L520,105 L560,30 L600,90 L640,25 L680,85 L720,40 L760,100 L800,20 L840,80 L880,35 L920,95 L960,15 L1000,85 L1040,40 L1080,90 L1120,30 L1160,80 L1200,50 L1200,120 Z" opacity="0.6" />
          <path d="M0,120 L0,90 L40,60 L80,100 L130,50 L180,105 L220,55 L270,110 L310,65 L360,115 L410,45 L460,100 L510,60 L570,110 L620,50 L670,105 L730,55 L780,115 L830,45 L880,100 L930,60 L990,110 L1040,50 L1090,105 L1140,65 L1200,90 L1200,120 Z" opacity="0.9" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10 space-y-16">
        
        {/* ─── 1. TOP SECTION: Gabung Komunitas Kami & Circular Social Icons ─── */}
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight">
            Gabung Komunitas Kami
          </h2>

          {/* Circular Social Channel Buttons (LinkedIn, Instagram, TikTok, Komunitas WA) */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/20 bg-white/5 group-hover:bg-[#faeed4] group-hover:border-[#faeed4] group-hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-md">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:text-[#252f27] transition-colors duration-300" />
                  </div>
                  <span className="text-xs sm:text-sm text-stone-300 group-hover:text-white font-medium transition-colors">
                    {social.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* ─── Horizontal Divider ─── */}
        <div className="w-full border-t border-white/15" />

        {/* ─── 2. MIDDLE SECTION: Brand Info & Links Columns ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start justify-between">
          
          {/* Brand Logo & Address (Left - 6 cols) */}
          <div className="md:col-span-6 flex items-start gap-4 sm:gap-5">
            <Link to="/" className="shrink-0 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#252f27] border border-white/20 p-2.5 flex items-center justify-center shadow-lg group-hover:border-[#faeed4] group-hover:scale-105 transition-all">
                <img
                  src="/assets/logo/logotp-removebg-preview.webp"
                  alt="Logo IYMPACK"
                  loading="lazy"
                  decoding="async"
                  width="48"
                  height="48"
                  className="w-full h-full object-contain brightness-110"
                  onError={(e) => {
                    e.target.src = "/iympack-logo.webp";
                  }}
                />
              </div>
            </Link>
            <div className="space-y-1.5 pt-0.5">
              <h3 className="text-base sm:text-lg font-bold text-white font-heading leading-tight">
                {settings.orgName || 'IYMPACK'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light max-w-sm">
                {settings.address || 'Tajur Halang, Kab. Bogor, Jawa Barat, Indonesia'}
              </p>
              <p className="text-xs text-[#819b8e] font-medium pt-1">
                {settings.email || 'halo@iympack.org'}
              </p>
            </div>
          </div>

          {/* Navigation Links (Right - 6 cols) */}
          <div className="md:col-span-6 grid grid-cols-2 gap-8 text-xs sm:text-sm">
            {/* Column 1 */}
            <div className="space-y-3 font-light">
              <p><Link to="/" className="hover:text-white transition-colors">Beranda</Link></p>
              <p><Link to="/tentang-kami" className="hover:text-white transition-colors">Tentang Kami</Link></p>
              <p><Link to="/kontak" className="hover:text-white transition-colors">Kontak & Lokasi</Link></p>
              <p><Link to="/berita" className="hover:text-white transition-colors">Berita & Artikel</Link></p>
              <p><Link to="/faq" className="hover:text-white transition-colors">Pertanyaan Umum (FAQ)</Link></p>
            </div>

            {/* Column 2 */}
            <div className="space-y-3 font-light">
              <p><Link to="/event" className="hover:text-white transition-colors">Agenda Kegiatan</Link></p>
              <p><Link to="/event" className="hover:text-white transition-colors">Penyaluran Donasi</Link></p>
              <p><Link to="/relawan" className="hover:text-white transition-colors">Portal Relawan</Link></p>
              <p><Link to="/tentang-kami" className="hover:text-white transition-colors">Tim Pengurus</Link></p>
            </div>
          </div>

        </div>

        {/* ─── Bottom Bar: Copyright & Attribution & Legal Policies ─── */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-400 font-light">
          <p>
            &copy; {new Date().getFullYear()} {settings.orgName || 'IYMPACK'}. Seluruh hak cipta dilindungi. Didesain oleh{' '}
            <a
              href="https://zcode.agency"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#faeed4] hover:underline font-medium transition-colors"
            >
              zcode.agency
            </a>
          </p>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/kebijakan-privasi" className="hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/syarat-dan-ketentuan" className="hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
