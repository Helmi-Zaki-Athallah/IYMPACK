import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  ArrowLeft,
  Compass,
  Calendar,
  BookOpen,
  Users } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1 } } };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' } } };

  const quickLinks = [
    { to: '/', label: 'Beranda', desc: 'Kembali ke halaman utama IYMPACK', icon: Home },
    { to: '/event', label: 'Agenda Kegiatan', desc: 'Jelajahi program kerelawanan', icon: Calendar },
    { to: '/artikel', label: 'Artikel & Kabar', desc: 'Baca cerita dan liputan aksi', icon: BookOpen },
    { to: '/tentang-kami', label: 'Tentang Kami', desc: 'Profil dan visi misi yayasan', icon: Users },
  ];

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-20 px-4 sm:px-6 relative overflow-hidden bg-[#1c241e] text-stone-100">
      {/* Background Ambience & Textures */}
      <div className="absolute inset-0 bg-topo-pattern opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#819b8e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-[#faeed4]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-2xl mx-auto text-center space-y-8"
      >
        {/* Animated Badge & Compass */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#faeed4] backdrop-blur-md shadow-md">
            <Compass className="w-3.5 h-3.5 text-[#faeed4] animate-spin" style={{ animationDuration: '10s' }} />
            <span>Kode Error 404 • Halaman Tersesat</span>
          </div>
        </motion.div>

        {/* 404 Giant Typography with Float Animation */}
        <motion.div
          variants={itemVariants}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="relative select-none"
        >
          <span className="text-8xl sm:text-9xl font-black font-heading tracking-tight bg-gradient-to-b from-white via-[#faeed4] to-stone-500 bg-clip-text text-transparent drop-shadow-2xl">
            404
          </span>
          <div className="absolute -bottom-2 inset-x-0 h-8 bg-gradient-to-t from-[#1c241e] to-transparent pointer-events-none" />
        </motion.div>

        {/* Title & Description */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-white leading-snug">
            Oops! Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed font-light">
            Tampaknya alamat tautan yang Anda tuju salah, telah dipindahkan, atau tidak lagi tersedia di sistem resmi IYMPACK.
          </p>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-stone-200 text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali Sebelumnya</span>
          </button>

          <Link
            to="/"
            className="px-7 py-3 rounded-full bg-[#faeed4] hover:bg-white text-[#1c241e] text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Ke Halaman Utama</span>
          </Link>
        </motion.div>

        {/* Quick Links Grid */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">
            Atau Jelajahi Halaman Populer Ini:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="p-4 rounded-2xl bg-[#252f27]/75 hover:bg-[#252f27] border border-white/10 hover:border-[#faeed4]/40 transition-all flex items-start gap-3.5 group shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 text-[#faeed4] flex items-center justify-center shrink-0 group-hover:bg-[#faeed4] group-hover:text-[#1c241e] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#faeed4] transition-colors">
                      {link.label}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-light mt-0.5 line-clamp-1">
                      {link.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Need Help Footnote */}
        <motion.div variants={itemVariants} className="pt-2 text-center text-xs text-stone-400">
          <span>Perlu bantuan panitia? </span>
          <Link to="/kontak" className="text-[#faeed4] hover:underline font-medium">
            Hubungi Narahubung IYMPACK
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
