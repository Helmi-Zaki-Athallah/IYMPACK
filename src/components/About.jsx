import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';

const About = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section id="tentang" className="bg-bglight py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Column - Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2"
          >
            <div className="w-full aspect-[4/3] bg-primary/20 rounded-2xl shadow-lg flex items-center justify-center relative overflow-hidden">
              <img 
                src="/assets/logo/logotp-removebg-preview.png" 
                alt="IYMPACK Logo" 
                className="w-1/2 object-contain opacity-50"
              />
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col items-start"
          >
            <span className="text-accent uppercase tracking-widest font-semibold text-sm mb-4">
              Tentang Kami
            </span>
            <h2 className="text-primary font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
              Membangun Generasi Muda yang Berdampak
            </h2>
            <div className="text-textdark/80 text-lg space-y-4 mb-8">
              <p>
                IYMPACK adalah komunitas pengembangan diri dan pemberdayaan generasi muda yang hadir sebagai ruang untuk belajar, bertumbuh, dan berkolaborasi. Kami percaya bahwa setiap individu memiliki potensi, ide, dan kemampuan yang dapat memberikan dampak positif bagi lingkungan sekitarnya.
              </p>
              <p>
                Didirikan pada tahun 2024, kami telah menginspirasi ribuan pemuda Indonesia untuk mengambil peran aktif dalam perubahan sosial melalui berbagai program kerelawanan, pelatihan kepemimpinan, dan kegiatan sosial.
              </p>
            </div>
            
            <a 
              href="#program" 
              className="inline-flex items-center text-accent font-semibold text-lg hover:text-primary transition-colors duration-300 group"
            >
              Pelajari Selengkapnya 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
