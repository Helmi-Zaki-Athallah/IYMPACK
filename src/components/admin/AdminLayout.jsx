/**
 * IYMPACK CMS — Admin Layout
 *
 * Sidebar + Topbar layout for all admin pages.
 * Wraps child routes with DataProvider.
 */

import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import AdminBreadcrumbs from './AdminBreadcrumbs.jsx';
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Users,
  UserCog,
  Settings,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Shield,
  Image as ImageIcon,
  MessageSquareQuote,
  HelpCircle,
  Ticket,
  LayoutTemplate,
  Search,
  KeyRound,
} from 'lucide-react';

const MENU_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/kegiatan', icon: CalendarDays, label: 'Kegiatan' },
  { to: '/admin/artikel', icon: FileText, label: 'Berita' },
  { to: '/admin/pendaftar', icon: Users, label: 'Pendaftar' },
  { to: '/admin/tim', icon: Shield, label: 'Profil Tim' },
];

const SUPER_ADMIN_ITEMS = [
  { to: '/admin/akun', icon: KeyRound, label: 'Pengaturan Akun' },
  { to: '/admin/konten', icon: LayoutTemplate, label: 'Edit Konten Web' },
  { to: '/admin/galeri', icon: ImageIcon, label: 'Galeri Foto' },
  { to: '/admin/testimoni', icon: MessageSquareQuote, label: 'Testimoni' },
  { to: '/admin/faq', icon: HelpCircle, label: 'Kelola FAQ' },
  { to: '/admin/voucher', icon: Ticket, label: 'Kelola Voucher' },
  { to: '/admin/users', icon: UserCog, label: 'Kelola Akun' },
  { to: '/admin/pengaturan', icon: Settings, label: 'Pengaturan Situs' },
  { to: '/admin/audit-log', icon: ClipboardList, label: 'Audit Log' },
];

export default function AdminLayout() {
  const { user, logout, isSuperAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Default ke icon-only (terlipat) sesuai permintaan user
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [tooltip, setTooltip] = useState(null); // { label, top, isSuper }
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const handleMouseEnter = (e, label, isSuper = false) => {
    // Hanya munculkan flyout tooltip saat desktop dalam mode ikon
    if (!isCollapsed && window.innerWidth >= 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      label,
      top: rect.top + rect.height / 2,
      isSuper,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Judul halaman berdasarkan route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/kegiatan/tambah')) return 'Tambah Kegiatan';
    if (path.includes('/kegiatan/edit')) return 'Edit Kegiatan';
    if (path.includes('/kegiatan/detail')) return 'Detail Kegiatan';
    if (path.includes('/kegiatan')) return 'Manajemen Kegiatan';
    if (path.includes('/artikel/tambah')) return 'Tulis Berita';
    if (path.includes('/artikel/edit')) return 'Edit Berita';
    if (path.includes('/artikel')) return 'Manajemen Berita';
    if (path.includes('/pendaftar/') && path.split('/').filter(Boolean).length > 2) return 'Detail Pendaftar';
    if (path.includes('/pendaftar')) return 'Manajemen Pendaftar';
    if (path.includes('/akun')) return 'Pengaturan Akun Saya';
    if (path.includes('/tim')) return 'Profil & Anggota Tim';
    if (path.includes('/konten')) return 'Edit Konten Per Section';
    if (path.includes('/galeri')) return 'Kelola Galeri Foto';
    if (path.includes('/testimoni')) return 'Kelola Testimoni';
    if (path.includes('/faq')) return 'Kelola FAQ Resmi';
    if (path.includes('/voucher')) return 'Kelola Voucher';
    if (path.includes('/users/tambah')) return 'Tambah Pengguna';
    if (path.includes('/users')) return 'Kelola Akun';
    if (path.includes('/pengaturan')) return 'Pengaturan Situs';
    if (path.includes('/audit-log')) return 'Audit Log';
    return 'Admin Panel';
  };

  const roleBadge = isSuperAdmin()
    ? { label: 'Super Admin', color: 'bg-amber-100/90 text-amber-800 border border-amber-200/80' }
    : { label: `Admin ${user?.userTeamId ? user.userTeamId.toUpperCase() : 'Cabang'}`, color: 'bg-blue-50 text-blue-700 border border-blue-200/70' };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#eaf0f5] text-slate-800 flex flex-col lg:flex-row relative selection:bg-slate-700 selection:text-white">
      {/* ─── Ambient Radiant Glows ─── */}
      <div className="fixed -top-32 -left-32 w-[520px] h-[520px] bg-blue-200/35 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-slate-200/40 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-32 left-1/3 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* ─── Sidebar Overlay (Mobile) ─────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── Sidebar (Mode Ikon Minimalis + Expandable) ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-72 max-w-[85vw] bg-[#f8fafc] sm:bg-[#f1f5f9] lg:bg-transparent glass-admin-sidebar shadow-2xl lg:shadow-none flex flex-col transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto lg:h-full lg:shrink-0 lg:border-r lg:border-white/80 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div
          className={`h-16 shrink-0 flex items-center ${
            isCollapsed ? 'lg:justify-center justify-between px-4' : 'justify-between px-5'
          } border-b border-white/70 bg-white/40 backdrop-blur-md`}
        >
          <Link
            to="/admin"
            className="flex items-center gap-3 group"
            onMouseEnter={(e) => handleMouseEnter(e, 'IYMPACK Admin CMS')}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src="/assets/logo/logotp-removebg-preview.png"
              alt="Logo IYMPACK"
              className="h-10 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.src = '/assets/logo/logo-iympack.png';
              }}
            />
            {(!isCollapsed || sidebarOpen) && (
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-800 font-heading leading-tight tracking-wider">
                  IYMPACK
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                  Admin CMS
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Button Collapse di Desktop (hanya tampil jika expanded) */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="hidden lg:flex p-1.5 rounded-xl hover:bg-white/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Perkecil ke Mode Ikon"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Tombol Tutup Drawer Mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl hover:bg-white/60 text-slate-500 cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav
          className={`flex-1 ${
            isCollapsed ? 'lg:px-2.5 px-3.5' : 'px-3.5'
          } py-4 space-y-1.5 overflow-y-auto glass-scrollbar`}
        >
          {(!isCollapsed || sidebarOpen) && (
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Menu Utama
            </p>
          )}

          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label, false)}
              onMouseLeave={handleMouseLeave}
              className={({ isActive }) =>
                `relative flex items-center ${
                  isCollapsed ? 'lg:justify-center lg:w-11 lg:h-11 lg:mx-auto gap-3 px-3.5 py-2.5' : 'gap-3 px-3.5 py-2.5'
                } rounded-2xl text-xs sm:text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-bold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  {(!isCollapsed || sidebarOpen) && <span className="truncate">{item.label}</span>}
                  {isActive && isCollapsed && (
                    <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-blue-600 rounded-r-full hidden lg:block" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Super Admin Menu */}
          {isSuperAdmin() && (
            <>
              <div
                className={`my-3 border-t border-white/60 ${
                  isCollapsed ? 'lg:w-8 lg:mx-auto' : ''
                }`}
              />
              {!isCollapsed || sidebarOpen ? (
                <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-amber-500" />
                  <span>Super Admin</span>
                </p>
              ) : (
                <div
                  className="hidden lg:flex justify-center py-1 cursor-default"
                  onMouseEnter={(e) => handleMouseEnter(e, 'Kategori Super Admin', true)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500/80" />
                </div>
              )}

              {SUPER_ADMIN_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  onMouseEnter={(e) => handleMouseEnter(e, item.label, true)}
                  onMouseLeave={handleMouseLeave}
                  className={({ isActive }) =>
                    `relative flex items-center ${
                      isCollapsed ? 'lg:justify-center lg:w-11 lg:h-11 lg:mx-auto gap-3 px-3.5 py-2.5' : 'gap-3 px-3.5 py-2.5'
                    } rounded-2xl text-xs sm:text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-bold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      {(!isCollapsed || sidebarOpen) && <span className="truncate">{item.label}</span>}
                      {isActive && isCollapsed && (
                        <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-blue-600 rounded-r-full hidden lg:block" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div
          className={`shrink-0 ${
            isCollapsed ? 'lg:px-2 lg:py-3 px-4 py-3.5' : 'px-4 py-3.5'
          } border-t border-white/60 bg-white/70 lg:bg-white/30 backdrop-blur-md space-y-2 mt-auto`}
        >
          {isCollapsed ? (
            <>
              {/* Footer Ikon Saja di Desktop */}
              <div className="hidden lg:flex flex-col items-center gap-2">
                <Link
                  to="/"
                  target="_blank"
                  onMouseEnter={(e) => handleMouseEnter(e, 'Lihat Website Publik')}
                  onMouseLeave={handleMouseLeave}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-white/80 transition-all shadow-2xs"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  onMouseEnter={(e) => handleMouseEnter(e, 'Keluar dari Akun')}
                  onMouseLeave={handleMouseLeave}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all shadow-2xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Tampilan Lengkap di Drawer Mobile */}
              <div className="lg:hidden space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/90 border border-white shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {user?.userName?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate">{user?.userName || 'Admin'}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to="/"
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white/80 hover:text-slate-900 transition-all border border-transparent hover:border-white/80 shadow-2xs"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lihat Website</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Tampilan Full saat Expanded di Desktop */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/90 border border-white shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {user?.userName?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{user?.userName || 'Admin'}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <Link
                to="/"
                target="_blank"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white/80 hover:text-slate-900 transition-all border border-transparent hover:border-white/80 shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lihat Website</span>
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </Link>
              <div className="px-3 text-[10px] text-slate-400 font-medium">
                © {new Date().getFullYear()} IYMPACK • v2.0
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ─── Floating Flyout Tooltip (Pixel-Perfect, Zero Clipping) ─── */}
      {tooltip && (
        <div
          style={{ top: tooltip.top }}
          className="fixed left-22 -translate-y-1/2 z-[100] pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 hidden lg:block"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-semibold rounded-xl shadow-2xl backdrop-blur-md border border-white/10 whitespace-nowrap">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                tooltip.isSuper ? 'bg-amber-400' : 'bg-blue-400'
              }`}
            />
            <span>{tooltip.label}</span>
          </div>
        </div>
      )}

      {/* ─── Main Content Area (Separated Independent Scroll) ───── */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-y-auto glass-scrollbar relative z-10">
        {/* Topbar */}
        <header className="sticky top-0 h-16 shrink-0 glass-admin-header flex items-center justify-between px-3.5 sm:px-6 z-20">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 shadow-xs border border-white/90 active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label="Buka Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Toggle Button (Mode Ikon vs Expanded) */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 shadow-xs border border-white/90 active:scale-95 transition-all cursor-pointer shrink-0"
              title={isCollapsed ? 'Tampilkan Nama Menu (Perluas)' : 'Sembunyikan Nama Menu (Hanya Ikon)'}
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <h1 className="text-sm sm:text-lg font-bold text-slate-800 font-heading truncate">
              {getPageTitle()}
            </h1>

            {/* Pill Search Bar */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/90 shadow-[0_2px_8px_rgba(112,144,176,0.08)] text-slate-500 text-xs w-64">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kegiatan, pendaftar..."
                className="bg-transparent text-slate-700 placeholder-slate-400 text-xs outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* User Info Pill */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/80 border border-white/95 shadow-[0_2px_10px_rgba(112,144,176,0.08)] backdrop-blur-md">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-xs">
                <span className="text-[11px] font-bold">
                  {user?.userName?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.userName || 'Admin'}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full w-fit ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>

            {/* Mobile User Avatar Indicator */}
            <div className="sm:hidden w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
              {user?.userName?.charAt(0)?.toUpperCase() || 'A'}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 bg-white/75 border border-white/90 shadow-xs transition-all cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
          <AdminBreadcrumbs />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
