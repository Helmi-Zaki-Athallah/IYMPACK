import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { siteConfig } from '../data/iympackData.js';
import { getSiteSettings } from '../services/settings.service.js';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock background body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCaraKerjaActive = ['/faq', '/syarat-dan-ketentuan', '/kebijakan-privasi'].includes(location.pathname);

  const settings = useMemo(() => {
    const s = getSiteSettings();
    return { ...siteConfig, ...s };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 transition-all duration-300 ease-out transform ${
          isScrolled || mobileMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto pointer-events-auto">
          <nav aria-label="Navigasi Utama Situs" className="w-full flex items-center justify-between text-white pointer-events-auto rounded-full bg-[#252f27]/90 backdrop-blur-xl border border-[#819b8e]/30 shadow-2xl px-5 sm:px-8 py-2.5 sm:py-3 transition-all duration-300">
            
            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center gap-3 group cursor-pointer pointer-events-auto">
              <img 
                src="/assets/logo/logotp-removebg-preview.webp" 
                alt="Logo IYMPACK" 
                width="48"
                height="48"
                decoding="async"
                className="h-10 sm:h-12 md:h-13 w-auto object-contain brightness-110 drop-shadow-md"
                onError={(e) => {
                  e.target.src = "/iympack-logo.webp";
                }}
              />
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white font-heading leading-tight">
                  {settings.orgName || 'IYMPACK'}
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-300 tracking-wider hidden sm:block">
                  {settings.slogan || 'Berbagi Untuk Bersama'}
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <ul className="hidden lg:flex items-center gap-8 text-xs font-medium tracking-wide text-gray-200 pointer-events-auto">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `transition-colors py-1 cursor-pointer ${isActive ? 'text-white font-bold border-b border-white' : 'hover:text-white text-gray-200'}`
                  }
                >
                  Beranda
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/event"
                  className={({ isActive }) =>
                    `transition-colors py-1 cursor-pointer ${isActive ? 'text-white font-bold border-b border-white' : 'hover:text-white text-gray-200'}`
                  }
                >
                  Kegiatan
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/berita"
                  className={({ isActive }) =>
                    `transition-colors py-1 cursor-pointer ${isActive ? 'text-white font-bold border-b border-white' : 'hover:text-white text-gray-200'}`
                  }
                >
                  Berita
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/tentang-kami"
                  className={({ isActive }) =>
                    `transition-colors py-1 cursor-pointer ${isActive ? 'text-white font-bold border-b border-white' : 'hover:text-white text-gray-200'}`
                  }
                >
                  Tentang Kami
                </NavLink>
              </li>

              {/* Dropdown Menu Cara Kerja */}
              <li className="relative pointer-events-auto" ref={dropdownRef}>
                <button
                  type="button"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label="Menu Cara Kerja (FAQ, Syarat, Privasi)"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`py-1 cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
                    isCaraKerjaActive ? 'text-white font-bold border-b border-white' : 'hover:text-white text-gray-200'
                  }`}
                >
                  <span>Cara Kerja</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180 text-white' : 'text-gray-300'
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-52 bg-[#252f27]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-[#819b8e]/30 py-2 z-50 text-xs pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
                    <NavLink
                      to="/faq"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      FAQ (Tanya Jawab)
                    </NavLink>
                    <NavLink
                      to="/syarat-dan-ketentuan"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      Syarat & Ketentuan
                    </NavLink>
                    <NavLink
                      to="/kebijakan-privasi"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      Kebijakan Privasi
                    </NavLink>
                  </div>
                )}
              </li>

              <li>
                <NavLink
                  to="/kontak"
                  className={({ isActive }) =>
                    `transition-colors py-1 cursor-pointer ${isActive ? 'text-white font-bold border-b border-white' : 'hover:text-white text-gray-200'}`
                  }
                >
                  Kontak
                </NavLink>
              </li>
            </ul>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-11 h-11 rounded-full border border-[#819b8e]/40 text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer pointer-events-auto shadow-md"
              aria-label="Buka Menu Navigasi"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>

      {/* ─── Mobile Side Drawer (Clean, Minimalist, No Gradient/Icons) ─── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu Navigasi Mobile"
        className={`fixed top-3 right-3 bottom-3 z-50 w-[82vw] max-w-[320px] bg-[#1c241e] border border-white/15 rounded-3xl flex flex-col justify-between shadow-2xl transition-all duration-300 ease-out lg:hidden overflow-hidden ${
          mobileMenuOpen ? 'translate-x-0 pointer-events-auto opacity-100 visible' : 'translate-x-[110%] pointer-events-none opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* ── Header: Logo IYMPACK, Brand Name & Circular Close Button ── */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5"
            >
              <img
                src="/assets/logo/logotp-removebg-preview.webp"
                alt="Logo IYMPACK"
                width="32"
                height="32"
                decoding="async"
                className="h-8 w-auto object-contain brightness-110"
                onError={(e) => {
                  e.target.src = "/iympack-logo.webp";
                }}
              />
              <span className="text-base font-bold text-white tracking-tight font-heading">
                {settings.orgName || 'IYMPACK'}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Tutup menu navigasi"
              className="w-10 h-10 rounded-full border border-white/20 text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Navigation: Clean list ── */}
          <div className="px-4 py-4 flex flex-col space-y-1 text-sm font-semibold">
            {[
              { to: '/', label: 'Beranda' },
              { to: '/event', label: 'Kegiatan' },
              { to: '/berita', label: 'Berita' },
              { to: '/tentang-kami', label: 'Tentang Kami' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-2xl transition-colors duration-150 ${
                    isActive
                      ? 'bg-white/10 text-[#d8a76d] font-bold'
                      : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Cara Kerja Accordion (Toggleable Open and Close) */}
            <div className="rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileDropdownOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-150 cursor-pointer ${
                  isCaraKerjaActive || mobileDropdownOpen
                    ? 'bg-white/10 text-[#d8a76d] font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Cara Kerja</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileDropdownOpen ? 'rotate-180 text-[#d8a76d]' : 'text-stone-400'
                  }`}
                />
              </button>

              {mobileDropdownOpen && (
                <div className="pl-5 pr-3 py-1.5 space-y-1 text-xs text-stone-300 border-l border-white/10 ml-4 my-1 animate-in fade-in duration-150">
                  {[
                    { to: '/faq', label: 'FAQ (Tanya Jawab)' },
                    { to: '/syarat-dan-ketentuan', label: 'Syarat & Ketentuan' },
                    { to: '/kebijakan-privasi', label: 'Kebijakan Privasi' },
                  ].map(({ to, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block py-2 px-3 rounded-xl transition-colors ${
                          isActive
                            ? 'text-[#d8a76d] font-semibold bg-white/5'
                            : 'text-stone-400 hover:text-stone-200'
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom CTA Button: Rounded pill-style ── */}
        <div className="p-4 border-t border-white/10">
          <Link
            to="/kontak"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center py-3 px-4 rounded-2xl font-bold text-sm text-[#1c241e] bg-[#b78958] hover:bg-[#c89862] active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            Kontak Kami
          </Link>
        </div>
      </aside>
    </>
  );
}

