/**
 * IYMPACK CMS — Applicants Management Page (Data Pendaftar Kegiatan)
 *
 * Menampilkan seluruh data peserta dan calon relawan terdaftar per kegiatan
 * tanpa proses / aksi verifikasi manual.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../hooks/useData.js';
import { formatDate } from '../../lib/utils.js';
import {
  Users, Search, Download, CheckCircle2,
  Eye, Phone, Building, Ticket, Trash2, AlertTriangle, X, CheckSquare, Square
} from 'lucide-react';
import { TEAMS, TEAM_LABELS } from '../../lib/db.constants.js';

export default function ApplicantsManagePage() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const {
    events,
    getApplicantsByEvent,
    exportApplicantsCSV,
    deleteApplicant,
    bulkDeleteApplicants,
  } = useData();

  const [teamFilter, setTeamFilter] = useState('all');

  // Scoped events based on user branch role
  const scopedEvents = useMemo(() => {
    if (!isSuperAdmin()) {
      const userTeam = user?.userTeamId || TEAMS.PUSAT;
      return events.filter((e) => (e.teamId || TEAMS.PUSAT) === userTeam);
    }
    if (teamFilter !== 'all') {
      return events.filter((e) => (e.teamId || TEAMS.PUSAT) === teamFilter);
    }
    return events;
  }, [events, isSuperAdmin, user, teamFilter]);

  const [selectedEventId, setSelectedEventId] = useState('');

  // Keep selectedEventId in sync when scopedEvents change
  useEffect(() => {
    if (scopedEvents.length > 0) {
      if (!scopedEvents.some((e) => e.id === selectedEventId)) {
        setSelectedEventId(scopedEvents[0].id);
      }
    } else {
      setSelectedEventId('');
    }
  }, [scopedEvents, selectedEventId]);

  const [searchQuery, setSearchQuery] = useState('');

  const applicants = useMemo(() => {
    if (!selectedEventId) return [];
    return getApplicantsByEvent(selectedEventId, {
      search: searchQuery || undefined,
    });
  }, [selectedEventId, searchQuery, getApplicantsByEvent]);

  const allEventApplicants = useMemo(() => {
    if (!selectedEventId) return [];
    return getApplicantsByEvent(selectedEventId);
  }, [selectedEventId, getApplicantsByEvent]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Quota & Stats calculation
  const maxQuota = selectedEvent?.maxQuota || 0;
  const totalCount = allEventApplicants.length;
  const remainingQuota = maxQuota > 0 ? Math.max(0, maxQuota - totalCount) : 'Tak Terbatas';
  const percentageFilled = maxQuota > 0 ? Math.min(100, Math.round((totalCount / maxQuota) * 100)) : 100;

  // ── delete / bulk delete state ──
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null); // {id, name} or {ids: []}
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // reset selection when event/search changes
  useEffect(() => { setSelectedIds(new Set()); }, [selectedEventId, searchQuery]);

  // auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === applicants.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(applicants.map(a => a.id)));
  };
  const handleDeleteOne = async () => {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);
    try {
      await deleteApplicant(deleteTarget.id);
      setToast({ type: 'success', msg: `Pendaftar "${deleteTarget.name}" berhasil dihapus.` });
      setSelectedIds(prev => { const n=new Set(prev); n.delete(deleteTarget.id); return n; });
    } catch(e){ setToast({type:'error', msg: e.message}); }
    finally { setIsDeleting(false); setDeleteTarget(null); }
  };
  const handleBulkDelete = async () => {
    const ids = deleteTarget?.ids || [];
    if (!ids.length) return;
    setIsDeleting(true);
    try {
      await bulkDeleteApplicants(ids);
      setToast({ type: 'success', msg: `${ids.length} pendaftar berhasil dihapus (spam/phising). Kuota otomatis dikoreksi.` });
      setSelectedIds(new Set());
    } catch(e){ setToast({type:'error', msg: e.message}); }
    finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800 font-heading">Data Pendaftar Kegiatan</h2>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              !isSuperAdmin() ? 'bg-forest/10 text-forest' : 'bg-amber-100 text-amber-800'
            }`}>
              {!isSuperAdmin() ? TEAM_LABELS[user?.userTeamId] || 'Cabang' : 'Super Admin (Pusat)'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Daftar seluruh relawan dan peserta yang terdaftar pada kegiatan IYMPACK
          </p>
        </div>
        <button
          onClick={() => selectedEventId && exportApplicantsCSV(selectedEventId, selectedEvent?.title)}
          disabled={!selectedEventId || applicants.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-forest/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Download className="w-4 h-4" /> Ekspor ke CSV / Excel
        </button>
      </div>

      {/* ─── Event Selector & Stats Pills ─────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Filter Cabang Khusus Super Admin */}
          {isSuperAdmin() && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-amber-600" />
                <span>Filter Cabang (8 Tim)</span>
              </label>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest bg-gray-50/50"
              >
                <option value="all">Semua Cabang (8 Tim)</option>
                {Object.entries(TEAM_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          )}

          <div className={isSuperAdmin() ? "md:col-span-2" : "md:col-span-3"}>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pilih Agenda Kegiatan</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest bg-gray-50/50"
            >
              {scopedEvents.length === 0 && (
                <option value="">Belum ada kegiatan untuk cabang ini</option>
              )}
              {scopedEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  [{TEAM_LABELS[ev.teamId] || 'Pusat'}] {ev.title} ({ev.currentApplicants}/{ev.maxQuota || '∞'} Peserta)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Total Terdaftar</span>
            <span className="text-xl font-black text-emerald-800 font-heading">{totalCount} Peserta</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Target Kuota</span>
            <span className="text-xl font-black text-gray-800 font-heading">{maxQuota > 0 ? `${maxQuota} Relawan` : 'Bebas'}</span>
          </div>
          <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-100">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Sisa Slot Kuota</span>
            <span className="text-xl font-black text-amber-800 font-heading">{remainingQuota}</span>
          </div>
          <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-100">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Keterisian Kuota</span>
            <span className="text-xl font-black text-blue-800 font-heading">{percentageFilled}%</span>
          </div>
        </div>
      </div>

      {/* ─── Search Toolbar + Bulk Actions ───────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama peserta, email, nomor WA, atau domisili..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium self-end sm:self-center">
            Menampilkan <strong className="text-gray-800">{applicants.length}</strong> peserta terdaftar
          </span>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <span className="text-xs font-bold text-red-700">{selectedIds.size} dipilih</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedIds(new Set())} className="text-xs font-semibold text-gray-600 hover:text-gray-800 px-2 py-1">Batal</button>
              <button
                onClick={() => setDeleteTarget({ ids: Array.from(selectedIds) })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm"
              ><Trash2 className="w-3.5 h-3.5"/> Hapus {selectedIds.size} (Spam/Phising)</button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-3 py-3.5 text-center w-10">
                  <button onClick={toggleAll} className="text-gray-500 hover:text-forest" title="Pilih semua">
                    {applicants.length>0 && selectedIds.size===applicants.length ? <CheckSquare className="w-4 h-4 text-forest"/> : <Square className="w-4 h-4"/>}
                  </button>
                </th>
                <th className="px-2 py-3.5 text-left w-10 text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Lengkap & Akun</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Kontak WhatsApp</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Kota Domisili</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">Waktu Daftar</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Voucher</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applicants.map((a, idx) => {
                const waUrl = a.whatsapp ? `https://wa.me/${a.whatsapp.replace(/\\D/g, '')}` : null;
                const checked = selectedIds.has(a.id);
                return (
                  <tr key={a.id} className={`transition-colors ${checked ? 'bg-red-50/60' : 'hover:bg-gray-50/70'}`}>
                    <td className="px-3 py-3.5 text-center">
                      <button onClick={() => toggleOne(a.id)} className={`${checked ? 'text-red-600' : 'text-gray-400 hover:text-forest'}`}>
                        {checked ? <CheckSquare className="w-4 h-4"/> : <Square className="w-4 h-4"/>}
                      </button>
                    </td>
                    <td className="px-2 py-3.5 text-xs text-gray-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => navigate(`/admin/pendaftar/${a.id}`)}
                        className="text-left group cursor-pointer"
                      >
                        <p className="font-bold text-gray-800 group-hover:text-forest transition-colors">{a.fullName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.email}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200/80 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-green-600" />
                          <span>{a.whatsapp}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-xs text-gray-600 font-medium">{a.city || '-'}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell text-xs text-gray-500">
                      {formatDate(a.submittedAt, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      {a.voucherCode ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-mono font-bold tracking-wider w-fit">
                            <Ticket className="w-3 h-3 shrink-0" />
                            {a.voucherCode}
                          </span>
                          {a.discountAmount > 0 && (
                            <span className="text-[10px] text-emerald-600 font-semibold pl-1">
                              Diskon Rp.{Number(a.discountAmount).toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Terdaftar
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/pendaftar/${a.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-forest bg-white hover:bg-forest/5 text-gray-700 hover:text-forest text-xs font-semibold transition-all shadow-sm cursor-pointer"
                          title="Lihat Data Lengkap & Jawaban Kuesioner"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Detail</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: a.id, name: a.fullName })}
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Hapus (spam/phising)"
                        ><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {applicants.length === 0 && (
          <div className="px-5 py-14 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-600">Tidak ada data pendaftar</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {selectedEventId
                ? 'Belum ada relawan yang terdaftar untuk kegiatan ini, atau pencarian tidak menemukan hasil yang cocok.'
                : 'Silakan pilih agenda kegiatan di atas untuk meninjau data peserta.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 ${toast.type==='success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type==='success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}
          <span>{toast.msg}</span>
          <button onClick={()=>setToast(null)} className="ml-2 p-1 hover:bg-white/20 rounded"><X className="w-3.5 h-3.5"/></button>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>!isDeleting && setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4" onClick={e=>e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 rounded-xl text-red-600"><AlertTriangle className="w-6 h-6"/></div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Hapus Pendaftar?</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {deleteTarget.id
                    ? <>Yakin ingin menghapus <strong className="text-gray-800">{deleteTarget.name}</strong>? Data akan hilang permanen & kuota kegiatan akan dikoreksi (-1). Gunakan untuk kasus <strong>spam / phising / data palsu</strong>.</>
                    : <>Yakin ingin menghapus <strong className="text-gray-800">{deleteTarget.ids?.length} pendaftar terpilih</strong>? Aksi permanen, kuota akan dikoreksi otomatis.</>
                  }
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button disabled={isDeleting} onClick={()=>setDeleteTarget(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Batal</button>
              <button disabled={isDeleting} onClick={deleteTarget.id ? handleDeleteOne : handleBulkDelete} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50 inline-flex items-center gap-1.5">
                {isDeleting ? 'Menghapus...' : <><Trash2 className="w-4 h-4"/> Ya, Hapus Permanen</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
