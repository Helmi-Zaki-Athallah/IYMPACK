/**
 * IYMPACK CMS — Teams & Chapters Service
 *
 * Mengelola data 8 tim/chapter IYMPACK (Pusat, Jakarta, Bogor, Depok, Tangerang, Bekasi, Bandung, Mengajar)
 * Menyimpan dan menyinkronkan profil tim dan anggota pengurus ke LocalStorage.
 */

import { LS_KEYS } from '../lib/db.constants.js';
import { getCollection, setCollection } from '../lib/storage.js';
import { teamsData as initialTeamsData } from '../data/teamsData.js';
import { createTeamProfile } from '../lib/db.schemas.js';
import { now, generateSlug } from '../lib/utils.js';
import { sanitizeText, sanitizeUrl } from '../lib/security.js';

/**
 * Buat cabang/chapter baru — dinamis, tidak lagi hardcode 8.
 */
export async function createTeam(data = {}) {
  const rawName = sanitizeText(data.name || '', 60);
  if (!rawName || rawName.length < 2) throw new Error('Nama cabang wajib diisi (min 2 karakter).');
  let slug = sanitizeText(data.slug || generateSlug(rawName), 40).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!slug || slug.length < 2) throw new Error('Slug cabang tidak valid.');
  const existing = getTeams();
  if (existing.some((t) => t.slug?.toLowerCase() === slug || t.id?.toLowerCase() === slug)) {
    throw new Error(`Slug "${slug}" sudah dipakai cabang lain.`);
  }
  const team = createTeamProfile({
    id: slug,
    slug,
    name: `IYMPACK ${rawName.replace(/^iympack\s*/i, '')}`,
    displayName: rawName,
    tagline: sanitizeText(data.tagline || `Chapter IYMPACK ${rawName}`, 200),
    ig: sanitizeText(data.ig || '', 50),
    igUrl: sanitizeUrl(data.igUrl || ''),
    tiktok: sanitizeText(data.tiktok || '', 50),
    tiktokUrl: sanitizeUrl(data.tiktokUrl || ''),
    coverImage: data.coverImage || '',
    members: [],
  });
  const next = [...existing, team];
  await setCollection(LS_KEYS.TEAMS, next);
  return team;
}

export async function deleteTeam(slug) {
  const lower = slug.toLowerCase().trim();
  if (lower === 'pusat') throw new Error('Cabang Pusat tidak boleh dihapus.');
  const teams = getTeams();
  const idx = teams.findIndex((t) => t.slug?.toLowerCase() === lower || t.id?.toLowerCase() === lower);
  if (idx === -1) throw new Error(`Cabang "${slug}" tidak ditemukan.`);
  const removed = teams[idx];
  teams.splice(idx, 1);
  await setCollection(LS_KEYS.TEAMS, teams);
  return removed;
}

/**
 * Inisialisasi koleksi tim jika belum ada di LocalStorage
 */
export function initTeams() {
  const existing = getCollection(LS_KEYS.TEAMS);
  if (!existing || existing.length === 0) {
    const formatted = initialTeamsData.map((t) => createTeamProfile(t));
    setCollection(LS_KEYS.TEAMS, formatted);
    return formatted;
  }
  return existing;
}

/**
 * Dapatkan semua data tim
 * @returns {Array}
 */
export function getTeams() {
  const teams = getCollection(LS_KEYS.TEAMS);
  if (!teams || teams.length === 0) {
    return initTeams();
  }
  return teams;
}

/**
 * Dapatkan data tim berdasarkan slug atau id
 * @param {string} slugOrId
 * @returns {Object|null}
 */
export function getTeamBySlug(slugOrId) {
  if (!slugOrId) return null;
  const teams = getTeams();
  const lower = slugOrId.toLowerCase().trim();
  return teams.find((t) => t.slug?.toLowerCase() === lower || t.id?.toLowerCase() === lower) || null;
}

/**
 * Perbarui informasi profil tim (coverImage, tagline, ig, tiktok, dll)
 * @param {string} slug
 * @param {Object} updates
 * @returns {Promise<Object>} Updated team
 */
export async function updateTeam(slug, updates) {
  const teams = getTeams();
  const lower = slug.toLowerCase().trim();
  const index = teams.findIndex((t) => t.slug?.toLowerCase() === lower || t.id?.toLowerCase() === lower);

  if (index === -1) {
    throw new Error(`Tim dengan id "${slug}" tidak ditemukan.`);
  }

  const updatedTeam = {
    ...teams[index],
    ...updates,
    membersCount: (updates.members || teams[index].members || []).length,
    updatedAt: now(),
  };

  teams[index] = updatedTeam;
  await setCollection(LS_KEYS.TEAMS, teams);
  return updatedTeam;
}

/**
 * Tambah anggota baru ke tim
 * @param {string} slug
 * @param {Object} member - { name, role, category, photo }
 * @returns {Promise<Object>} Updated team
 */
export async function addMemberToTeam(slug, member) {
  const team = getTeamBySlug(slug);
  if (!team) throw new Error(`Tim "${slug}" tidak ditemukan.`);

  const newMember = {
    name: member.name || '',
    role: member.role || '',
    division: member.division || member.category || 'Pengurus Harian',
    category: member.division || member.category || 'Pengurus Harian',
    photo: member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Member')}&background=252f27&color=faeed4&size=256`,
  };

  const members = [...(team.members || []), newMember];
  return await updateTeam(slug, { members });
}

/**
 * Perbarui anggota tim pada index tertentu
 * @param {string} slug
 * @param {number} memberIndex
 * @param {Object} updatedData
 * @returns {Promise<Object>} Updated team
 */
export async function updateMemberInTeam(slug, memberIndex, updatedData) {
  const team = getTeamBySlug(slug);
  if (!team) throw new Error(`Tim "${slug}" tidak ditemukan.`);

  const members = [...(team.members || [])];
  if (memberIndex < 0 || memberIndex >= members.length) {
    throw new Error('Index anggota tidak valid.');
  }

  members[memberIndex] = {
    ...members[memberIndex],
    ...updatedData,
  };

  return await updateTeam(slug, { members });
}

/**
 * Hapus anggota tim pada index tertentu
 * @param {string} slug
 * @param {number} memberIndex
 * @returns {Promise<Object>} Updated team
 */
export async function removeMemberFromTeam(slug, memberIndex) {
  const team = getTeamBySlug(slug);
  if (!team) throw new Error(`Tim "${slug}" tidak ditemukan.`);

  const members = [...(team.members || [])];
  if (memberIndex < 0 || memberIndex >= members.length) {
    throw new Error('Index anggota tidak valid.');
  }

  members.splice(memberIndex, 1);
  return await updateTeam(slug, { members });
}
