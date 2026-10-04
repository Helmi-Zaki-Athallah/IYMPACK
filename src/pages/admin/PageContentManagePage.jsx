/**
 * IYMPACK CMS — Page Content & Section Management (Super Admin Only)
 *
 * Allows Super Admin to edit every section across website pages:
 * - Homepage (Hero, Stats & About, 3 Pillars, Section Headers, CTA Banner)
 * - About Us Page (Banner, Story & History, Vision & Mission)
 * - Volunteer Portal (Banner, Divisions)
 * - Legal (Terms & Privacy Intro)
 */

import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useData.js';
import { DEFAULT_PAGE_SECTIONS } from '../../services/sections.service.js';
import {
  Home,
  Info,
  HeartHandshake,
  ShieldAlert,
  Save,
  RotateCcw,
  CheckCircle2,
  Upload,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';
import { validateUploadedFile } from '../../lib/security.js';
import { uploadImage } from '../../lib/upload.js';

export default function PageContentManagePage() {
  const { pageSections, updateSection, updatePageSections, resetSectionContent, resetAllSections } = useData();

  // Active Page Tab: 'home' | 'about' | 'volunteer' | 'legal'
  const [activeTab, setActiveTab] = useState('home');

  // Local form state cloned from pageSections
  const [formData, setFormData] = useState(pageSections || DEFAULT_PAGE_SECTIONS);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Accordion open/close state for Home sections
  const [openSections, setOpenSections] = useState({
    hero: true,
    stats: true,
    pillars: true,
    headers: false,
    cta: false,
    aboutBanner: true,
    aboutStory: true,
    aboutVision: true,
    volBanner: true,
    volDivisions: true,
    legalTerms: true,
    legalPrivacy: true,
  });

  useEffect(() => {
    if (pageSections) {
      setFormData(pageSections);
    }
  }, [pageSections]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Helper to handle text updates
  const handleFieldChange = (pageKey, sectionKey, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [sectionKey]: {
          ...prev[pageKey]?.[sectionKey],
          [field]: value,
        },
      },
    }));
  };

  // Helper for image upload (compress & upload to Hostinger or fallback)
  const handleImageUpload = async (pageKey, sectionKey, field, file) => {
    if (!file) return;
    const check = validateUploadedFile(file, { maxBytes: 10 * 1024 * 1024 });
    if (!check.valid) {
      showToast(check.error);
      return;
    }
    try {
      const urlOrBase64 = await uploadImage(file);
      handleFieldChange(pageKey, sectionKey, field, urlOrBase64);
      // Auto persist immediately so user doesn't lose it if they forget to click the bottom save button
      const currentSection = formData[pageKey]?.[sectionKey] || {};
      const updatedSection = { ...currentSection, [field]: urlOrBase64 };
      updateSection(pageKey, sectionKey, updatedSection);
      showToast('Gambar berhasil diunggah dan disimpan!');
    } catch {
      showToast('Gagal mengunggah gambar.');
    }
  };

  // Save current tab
  const handleSavePage = (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const pageData = formData[activeTab];
      updatePageSections(activeTab, pageData);
      showToast(`Perubahan konten pada halaman ${activeTab.toUpperCase()} berhasil disimpan!`);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan konten halaman.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save specific section
  const handleSaveSection = (pageKey, sectionKey) => {
    try {
      const secData = formData[pageKey]?.[sectionKey];
      updateSection(pageKey, sectionKey, secData);
      showToast(`Section "${sectionKey}" berhasil disimpan!`);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan section.');
    }
  };

  // Reset section
  const handleResetSection = (pageKey, sectionKey) => {
    if (confirm(`Kembalikan isi section "${sectionKey}" ke teks bawaan semula?`)) {
      resetSectionContent(pageKey, sectionKey);
      showToast(`Section "${sectionKey}" dikembalikan ke default.`);
    }
  };

  // Reset entire active page
  const handleResetActivePage = () => {
    if (confirm(`Kembalikan SELURUH section pada tab "${activeTab.toUpperCase()}" ke pengaturan awal?`)) {
      resetAllSections(activeTab);
      showToast(`Seluruh konten halaman ${activeTab.toUpperCase()} dikembalikan ke default.`);
    }
  };

  // Safe accessor to prevent undefined runtime errors
  const homeData = formData.home || DEFAULT_PAGE_SECTIONS.home;
  const aboutData = formData.about || DEFAULT_PAGE_SECTIONS.about;
  const volunteerData = formData.volunteer || DEFAULT_PAGE_SECTIONS.volunteer;
  const legalData = formData.legal || DEFAULT_PAGE_SECTIONS.legal;

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* ─── Toast Notification ───────────────────────── */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#1c241e] text-white border border-[#faeed4]/30 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Khusus Super Admin
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Edit Konten Per Section</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ubah headline, teks deskripsi, angka statistik, pilar program, dan judul seksi di seluruh halaman website
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={handleResetActivePage}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Tab Ini
          </button>
          <button
            type="button"
            onClick={handleSavePage}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest/90 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
        </div>
      </div>

      {/* ─── Page Tabs Navigation ─────────────────────── */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'home'
              ? 'bg-forest text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Home className="w-4 h-4" /> Halaman Beranda (Home)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'about'
              ? 'bg-forest text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Info className="w-4 h-4" /> Tentang Kami (/tentang-kami)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('volunteer')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'volunteer'
              ? 'bg-forest text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4" /> Portal Relawan (/relawan)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'legal'
              ? 'bg-forest text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Syarat & Kebijakan
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ─── TAB 1: BERANDA (HOMEPAGE) ─────────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* 1.1 Section Hero */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection('hero')}
              className="flex items-center justify-between p-5 bg-stone-50/70 border-b border-gray-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Section Hero Utama (Layar Paling Atas)</h3>
                  <p className="text-xs text-gray-500">Judul raksasa, deskripsi pembuka, tombol aksi, dan banner background</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('home', 'hero');
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 text-xs"
                  title="Reset section ini"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {openSections.hero ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {openSections.hero && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Headline Utama (Teks Raksasa)
                    </label>
                    <input
                      type="text"
                      value={homeData.hero.headline}
                      onChange={(e) => handleFieldChange('home', 'hero', 'headline', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                      placeholder="IYMPACK"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Teks Tombol Aksi Hero
                    </label>
                    <input
                      type="text"
                      value={homeData.hero.buttonText}
                      onChange={(e) => handleFieldChange('home', 'hero', 'buttonText', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                      placeholder="Ikut Kegiatan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Subheadline / Deskripsi Singkat
                    </label>
                    <textarea
                      rows={3}
                      value={homeData.hero.subheadline}
                      onChange={(e) => handleFieldChange('home', 'hero', 'subheadline', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                      placeholder="Mari bertumbuh bersama, membangun aksi sosial yang berdampak..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Tautan Tombol Aksi (URL / Halaman)
                    </label>
                    <input
                      type="text"
                      value={homeData.hero.buttonUrl}
                      onChange={(e) => handleFieldChange('home', 'hero', 'buttonUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                      placeholder="/event"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Gunakan rute lokal seperti <code>/event</code> atau tautan eksternal <code>https://...</code></p>
                  </div>
                </div>

                {/* Banner Photo Upload */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Foto Background Banner Hero
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-48 h-28 rounded-xl overflow-hidden bg-stone-900 border border-gray-200 relative group shrink-0">
                      <img
                        src={homeData.hero.bannerUrl || '/hero-hands.webp'}
                        alt="Hero Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 flex-grow w-full">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors">
                          <Upload className="w-3.5 h-3.5" /> Unggah Gambar Baru
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload('home', 'hero', 'bannerUrl', e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleFieldChange('home', 'hero', 'bannerUrl', '/hero-hands.webp')}
                          className="px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold"
                        >
                          Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => handleSaveSection('home', 'hero')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest/90"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Section Hero
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 1.2 Section Tentang Kami & Angka Statistik */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection('stats')}
              className="flex items-center justify-between p-5 bg-stone-50/70 border-b border-gray-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Section Tentang Kami & Angka Statistik</h3>
                  <p className="text-xs text-gray-500">Paragraf pengantar dan 3 metrik capaian (Relawan, Cabang, Penerima Manfaat)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('home', 'stats');
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 text-xs"
                  title="Reset section ini"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {openSections.stats ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {openSections.stats && (
              <div className="p-6 space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Judul Section
                    </label>
                    <input
                      type="text"
                      value={homeData.stats.title}
                      onChange={(e) => handleFieldChange('home', 'stats', 'title', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Teks Deskripsi Lengkap Tentang Kami (Beranda)
                    </label>
                    <textarea
                      rows={4}
                      value={homeData.stats.desc}
                      onChange={(e) => handleFieldChange('home', 'stats', 'desc', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                    />
                  </div>
                </div>

                {/* 3 Metric Counters */}
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    3 Angka Statistik Counter
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Stat 1 */}
                    <div className="p-3.5 rounded-xl border border-gray-200 bg-stone-50/50 space-y-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">Statistik 1</span>
                      <input
                        type="text"
                        value={homeData.stats.stat1Value}
                        onChange={(e) => handleFieldChange('home', 'stats', 'stat1Value', e.target.value)}
                        placeholder="100+"
                        className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-gray-200 bg-white"
                      />
                      <input
                        type="text"
                        value={homeData.stats.stat1Label}
                        onChange={(e) => handleFieldChange('home', 'stats', 'stat1Label', e.target.value)}
                        placeholder="Relawan Terlibat"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600"
                      />
                    </div>

                    {/* Stat 2 */}
                    <div className="p-3.5 rounded-xl border border-gray-200 bg-stone-50/50 space-y-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">Statistik 2</span>
                      <input
                        type="text"
                        value={homeData.stats.stat2Value}
                        onChange={(e) => handleFieldChange('home', 'stats', 'stat2Value', e.target.value)}
                        placeholder="8"
                        className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-gray-200 bg-white"
                      />
                      <input
                        type="text"
                        value={homeData.stats.stat2Label}
                        onChange={(e) => handleFieldChange('home', 'stats', 'stat2Label', e.target.value)}
                        placeholder="Cabang Kota"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600"
                      />
                    </div>

                    {/* Stat 3 */}
                    <div className="p-3.5 rounded-xl border border-gray-200 bg-stone-50/50 space-y-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">Statistik 3</span>
                      <input
                        type="text"
                        value={homeData.stats.stat3Value}
                        onChange={(e) => handleFieldChange('home', 'stats', 'stat3Value', e.target.value)}
                        placeholder="1.000+"
                        className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-gray-200 bg-white"
                      />
                      <input
                        type="text"
                        value={homeData.stats.stat3Label}
                        onChange={(e) => handleFieldChange('home', 'stats', 'stat3Label', e.target.value)}
                        placeholder="Penerima Manfaat"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => handleSaveSection('home', 'stats')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest/90"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Section Statistik
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 1.3 Section 3 Pilar Keterlibatan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection('pillars')}
              className="flex items-center justify-between p-5 bg-stone-50/70 border-b border-gray-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Section 3 Pilar Program & Keterlibatan</h3>
                  <p className="text-xs text-gray-500">Tiga kartu pilar: Jadi Volunteer, Kolaborasi Komunitas, dan Kemitraan & Sponsor</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('home', 'pillars');
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 text-xs"
                  title="Reset section ini"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {openSections.pillars ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {openSections.pillars && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Judul Section Pilar
                    </label>
                    <input
                      type="text"
                      value={homeData.pillars.title}
                      onChange={(e) => handleFieldChange('home', 'pillars', 'title', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Subjudul Section Pilar
                    </label>
                    <input
                      type="text"
                      value={homeData.pillars.subtitle}
                      onChange={(e) => handleFieldChange('home', 'pillars', 'subtitle', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                    />
                  </div>
                </div>

                {/* 3 Pillar Cards */}
                <div className="space-y-4">
                  {homeData.pillars.items.map((pillar, idx) => (
                    <div key={pillar.id} className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-forest uppercase tracking-wider">
                          Pilar {idx + 1}: {pillar.title}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">ID: {pillar.id}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Judul Kartu</label>
                          <input
                            type="text"
                            value={pillar.title}
                            onChange={(e) => {
                              const newItems = [...homeData.pillars.items];
                              newItems[idx] = { ...newItems[idx], title: e.target.value };
                              handleFieldChange('home', 'pillars', 'items', newItems);
                            }}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Teks Tombol</label>
                          <input
                            type="text"
                            value={pillar.actionLabel}
                            onChange={(e) => {
                              const newItems = [...homeData.pillars.items];
                              newItems[idx] = { ...newItems[idx], actionLabel: e.target.value };
                              handleFieldChange('home', 'pillars', 'items', newItems);
                            }}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Tautan Aksi (URL)</label>
                          <input
                            type="text"
                            value={pillar.actionUrl}
                            onChange={(e) => {
                              const newItems = [...homeData.pillars.items];
                              newItems[idx] = { ...newItems[idx], actionUrl: e.target.value };
                              handleFieldChange('home', 'pillars', 'items', newItems);
                            }}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Deskripsi Singkat</label>
                        <textarea
                          rows={2}
                          value={pillar.desc}
                          onChange={(e) => {
                            const newItems = [...homeData.pillars.items];
                            newItems[idx] = { ...newItems[idx], desc: e.target.value };
                            handleFieldChange('home', 'pillars', 'items', newItems);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Foto / Gambar Kartu</label>
                        <div className="flex items-center gap-3">
                          {pillar.image && (
                            <img src={pillar.image} alt={pillar.title} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                          )}
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest/10 text-forest hover:bg-forest/20 rounded-lg text-xs font-semibold cursor-pointer">
                            <Upload className="w-3 h-3" /> Unggah Foto
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const check = validateUploadedFile(file, { maxBytes: 10 * 1024 * 1024 });
                                if (!check.valid) {
                                  showToast(check.error);
                                  return;
                                }
                                try {
                                  const urlOrBase64 = await uploadImage(file);
                                  const newItems = [...(homeData.pillars.items || [])];
                                  newItems[idx] = { ...newItems[idx], image: urlOrBase64 };
                                  handleFieldChange('home', 'pillars', 'items', newItems);
                                  // Auto persist immediately so it immediately syncs to Hostinger and other devices
                                  const updatedPillars = {
                                    ...(formData.home?.pillars || {}),
                                    items: newItems,
                                  };
                                  updateSection('home', 'pillars', updatedPillars);
                                  showToast(`Foto pilar ${idx + 1} berhasil diunggah dan disimpan!`);
                                } catch {
                                  showToast('Gagal memproses gambar pilar.');
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveSection('home', 'pillars')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest/90"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan 3 Pilar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 1.4 Section Headers Dinamis (Kegiatan, Galeri, Testimoni, Artikel) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection('headers')}
              className="flex items-center justify-between p-5 bg-stone-50/70 border-b border-gray-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Judul & Subjudul Section Lainnya di Beranda</h3>
                  <p className="text-xs text-gray-500">Kustomisasi header section Kegiatan, Galeri, Testimoni, dan Artikel</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openSections.headers ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {openSections.headers && (
              <div className="p-6 space-y-6">
                {/* Events Header */}
                <div className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-3">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider">Header Section: Kegiatan Mendatang</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Judul Seksi</label>
                      <input
                        type="text"
                        value={homeData.eventsHeader?.title || ''}
                        onChange={(e) => handleFieldChange('home', 'eventsHeader', 'title', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Subjudul / Deskripsi Seksi</label>
                      <input
                        type="text"
                        value={homeData.eventsHeader?.subtitle || ''}
                        onChange={(e) => handleFieldChange('home', 'eventsHeader', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery Header */}
                <div className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-3">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider">Header Section: Galeri Showcase</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Judul Seksi</label>
                      <input
                        type="text"
                        value={homeData.galleryHeader?.title || ''}
                        onChange={(e) => handleFieldChange('home', 'galleryHeader', 'title', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Subjudul / Deskripsi Seksi</label>
                      <input
                        type="text"
                        value={homeData.galleryHeader?.subtitle || ''}
                        onChange={(e) => handleFieldChange('home', 'galleryHeader', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Testimonials Header */}
                <div className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-3">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider">Header Section: Testimoni</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Judul Seksi</label>
                      <input
                        type="text"
                        value={homeData.testimonialsHeader?.title || ''}
                        onChange={(e) => handleFieldChange('home', 'testimonialsHeader', 'title', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Subjudul / Deskripsi Seksi</label>
                      <input
                        type="text"
                        value={homeData.testimonialsHeader?.subtitle || ''}
                        onChange={(e) => handleFieldChange('home', 'testimonialsHeader', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Articles Header */}
                <div className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-3">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider">Header Section: Artikel & Berita</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Judul Seksi</label>
                      <input
                        type="text"
                        value={homeData.articlesHeader?.title || ''}
                        onChange={(e) => handleFieldChange('home', 'articlesHeader', 'title', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Subjudul / Deskripsi Seksi</label>
                      <input
                        type="text"
                        value={homeData.articlesHeader?.subtitle || ''}
                        onChange={(e) => handleFieldChange('home', 'articlesHeader', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 1.5 Section CTA Bawah */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection('cta')}
              className="flex items-center justify-between p-5 bg-stone-50/70 border-b border-gray-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Section Banner Ajakan / CTA Bawah</h3>
                  <p className="text-xs text-gray-500">Banner penutup sebelum footer yang mengajak bergabung menjadi relawan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('home', 'cta');
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 text-xs"
                  title="Reset section ini"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {openSections.cta ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {openSections.cta && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Judul Ajakan CTA
                    </label>
                    <input
                      type="text"
                      value={homeData.cta.title}
                      onChange={(e) => handleFieldChange('home', 'cta', 'title', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Teks Tombol CTA
                    </label>
                    <input
                      type="text"
                      value={homeData.cta.buttonText}
                      onChange={(e) => handleFieldChange('home', 'cta', 'buttonText', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Subjudul / Deskripsi Ajakan
                    </label>
                    <textarea
                      rows={2}
                      value={homeData.cta.subtitle}
                      onChange={(e) => handleFieldChange('home', 'cta', 'subtitle', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Tautan Tombol CTA (URL)
                    </label>
                    <input
                      type="text"
                      value={homeData.cta.buttonUrl}
                      onChange={(e) => handleFieldChange('home', 'cta', 'buttonUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                    />
                  </div>
                </div>

                {/* Background Image Upload */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Foto Background Banner CTA
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 rounded-xl border border-gray-200 bg-stone-50/50">
                    <img
                      src={homeData.cta?.imageUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1800&auto=format&fit=crop"}
                      alt="CTA Preview"
                      className="w-28 h-16 object-cover rounded-lg border border-gray-300"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-forest/90 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" /> Ganti Foto
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload('home', 'cta', 'imageUrl', e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                        {homeData.cta?.imageUrl && (
                          <button
                            type="button"
                            onClick={() => handleFieldChange('home', 'cta', 'imageUrl', '')}
                            className="px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-semibold"
                          >
                            Reset ke Default
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">Rekomendasi rasio 16:9 atau panorama (maksimal 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveSection('home', 'cta')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest/90"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Section CTA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ─── TAB 2: TENTANG KAMI ───────────────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          {/* 2.1 Banner Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection('aboutBanner')}
              className="flex items-center justify-between p-5 bg-stone-50/70 border-b border-gray-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Banner Header (/tentang-kami)</h3>
                  <p className="text-xs text-gray-500">Tagline kategori, judul utama, dan teks pembuka</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('about', 'banner');
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {openSections.aboutBanner ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {openSections.aboutBanner && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Tagline Kecil (Atas)
                    </label>
                    <input
                      type="text"
                      value={aboutData.banner.tag}
                      onChange={(e) => handleFieldChange('about', 'banner', 'tag', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Judul Utama Banner
                    </label>
                    <input
                      type="text"
                      value={aboutData.banner.title}
                      onChange={(e) => handleFieldChange('about', 'banner', 'title', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Deskripsi Ringkas
                  </label>
                  <textarea
                    rows={2}
                    value={aboutData.banner.desc}
                    onChange={(e) => handleFieldChange('about', 'banner', 'desc', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveSection('about', 'banner')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest/90"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Banner
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2.2 Kisah & Sejarah */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection('aboutStory')}
              className="flex items-center justify-between p-5 bg-stone-50/70 border-b border-gray-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Kisah, Sejarah, Landasan & Nilai Organisasi</h3>
                  <p className="text-xs text-gray-500">4 Poin penting: Tentang Yayasan, Sejarah, Fokus Kegiatan, serta Nilai & Harapan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('about', 'story');
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {openSections.aboutStory ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {openSections.aboutStory && (
              <div className="p-6 space-y-5">
                {/* 1. Tentang Yayasan */}
                <div className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-2">
                  <label className="block text-xs font-bold text-forest uppercase">1. Judul & Konten Tentang Yayasan</label>
                  <input
                    type="text"
                    value={aboutData.story.aboutTitle}
                    onChange={(e) => handleFieldChange('about', 'story', 'aboutTitle', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 bg-white"
                  />
                  <textarea
                    rows={3}
                    value={aboutData.story.aboutText}
                    onChange={(e) => handleFieldChange('about', 'story', 'aboutText', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                  />
                </div>

                {/* 2. Sejarah */}
                <div className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-2">
                  <label className="block text-xs font-bold text-forest uppercase">2. Judul & Konten Sejarah Berdirinya</label>
                  <input
                    type="text"
                    value={aboutData.story.historyTitle}
                    onChange={(e) => handleFieldChange('about', 'story', 'historyTitle', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 bg-white"
                  />
                  <textarea
                    rows={3}
                    value={aboutData.story.historyText}
                    onChange={(e) => handleFieldChange('about', 'story', 'historyText', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                  />
                </div>

                {/* 3. Fokus & Kegiatan */}
                <div className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-2">
                  <label className="block text-xs font-bold text-forest uppercase">3. Judul & Konten Fokus dan Kegiatan</label>
                  <input
                    type="text"
                    value={aboutData.story.focusTitle}
                    onChange={(e) => handleFieldChange('about', 'story', 'focusTitle', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 bg-white"
                  />
                  <textarea
                    rows={3}
                    value={aboutData.story.focusText}
                    onChange={(e) => handleFieldChange('about', 'story', 'focusText', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                  />
                </div>

                {/* 4. Nilai & Harapan */}
                <div className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-2">
                  <label className="block text-xs font-bold text-forest uppercase">4. Judul & Konten Nilai dan Harapan</label>
                  <input
                    type="text"
                    value={aboutData.story.valuesTitle}
                    onChange={(e) => handleFieldChange('about', 'story', 'valuesTitle', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 bg-white"
                  />
                  <textarea
                    rows={3}
                    value={aboutData.story.valuesText}
                    onChange={(e) => handleFieldChange('about', 'story', 'valuesText', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveSection('about', 'story')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest/90"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Kisah & Sejarah
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2.3 Visi & Misi */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection('aboutVision')}
              className="flex items-center justify-between p-5 bg-stone-50/70 border-b border-gray-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Visi & Misi Yayasan</h3>
                  <p className="text-xs text-gray-500">Rumusan visi besar dan butir-butir misi pelaksanaan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('about', 'visionMission');
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {openSections.aboutVision ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {openSections.aboutVision && (
              <div className="p-6 space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Pernyataan Visi
                    </label>
                    <textarea
                      rows={3}
                      value={aboutData.visionMission.visionText}
                      onChange={(e) => handleFieldChange('about', 'visionMission', 'visionText', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Butir-butir Misi
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentMissions = aboutData.visionMission.missions || [];
                          handleFieldChange('about', 'visionMission', 'missions', [...currentMissions, 'Misi baru...']);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Misi
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {aboutData.visionMission.missions.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-forest/10 text-forest text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={m}
                            onChange={(e) => {
                              const newMissions = [...aboutData.visionMission.missions];
                              newMissions[idx] = e.target.value;
                              handleFieldChange('about', 'visionMission', 'missions', newMissions);
                            }}
                            className="flex-grow px-3 py-2 text-xs rounded-lg border border-gray-200"
                          />
                          {aboutData.visionMission.missions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newMissions = aboutData.visionMission.missions.filter((_, i) => i !== idx);
                                handleFieldChange('about', 'visionMission', 'missions', newMissions);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveSection('about', 'visionMission')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest/90"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Visi & Misi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ─── TAB 3: PORTAL RELAWAN ─────────────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'volunteer' && (
        <div className="space-y-6">
          {/* 3.1 Banner Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection('volBanner')}
              className="flex items-center justify-between p-5 bg-stone-50/70 border-b border-gray-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Banner Header Portal Relawan (/relawan)</h3>
                  <p className="text-xs text-gray-500">Tagline kategori, judul utama, dan teks sambutan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('volunteer', 'banner');
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {openSections.volBanner ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {openSections.volBanner && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Tagline Kecil (Atas)
                    </label>
                    <input
                      type="text"
                      value={volunteerData.banner.tag}
                      onChange={(e) => handleFieldChange('volunteer', 'banner', 'tag', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Judul Utama Banner
                    </label>
                    <input
                      type="text"
                      value={volunteerData.banner.title}
                      onChange={(e) => handleFieldChange('volunteer', 'banner', 'title', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Deskripsi Ringkas
                  </label>
                  <textarea
                    rows={2}
                    value={volunteerData.banner.desc}
                    onChange={(e) => handleFieldChange('volunteer', 'banner', 'desc', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveSection('volunteer', 'banner')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest/90"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Banner Relawan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3.2 Bidang Kontribusi & Divisi */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSection('volDivisions')}
              className="flex items-center justify-between p-5 bg-stone-50/70 border-b border-gray-100 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Bidang Kontribusi & Pilihan Divisi Relawan</h3>
                  <p className="text-xs text-gray-500">Judul seksi dan 4 deskripsi divisi (Pengajaran, Media, Logistik, Kemitraan)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('volunteer', 'divisions');
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {openSections.volDivisions ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {openSections.volDivisions && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Subjudul Seksi (Tagline)
                    </label>
                    <input
                      type="text"
                      value={volunteerData.divisionsHeader?.subtitle || ''}
                      onChange={(e) => handleFieldChange('volunteer', 'divisionsHeader', 'subtitle', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Judul Seksi
                    </label>
                    <input
                      type="text"
                      value={volunteerData.divisionsHeader?.title || ''}
                      onChange={(e) => handleFieldChange('volunteer', 'divisionsHeader', 'title', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Daftar Divisi Relawan
                  </h4>
                  {volunteerData.divisions.map((div, idx) => (
                    <div key={div.id} className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-forest uppercase">Divisi {idx + 1}</span>
                        <span className="text-[11px] text-gray-400 font-mono">{div.id}</span>
                      </div>
                      <input
                        type="text"
                        value={div.title}
                        onChange={(e) => {
                          const newDivs = [...volunteerData.divisions];
                          newDivs[idx] = { ...newDivs[idx], title: e.target.value };
                          handleFieldChange('volunteer', 'divisions', null, newDivs);
                        }}
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 bg-white"
                      />
                      <textarea
                        rows={2}
                        value={div.desc}
                        onChange={(e) => {
                          const newDivs = [...volunteerData.divisions];
                          newDivs[idx] = { ...newDivs[idx], desc: e.target.value };
                          handleFieldChange('volunteer', 'divisions', null, newDivs);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateSection('volunteer', 'divisionsHeader', volunteerData.divisionsHeader);
                      updateSection('volunteer', 'divisions', volunteerData.divisions);
                      showToast('Divisi relawan berhasil disimpan!');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest/90"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Bidang Divisi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ─── TAB 4: SYARAT & KEBIJAKAN PRIVASI ─────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          {/* 4.1 Syarat & Ketentuan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Halaman Syarat & Ketentuan (/syarat-dan-ketentuan)</h3>
              <button
                type="button"
                onClick={() => handleResetSection('legal', 'termsIntro')}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tanggal Berlaku Efektif
                </label>
                <input
                  type="text"
                  value={legalData.termsEffectiveDate}
                  onChange={(e) => handleFieldChange('legal', 'termsEffectiveDate', null, e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                  placeholder="1 Januari 2026"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Teks Pengantar Dokumen
                </label>
                <textarea
                  rows={3}
                  value={legalData.termsIntro}
                  onChange={(e) => handleFieldChange('legal', 'termsIntro', null, e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* 4.2 Kebijakan Privasi */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Halaman Kebijakan Privasi (/kebijakan-privasi)</h3>
              <button
                type="button"
                onClick={() => handleResetSection('legal', 'privacyIntro')}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tanggal Berlaku Efektif
                </label>
                <input
                  type="text"
                  value={legalData.privacyEffectiveDate}
                  onChange={(e) => handleFieldChange('legal', 'privacyEffectiveDate', null, e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                  placeholder="1 Januari 2026"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Teks Pengantar Kebijakan Privasi
                </label>
                <textarea
                  rows={3}
                  value={legalData.privacyIntro}
                  onChange={(e) => handleFieldChange('legal', 'privacyIntro', null, e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSavePage}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest/90"
              >
                <Save className="w-3.5 h-3.5" /> Simpan Dokumen Legal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
