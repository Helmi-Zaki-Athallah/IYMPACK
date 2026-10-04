/**
 * IYMPACK CMS — Account Settings (Self-Service)
 * Semua admin (termasuk cabang) bisa edit profil sendiri & ganti password.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../hooks/useData.js';
import { TEAM_LABELS } from '../../lib/db.constants.js';
import {
  User, Mail, Shield, Lock, Eye, EyeOff,
  Save, CheckCircle2, AlertTriangle, KeyRound, ArrowLeft
} from 'lucide-react';

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { users, updateOwnProfile, changeOwnPassword } = useData();

  const me = users.find(u => u.id === user?.userId) || user || {};

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    setProfile({
      name: me.name || me.userName || '',
      email: me.email || me.userEmail || '',
    });
  }, [me.name, me.email, me.userName, me.userEmail]);

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!profile.name.trim() || profile.name.trim().length < 2) {
      setProfileMsg({ type: 'error', text: 'Nama minimal 2 karakter.' });
      return;
    }
    if (!profile.email.trim() || !profile.email.includes('@')) {
      setProfileMsg({ type: 'error', text: 'Email tidak valid.' });
      return;
    }
    setProfileLoading(true);
    try {
      await updateOwnProfile({ name: profile.name.trim(), email: profile.email.trim().toLowerCase() });
      setProfileMsg({ type: 'success', text: 'Profil berhasil diperbarui. Silakan refresh jika nama di header belum berubah.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally { setProfileLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (!pwd.current) { setPwdMsg({ type: 'error', text: 'Password lama wajib diisi.' }); return; }
    if (pwd.next.length < 6) { setPwdMsg({ type: 'error', text: 'Password baru minimal 6 karakter.' }); return; }
    if (pwd.next !== pwd.confirm) { setPwdMsg({ type: 'error', text: 'Konfirmasi password tidak cocok.' }); return; }
    if (pwd.current === pwd.next) { setPwdMsg({ type: 'error', text: 'Password baru tidak boleh sama dengan password lama.' }); return; }
    setPwdLoading(true);
    try {
      await changeOwnPassword(pwd.current, pwd.next);
      setPwdMsg({ type: 'success', text: 'Password berhasil diganti. Gunakan password baru saat login berikutnya.' });
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message });
    } finally { setPwdLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-16">
      <div className="flex items-center gap-3 border-b border-gray-200/80 pb-4">
        <Link to="/admin" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 font-heading">Pengaturan Akun Saya</h1>
          <p className="text-xs text-gray-500 mt-0.5">Kelola profil &amp; ganti password mandiri — tanpa perlu Super Admin.</p>
        </div>
      </div>

      {/* Info badge */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold shrink-0">
          {(me.name || me.userName || 'A').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{me.name || me.userName}</p>
          <p className="text-xs text-gray-500 truncate">{me.email || me.userEmail} • {TEAM_LABELS[me.teamId || me.userTeamId] || me.role || '-'}</p>
        </div>
        <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full border ${me.role === 'super_admin' || me.userRole === 'super_admin' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
          <Shield className="w-3 h-3 inline mr-1" />{me.role === 'super_admin' || me.userRole === 'super_admin' ? 'Super Admin' : 'Admin Cabang'}
        </span>
      </div>

      {/* ── Profil ── */}
      <form onSubmit={handleProfile} className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2"><User className="w-4 h-4 text-forest" /> Edit Profil</h2>
        {profileMsg && (
          <div className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {profileMsg.text}
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap</label>
          <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest" placeholder="Nama lengkap" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Login</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest" placeholder="email@iympack.id" />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Email dipakai untuk login. Pastikan valid &amp; belum dipakai akun lain.</p>
        </div>
        <div className="flex justify-end pt-2">
          <button disabled={profileLoading} className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold shadow-md shadow-forest/20 disabled:opacity-50">
            <Save className="w-4 h-4" /> {profileLoading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </form>

      {/* ── Ganti Password ── */}
      <form onSubmit={handlePassword} className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2"><KeyRound className="w-4 h-4 text-amber-600" /> Ganti Password</h2>
        <p className="text-xs text-gray-500 -mt-1">Password bebas sesuai yang kamu mau — minimal 6 karakter. Contoh: <code className="bg-gray-100 px-1 rounded">123456</code>, <code className="bg-gray-100 px-1 rounded">jakarta123</code></p>
        {pwdMsg && (
          <div className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${pwdMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {pwdMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {pwdMsg.text}
          </div>
        )}
        {[
          { key: 'current', label: 'Password Lama', ph: 'Masukkan password saat ini' },
          { key: 'next', label: 'Password Baru', ph: 'Minimal 6 karakter, bebas' },
          { key: 'confirm', label: 'Konfirmasi Password Baru', ph: 'Ulangi password baru' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={show[f.key] ? 'text' : 'password'} value={pwd[f.key]} onChange={e => setPwd({ ...pwd, [f.key]: e.target.value })}
                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest" placeholder={f.ph} />
              <button type="button" onClick={() => setShow({ ...show, [f.key]: !show[f.key] })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                {show[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <button disabled={pwdLoading} className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50">
            <Lock className="w-4 h-4" /> {pwdLoading ? 'Memproses...' : 'Ganti Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
