import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BookOpen, Award, HeartHandshake, Brain, ArrowRight } from 'lucide-react';
import { programs } from '../data/programs';

const iconMap = {
  BookOpen: BookOpen,
  Award: Award,
  HeartHandshake: HeartHandshake,
  Brain: Brain
};

const Programs = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="program" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-bold uppercase tracking-widest block mb-3">
            Program Kami
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Program yang Membawa Dampak
          </h2>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {programs.map((program) => {
            const IconComponent = iconMap[program.icon];
            
            return (
              <motion.div
                key={program.id}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full border border-gray-100"
              >
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                  {IconComponent && <IconComponent size={28} />}
                </div>
                
                <h3 className="text-xl font-bold text-primary mb-4">
                  {program.title}
                </h3>
                
                <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                  {program.description}
                </p>
                
                <a href="#" className="inline-flex items-center text-accent font-medium hover:text-accent/80 transition-colors mt-auto group">
                  Pelajari Selengkapnya 
                  <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Programs;
