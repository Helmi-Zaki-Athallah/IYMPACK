import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { useData } from '../hooks/useData.js';

const defaultGalleryItems = [
  { id: 1, title: 'Workshop Digital Marketing', category: 'Workshop', color: 'bg-emerald-600' },
  { id: 2, title: 'Bakti Sosial Ramadhan', category: 'Sosial', color: 'bg-amber-600' },
  { id: 3, title: 'Leadership Camp 2024', category: 'Kepemimpinan', color: 'bg-blue-600' },
  { id: 4, title: 'Mengajar di Pelosok', category: 'Relawan', color: 'bg-rose-600' },
  { id: 5, title: 'Workshop Public Speaking', category: 'Workshop', color: 'bg-teal-600' },
  { id: 6, title: 'Santunan Anak Yatim', category: 'Sosial', color: 'bg-orange-600' },
  { id: 7, title: 'Training of Trainers', category: 'Kepemimpinan', color: 'bg-indigo-600' },
  { id: 8, title: 'Beach Clean Up', category: 'Relawan', color: 'bg-cyan-600' },
];

const filters = ['Semua', 'Pendidikan', 'Kerelawanan', 'Workshop', 'Sosial', 'Lingkungan'];

const Gallery = () => {
  const { gallery } = useData();
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const items = gallery && gallery.length > 0 ? gallery : defaultGalleryItems;

  const filteredItems = activeFilter === 'Semua' 
    ? items 
    : items.filter(item => item.category?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <section id="kegiatan" className="py-20 bg-bglighter">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-accent uppercase tracking-wider font-semibold text-sm">KEGIATAN KAMI</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mt-2">Galeri Aktivitas</h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full transition-colors duration-300 ${
                activeFilter === filter 
                  ? 'bg-accent text-white' 
                  : 'bg-white text-gray-600 hover:bg-accent/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-2xl overflow-hidden aspect-[4/3] ${item.color || 'bg-[#252f27]'} shadow-md group`}
              >
                {(item.url || item.image) && (
                  <img
                    src={item.url || item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/hero-hands.png';
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary">
                  {item.category}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-white font-semibold text-xl leading-tight">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery;
