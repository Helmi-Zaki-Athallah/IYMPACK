/**
 * IYMPACK CMS — Audit Log Viewer (Super Admin Only)
 */

import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData.js';
import { clearOldLogs, getAuditActionTypes } from '../../services/audit.service.js';
import { formatDate } from '../../lib/utils.js';
import {
  ClipboardList, Search, Trash2, Clock, CheckCircle2
} from 'lucide-react';

const ACTION_COLORS = {
  login: 'bg-green-100 text-green-700',
  logout: 'bg-gray-100 text-gray-600',
  login_failed: 'bg-red-100 text-red-700',
  user_created: 'bg-purple-100 text-purple-700',
  user_updated: 'bg-blue-100 text-blue-700',
  user_suspended: 'bg-amber-100 text-amber-700',
  user_activated: 'bg-green-100 text-green-700',
  user_deleted: 'bg-red-100 text-red-700',
  event_created: 'bg-emerald-100 text-emerald-700',
  event_updated: 'bg-cyan-100 text-cyan-700',
  event_deleted: 'bg-rose-100 text-rose-700',
  event_status_changed: 'bg-teal-100 text-teal-700',
  applicant_submitted: 'bg-amber-100 text-amber-800',
  applicant_verified: 'bg-green-100 text-green-800',
  article_created: 'bg-indigo-100 text-indigo-700',
  article_updated: 'bg-sky-100 text-sky-700',
  article_deleted: 'bg-pink-100 text-pink-700',
  settings_updated: 'bg-orange-100 text-orange-700' };

export default function AuditLogPage() {
  const { getAuditLogs } = useData();
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [notice, setNotice] = useState(null);

  const { logs, total } = useMemo(() => {
    return getAuditLogs({
      action: actionFilter || undefined,
      search: search || undefined,
      limit: 100 });
    // oxlint-disable-next-line react-hooks(exhaustive-deps) - refreshTick intentionally triggers recompute from localStorage
  }, [getAuditLogs, actionFilter, search, refreshTick]);

  // oxlint-disable-next-line react-hooks(exhaustive-deps) - refreshTick triggers re-read of static service data
  const actionTypes = useMemo(() => getAuditActionTypes(), [refreshTick]);

  const handleClearOld = () => {
    if (confirm('Bersihkan riwayat log yang berusia lebih dari 90 hari?')) {
      const removed = clearOldLogs(90);
      setRefreshTick((t) => t + 1);
      setNotice(`${removed} catatan log lama berhasil dibersihkan.`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Toast Notice ─────────────────────────────── */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 bg-forest text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 font-heading">Audit Log Sistem</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Rekam jejak aktivitas login, perubahan hak akses, serta modifikasi data
          </p>
        </div>
        <button
          onClick={handleClearOld}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors self-start"
        >
          <Trash2 className="w-3.5 h-3.5" /> Bersihkan Log Lama (&gt;90 hari)
        </button>
      </div>

      {/* ─── Filter Bar ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari user, aksi, atau rincian kegiatan..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 w-full sm:w-52"
        >
          <option value="">Semua Tipe Aksi</option>
          {actionTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* ─── Log Table ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-44">Waktu</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => {
                const colorClass = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700';
                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{formatDate(log.timestamp, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold text-[10px]">
                          {log.userName?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <span className="font-semibold text-gray-800 text-xs">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${colorClass}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                      {log.details || '-'}
                      {log.target && (
                        <span className="ml-2 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          target: {log.target}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="px-5 py-14 text-center">
            <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Belum ada catatan aktivitas</p>
            <p className="text-xs text-gray-400 mt-1">
              Aktivitas login dan modifikasi data akan tercatat secara otomatis di sini.
            </p>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400 text-right">
        Menampilkan {logs.length} dari total {total} catatan
      </div>
    </div>
  );
}
