/**
 * IYMPACK CMS — Articles Management Page
 *
 * Full list view with search, filters, and direct full-page navigation for create/edit.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../hooks/useData.js';
import { formatDate, truncate } from '../../lib/utils.js';
import {  TEAMS, TEAM_LABELS } from '../../lib/db.constants.js';
import {
  FileText, Plus, ExternalLink, Edit, Trash2, Search,
  Clock, CheckCircle2
} from 'lucide-react';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: Clock },
  published: { label: 'Dipublikasi', color: 'bg-green-100 text-green-700', icon: CheckCircle2 } };

const CATEGORY_OPTIONS = ['Inspirasi', 'Pendidikan', 'Komunitas', 'Sosial', 'Lingkungan'];

export default function ArticlesManagePage() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const { articles, deleteArticle } = useData();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filtered & scoped articles
  const filtered = useMemo(() => {
    let list = [...articles];

    // Isolasi cabang: jika admin cabang, HANYA tampilkan artikel cabang mereka
    if (!isSuperAdmin()) {
      const userTeam = user?.userTeamId || TEAMS.PUSAT;
      list = list.filter((a) => (a.teamId || TEAMS.PUSAT) === userTeam);
    } else if (teamFilter !== 'all') {
      list = list.filter((a) => (a.teamId || TEAMS.PUSAT) === teamFilter);
    }

    if (statusFilter) list = list.filter((a) => a.status === statusFilter);
    if (categoryFilter) list = list.filter((a) => a.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
          (a.author && a.author.toLowerCase().includes(q))
      );
    }
    return list;
  }, [articles, isSuperAdmin, user, teamFilter, statusFilter, categoryFilter, search]);

  const handleDelete = async (id) => {
    try {
      await deleteArticle(id);
    } catch (err) {
      alert('Gagal menghapus artikel dari server: ' + err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800 font-heading">Manajemen Artikel & Berita</h2>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              !isSuperAdmin() ? 'bg-forest/10 text-forest' : 'bg-amber-100 text-amber-800'
            }`}>
              {!isSuperAdmin() ? TEAM_LABELS[user?.userTeamId] : 'Super Admin (Pusat)'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} artikel terdaftar</p>
        </div>
        <button
          onClick={() => navigate('/admin/artikel/tambah')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-forest/20"
        >
          <Plus className="w-4 h-4" /> Tulis Artikel
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
            placeholder="Cari judul, konten, atau penulis..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
          />
        </div>

        {/* Filter Cabang Khusus Super Admin */}
        {isSuperAdmin() && (
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 w-full sm:w-44 font-medium text-gray-700"
          >
            <option value="all">Semua Cabang (8 Tim)</option>
            {Object.entries(TEAM_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        )}

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 w-full sm:w-36"
        >
          <option value="">Semua Kategori</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 w-full sm:w-36"
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="published">Dipublikasi</option>
        </select>
      </div>

      {/* ─── Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Artikel</th>
                {isSuperAdmin() && (
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Cabang</th>
                )}
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Tanggal</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((article) => {
                const badge = STATUS_CONFIG[article.status] || STATUS_CONFIG.draft;
                return (
                  <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {article.coverImage && (
                          <img
                            src={article.coverImage}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg shrink-0 border border-gray-100 hidden xs:block"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1">{article.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {article.excerpt || truncate(article.bodyContent, 60)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-gray-400">
                              oleh {article.author || 'Admin'}
                            </span>
                            {!isSuperAdmin() && (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {TEAM_LABELS[article.teamId] || 'Pusat'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    {isSuperAdmin() && (
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                          {TEAM_LABELS[article.teamId] || 'Pusat'}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-forest bg-forest/5 px-2.5 py-1 rounded-full font-medium">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.color}`}>
                        <badge.icon className="w-3 h-3" /> {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">
                        {formatDate(article.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <p className="text-[11px] text-gray-400">oleh {article.author || 'Admin'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/berita/${article.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-forest transition-colors"
                          title="Lihat di Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => navigate(`/admin/artikel/edit/${article.id}`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Halaman Penuh"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(article)}
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
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Belum ada artikel</p>
            <p className="text-xs text-gray-400 mt-1">Mulai tulis dokumentasi atau cerita dampak sosial pertama.</p>
            <button
              onClick={() => navigate('/admin/artikel/tambah')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tulis Artikel Pertama
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
            <h3 className="text-lg font-bold text-gray-800 font-heading">Hapus Artikel?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Artikel <strong>"{deleteConfirm.title}"</strong> akan dihapus permanen.
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
