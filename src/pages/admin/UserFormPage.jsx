/**
 * IYMPACK CMS — Full Page User Creation (Super Admin Only)
 *
 * Dedicated full-page interface replacing popup modal.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../hooks/useData.js';
import { ROLES, TEAMS, TEAM_LABELS } from '../../lib/db.constants.js';
import { ArrowLeft, Save, ShieldAlert, CheckCircle2, Check, Copy, Building } from 'lucide-react';

export default function UserFormPage() {
  const navigate = useNavigate();
  const { createUser, teams } = useData();

  const [form, setForm] = useState({ name: '', email: '', role: ROLES.ADMIN, teamId: TEAMS.JAKARTA });
  const [createdResult, setCreatedResult] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await createUser(form);
      setCreatedResult(res);
      setForm({ name: '', email: '', role: ROLES.ADMIN, teamId: TEAMS.JAKARTA });
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membuat user.');
    }
  };

  const copyPassword = () => {
    if (createdResult?.tempPassword) {
      navigator.clipboard.writeText(createdResult.tempPassword);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-16">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-gray-200/80 pb-4">
        <Link
          to="/admin/users"
          className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
          title="Kembali ke Kelola Akun"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 font-heading">
            Tambah Akun Administrator
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftarkan akun pengurus baru untuk mengelola website IYMPACK.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <ShieldAlert className="w-4 h-4" /> {errorMsg}
        </div>
      )}

      {!createdResult ? (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-5 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Siti Rahmawati"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Alamat Email (Digunakan untuk Login) <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nama@iympack.org"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Tingkat Hak Akses (Role)
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 bg-white"
            >
              <option value={ROLES.ADMIN}>Admin Cabang (Kelola Kegiatan, Artikel & Relawan Cabang)</option>
              <option value={ROLES.SUPER_ADMIN}>Super Admin (Seluruh Hak Akses & Konfigurasi Sistem)</option>
            </select>
          </div>

          {form.role === ROLES.ADMIN && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-forest" />
                <span>Pilih Wilayah Cabang / Chapter</span> <span className="text-red-500">*</span>
              </label>
              <select
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 bg-white"
              >
                {(teams && teams.length ? teams : Object.entries(TEAM_LABELS).map(([key, label]) => ({ slug: key, name: label })))
                  .filter((t) => (t.slug || t.id) !== TEAMS.PUSAT)
                  .map((t) => {
                    const key = t.slug || t.id;
                    const label = TEAM_LABELS[key] || t.displayName || t.name || key;
                    return (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    );
                  })}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">Admin cabang hanya memiliki akses mengelola data cabang yang dipilih.</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold shadow-md shadow-forest/20 transition-colors"
            >
              <Save className="w-4 h-4" /> Daftarkan Akun
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-green-600" /> Akun Berhasil Didaftarkan!
            </p>
            <p className="text-xs text-green-700">
              Berikan kredensial login sementara berikut kepada pengurus terkait:
            </p>
            <div className="bg-white p-3.5 rounded-lg border border-green-200 space-y-1.5 mt-2">
              <div className="text-xs text-gray-500">Email: <strong className="text-gray-800">{createdResult.email}</strong></div>
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>Password Sementara: <strong className="text-forest font-mono text-sm">{createdResult.tempPassword}</strong></span>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="text-forest hover:text-amber-600 p-1 flex items-center gap-1 text-xs font-semibold"
                  title="Salin Password"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copySuccess ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setCreatedResult(null);
                setForm({ name: '', email: '', role: ROLES.ADMIN });
              }}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
            >
              Tambah User Lain
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="flex-1 py-2 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest-dark transition-colors"
            >
              Kembali ke Kelola Akun
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
