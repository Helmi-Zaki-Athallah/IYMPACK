import React from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, Heart } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import { useInView } from 'react-intersection-observer';

const StatItem = ({ icon: Icon, value, label, prefix = "", delay }) => {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mb-4">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <div className="text-3xl font-bold text-white mb-2">
        {prefix}{count}
      </div>
      <div className="text-white/70 text-sm font-medium uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};

const StatsCounter = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const stats = [
    { icon: Users, value: 127, label: "Tim Inti", prefix: "" },
    { icon: MapPin, value: 7, label: "Wilayah", prefix: "" },
    { icon: Calendar, value: 100, label: "Aktivitas", prefix: "+" },
    { icon: Heart, value: 2500, label: "Pemuda Terdampak", prefix: "+" },
  ];

  return (
    <div className="relative z-10 -mt-16 sm:-mt-24 px-4 w-full max-w-5xl mx-auto">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="bg-primary rounded-2xl shadow-2xl p-4 sm:p-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 divide-x-0 md:divide-x divide-white/10">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              prefix={stat.prefix}
              delay={0.1 * (index + 1)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StatsCounter;
