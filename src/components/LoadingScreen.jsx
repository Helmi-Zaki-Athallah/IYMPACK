import React from 'react';

/**
 * LoadingScreen
 * Elegant animated loader featuring the IYMPACK logo, glowing concentric rings,
 * and pulsing typography. Supports both dark (public) and light (admin) themes with 100% native CSS.
 *
 * @param {Object} props
 * @param {string} [props.message='Memuat data...'] - Loading text to display
 * @param {boolean} [props.fullScreen=false] - Whether to render full viewport height
 * @param {boolean} [props.dark=true] - Dark mode (for public pages) or Light mode (for admin)
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Scale of the loader
 */
export default function LoadingScreen({
  message = 'Memuat data...',
  fullScreen = false,
  dark = true,
  size = 'md',
}) {
  const sizeMap = {
    sm: { box: 'w-16 h-16', logo: 'w-10 h-10', text: 'text-xs' },
    md: { box: 'w-24 h-24', logo: 'w-14 h-14', text: 'text-sm' },
    lg: { box: 'w-32 h-32', logo: 'w-20 h-20', text: 'text-base' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const containerBg = fullScreen
    ? dark
      ? 'fixed inset-0 z-50 bg-[#1c241e] text-stone-100 flex flex-col items-center justify-center'
      : 'fixed inset-0 z-50 bg-slate-50 text-slate-800 flex flex-col items-center justify-center'
    : dark
    ? 'min-h-[50vh] bg-transparent text-stone-100 flex flex-col items-center justify-center'
    : 'min-h-[50vh] bg-transparent text-slate-800 flex flex-col items-center justify-center';

  return (
    <div className={`p-6 w-full ${containerBg}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Gradient Ring */}
        <div
          className={`${currentSize.box} rounded-full p-[2px] bg-gradient-to-tr from-transparent via-[#faeed4] to-emerald-500/80 shadow-lg animate-spin [animation-duration:2.2s]`}
        >
          <div
            className={`w-full h-full rounded-full ${
              dark ? 'bg-[#1c241e]' : 'bg-white'
            }`}
          />
        </div>

        {/* Ambient Pulsing Glow behind Logo */}
        <div
          className={`absolute ${currentSize.box} rounded-full bg-emerald-500/20 blur-xl pointer-events-none animate-pulse`}
        />

        {/* Logo in Center (Full Circle Badge) */}
        <div
          className={`absolute flex items-center justify-center ${currentSize.logo} rounded-full aspect-square overflow-hidden ${
            dark ? 'bg-white shadow-[0_0_25px_rgba(250,238,212,0.35)]' : 'bg-white shadow-md'
          } p-2 border-2 ${
            dark ? 'border-[#faeed4]/40' : 'border-emerald-500/25'
          }`}
        >
          <img
            src="/assets/logo/logo-iympack.png"
            onError={(e) => {
              e.currentTarget.src = '/assets/logo/logotp-removebg-preview.png';
            }}
            alt="IYMPACK"
            width="80"
            height="80"
            className="w-full h-full object-contain rounded-full select-none"
          />
        </div>
      </div>

      {/* Loading Message with Animated Typing/Pulse Dots */}
      <div className="mt-5 flex flex-col items-center gap-1.5">
        <p
          className={`${currentSize.text} font-semibold font-heading tracking-wide ${
            dark ? 'text-stone-300' : 'text-slate-700'
          }`}
        >
          {message}
        </p>

        {/* 3 Animated Bouncing Dots */}
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${dark ? 'bg-[#faeed4]' : 'bg-emerald-600'}`} />
          <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${dark ? 'bg-[#faeed4]' : 'bg-emerald-600'}`} />
          <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${dark ? 'bg-[#faeed4]' : 'bg-emerald-600'}`} />
        </div>
      </div>
    </div>
  );
}
