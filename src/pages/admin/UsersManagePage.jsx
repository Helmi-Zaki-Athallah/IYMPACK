/**
 * IYMPACK CMS — Users Management Page (Super Admin Only)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../hooks/useData.js';
import { formatDate } from '../../lib/utils.js';
import { ROLES, USER_STATUS } from '../../lib/db.constants.js';
import {
  UserCog, Plus, Trash2, ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle
} from 'lucide-react';

export default function UsersManagePage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { users, suspendUser, activateUser, deleteUser, adminSetUserPassword } = useData();

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPwd, setNewPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleToggleStatus = (targetUser) => {
    if (targetUser.id === currentUser?.userId) {
      alert('Anda tidak dapat menonaktifkan akun sendiri.');
      return;
    }
    if (targetUser.status === USER_STATUS.ACTIVE) {
      suspendUser(targetUser.id);
    } else {
      activateUser(targetUser.id);
    }
  };

  const handleDelete = (id) => {
    if (id === currentUser?.userId) {
      alert('Anda tidak dapat menghapus akun sendiri.');
      return;
    }
    deleteUser(id);
    setDeleteConfirm(null);
  };

  const openReset = (u) => { setResetTarget(u); setNewPwd(''); setResetMsg(null); setShowPwd(false); };
  const handleReset = async () => {
    if (!newPwd || newPwd.length < 6) { setResetMsg({ type: 'error', text: 'Password baru minimal 6 karakter.' }); return; }
    setResetLoading(true);
    try {
      await adminSetUserPassword(resetTarget.id, newPwd);
      setResetMsg({ type: 'success', text: `Password akun ${resetTarget.name} berhasil diganti.` });
      setTimeout(() => { setResetTarget(null); setNewPwd(''); setResetMsg(null); }, 1200);
    } catch (e) { setResetMsg({ type: 'error', text: e.message }); }
    finally { setResetLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 font-heading">Kelola Akun Administrator</h2>
          <p className="text-sm text-gray-500 mt-0.5">Daftar pengguna dengan hak akses ke CMS IYMPACK</p>
        </div>
        <button
          onClick={() => navigate('/admin/users/tambah')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-forest/20"
        >
          <Plus className="w-4 h-4" /> Tambah Akun Staf
        </button>
      </div>

      {/* ─── Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama & Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Terdaftar</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const isMe = u.id === currentUser?.userId;
                const isSuper = u.role === ROLES.SUPER_ADMIN;
                const isActive = u.status === USER_STATUS.ACTIVE;

                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold text-xs shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{u.name}</span>
                            {isMe && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 block">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isSuper
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-forest/10 text-forest border border-forest/20'
                        }`}
                      >
                        {isSuper ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCog className="w-3.5 h-3.5" />}
                        {isSuper ? 'Super Admin' : 'Admin Staf'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-600' : 'bg-red-500'}`} />
                        {isActive ? 'Aktif' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell text-xs text-gray-500">
                      {formatDate(u.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isMe && (
                          <button
                            onClick={() => openReset(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold"
                            title="Reset password akun ini (bebas password yang kamu mau)"
                          ><KeyRound className="w-3.5 h-3.5" /> Reset Pwd</button>
                        )}
                        {!isMe && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              isActive
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
                            }`}
                            title={isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          >
                            {isActive ? 'Suspend' : 'Aktifkan'}
                          </button>
                        )}
                        {!isMe && (
                          <button
                            onClick={() => setDeleteConfirm(u)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Delete Confirmation ──────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-heading">Hapus Akun Staf?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Akun pengurus <strong>"{deleteConfirm.name}"</strong> ({deleteConfirm.email}) akan dihapus secara permanen.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reset Password (Super Admin set bebas) ─────────── */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !resetLoading && setResetTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-heading text-center">Reset Password</h3>
            <p className="text-xs text-gray-500 text-center">Set password baru untuk <strong className="text-gray-800">{resetTarget.name}</strong> ({resetTarget.email}) — bebas yang kamu mau, minimal 6 karakter.</p>
            {resetMsg && (
              <div className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${resetMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {resetMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {resetMsg.text}
              </div>
            )}
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)}
                placeholder="Password baru — bebas, min 6 karakter" className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            <div className="flex gap-3">
              <button disabled={resetLoading} onClick={() => setResetTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 disabled:opacity-50">Batal</button>
              <button disabled={resetLoading} onClick={handleReset} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50">{resetLoading ? 'Menyimpan...' : 'Simpan Password'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
