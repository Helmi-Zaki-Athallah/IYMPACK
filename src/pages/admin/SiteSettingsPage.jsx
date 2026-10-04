/**
 * IYMPACK CMS — Site Settings Page (Super Admin Only)
 */

import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useData.js';
import { resetSiteSettings } from '../../services/settings.service.js';
import { validateUploadedFile } from '../../lib/security.js';
import { uploadImage } from '../../lib/upload.js';
import {
   Save, RefreshCw, CheckCircle2, Globe, MapPin, Share2, FileText, Image
} from 'lucide-react';

export default function SiteSettingsPage() {
  const { siteSettings, updateSettings, refreshSettings } = useData();
  const [formData, setFormData] = useState(siteSettings || {});
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [_isUploadingHero, setIsUploadingHero] = useState(false);

  useEffect(() => {
    if (siteSettings) {
      setFormData(siteSettings);
    }
  }, [siteSettings]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const check = validateUploadedFile(file, { maxBytes: 15 * 1024 * 1024 });
      if (!check.valid) {
        alert(check.error);
        return;
      }
      setIsUploadingHero(true);
      try {
        const url = await uploadImage(file);
        handleChange('heroBannerUrl', url);
      } catch {
        alert('Gagal mengunggah banner.');
      } finally {
        setIsUploadingHero(false);
      }
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateSettings(formData);
      showToast('Pengaturan situs berhasil diperbarui!');
    } catch {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Kembalikan seluruh pengaturan situs ke nilai bawaan (default)?')) {
      resetSiteSettings();
      refreshSettings();
      showToast('Pengaturan dikembalikan ke bawaan sistem.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ─── Toast Notification ───────────────────────── */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-forest text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 font-heading">Pengaturan Global Situs</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Konfigurasi identitas organisasi, kontak resmi, dan tautan media sosial
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Default
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 0. Hero Banner (Homepage) — Khusus Super Admin */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2.5 text-forest font-bold text-sm">
              <Image className="w-4 h-4" />
              <span>Foto Hero Banner (Halaman Utama / Beranda)</span>
            </div>
            {formData.heroBannerUrl && formData.heroBannerUrl !== '/hero-hands.webp' && formData.heroBannerUrl !== '/hero-hands.png' && (
              <button
                type="button"
                onClick={() => handleChange('heroBannerUrl', '/hero-hands.webp')}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold transition-colors"
              >
                Gunakan Gambar Default
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Foto ini ditampilkan sebagai latar belakang utama di bagian atas Beranda (Hero Section) website IYMPACK.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Upload Foto Banner dari Komputer/HP
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroUpload}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-forest/10 file:text-forest hover:file:bg-forest/20 cursor-pointer"
                />
                <p className="text-[11px] text-gray-400 mt-1">Disarankan foto lanskap resolusi tinggi (1920x1080 px atau lebih).</p>
              </div>

            </div>

            {/* Live Preview */}
            <div>
              <span className="block text-xs font-semibold text-gray-600 mb-1.5">
                Pratinjau Hero Banner Aktif:
              </span>
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black aspect-video flex items-center justify-center group shadow-md">
                <img
                  src={formData.heroBannerUrl || '/hero-hands.webp'}
                  alt="Pratinjau Hero Banner"
                  className="w-full h-full object-cover filter brightness-90"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/hero-hands.webp';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-sm font-bold font-heading">IYMPACK</p>
                  <p className="text-[10px] text-stone-300">Pratinjau tampilan beranda</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Identitas Organisasi */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-forest font-bold pb-2 border-b border-gray-100 text-sm">
            <Globe className="w-4 h-4" />
            <span>Identitas Organisasi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Singkat / Brand</label>
              <input
                type="text"
                value={formData.orgName || ''}
                onChange={(e) => handleChange('orgName', e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slogan</label>
              <input
                type="text"
                value={formData.slogan || ''}
                onChange={(e) => handleChange('slogan', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap Yayasan / Lembaga</label>
            <input
              type="text"
              value={formData.orgFullName || ''}
              onChange={(e) => handleChange('orgFullName', e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
            />
          </div>
        </div>

        {/* 2. Informasi Kontak & Alamat */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-forest font-bold pb-2 border-b border-gray-100 text-sm">
            <MapPin className="w-4 h-4" />
            <span>Kontak Resmi & Sekretariat</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Publik</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nomor Telepon</label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">WhatsApp Admin</label>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="6281234567890"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alamat Kantor / Sekretariat</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Google Maps Embed URL / Kode Semat Peta</label>
            <input
              type="text"
              value={formData.mapsEmbedUrl || ''}
              onChange={(e) => {
                let val = e.target.value.trim();
                const match = val.match(/src=["'](.*?)["']/);
                if (match && match[1]) {
                  val = match[1];
                }
                handleChange('mapsEmbedUrl', val);
              }}
              placeholder="https://www.google.com/maps/embed?pb=... atau kosongkan untuk otomatis dari alamat"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Bisa langsung paste link embed Google Maps ("Bagikan" &rarr; "Sematkan peta") atau kode &lt;iframe&gt;. Jika dikosongkan, peta akan otomatis mencari lokasi berdasarkan teks alamat di atas.
            </span>
          </div>
        </div>

        {/* 3. Media Sosial */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-forest font-bold pb-2 border-b border-gray-100 text-sm">
            <Share2 className="w-4 h-4" />
            <span>Tautan Media Sosial</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Instagram URL</label>
              <input
                type="url"
                value={formData.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedin || ''}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">TikTok URL</label>
              <input
                type="url"
                value={formData.tiktok || ''}
                onChange={(e) => handleChange('tiktok', e.target.value)}
                placeholder="https://tiktok.com/@..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Komunitas WhatsApp (Grup / Channel)</label>
              <input
                type="url"
                value={formData.whatsappCommunity || ''}
                onChange={(e) => handleChange('whatsappCommunity', e.target.value)}
                placeholder="https://chat.whatsapp.com/... atau https://whatsapp.com/channel/..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
              />
            </div>
          </div>
        </div>

        {/* 4. Footer & Copyright */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-forest font-bold pb-2 border-b border-gray-100 text-sm">
            <FileText className="w-4 h-4" />
            <span>Footer & Hak Cipta</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teks Hak Cipta Footer</label>
            <input
              type="text"
              value={formData.footerText || ''}
              onChange={(e) => handleChange('footerText', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-forest hover:bg-forest-dark text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-forest/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
