import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { InstagramIcon as Instagram, LinkedinIcon as Linkedin, TikTokIcon as TikTok, WhatsAppIcon as WhatsApp } from './SocialIcons';
import { siteConfig } from '../data/iympackData';
import { getSiteSettings } from '../services/settings.service.js';

const Contact = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [formData, setFormData] = useState({ nama: '', email: '', subjek: '', pesan: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ nama: '', email: '', subjek: '', pesan: '' });
    }, 3000);
  };

  return (
    <section id="kontak" className="py-20 bg-bglight">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent uppercase tracking-wider font-semibold text-sm">HUBUNGI KAMI</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mt-2">Mari Berkolaborasi</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-sm relative overflow-hidden"
          >
            <AnimatePresence>
              {isSubmitted && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <CheckCircle className="text-emerald-500 w-20 h-20 mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-primary mb-2">Pesan Terkirim!</h3>
                  <p className="text-textprimary">Terima kasih, kami akan segera menghubungi Anda.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input 
                  type="text" 
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Nama Lengkap" 
                  required
                  className="w-full rounded-xl border border-gray-200 p-4 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Alamat Email" 
                  required
                  className="w-full rounded-xl border border-gray-200 p-4 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>
              <div>
                <input 
                  type="text" 
                  name="subjek"
                  value={formData.subjek}
                  onChange={handleChange}
                  placeholder="Subjek Pesan" 
                  required
                  className="w-full rounded-xl border border-gray-200 p-4 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>
              <div>
                <textarea 
                  name="pesan"
                  value={formData.pesan}
                  onChange={handleChange}
                  placeholder="Tulis pesan Anda disini..." 
                  required
                  rows="4"
                  className="w-full rounded-xl border border-gray-200 p-4 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="bg-accent text-white rounded-xl px-8 py-4 w-full font-semibold hover:bg-accent/90 transition-colors shadow-md hover:shadow-lg"
              >
                Kirim Pesan
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col gap-6 justify-center"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm flex items-start gap-4">
              <div className="bg-accent/10 p-4 rounded-full text-accent">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-1">Email</h4>
                <a href="mailto:iympack.id@gmail.com" className="text-gray-600 hover:text-accent transition-colors">
                  iympack.id@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm flex items-start gap-4">
              <div className="bg-accent/10 p-4 rounded-full text-accent">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-1">Telepon / WhatsApp</h4>
                <p className="text-gray-600">+62 812 3456 7890</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm flex items-start gap-4">
              <div className="bg-accent/10 p-4 rounded-full text-accent">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-1">Lokasi</h4>
                <p className="text-gray-600">Jakarta, Indonesia</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center gap-4 mt-2">
              <h4 className="font-semibold text-primary">Ikuti Sosial Media Kami</h4>
              <div className="flex gap-4">
                <a
                  href={getSiteSettings()?.instagram || siteConfig.socials?.instagram || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-primary/5 p-3 rounded-full text-primary hover:bg-accent hover:text-white transition-all"
                  title="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href={getSiteSettings()?.linkedin || siteConfig.socials?.linkedin || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-primary/5 p-3 rounded-full text-primary hover:bg-accent hover:text-white transition-all"
                  title="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href={getSiteSettings()?.tiktok || siteConfig.socials?.tiktok || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-primary/5 p-3 rounded-full text-primary hover:bg-accent hover:text-white transition-all"
                  title="TikTok"
                >
                  <TikTok size={20} />
                </a>
                <a
                  href={getSiteSettings()?.whatsappCommunity || siteConfig.socials?.whatsappCommunity || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-primary/5 p-3 rounded-full text-primary hover:bg-accent hover:text-white transition-all"
                  title="Komunitas WhatsApp"
                >
                  <WhatsApp size={20} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
