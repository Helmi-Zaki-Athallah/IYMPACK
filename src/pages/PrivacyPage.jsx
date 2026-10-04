/**
 * IYMPACK — Privacy Policy Page (Kebijakan Privasi Resmi)
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useData.js';
import { DEFAULT_PAGE_SECTIONS } from '../services/sections.service.js';

export default function PrivacyPage() {
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
          alt="Kebijakan Privasi IYMPACK"
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
            Perlindungan Data & Privasi
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            Kebijakan Privasi
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-200 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            Prinsip dan tata kelola IYMPACK dalam melindungi, menyimpan, serta mengelola data pribadi pengguna dan volunteam.
          </p>
        </div>
      </section>

      {/* ─── Content ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 text-sm text-stone-300 leading-relaxed">

          {/* Card 1: Komitmen Kami terhadap Privasi */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-semibold text-[#819b8e] uppercase tracking-wider block">
                Prinsip Perlindungan Data
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-1">
                Komitmen Kami terhadap Privasi
              </h2>
            </div>
            
            <p className="text-stone-300 font-light leading-relaxed">
              {legalContent.privacyIntro || 'IYMPACK berkomitmen untuk menjaga dan melindungi privasi setiap anggota, volunteam, mitra, serta pengguna layanan kami. Kami berupaya memberikan lingkungan yang aman, nyaman, dan terpercaya bagi seluruh pihak yang terlibat dalam kegiatan maupun platform IYMPACK. Kebijakan Privasi ini mengatur bagaimana IYMPACK mengumpulkan, menggunakan, menyimpan, melindungi, dan mengelola informasi yang diberikan oleh pengguna.'}
            </p>
            <p className="text-stone-300 font-light leading-relaxed">
              Dengan mendaftar, mengakses, atau menggunakan layanan IYMPACK, Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan dalam Kebijakan Privasi ini. Apabila Anda tidak menyetujui kebijakan ini, Anda dapat memilih untuk tidak menggunakan layanan IYMPACK.
            </p>
          </div>

          {/* Card 2: Ruang Lingkup Kebijakan Privasi */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                Ruang Lingkup Kebijakan Privasi
              </h2>
            </div>
            <p className="text-stone-300 font-light leading-relaxed">
              Kebijakan Privasi ini berlaku untuk seluruh informasi yang diberikan oleh pengguna kepada IYMPACK melalui formulir pendaftaran, kegiatan, media komunikasi, platform digital, maupun sarana lain yang dikelola oleh IYMPACK.
            </p>
            <p className="text-stone-300 font-light leading-relaxed">
              Kebijakan ini tidak berlaku terhadap situs, aplikasi, atau layanan pihak ketiga yang mungkin terhubung dengan platform IYMPACK. Pengguna disarankan untuk membaca kebijakan privasi pihak ketiga secara mandiri.
            </p>
          </div>

          {/* Card 3: Informasi yang Kami Kumpulkan */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                Informasi yang Kami Kumpulkan
              </h2>
            </div>
            <p className="text-stone-300 font-light leading-relaxed">
              Informasi yang kami kumpulkan berupa:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#faeed4] shrink-0" />
                <span className="text-stone-200 text-xs sm:text-sm">Nama Lengkap</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#faeed4] shrink-0" />
                <span className="text-stone-200 text-xs sm:text-sm">Alamat Email</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#faeed4] shrink-0" />
                <span className="text-stone-200 text-xs sm:text-sm">Nomor Telepon / WhatsApp</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#faeed4] shrink-0" />
                <span className="text-stone-200 text-xs sm:text-sm">Institusi / Organisasi Asal</span>
              </div>
            </div>
            <p className="text-stone-400 font-light text-xs pt-1">
              Serta data relevan lainnya yang diberikan secara sukarela oleh volunteam saat mengisi formulir pendaftaran kegiatan.
            </p>
          </div>

          {/* Card 4: Penggunaan Informasi */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                Penggunaan Informasi
              </h2>
              <p className="text-stone-300 font-light text-xs sm:text-sm mt-1">
                Informasi yang dikumpulkan oleh IYMPACK digunakan untuk:
              </p>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-[#faeed4] font-bold mt-0.5">&bull;</span>
                <span>Mengelola keanggotaan dan partisipasi volunteam.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#faeed4] font-bold mt-0.5">&bull;</span>
                <span>Menyampaikan informasi kegiatan, program, dan pengumuman penting.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#faeed4] font-bold mt-0.5">&bull;</span>
                <span>Memfasilitasi komunikasi antara sesama volunteam dan tim inti IYMPACK.</span>
              </li>
            </ul>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 mt-3 text-xs text-stone-300">
              IYMPACK tidak akan menggunakan informasi pribadi pengguna untuk tujuan yang bertentangan dengan kebijakan ini tanpa persetujuan pengguna.
            </div>
          </div>

          {/* Card 5: Penyimpanan dan Keamanan Data */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                Penyimpanan dan Keamanan Data
              </h2>
            </div>
            <p className="text-stone-300 font-light leading-relaxed">
              IYMPACK menerapkan langkah-langkah yang wajar untuk menjaga keamanan data pengguna dari akses, penggunaan, perubahan, atau pengungkapan yang tidak sah.
            </p>
            <p className="text-stone-300 font-light leading-relaxed">
              Meskipun demikian, tidak ada sistem keamanan yang dapat menjamin perlindungan secara mutlak. Oleh karena itu, pengguna juga bertanggung jawab untuk menjaga kerahasiaan akun dan informasi pribadinya.
            </p>
          </div>

          {/* Card 6: Pengungkapan Informasi kepada Pihak Ketiga */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                Pengungkapan Informasi kepada Pihak Ketiga
              </h2>
            </div>
            <p className="text-stone-300 font-light leading-relaxed font-semibold text-white">
              IYMPACK tidak menjual, memperdagangkan, atau menyewakan informasi pribadi pengguna kepada pihak mana pun.
            </p>
            <p className="text-stone-300 font-light leading-relaxed">
              Informasi pengguna hanya dapat dibagikan dalam kondisi berikut:
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-[#819b8e] font-bold mt-0.5">&bull;</span>
                <span>Atas persetujuan langsung dari pengguna.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#819b8e] font-bold mt-0.5">&bull;</span>
                <span>Untuk mendukung pelaksanaan program atau kegiatan yang diikuti pengguna.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#819b8e] font-bold mt-0.5">&bull;</span>
                <span>Apabila diwajibkan oleh peraturan perundang-undangan atau proses hukum yang berlaku.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#819b8e] font-bold mt-0.5">&bull;</span>
                <span>Untuk melindungi hak, keamanan, dan kepentingan IYMPACK maupun pengguna lainnya.</span>
              </li>
            </ul>
          </div>

          {/* Card 7: Dokumentasi Kegiatan & Batasan Usia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dokumentasi Kegiatan */}
            <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
              <h3 className="text-lg font-bold text-white font-heading border-b border-white/10 pb-3">
                Dokumentasi Kegiatan
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                Selama mengikuti kegiatan yang diselenggarakan oleh IYMPACK, pengguna memahami dan menyetujui bahwa foto, video, rekaman suara, maupun dokumentasi lainnya yang melibatkan dirinya dapat digunakan oleh IYMPACK untuk keperluan dokumentasi, publikasi, pelaporan, promosi, dan pengembangan organisasi.
              </p>
              <p className="text-xs text-stone-400 font-light leading-relaxed pt-1">
                Penggunaan dokumentasi akan dilakukan secara wajar serta tidak bertujuan merugikan pihak yang bersangkutan.
              </p>
            </div>

            {/* Batasan Usia */}
            <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-heading border-b border-white/10 pb-3">
                  Batasan Usia
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed mt-3">
                  <strong className="text-[#faeed4] font-semibold">Tidak ada batasan usia</strong> untuk seluruh volunteam yang ikut dalam event dan agenda kegiatan IYMPACK.
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-stone-400">
                Siapa pun dengan semangat berbagi dan belajar dapat bergabung bersama IYMPACK.
              </div>
            </div>
          </div>

          {/* Card 8: Perubahan Kebijakan Privasi */}
          <div className="bg-[#252f27] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                Perubahan Kebijakan Privasi
              </h2>
            </div>
            <p className="text-stone-300 font-light leading-relaxed">
              IYMPACK berhak untuk mengubah atau memperbarui Kebijakan Privasi ini sewaktu-waktu sesuai kebutuhan organisasi maupun perkembangan peraturan yang berlaku.
            </p>
            <p className="text-stone-300 font-light leading-relaxed">
              Setiap perubahan akan diinformasikan melalui media komunikasi resmi IYMPACK dan akan berlaku sejak tanggal dipublikasikan.
            </p>
          </div>

          {/* Card 9: Persetujuan Pengguna */}
          <div className="bg-gradient-to-br from-[#252f27] to-[#1c241e] border border-[#faeed4]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-semibold text-[#faeed4] uppercase tracking-wider block">
                Konfirmasi & Legalitas
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-1">
                Persetujuan Pengguna
              </h2>
            </div>
            <p className="text-stone-200 font-light leading-relaxed text-xs sm:text-sm">
              Dengan mendaftar sebagai anggota atau volunteam IYMPACK, serta menggunakan layanan yang disediakan, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi Kebijakan Privasi ini, termasuk pengumpulan, penggunaan, penyimpanan, dan pengelolaan data sebagaimana dijelaskan di atas.
            </p>
            <div className="pt-2">
              <Link
                to="/syarat-dan-ketentuan"
                className="text-xs text-[#faeed4] hover:text-white underline transition-colors inline-flex items-center gap-1"
              >
                Lihat juga Syarat dan Ketentuan IYMPACK &rarr;
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
