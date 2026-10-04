import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * TopLoadingBar
 * Sleek, high-performance top progress bar that animates across
 * the top of the browser viewport on every route transition using 100% native CSS.
 */
export default function TopLoadingBar() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    setProgress(30);

    const midTimer = setTimeout(() => {
      setProgress(75);
    }, 80);

    const completeTimer = setTimeout(() => {
      setProgress(100);
    }, 220);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 400);

    return () => {
      clearTimeout(midTimer);
      clearTimeout(completeTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname, location.search]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3px] bg-transparent transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-[#faeed4] to-emerald-400 shadow-[0_0_12px_rgba(250,238,212,0.8)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
