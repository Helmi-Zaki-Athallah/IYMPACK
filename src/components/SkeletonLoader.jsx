import React from 'react';
import { motion } from 'framer-motion';

/**
 * SkeletonCard
 * Modern shimmer skeleton card for content placeholders.
 */
export function SkeletonCard({ dark = true, count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`rounded-3xl overflow-hidden border p-5 space-y-4 ${
            dark
              ? 'bg-[#252f27]/60 border-white/10'
              : 'bg-white/80 border-slate-200/80 shadow-xs'
          }`}
        >
          {/* Shimmering Image Box */}
          <div
            className={`w-full aspect-[16/10] rounded-2xl relative overflow-hidden ${
              dark ? 'bg-white/5' : 'bg-slate-200/60'
            }`}
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
          </div>

          {/* Shimmering Text Lines */}
          <div className="space-y-2.5 pt-2">
            <div
              className={`h-4 w-1/3 rounded-full relative overflow-hidden ${
                dark ? 'bg-white/10' : 'bg-slate-200'
              }`}
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
            </div>
            <div
              className={`h-6 w-4/5 rounded-full relative overflow-hidden ${
                dark ? 'bg-white/10' : 'bg-slate-200'
              }`}
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
            </div>
            <div
              className={`h-3.5 w-full rounded-full relative overflow-hidden ${
                dark ? 'bg-white/5' : 'bg-slate-100'
              }`}
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonCard;
