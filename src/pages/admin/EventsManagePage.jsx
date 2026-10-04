/**
 * IYMPACK CMS — Events Management Page
 *
 * Full list view with search, filters, and direct full-page navigation for create/edit/detail.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../hooks/useData.js';
import { formatDate, formatFee } from '../../lib/utils.js';
import { EVENT_STATUS, TEAMS, TEAM_LABELS } from '../../lib/db.constants.js';
import {
  CalendarDays, Plus, Eye, Edit, Trash2, Search,
  Clock, CheckCircle2, Archive
} from 'lucide-react';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: Clock },
  published: { label: 'Sedang Buka', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  closed: { label: 'Selesai', color: 'bg-red-100 text-red-600', icon: Archive } };

export default function EventsManagePage() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const { events, deleteEvent, changeEventStatus } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Scoped & filtered events
  const filtered = useMemo(() => {
    let list = [...events];

    // Isolasi cabang: jika admin cabang, HANYA tampilkan kegiatan cabang mereka
    if (!isSuperAdmin()) {
      const userTeam = user?.userTeamId || TEAMS.PUSAT;
      list = list.filter((e) => (e.teamId || TEAMS.PUSAT) === userTeam);
    } else if (teamFilter !== 'all') {
      list = list.filter((e) => (e.teamId || TEAMS.PUSAT) === teamFilter);
    }

    if (statusFilter) list = list.filter((e) => e.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q) || (e.location && e.location.toLowerCase().includes(q)));
    }
    return list;
  }, [events, isSuperAdmin, user, teamFilter, statusFilter, search]);

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
    } catch (err) {
      alert('Gagal menghapus kegiatan dari server: ' + err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await changeEventStatus(id, newStatus);
    } catch (err) {
      alert('Gagal mengubah status kegiatan di server: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800 font-heading">Manajemen Kegiatan</h2>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              !isSuperAdmin() ? 'bg-forest/10 text-forest' : 'bg-amber-100 text-amber-800'
            }`}>
              {!isSuperAdmin() ? TEAM_LABELS[user?.userTeamId] || 'Cabang' : 'Super Admin (Pusat)'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} kegiatan terdaftar</p>
        </div>
        <button
          onClick={() => navigate('/admin/kegiatan/tambah')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-forest/20"
        >
          <Plus className="w-4 h-4" /> Tambah Kegiatan
        </button>
      </div>

      {/* ─── Filters ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul kegiatan atau lokasi..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
          />
        </div>

        {/* Filter Cabang Khusus Super Admin */}
        {isSuperAdmin() && (
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 w-full sm:w-48 font-medium text-gray-700"
          >
            <option value="all">Semua Cabang (8 Tim)</option>
            {Object.entries(TEAM_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        )}

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 w-full sm:w-44"
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="published">Sedang Buka</option>
          <option value="closed">Selesai</option>
        </select>
      </div>

      {/* ─── Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kegiatan</th>
                {isSuperAdmin() && (
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Cabang</th>
                )}
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Jadwal & Lokasi</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Pendaftar</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((event) => {
                const badge = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
                const quotaPercent = event.maxQuota ? Math.round((event.currentApplicants / event.maxQuota) * 100) : 0;
                return (
                  <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {event.bannerImage && (
                          <img
                            src={event.bannerImage}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg shrink-0 border border-gray-100 hidden xs:block"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1">{event.title}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-forest font-medium">{event.category || 'Umum'}</span>
                            <span className="text-[11px] font-bold text-caramel bg-caramel-light px-1.5 py-0.5 rounded">
                              {formatFee(event.fee)}
                            </span>
                            {!isSuperAdmin() ? (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {TEAM_LABELS[event.teamId] || 'Pusat'}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    {isSuperAdmin() && (
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                          {TEAM_LABELS[event.teamId] || 'Pusat'}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-gray-700">{event.time || formatDate(event.startDate)}</p>
                      <p className="text-[11px] text-gray-400">{event.location}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">
                          {event.currentApplicants} / {event.maxQuota || '∞'}
                        </span>
                        {event.maxQuota > 0 && (
                          <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${quotaPercent >= 100 ? 'bg-red-500' : 'bg-forest'}`}
                              style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event.id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-forest/20 ${badge.color}`}
                      >
                        <option value={EVENT_STATUS.DRAFT}>Draft</option>
                        <option value={EVENT_STATUS.PUBLISHED}>Sedang Buka</option>
                        <option value={EVENT_STATUS.CLOSED}>Selesai</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/kegiatan/detail/${event.id}`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-forest transition-colors"
                          title="Lihat Detail Halaman Penuh"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/kegiatan/edit/${event.id}`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Halaman Penuh"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(event)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-14 text-center">
            <CalendarDays className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Belum ada kegiatan</p>
            <p className="text-xs text-gray-400 mt-1">Klik tombol "Tambah Kegiatan" untuk membuat yang pertama.</p>
            <button
              onClick={() => navigate('/admin/kegiatan/tambah')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Buat Kegiatan Pertama
            </button>
          </div>
        )}
      </div>

      {/* ─── Delete Confirmation Modal ────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-heading">Hapus Kegiatan?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Kegiatan <strong>"{deleteConfirm.title}"</strong> dan semua data pendaftarnya akan dihapus permanen.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
