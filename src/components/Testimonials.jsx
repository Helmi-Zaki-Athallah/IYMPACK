import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Quote } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { testimonials as staticTestimonials } from '../data/testimonials';
import { useData } from '../hooks/useData.js';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Testimonials = () => {
  const { testimonials } = useData();
  const list = testimonials && testimonials.length > 0 ? testimonials : staticTestimonials;

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section id="testimonials" className="py-20 bg-primary overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-bold uppercase tracking-widest block mb-3">
            Testimoni
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Suara Komunitas Kami
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-16 testimonials-swiper"
          >
            {list.map((testimonial) => (
              <SwiperSlide key={testimonial.id} className="h-auto">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full flex flex-col relative group hover:bg-white/15 transition-colors duration-300">
                  <Quote className="absolute top-6 right-6 text-accent/20 w-12 h-12 rotate-180 transform group-hover:scale-110 group-hover:text-accent/30 transition-all duration-300" />
                  
                  <div className="flex-grow">
                    <p className="text-white text-lg italic mb-8 relative z-10 font-light leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  
                  <div className="flex items-center mt-auto border-t border-white/10 pt-6">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.author || testimonial.name}
                        className="w-12 h-12 rounded-full object-cover mr-4 shrink-0 shadow-lg border border-accent/40"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent text-primary font-bold flex items-center justify-center text-lg mr-4 shrink-0 shadow-lg">
                        {testimonial.initials || (testimonial.author || testimonial.name || 'U').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-white font-bold">{testimonial.author || testimonial.name}</h4>
                      <p className="text-white/70 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .testimonials-swiper .swiper-pagination {
          bottom: 0 !important;
        }
        .testimonials-swiper .swiper-pagination-bullet {
          background-color: rgba(255, 255, 255, 0.4);
          width: 8px;
          height: 8px;
          display: inline-block;
          border-radius: 50%;
          margin: 0 4px;
          transition: all 0.3s ease;
          opacity: 1;
        }
        .testimonials-swiper .swiper-pagination-bullet-active {
          background-color: #c5a982;
          width: 24px;
          border-radius: 4px;
        }
      `}} />
    </section>
  );
};

export default Testimonials;
