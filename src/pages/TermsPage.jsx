/**
 * IYMPACK — Terms of Service Page (Syarat dan Ketentuan Resmi)
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useData.js';
import { DEFAULT_PAGE_SECTIONS } from '../services/sections.service.js';

export default function TermsPage() {
  const { pageSections } = useData();
  const legalContent = useMemo(() => pageSections?.legal || DEFAULT_PAGE_SECTIONS.legal, [pageSections]);

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
          src="/hero-hands.webp"
          alt="Syarat dan Ketentuan IYMPACK"
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
            Regulasi & Pedoman
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            Syarat dan Ketentuan
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-200 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            Panduan resmi hak, kewajiban, dan ketentuan partisipasi seluruh anggota dan volunteam IYMPACK.
          </p>
        </div>
      </section>

      {/* ─── Content ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 text-sm text-stone-300 leading-relaxed">
          
          {/* Card 1: Pendahuluan */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-semibold text-[#819b8e] uppercase tracking-wider block">
                Ketentuan Layanan Platform
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-1">
                Syarat dan Ketentuan
              </h2>
            </div>
            
            <p className="text-stone-300 font-light leading-relaxed">
              {legalContent.termsIntro || 'IYMPACK berkomitmen untuk melindungi privasi pengguna serta berupaya memberikan pengalaman yang aman, nyaman, dan bermanfaat bagi seluruh anggota dan volunteam. Syarat dan Ketentuan ini (“Syarat dan Ketentuan”) mengatur penggunaan platform, layanan, serta seluruh aktivitas yang dilakukan melalui website IYMPACK.'}
            </p>
            <p className="text-stone-300 font-light leading-relaxed">
              Harap diperhatikan bahwa penggunaan platform dan layanan IYMPACK juga tunduk pada{' '}
              <Link to="/kebijakan-privasi" className="text-[#faeed4] underline hover:text-white transition-colors">
                Kebijakan Privasi
              </Link>{' '}
              yang dapat diakses melalui situs atau media resmi IYMPACK.
            </p>
            <p className="text-stone-300 font-light leading-relaxed">
              Dengan mengakses, mendaftar, dan menggunakan layanan IYMPACK, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan serta Kebijakan Privasi yang berlaku. Apabila Anda tidak menyetujui sebagian atau seluruh ketentuan tersebut, Anda tidak diperkenankan untuk mengakses atau menggunakan layanan IYMPACK. IYMPACK berhak untuk membatasi, menangguhkan, atau menghentikan akses pengguna apabila ditemukan pelanggaran terhadap Syarat dan Ketentuan, Kebijakan Privasi, atau ketentuan lain yang ditetapkan oleh IYMPACK.
            </p>
          </div>

          {/* Card 2: Tanggung Jawab Volunteam */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                Tanggung Jawab Volunteam
              </h2>
            </div>
            <p className="text-stone-300 font-light leading-relaxed">
              Sebagai volunteam IYMPACK, Anda bertanggung jawab penuh atas seluruh tindakan, perilaku, dan aktivitas yang dilakukan selama mengikuti program, kegiatan, maupun interaksi yang berlangsung di lingkungan IYMPACK, baik secara daring maupun luring.
            </p>
            <p className="text-stone-300 font-light leading-relaxed">
              Setiap volunteam wajib menjaga sikap, perilaku, dan komunikasi yang baik selama mengikuti kegiatan. Volunteam juga wajib menghormati sesama volunteam, pengurus, maupun pihak lain yang terlibat dalam kegiatan IYMPACK. IYMPACK tidak bertanggung jawab atas tindakan pribadi volunteam di luar ruang lingkup kegiatan resmi maupun atas konsekuensi yang timbul akibat pelanggaran yang dilakukan oleh volunteam.
            </p>
          </div>

          {/* Card 3: Kesepakatan IYMPACK dan Volunteam */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                Kesepakatan IYMPACK dan Volunteam
              </h2>
              <p className="text-stone-300 font-light text-xs sm:text-sm mt-1">
                Dengan mendaftarkan diri dan bergabung sebagai volunteam IYMPACK, kedua belah pihak sepakat untuk menjalankan kerja sama berdasarkan prinsip saling menghormati, profesionalisme, tanggung jawab, dan integritas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Kewajiban Volunteam */}
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <h3 className="text-base font-bold text-[#faeed4] flex items-center gap-2">
                  <span>Kewajiban Volunteam</span>
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#faeed4] font-bold mt-0.5">&bull;</span>
                    <span>Mematuhi seluruh peraturan, kebijakan, dan kode etik yang berlaku di IYMPACK.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#faeed4] font-bold mt-0.5">&bull;</span>
                    <span>Melaksanakan tugas dan tanggung jawab yang telah disepakati dengan penuh komitmen.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#faeed4] font-bold mt-0.5">&bull;</span>
                    <span>Menjaga kerahasiaan informasi internal organisasi yang tidak diperuntukkan untuk publik.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#faeed4] font-bold mt-0.5">&bull;</span>
                    <span>Menjaga nama baik IYMPACK dan tidak melakukan tindakan yang dapat merugikan organisasi maupun pihak lain.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#faeed4] font-bold mt-0.5">&bull;</span>
                    <span>Berpartisipasi secara aktif dan bertanggung jawab dalam kegiatan yang diikuti.</span>
                  </li>
                </ul>
              </div>

              {/* Kewajiban IYMPACK */}
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <h3 className="text-base font-bold text-[#819b8e] flex items-center gap-2">
                  <span>Kewajiban IYMPACK</span>
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#819b8e] font-bold mt-0.5">&bull;</span>
                    <span>Memberikan informasi yang jelas mengenai program, kegiatan, dan tugas volunteam.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#819b8e] font-bold mt-0.5">&bull;</span>
                    <span>Menyediakan lingkungan kegiatan yang aman, nyaman, inklusif, dan mendukung pengembangan diri volunteam.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#819b8e] font-bold mt-0.5">&bull;</span>
                    <span>Memberikan arahan, koordinasi, dan pendampingan yang diperlukan selama kegiatan berlangsung.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#819b8e] font-bold mt-0.5">&bull;</span>
                    <span>Menghargai hak dan kontribusi relawan serta memperlakukan seluruh volunteam secara adil tanpa diskriminasi.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 4: Ketentuan Umum */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                Ketentuan Umum
              </h2>
            </div>
            
            <ul className="space-y-3 text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-[#faeed4] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">1</span>
                <span>Keikutsertaan dalam IYMPACK bersifat sukarela dan tidak menimbulkan hubungan kerja maupun kewajiban pemberian upah, kecuali ditentukan lain dalam program tertentu.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-[#faeed4] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">2</span>
                <span>Volunteam berhak mengundurkan diri dengan memberikan pemberitahuan kepada pihak IYMPACK sesuai prosedur yang berlaku.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-[#faeed4] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">3</span>
                <span>IYMPACK berhak menangguhkan atau menghentikan keanggotaan volunteam apabila terbukti melakukan pelanggaran terhadap peraturan, kode etik, atau ketentuan yang berlaku.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-[#faeed4] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">4</span>
                <span>Foto, video, maupun dokumentasi lain yang dihasilkan selama kegiatan IYMPACK dapat digunakan untuk kebutuhan dokumentasi, pelaporan, promosi, dan publikasi organisasi dengan tetap memperhatikan etika dan privasi volunteam.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-[#faeed4] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">5</span>
                <span>Segala bentuk perselisihan yang timbul akan diselesaikan secara musyawarah dan kekeluargaan sesuai nilai-nilai yang dijunjung oleh IYMPACK.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
}
