import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  return (
    <section 
      id="beranda"
      className="relative min-h-screen flex items-center justify-center bg-fixed bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/assets/images/hero.jpg')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-primary/70"></div>

      {/* Centered Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mt-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-accent text-sm md:text-base font-bold tracking-[0.2em] mb-4 uppercase">
            Berbagi Untuk Bersama
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-bglighter mb-6 leading-tight whitespace-pre-line"
        >
          {"Ambil Peran,\nJadi Relawan"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-bglight/90 mb-10 max-w-2xl mx-auto"
        >
          Ubah niat baik jadi aksi nyata hari ini. Bergabunglah dengan komunitas pengembangan diri dan pemberdayaan generasi muda Indonesia.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <a 
            href="#program"
            className="inline-block bg-accent text-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(197,169,130,0.5)] hover:shadow-[0_0_25px_rgba(197,169,130,0.8)]"
          >
            Cari Aktivitas
          </a>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <a href="#tentang" className="text-accent hover:text-bglighter transition-colors">
            <ChevronDown size={36} />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
