import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { InstagramIcon as Instagram, LinkedinIcon as Linkedin, TwitterIcon as Twitter } from './SocialIcons';
import { teamData } from '../data/team';

const Team = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <span className="text-accent uppercase tracking-wider font-semibold text-sm">TIM KAMI</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mt-2">Penggerak di Balik IYMPACK</h2>
        </div>

        <motion.div 
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {teamData.map((member) => (
            <motion.div key={member.id} variants={itemVariants} className="bg-white rounded-2xl shadow-lg overflow-hidden group relative">
              <div className="h-48 bg-primary/5 flex items-center justify-center relative overflow-hidden">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-white text-2xl font-bold z-10">
                  {member.initials}
                </div>
                {/* Decorative background circle */}
                <div className="absolute w-40 h-40 bg-accent/10 rounded-full -top-10 -right-10 transition-transform duration-500 group-hover:scale-150"></div>
              </div>
              
              <div className="p-6 relative bg-white z-20">
                <h3 className="font-bold text-primary text-xl mb-1">{member.name}</h3>
                <p className="text-accent text-sm font-medium mb-4">{member.role}</p>
                <div className="flex gap-3">
                  <a href="#" className="text-accent hover:text-primary transition-colors"><Instagram size={18} /></a>
                  <a href="#" className="text-accent hover:text-primary transition-colors"><Linkedin size={18} /></a>
                  <a href="#" className="text-accent hover:text-primary transition-colors"><Twitter size={18} /></a>
                </div>
              </div>

              {/* Bio Overlay */}
              <div className="absolute inset-0 bg-primary/95 text-white p-6 flex flex-col justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-30">
                <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                <p className="text-accent text-sm mb-4">{member.role}</p>
                <p className="text-sm text-white/90 leading-relaxed">{member.bio}</p>
                <div className="flex gap-3 mt-4">
                  <a href="#" className="text-accent hover:text-white transition-colors"><Instagram size={18} /></a>
                  <a href="#" className="text-accent hover:text-white transition-colors"><Linkedin size={18} /></a>
                  <a href="#" className="text-accent hover:text-white transition-colors"><Twitter size={18} /></a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Team;
