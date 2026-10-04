/**
 * IYMPACK CMS — Database Seeder
 *
 * Auto-seeds LocalStorage with default data on first run:
 * - 1 Super Admin account (Pusat)
 * - 7 Regional Admin accounts (Jakarta, Bogor, Depok, Tangerang, Bekasi, Bandung, Mengajar)
 * - 8 Teams & Chapters data (Pusat, Jakarta, Bogor, Depok, Tangerang, Bekasi, Bandung, Mengajar)
 * - Sample events with team association
 * - Sample articles & applicants
 * - Default site settings
 */

import { LS_KEYS, ROLES, EVENT_STATUS, APPLICANT_STATUS, ARTICLE_STATUS, TEAMS } from './db.constants.js';
import { createUser, createEvent, createApplicant, createArticle, createSiteSettings } from './db.schemas.js';
import { getCollection, setCollection, setObject, syncWithHostingerDatabase } from './storage.js';
import { fetchServerCollections } from './api.js';
import { hashPassword } from '../services/auth.service.js';
import { initTeams } from '../services/teams.service.js';
import { initTestimonials, initGalleryPhotos, initFaqs } from '../services/content.service.js';

// Existing data from the project to reuse
import { eventsData, articlesData, siteConfig } from '../data/iympackData.js';

/**
 * Deteksi teamId berdasarkan judul, lokasi, atau pembicara event
 */
function detectTeamId(item = {}) {
  const text = `${item.location || ''} ${item.title || ''} ${item.speaker || ''}`.toLowerCase();
  if (text.includes('jakarta')) return TEAMS.JAKARTA;
  if (text.includes('bogor')) return TEAMS.BOGOR;
  if (text.includes('depok')) return TEAMS.DEPOK;
  if (text.includes('tangerang')) return TEAMS.TANGERANG;
  if (text.includes('bekasi')) return TEAMS.BEKASI;
  if (text.includes('bandung')) return TEAMS.BANDUNG;
  if (text.includes('mengajar')) return TEAMS.MENGAJAR;
  return TEAMS.PUSAT;
}

/**
 * Main seed function — call once on app startup.
 */
export async function seedDatabase() {
  // 1. Cek apakah server Hostinger sudah memiliki koleksi data
  try {
    const serverCollections = await fetchServerCollections();
    if (serverCollections && typeof serverCollections === 'object') {
      await syncWithHostingerDatabase();
      return;
    }
  } catch {}

  console.log('[seed] 🌱 Inisialisasi awal data website...');

  try {
    await seedUsers();
    initTeams();
    seedEvents();
    seedArticles();
    seedApplicants();
    seedSiteSettings();
    await setCollection(LS_KEYS.GALLERY, [], true);
    await setCollection(LS_KEYS.TESTIMONIALS, [], true);
    await setCollection(LS_KEYS.FAQS, [], true);
    console.log('[seed] ✅ Inisialisasi data selesai!');
  } catch (err) {
    console.error('[seed] ❌ Gagal melakukan inisialisasi:', err);
  }
}

// ─── Users (8 Akun Tim + Master Super Admin) ─────────────────

async function seedUsers() {
  // Password default di-hash langsung \u2014 tidak pernah disimpan sebagai plaintext.
  // PENTING: Setelah deploy, segera ganti semua password via panel /admin/akun.
  const { hash: defaultHash, salt: defaultSalt } = await hashPassword('admin@iympack2026');

  const teamAccounts = [
    {
      id: 'user-superadmin-001',
      name: 'Super Admin IYMPACK',
      email: 'superadmin@iympack.id',
      role: ROLES.SUPER_ADMIN,
      teamId: TEAMS.PUSAT },
    {
      id: 'user-pusat-001',
      name: 'Admin IYMPACK Pusat',
      email: 'pusat@iympack.id',
      role: ROLES.SUPER_ADMIN,
      teamId: TEAMS.PUSAT },
    {
      id: 'user-jakarta-001',
      name: 'Admin IYMPACK Jakarta',
      email: 'jakarta@iympack.id',
      role: ROLES.ADMIN,
      teamId: TEAMS.JAKARTA },
    {
      id: 'user-bogor-001',
      name: 'Admin IYMPACK Bogor',
      email: 'bogor@iympack.id',
      role: ROLES.ADMIN,
      teamId: TEAMS.BOGOR },
    {
      id: 'user-depok-001',
      name: 'Admin IYMPACK Depok',
      email: 'depok@iympack.id',
      role: ROLES.ADMIN,
      teamId: TEAMS.DEPOK },
    {
      id: 'user-tangerang-001',
      name: 'Admin IYMPACK Tangerang',
      email: 'tangerang@iympack.id',
      role: ROLES.ADMIN,
      teamId: TEAMS.TANGERANG },
    {
      id: 'user-bekasi-001',
      name: 'Admin IYMPACK Bekasi',
      email: 'bekasi@iympack.id',
      role: ROLES.ADMIN,
      teamId: TEAMS.BEKASI },
    {
      id: 'user-bandung-001',
      name: 'Admin IYMPACK Bandung',
      email: 'bandung@iympack.id',
      role: ROLES.ADMIN,
      teamId: TEAMS.BANDUNG },
    {
      id: 'user-mengajar-001',
      name: 'Admin IYMPACK Mengajar',
      email: 'mengajar@iympack.id',
      role: ROLES.ADMIN,
      teamId: TEAMS.MENGAJAR },
  ];

  const users = teamAccounts.map((acc) =>
    createUser({
      id: acc.id,
      name: acc.name,
      email: acc.email,
      passwordHash: defaultHash,
      salt: defaultSalt,
      role: acc.role,
      teamId: acc.teamId,
      createdAt: '2024-11-04T00:00:00.000Z' })
  );

  setCollection(LS_KEYS.USERS, users, false);
  console.log(`[seed]   👤 ${users.length} akun tim dibuat`);
}

// ─── Events ─────────────────────────────────────────────────
function seedEvents() {
  setCollection(LS_KEYS.EVENTS, [], false);
  console.log('[seed]   📅 Inisialisasi daftar kegiatan kosong (clean slate)');
}

// ─── Articles ───────────────────────────────────────────────
function seedArticles() {
  setCollection(LS_KEYS.ARTICLES, [], false);
  console.log('[seed]   📰 Inisialisasi daftar artikel kosong (clean slate)');
}

// ─── Applicants ─────────────────────────────────────────────
function seedApplicants() {
  setCollection(LS_KEYS.APPLICANTS, [], false);
  console.log('[seed]   📝 Inisialisasi daftar pendaftar kosong (clean slate)');
}

// ─── Site Settings ──────────────────────────────────────────

function seedSiteSettings() {
  const settings = createSiteSettings({
    orgName: siteConfig.name,
    orgFullName: 'Yayasan Indonesia Yuwana Muda Peduli Aksi Cinta Kasih',
    slogan: 'BERBAGI UNTUK BERSAMA',
    heroBannerUrl: '/hero-hands.webp',
    contactPhone: siteConfig.phone,
    whatsapp: siteConfig.whatsapp,
    address: siteConfig.address,
    email: siteConfig.email,
    instagram: siteConfig.socials?.instagram || '@iympack',
    tiktok: siteConfig.socials?.tiktok || '@iympack',
    whatsappCommunity: siteConfig.socials?.whatsappCommunity || 'https://chat.whatsapp.com/IYMPACK-Official',
    logoUrl: '/logo-navbar.png',
    footerText: '© 2026 Yayasan IYMPACK. Hak Cipta Dilindungi.' });

  setObject(LS_KEYS.SITE_SETTINGS, settings, false);
  console.log('[seed]   ⚙️ Pengaturan situs dibuat');
}
