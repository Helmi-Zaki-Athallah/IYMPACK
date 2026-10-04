import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../hooks/useData.js';
import { TEAMS, TEAM_LABELS } from '../../lib/db.constants.js';
import {
  CalendarDays,
  FileText,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  Shield,
  ChevronRight,
  Trash2,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export default function DashboardPage() {
  const { user, isSuperAdmin } = useAuth();
  const {
    getDashboardStats,
    events,
    teams,
    selectedTeamFilter,
    setSelectedTeamFilter,
    deleteApplicant,
  } = useData();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const stats = getDashboardStats();

  // Cari tim aktif user untuk info pengurus
  const userTeamId = user?.userTeamId || TEAMS.PUSAT;
  const currentTeamObj = teams.find((t) => t.id === userTeamId || t.slug === userTeamId);
  const teamMemberCount = currentTeamObj?.members?.length || 0;

  // Map eventId to event title for recent applicants table
  const eventMap = {};
  events.forEach((e) => { eventMap[e.id] = e.title; });

  const recentApplicants = stats.recentApplicants || stats.recentPending || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteApplicant(deleteTarget.id); } catch (e) { alert('Gagal hapus: ' + e.message); }
    finally { setDeleteTarget(null); }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Top Row: Holographic Glass Hero Card + 3 Metric Cards ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Branch / Portal Overview Card (Clean Modern Glass) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="lg:col-span-5 glass-admin-card rounded-3xl p-4 sm:p-7 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full aspect-square overflow-hidden bg-white border border-slate-200/80 p-1.5 flex items-center justify-center shadow-xs shrink-0">
                  <img
                    src="/assets/logo/logo-iympack.png"
                    onError={(e) => { e.currentTarget.src = '/iympack-logo.png'; }}
                    alt="IYMPACK"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {!isSuperAdmin() ? 'Wilayah Kerja' : 'Pusat Kendali Nasional'}
                  </span>
                  <p className="text-sm font-black text-slate-800 leading-tight">
                    {!isSuperAdmin() ? TEAM_LABELS[user?.userTeamId] : 'IYMPACK Pusat'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Aktif Online</span>
              </span>
            </div>

            {/* Quick summary numbers in clean glass cards */}
            <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase truncate">Total Pendaftar</span>
                <p className="text-xl sm:text-2xl font-black text-slate-800 font-heading mt-0.5">
                  {stats.totalApplicants || 0}
                  <span className="text-xs font-semibold text-slate-500 ml-1">Orang</span>
                </p>
              </div>
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase truncate">Kegiatan Dibuka</span>
                <p className="text-xl sm:text-2xl font-black text-slate-800 font-heading mt-0.5">
                  {stats.events.published || 0}
                  <span className="text-xs font-semibold text-slate-500 ml-1">Event</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3.5 sm:pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100 mt-4">
            <span className="text-xs font-medium text-slate-500">
              Selamat datang, <strong className="text-slate-700">{user?.displayName || 'Admin'}</strong>
            </span>
            <Link
              to="/admin/kegiatan"
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-md shadow-forest/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer w-fit"
            >
              <span>Kelola Kegiatan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* 3 Metric Cards with Pill Badges (Right side of Hero) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Metric 1 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="glass-admin-card glass-admin-card-hover rounded-3xl p-4 sm:p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kegiatan</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                  +100% Aktif
                </span>
              </div>
              <p className="text-3xl font-black text-slate-800 font-heading tracking-tight mt-1">
                {stats.events.published}
              </p>
            </div>
            <div className="pt-3 border-t border-white/60 mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>{stats.events.total} Total Program</span>
              <CalendarDays className="w-4 h-4 text-slate-400" />
            </div>
          </motion.div>

          {/* Metric 2 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="glass-admin-card glass-admin-card-hover rounded-3xl p-4 sm:p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Artikel</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">
                  Dipublikasi
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-800 font-heading tracking-tight mt-1">
                {stats.articles.published}
              </p>
            </div>
            <div className="pt-3 border-t border-white/60 mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>{stats.articles.total} Tulisan Terdata</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
          </motion.div>

          {/* Metric 3 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="glass-admin-card glass-admin-card-hover rounded-3xl p-4 sm:p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {!isSuperAdmin() ? 'Pengurus' : 'Cabang'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200/60">
                  {!isSuperAdmin() ? 'Tim Aktif' : 'Nasional'}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-800 font-heading tracking-tight mt-1">
                {!isSuperAdmin() ? teamMemberCount : 8}
              </p>
            </div>
            <div className="pt-3 border-t border-white/60 mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>{!isSuperAdmin() ? 'Anggota Tim' : 'Pusat & Regional'}</span>
              <Shield className="w-4 h-4 text-slate-400" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Quick Actions Pill Bar ─── */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 sm:gap-3">
        <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/admin/kegiatan/tambah"
            className="glass-admin-pill px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-white flex items-center gap-1.5 sm:gap-2 shadow-xs transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span>Tambah Kegiatan</span>
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/admin/artikel/tambah"
            className="glass-admin-pill px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-white flex items-center gap-1.5 sm:gap-2 shadow-xs transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span>Tulis Artikel</span>
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/admin/pendaftar"
            className="glass-admin-pill px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-white flex items-center gap-1.5 sm:gap-2 shadow-xs transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span>Data Pendaftar</span>
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/admin/tim"
            className="glass-admin-pill px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-white flex items-center gap-1.5 sm:gap-2 shadow-xs transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span>Profil Tim</span>
          </Link>
        </motion.div>

        {/* Super admin filter selector */}
        {isSuperAdmin() && (
          <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 pt-1 sm:pt-0">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Filter:</span>
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="glass-admin-pill w-full sm:w-auto px-3.5 py-2 rounded-full text-xs font-bold text-slate-800 focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="all">Semua Cabang (Global)</option>
              {Object.entries(TEAM_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {/* ─── Two Column Layout: Table with Tab Pills + Status Summary Card ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Table with recent applicants */}
        <motion.div variants={itemVariants} className="lg:col-span-8 glass-admin-card rounded-3xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/60 bg-white/40 backdrop-blur-md flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800 font-heading">Pendaftar Terbaru</h3>
              <p className="text-xs text-slate-500">Relawan dan peserta terdata terbaru</p>
            </div>
            <Link
              to="/admin/pendaftar"
              className="text-xs font-bold text-forest hover:text-forest-dark flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Table Content */}
          {recentApplicants.length > 0 ? (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100/40 border-b border-white/60">
                    <th className="text-left px-3.5 sm:px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nama Peserta</th>
                    <th className="text-left px-3.5 sm:px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Kegiatan</th>
                    <th className="text-left px-3.5 sm:px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-3.5 sm:px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/60">
                  {recentApplicants.slice(0, 5).map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-white/50 backdrop-blur-xs transition-colors">
                      <td className="px-3.5 sm:px-6 py-3 sm:py-3.5">
                        <div>
                          <p className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">{applicant.fullName}</p>
                          <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[120px] sm:max-w-none">{applicant.email}</p>
                        </div>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-slate-700 font-medium line-clamp-1">
                          {eventMap[applicant.eventId] || 'Kegiatan Umum'}
                        </span>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-3.5">
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Terdaftar</span>
                        </span>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/pendaftar/${applicant.id}`}
                            className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs shadow-xs transition-all inline-block"
                          >
                            Detail
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(applicant)}
                            className="p-1.5 rounded-xl bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Hapus pendaftar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center my-auto">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">Belum ada data pendaftar terbaru.</p>
            </div>
          )}

          <div className="p-4 border-t border-white/60 bg-white/20 text-center">
            <Link
              to="/admin/pendaftar"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5"
            >
              <span>Buka Seluruh Halaman Pendaftar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Right Column (4 cols): Dispute Inbox / Quick Branch Card */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-5">
          {/* Mini Card 1: Dispute Inbox Style Overview */}
          <div className="glass-admin-card rounded-3xl p-5 space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ringkasan Status</span>
              <h4 className="text-base font-black text-slate-800 font-heading">Status Kegiatan</h4>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
                  <span className="text-xs font-bold text-slate-700">Sedang Dibuka</span>
                </div>
                <span className="text-xs font-black text-emerald-600">{stats.events.published} Program</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-200"></span>
                  <span className="text-xs font-bold text-slate-700">Draf / Menunggu</span>
                </div>
                <span className="text-xs font-black text-amber-600">{stats.events.draft} Program</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-slate-200"></span>
                  <span className="text-xs font-bold text-slate-700">Selesai / Ditutup</span>
                </div>
                <span className="text-xs font-black text-slate-500">{stats.events.closed} Program</span>
              </div>
            </div>
          </div>

          {/* Mini Card 2: Branch Info Pill Card */}
          <div className="glass-admin-card rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Cabang IYMPACK</h4>
              <Building className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda mengelola portal sebagai <strong className="text-slate-800">{!isSuperAdmin() ? TEAM_LABELS[user?.userTeamId] : 'Super Admin'}</strong>. Semua pembaruan data pendaftar dan kegiatan tersinkronisasi secara real-time.
            </p>
            <div className="pt-2">
              <Link
                to="/admin/tim"
                className="w-full py-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-700 font-bold text-xs border border-white shadow-2xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Lihat Struktur Tim</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Hapus pendaftar?</h3>
            <p className="text-xs text-slate-500 mt-1">
              <strong>{deleteTarget.fullName}</strong> ({deleteTarget.email}) akan dihapus permanen. Kuota kegiatan akan dikembalikan.
            </p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
