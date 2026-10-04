/**
 * IYMPACK CMS — Team Profile & Members Management Page
 *
 * Mengelola foto sampul, media sosial, dan anggota pengurus untuk 8 tim IYMPACK:
 * - Admin Cabang: Hanya dapat mengedit profil & anggota tim cabangnya sendiri.
 * - Super Admin: Dapat memilih dan mengedit seluruh 8 cabang.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../hooks/useData.js';
import { TEAMS, TEAM_LABELS } from '../../lib/db.constants.js';
import {
  Users,
  Camera,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  X,
  Upload,
  AlertCircle,
  Images } from 'lucide-react';
import { validateUploadedFile, sanitizeText, sanitizeUrl } from '../../lib/security.js';
import { uploadImage } from '../../lib/upload.js';

export default function TeamProfilePage() {
  const { user, isSuperAdmin } = useAuth();
  const { teams, updateTeam, createTeam, deleteTeam, addMemberToTeam, updateMemberInTeam, removeMemberFromTeam } = useData();

  // Target team yang sedang diedit
  // Cabang terkunci ke user.userTeamId; Super Admin default Pusat atau pilihan aktif
  const [selectedTeamSlug, setSelectedTeamSlug] = useState(() => {
    if (!isSuperAdmin()) {
      return user?.userTeamId || TEAMS.PUSAT;
    }
    return TEAMS.PUSAT;
  });

  const activeTeam = useMemo(() => {
    const slug = !isSuperAdmin() ? (user?.userTeamId || TEAMS.PUSAT) : selectedTeamSlug;
    return teams.find((t) => t.slug === slug || t.id === slug) || teams[0] || null;
  }, [teams, selectedTeamSlug, isSuperAdmin, user]);

  // Form info profil dasar tim
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    tagline: '',
    ig: '',
    igUrl: '',
    tiktok: '',
    tiktokUrl: '',
    coverImage: '' });

  // Modal State untuk Tambah / Edit Anggota (Hanya 3 input: Foto, Nama, Kategori Divisi)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState(null); // null = tambah baru, number = edit
  const [memberForm, setMemberForm] = useState({
    name: '',
    division: 'Pengurus Harian',
    customDivision: '',
    photo: '' });

  // State untuk penambahan kategori divisi cepat
  const [isAddingDivisionBar, setIsAddingDivisionBar] = useState(false);
  const [newDivisionBarInput, setNewDivisionBarInput] = useState('');

  // Kategori Divisi aktif pada tim (mengutamakan activeTeam.divisions dan divisi anggota)
  const teamDivisions = useMemo(() => {
    let baseList = [];
    if (Array.isArray(activeTeam?.divisions) && activeTeam.divisions.length > 0) {
      baseList = [...activeTeam.divisions];
    }

    const fromMembers = (activeTeam?.members || [])
      .map((m) => m.division || m.category)
      .filter(Boolean);

    return Array.from(new Set([...baseList, ...fromMembers])).filter(Boolean);
  }, [activeTeam]);

  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', slug: '', tagline: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Sync state saat activeTeam berganti
  useEffect(() => {
    if (activeTeam) {
      setProfileForm({
        displayName: activeTeam.displayName || activeTeam.name || '',
        tagline: activeTeam.tagline || '',
        ig: activeTeam.ig || '',
        igUrl: activeTeam.igUrl || '',
        tiktok: activeTeam.tiktok || '',
        tiktokUrl: activeTeam.tiktokUrl || '',
        coverImage: activeTeam.coverImage || '' });
      setGalleryPhotos(Array.isArray(activeTeam.gallery) ? activeTeam.gallery : []);
    }
  }, [activeTeam]);

  // ─── Gallery State ────────────────────────────────────────
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isSavingGallery, setIsSavingGallery] = useState(false);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3500);
  };

  // ─── Handle Upload Gambar ─────────────────────────────────
  const handleImageUpload = async (file, callback) => {
    if (!file) return;
    const check = validateUploadedFile(file, { maxBytes: 10 * 1024 * 1024 });
    if (!check.valid) {
      showNotification('error', check.error);
      return;
    }
    try {
      const urlOrBase64 = await uploadImage(file);
      callback(urlOrBase64);
    } catch {
      showNotification('error', 'Gagal memproses unggahan gambar.');
    }
  };

  // ─── Handle Upload Foto Gallery Tim ───────────────────────
  const handleGalleryUpload = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    const uploaded = [];
    for (const file of Array.from(files)) {
      const check = validateUploadedFile(file, { maxBytes: 10 * 1024 * 1024 });
      if (!check.valid) { showNotification('error', check.error); continue; }
      try {
        const url = await uploadImage(file);
        uploaded.push(url);
      } catch { showNotification('error', `Gagal upload: ${file.name}`); }
    }
    setGalleryPhotos(prev => [...prev, ...uploaded]);
    setIsUploadingGallery(false);
    if (uploaded.length > 0) showNotification('success', `${uploaded.length} foto berhasil diupload. Klik "Simpan Gallery" untuk menyimpan.`);
  };

  const handleRemoveGalleryPhoto = (idx) => {
    setGalleryPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveGallery = async () => {
    if (!activeTeam) return;
    setIsSavingGallery(true);
    try {
      await updateTeam(activeTeam.slug, { gallery: galleryPhotos });
      showNotification('success', 'Gallery foto tim berhasil disimpan!');
    } catch (err) {
      showNotification('error', err.message || 'Gagal menyimpan gallery.');
    } finally {
      setIsSavingGallery(false);
    }
  };

  // ─── Simpan Profil Tim ─────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!activeTeam) return;

    setIsSaving(true);
    try {
      await updateTeam(activeTeam.slug, {
        displayName: sanitizeText(profileForm.displayName, 80),
        tagline: sanitizeText(profileForm.tagline, 200),
        ig: sanitizeText(profileForm.ig, 50),
        igUrl: sanitizeUrl(profileForm.igUrl),
        tiktok: sanitizeText(profileForm.tiktok, 50),
        tiktokUrl: sanitizeUrl(profileForm.tiktokUrl),
        coverImage: profileForm.coverImage,
      });
      showNotification('success', `Profil ${activeTeam.name} berhasil diperbarui!`);
    } catch (err) {
      showNotification('error', err.message || 'Gagal menyimpan profil tim.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Kelola Kategori Divisi (Tambah & Hapus) ───────────────
  const handleAddDivision = async (newDivName) => {
    if (!activeTeam) return;
    const clean = sanitizeText(newDivName?.trim() || '', 60);
    if (!clean) {
      showNotification('error', 'Nama kategori divisi tidak boleh kosong.');
      return;
    }

    if (teamDivisions.some((d) => d.toLowerCase() === clean.toLowerCase())) {
      showNotification('error', `Kategori divisi "${clean}" sudah terdaftar.`);
      return;
    }

    const nextDivisions = [...teamDivisions, clean];
    try {
      await updateTeam(activeTeam.slug, { divisions: nextDivisions });
      setNewDivisionBarInput('');
      setIsAddingDivisionBar(false);
      showNotification('success', `Kategori divisi "${clean}" berhasil ditambahkan!`);
    } catch (err) {
      showNotification('error', err.message || 'Gagal menambahkan divisi.');
    }
  };

  const handleDeleteDivision = async (divToDelete) => {
    if (!activeTeam) return;
    if (teamDivisions.length <= 1) {
      showNotification('error', 'Minimal harus tersisa 1 kategori divisi pada tim.');
      return;
    }

    // Hitung anggota yang menggunakan divisi ini
    const affectedMembers = (activeTeam.members || []).filter(
      (m) => (m.division || m.category || '').trim() === divToDelete.trim()
    );

    const remainingDivs = teamDivisions.filter((d) => d !== divToDelete);
    const fallbackDiv = remainingDivs[0] || 'Umum';

    const confirmMsg = affectedMembers.length > 0
      ? `Kategori divisi "${divToDelete}" sedang digunakan oleh ${affectedMembers.length} anggota.\n\nApakah Anda yakin ingin menghapus kategori divisi ini? Seluruh ${affectedMembers.length} anggota tersebut akan otomatis dipindahkan ke kategori "${fallbackDiv}".`
      : `Apakah Anda yakin ingin menghapus kategori divisi "${divToDelete}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      // Pindahkan anggota terdampak ke fallback division
      const updatedMembers = (activeTeam.members || []).map((m) => {
        const curDiv = (m.division || m.category || '').trim();
        if (curDiv === divToDelete.trim()) {
          return {
            ...m,
            role: fallbackDiv,
            division: fallbackDiv,
            category: fallbackDiv,
          };
        }
        return m;
      });

      await updateTeam(activeTeam.slug, {
        divisions: remainingDivs,
        members: updatedMembers,
      });

      // Update form jika sedang memilih divisi yang dihapus
      setMemberForm((prev) => {
        if (prev.division === divToDelete) {
          return { ...prev, division: remainingDivs[0] || '__custom__' };
        }
        return prev;
      });

      showNotification('success', `Kategori divisi "${divToDelete}" berhasil dihapus.`);
    } catch (err) {
      showNotification('error', err.message || 'Gagal menghapus kategori divisi.');
    }
  };

  // ─── Kelola Anggota Tim (Foto, Nama, Divisi) ───────────────
  const handleOpenAddMember = () => {
    setEditingMemberIndex(null);
    setMemberForm({
      name: '',
      division: teamDivisions[0] || '__custom__',
      customDivision: '',
      photo: '',
    });
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (index) => {
    const member = activeTeam.members[index];
    if (!member) return;
    setEditingMemberIndex(index);
    const curDiv = (member.division || member.category || member.role || 'Pengurus Harian').trim();
    const isKnown = teamDivisions.includes(curDiv);
    setMemberForm({
      name: member.name || '',
      division: isKnown ? curDiv : '__custom__',
      customDivision: isKnown ? '' : curDiv,
      photo: member.photo || '',
    });
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    const cleanMemberName = sanitizeText(memberForm.name, 80);
    const chosenDiv = memberForm.division === '__custom__' ? memberForm.customDivision : memberForm.division;
    const cleanDivision = sanitizeText(chosenDiv?.trim() || 'Pengurus Harian', 80);

    if (!cleanMemberName) {
      showNotification('error', 'Nama lengkap anggota wajib diisi.');
      return;
    }

    if (!cleanDivision) {
      showNotification('error', 'Kategori divisi wajib dipilih atau diisi.');
      return;
    }

    try {
      const finalPhoto = memberForm.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanMemberName)}&background=252f27&color=faeed4&size=256`;

      // Jika ada kategori divisi baru, daftarkan ke list divisions tim
      let nextDivisions = [...teamDivisions];
      if (!nextDivisions.some((d) => d.toLowerCase() === cleanDivision.toLowerCase())) {
        nextDivisions.push(cleanDivision);
      }

      // Jabatan adalah divisi itu sendiri (role = cleanDivision)
      const safeMemberData = {
        name: cleanMemberName,
        role: cleanDivision,
        division: cleanDivision,
        category: cleanDivision,
        photo: finalPhoto,
      };

      const currentMembers = [...(activeTeam.members || [])];
      let nextMembers;
      if (editingMemberIndex === null) {
        nextMembers = [...currentMembers, safeMemberData];
      } else {
        nextMembers = currentMembers.map((m, idx) => (idx === editingMemberIndex ? { ...m, ...safeMemberData } : m));
      }

      // Simpan pembaruan divisi dan anggota secara ATOMIK dalam satu operasi
      await updateTeam(activeTeam.slug, {
        divisions: nextDivisions,
        members: nextMembers,
      });

      showNotification(
        'success',
        editingMemberIndex === null
          ? `Anggota "${cleanMemberName}" berhasil ditambahkan ke divisi "${cleanDivision}"!`
          : `Data anggota "${cleanMemberName}" berhasil diperbarui!`
      );
      setIsMemberModalOpen(false);
    } catch (err) {
      showNotification('error', err.message || 'Terjadi kesalahan saat menyimpan data anggota.');
    }
  };

  const handleDeleteMember = async (index) => {
    const member = activeTeam.members[index];
    if (!member) return;
    const memberDiv = member.division || member.category || member.role || 'Divisi Tim';
    if (window.confirm(`Yakin ingin menghapus ${member.name} (${memberDiv}) dari tim?`)) {
      try {
        await removeMemberFromTeam(activeTeam.slug, index);
        showNotification('success', `Anggota "${member.name}" berhasil dihapus.`);
      } catch (err) {
        alert(err.message || 'Gagal menghapus anggota.');
      }
    }
  };

  if (!activeTeam) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Memuat data tim IYMPACK...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* ─── Header & Team Selector ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-forest/10 text-forest">
              {TEAM_LABELS[activeTeam.slug] || activeTeam.name}
            </span>
            <span className="text-xs text-gray-400">
              {activeTeam.members?.length || 0} Anggota Terdaftar
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading mt-1">
            Kelola Profil & Foto Tim
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Perbarui foto sampul tim, akun media sosial, serta daftar pengurus dan anggota divisi.
          </p>
        </div>

        {/* Jika Super Admin: Dropdown + Tambah/Hapus Cabang */}
        {isSuperAdmin() ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <label htmlFor="team-select" className="text-xs font-semibold text-gray-600 whitespace-nowrap">Pilih Cabang:</label>
              <select id="team-select" value={selectedTeamSlug} onChange={(e) => setSelectedTeamSlug(e.target.value)} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer max-w-[180px]">
                {teams.map((t) => (<option key={t.slug} value={t.slug}>{TEAM_LABELS[t.slug] || t.displayName || t.name}</option>))}
              </select>
            </div>
            <button type="button" onClick={() => setShowCreateBranch(true)} className="px-3.5 py-2 bg-forest hover:bg-forest/90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"><Plus className="w-3.5 h-3.5" /> Cabang Baru</button>
            {activeTeam && activeTeam.slug !== 'pusat' && (
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(`Hapus cabang "${activeTeam.displayName || activeTeam.name}"? Semua data tim ini akan hilang.`)) return;
                  try {
                    await deleteTeam(activeTeam.slug);
                    setSelectedTeamSlug(TEAMS.PUSAT);
                    showNotification('success', `Cabang "${activeTeam.name}" dihapus.`);
                  } catch (e) {
                    showNotification('error', e.message);
                  }
                }}
                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 cursor-pointer"
                title="Hapus cabang ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 self-start sm:self-auto">
            Area Kerja: <strong className="text-forest">{TEAM_LABELS[user?.userTeamId] || 'Cabang Resmi'}</strong>
          </div>
        )}
      </div>

      {/* ─── Notification Alert ──────────────────────────── */}
      {notification.message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── 1. Pengaturan Sampul & Profil Tim ─────────────── */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-heading">
              1. Foto Sampul & Identitas Tim
            </h2>
            <p className="text-xs text-gray-500">
              Foto ini tampil sebagai banner utama di halaman tentang kami dan halaman detail tim.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-forest hover:bg-forest/90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil'}</span>
          </button>
        </div>

        {/* Cover Photo Banner */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">
            Foto Bersama / Banner Tim (Landscape)
          </label>
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 aspect-[21/9] max-h-72 flex items-center justify-center group">
            {profileForm.coverImage ? (
              <img
                src={profileForm.coverImage}
                alt="Sampul Tim"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="text-center text-gray-400 p-4">
                <Camera className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <span className="text-xs">Belum ada foto sampul tim</span>
              </div>
            )}

            {/* Overlay Upload Button */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label className="px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-100 flex items-center gap-1.5 shadow-lg">
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Foto Sampul</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0], (img) => setProfileForm((prev) => ({ ...prev, coverImage: img })))}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Rekomendasi rasio landscape (16:9 atau 21:9), format JPG/PNG/WEBP maks 5MB.
          </p>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nama Tampilan Tim
            </label>
            <input
              type="text"
              value={profileForm.displayName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="Contoh: IYMPACK Jakarta"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Akun Instagram Resmi
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={profileForm.ig}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, ig: e.target.value }))}
                placeholder="@iympack.id"
                className="w-1/2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
              />
              <input
                type="text"
                value={profileForm.igUrl}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, igUrl: e.target.value }))}
                placeholder="https://instagram.com/..."
                className="w-1/2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Tagline / Deskripsi Singkat Divisi
            </label>
            <input
              type="text"
              value={profileForm.tagline}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, tagline: e.target.value }))}
              placeholder="Divisi kepemudaan dan aksi sosial IYMPACK..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>
        </div>
      </form>

      {/* ─── 2. Daftar Anggota Pengurus & Relawan ─────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-heading">
              2. Anggota Pengurus & Divisi ({activeTeam.members?.length || 0})
            </h2>
            <p className="text-xs text-gray-500">
              Kelola foto profil, nama lengkap, dan kategori divisi anggota di tim ini (posisi jabatan otomatis diselaraskan dengan divisi).
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddMember}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota Baru</span>
          </button>
        </div>

        {/* ─── Kelola Kategori Divisi (Chip List + Hapus + Tambah Cepat) ─── */}
        <div className="bg-gray-50/80 rounded-2xl border border-gray-200/80 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-forest" />
                <span>Daftar Kategori Divisi Tim ({teamDivisions.length})</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Klik tanda <span className="font-bold text-red-500">✕</span> pada kategori divisi untuk menghapusnya. Anggota di dalamnya akan otomatis dialihkan.
              </p>
            </div>
            {!isAddingDivisionBar && (
              <button
                type="button"
                onClick={() => setIsAddingDivisionBar(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-forest/10 hover:bg-forest/20 text-forest text-xs font-bold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kategori Divisi Baru</span>
              </button>
            )}
          </div>

          {/* Form Tambah Divisi Cepat */}
          {isAddingDivisionBar && (
            <div className="flex items-center gap-2 pt-1 animate-fadeIn">
              <input
                type="text"
                value={newDivisionBarInput}
                onChange={(e) => setNewDivisionBarInput(e.target.value)}
                placeholder="Tulis nama kategori divisi baru..."
                className="px-3 py-1.5 border border-forest/50 rounded-xl text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest flex-1 max-w-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDivision(newDivisionBarInput);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleAddDivision(newDivisionBarInput)}
                className="px-3.5 py-1.5 bg-forest text-white text-xs font-bold rounded-xl hover:bg-forest/90 cursor-pointer shadow-sm"
              >
                Tambah
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingDivisionBar(false);
                  setNewDivisionBarInput('');
                }}
                className="px-2.5 py-1.5 text-gray-500 hover:text-gray-700 text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}

          {/* Pill Chips Divisi */}
          <div className="flex flex-wrap gap-2 pt-1">
            {teamDivisions.length > 0 ? (
              teamDivisions.map((divName) => {
                const memberCount = (activeTeam.members || []).filter(
                  (m) => (m.division || m.category || '').trim() === divName.trim()
                ).length;

                return (
                  <div
                    key={divName}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 text-xs font-medium shadow-xs hover:border-forest/40 transition-colors group"
                  >
                    <span className="font-semibold">{divName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 group-hover:bg-forest/10 group-hover:text-forest rounded-full font-bold text-gray-500">
                      {memberCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDivision(divName)}
                      className="ml-1 w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title={`Hapus kategori divisi "${divName}"`}
                      aria-label={`Hapus divisi ${divName}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 italic py-1">
                Belum ada kategori divisi. Tambahkan kategori divisi baru dengan tombol di atas atau saat menambah anggota.
              </p>
            )}
          </div>
        </div>

        {/* Member Grid */}
        {activeTeam.members && activeTeam.members.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeTeam.members.map((member, idx) => (
              <div
                key={idx}
                className="bg-gray-50 hover:bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center text-center transition-all hover:shadow-md group relative"
              >
                {/* Action Buttons Overlay */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg shadow-sm border border-gray-200 z-10">
                  <button
                    type="button"
                    onClick={() => handleOpenEditMember(idx)}
                    className="p-1 hover:bg-gray-100 text-blue-600 rounded cursor-pointer"
                    title="Edit Anggota"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(idx)}
                    className="p-1 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                    title="Hapus Anggota"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Portrait Photo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-forest/20 shadow-inner bg-white mb-3 relative">
                  <img
                    src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=252f27&color=faeed4&size=256`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Divisi / Kategori Badge */}
                <span className="text-[9px] font-bold uppercase tracking-wider text-forest bg-forest/10 px-2.5 py-0.5 rounded-full mb-1 max-w-full truncate">
                  {member.division || member.category || member.role || 'Pengurus Harian'}
                </span>

                {/* Name */}
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                  {member.name}
                </h4>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
            Belum ada anggota yang didaftarkan pada tim ini. Klik &quot;Tambah Anggota Baru&quot; di atas.
          </div>
        )}
      </div>

      {/* ─── 3. Gallery Foto Aktivitas Tim ────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-heading flex items-center gap-2">
              <Images className="w-5 h-5 text-forest" />
              3. Gallery Foto Aktivitas Tim
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Foto-foto ini tampil di halaman profil tim sebagai dokumentasi kegiatan. Upload beberapa foto sekaligus.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveGallery}
            disabled={isSavingGallery}
            className="px-4 py-2 bg-forest hover:bg-forest/90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingGallery ? 'Menyimpan...' : 'Simpan Gallery'}</span>
          </button>
        </div>

        {/* Upload area */}
        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-forest/30 hover:border-forest/60 bg-gray-50 hover:bg-forest/5 py-8 cursor-pointer transition-all group">
          <Upload className="w-7 h-7 text-forest/50 group-hover:text-forest transition-colors" />
          <span className="text-xs font-bold text-gray-500 group-hover:text-forest transition-colors">
            {isUploadingGallery ? 'Mengupload...' : 'Klik untuk upload foto (bisa beberapa sekaligus)'}
          </span>
          <span className="text-[10px] text-gray-400">Maks. 10MB per foto · JPG, PNG, WebP</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={isUploadingGallery}
            onChange={(e) => handleGalleryUpload(e.target.files)}
          />
        </label>

        {/* Grid preview */}
        {galleryPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryPhotos.map((url, idx) => (
              <div key={idx} className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryPhoto(idx)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-red-500/90 hover:bg-red-600 text-white cursor-pointer shadow-lg"
                    title="Hapus foto ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="absolute bottom-1 right-1.5 text-[9px] text-white/70 font-medium">{idx + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
            Belum ada foto gallery. Upload foto aktivitas tim di atas.
          </div>
        )}

        {galleryPhotos.length > 0 && (
          <p className="text-[11px] text-gray-400">
            {galleryPhotos.length} foto · Hover foto untuk menghapus · Klik "Simpan Gallery" setelah selesai mengatur.
          </p>
        )}
      </div>

      {/* ─── Modal Tambah / Edit Anggota ─────────────────── */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-heading">
                  {editingMemberIndex === null ? 'Tambah Anggota Baru' : 'Edit Data Anggota'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  Lengkapi foto, nama, dan pilih divisi anggota
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              {/* 1. Upload Foto & Pratinjau */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-forest/30 shadow-md bg-gray-100 relative group">
                  <img
                    src={memberForm.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberForm.name || 'Foto')}&background=252f27&color=faeed4&size=256`}
                    alt="Foto Anggota"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Ubah Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files?.[0], (img) => setMemberForm((prev) => ({ ...prev, photo: img })))}
                      className="hidden"
                    />
                  </label>
                </div>
                <label className="text-xs text-forest font-semibold cursor-pointer hover:underline">
                  Unggah Foto Profil
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files?.[0], (img) => setMemberForm((prev) => ({ ...prev, photo: img })))}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 2. Nama Lengkap Anggota */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Lengkap Anggota <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.name}
                  onChange={(e) => setMemberForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest"
                  autoFocus
                />
              </div>

              {/* 3. Kategori Divisi (Jabatan = Divisi) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Kategori Divisi <span className="text-red-500">*</span>
                  </label>
                  {memberForm.division !== '__custom__' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDivision(memberForm.division)}
                      className="text-[10px] text-red-500 hover:text-red-700 font-medium hover:underline cursor-pointer"
                      title="Hapus kategori divisi yang dipilih ini"
                    >
                      Hapus Divisi Ini
                    </button>
                  )}
                </div>
                <select
                  value={memberForm.division}
                  onChange={(e) => setMemberForm((prev) => ({ ...prev, division: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest bg-white"
                >
                  {teamDivisions.map((div, i) => (
                    <option key={i} value={div}>
                      {div}
                    </option>
                  ))}
                  <option value="__custom__">+ Tambah Kategori Divisi Baru...</option>
                </select>

                {memberForm.division === '__custom__' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1.5 animate-fadeIn">
                    <label className="block text-[11px] font-bold text-forest">
                      Nama Divisi Baru:
                    </label>
                    <input
                      type="text"
                      required
                      value={memberForm.customDivision}
                      onChange={(e) => setMemberForm((prev) => ({ ...prev, customDivision: e.target.value }))}
                      placeholder="Contoh: Divisi Kemitraan & Sponsor"
                      className="w-full px-3 py-2 border border-forest/40 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest bg-white"
                    />
                    <p className="text-[10px] text-gray-500">
                      Kategori divisi baru ini akan otomatis menjadi grup divisi baru di halaman tim.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest/90 transition-all shadow-md cursor-pointer"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <div><h3 className="text-base font-bold text-gray-900">Tambah Cabang Baru</h3><p className="text-[11px] text-gray-400">Cabang baru otomatis muncul di website dan form tambah user</p></div>
              <button type="button" onClick={() => setShowCreateBranch(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const t = await createTeam(newBranch);
                  setSelectedTeamSlug(t.slug);
                  setShowCreateBranch(false);
                  setNewBranch({ name: '', slug: '', tagline: '' });
                  showNotification('success', 'Cabang ' + t.displayName + ' berhasil dibuat!');
                } catch (err) {
                  showNotification('error', err.message);
                }
              }}
              className="space-y-4"
            >
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Nama Cabang <span className="text-red-500">*</span></label><input type="text" required value={newBranch.name} onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })} placeholder="Contoh: Surabaya" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-forest" /></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Slug URL opsional</label><input type="text" value={newBranch.slug} onChange={(e) => setNewBranch({ ...newBranch, slug: e.target.value })} placeholder="surabaya" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-forest" /><p className="text-[10px] text-gray-400 mt-1">Hanya huruf kecil, angka, dan strip. Contoh: /tim/surabaya</p></div>
              <div><label className="block text-xs font-bold text-gray-700 mb-1">Tagline</label><input type="text" value={newBranch.tagline} onChange={(e) => setNewBranch({ ...newBranch, tagline: e.target.value })} placeholder="Semangat kolaborasi untuk Surabaya..." className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-forest" /></div>
              <div className="flex items-center justify-end gap-2 pt-2"><button type="button" onClick={() => setShowCreateBranch(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 cursor-pointer">Batal</button><button type="submit" className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest/90 shadow-md cursor-pointer flex items-center gap-1.5"><Plus className="w-4 h-4" /> Buat Cabang</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
