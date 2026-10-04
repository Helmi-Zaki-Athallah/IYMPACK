/**
 * IYMPACK CMS — Data Context
 *
 * Centralized state provider for CMS data (events, articles, applicants, teams, settings).
 * Mendukung pembagian hak akses terisolasi untuk 8 tim IYMPACK:
 * - Admin Cabang: Data (Events, Applicants, Articles, Teams) terkunci khusus cabang mereka.
 * - Super Admin (Pusat): Akses global ke seluruh cabang dan kontrol pengaturan situs/hero banner.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataContext } from './DataContextValue.js';
import { useAuth } from '../hooks/useAuth.js';

// Services
import * as eventsService from '../services/events.service.js';
import * as articlesService from '../services/articles.service.js';
import * as applicantsService from '../services/applicants.service.js';
import * as settingsService from '../services/settings.service.js';
import * as usersService from '../services/users.service.js';
import * as teamsService from '../services/teams.service.js';
import * as auditService from '../services/audit.service.js';
import * as contentService from '../services/content.service.js';
import * as sectionsService from '../services/sections.service.js';
import { logAction } from '../services/audit.service.js';
import { AUDIT_ACTIONS, TEAMS, TEAM_LABELS, LS_KEYS } from '../lib/db.constants.js';
import { syncWithHostingerDatabase } from '../lib/storage.js';

export function DataProvider({ children }) {
  const { user, isSuperAdmin } = useAuth();

  // ─── State ────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [users, setUsers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [pageSections, setPageSections] = useState(sectionsService.DEFAULT_PAGE_SECTIONS);
  const [isLoading, _setIsLoading] = useState(false);

  // Filter cabang aktif untuk Super Admin (bisa 'all' atau 'jakarta', dll)
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');

  // Menentukan teamId efektif
  // Jika cabang: mutlak terkunci ke user.userTeamId
  // Jika super admin: bisa 'all' atau filter cabang yang dipilih
  const currentTeamId = useMemo(() => {
    if (!isSuperAdmin()) {
      return user?.userTeamId || TEAMS.PUSAT;
    }
    return selectedTeamFilter;
  }, [user, isSuperAdmin, selectedTeamFilter]);

  const currentTeamName = useMemo(() => {
    if (!isSuperAdmin()) {
      return TEAM_LABELS[user?.userTeamId] || 'IYMPACK Cabang';
    }
    return selectedTeamFilter === 'all' ? 'Seluruh Cabang' : TEAM_LABELS[selectedTeamFilter] || 'Pusat';
  }, [user, isSuperAdmin, selectedTeamFilter]);

  const refreshAllData = useCallback(() => {
    setEvents(eventsService.getEvents());
    setArticles(articlesService.getArticles());
    setTeams(teamsService.getTeams());
    setSiteSettings(settingsService.getSiteSettings());
    setUsers(usersService.getUsers());
    setTestimonials(contentService.getTestimonials());
    setGallery(contentService.getGalleryPhotos());
    setFaqs(contentService.getFaqs());
    setPageSections(sectionsService.getPageSections());
  }, []);

  // ─── Load data on mount & Multi-Device Sync with Hostinger Database ───
  useEffect(() => {
    // 1. Tampilkan data dari cache lokal secara instan (0ms)
    refreshAllData();

    let isSyncing = false;
    async function syncBackend() {
      if (isSyncing) return;
      isSyncing = true;
      try {
        const synced = await syncWithHostingerDatabase();
        if (synced) {
          refreshAllData();
        }
      } catch (e) {
        console.warn('[DataContext] Background sync failed:', e);
      } finally {
        isSyncing = false;
      }
    }

    // 2. Sinkronisasi pertama saat load
    syncBackend();

    // 3. Auto-sync saat tab browser laptop difokuskan kembali / dibuka (dithrottle min 5 detik)
    let lastFocusSync = 0;
    const handleVisibilityOrFocus = () => {
      const now = Date.now();
      if (!document.hidden && now - lastFocusSync > 5000) {
        lastFocusSync = now;
        syncBackend();
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('storage', refreshAllData);

    // 4. Polling sinkronisasi berkala setiap 20 detik agar device lain auto-update
    const pollTimer = setInterval(() => {
      if (!document.hidden) {
        syncBackend();
      }
    }, 20000);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('storage', refreshAllData);
      clearInterval(pollTimer);
    };
  }, [refreshAllData]);

  // ─── Page Sections (Super Admin) ─────────────────────────
  const refreshPageSections = useCallback(() => {
    setPageSections(sectionsService.getPageSections());
  }, []);

  const updateSection = useCallback((pageKey, sectionKey, data) => {
    const updated = sectionsService.updatePageSection(pageKey, sectionKey, data);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.PAGE_SECTIONS_UPDATED,
      target: 'page_section',
      targetId: `${pageKey}:${sectionKey}`,
      details: `Memperbarui section "${sectionKey}" pada halaman "${pageKey}"`,
    });
    setPageSections(updated);
    return updated;
  }, [user]);

  const updatePageSections = useCallback((pageKey, pageData) => {
    const updated = sectionsService.updatePage(pageKey, pageData);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.PAGE_SECTIONS_UPDATED,
      target: 'page_section',
      targetId: pageKey,
      details: `Memperbarui seluruh section pada halaman "${pageKey}"`,
    });
    setPageSections(updated);
    return updated;
  }, [user]);

  const resetSectionContent = useCallback((pageKey, sectionKey) => {
    const updated = sectionsService.resetSection(pageKey, sectionKey);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.PAGE_SECTIONS_UPDATED,
      target: 'page_section',
      targetId: `${pageKey}:${sectionKey}`,
      details: `Mereset section "${sectionKey}" pada halaman "${pageKey}" ke default`,
    });
    setPageSections(updated);
    return updated;
  }, [user]);

  const resetAllSections = useCallback((pageKey = null) => {
    const updated = sectionsService.resetPageSections(pageKey);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.PAGE_SECTIONS_UPDATED,
      target: 'page_section',
      targetId: pageKey || 'all',
      details: `Mereset konten halaman ${pageKey || 'seluruhnya'} ke default`,
    });
    setPageSections(updated);
    return updated;
  }, [user]);

  // ─── Teams & Chapters ────────────────────────────────────

  const refreshTeams = useCallback(() => {
    setTeams(teamsService.getTeams());
  }, []);

  const updateTeam = useCallback(async (slug, updates) => {
    const updated = await teamsService.updateTeam(slug, updates);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: 'team_updated',
      target: 'team',
      targetId: slug,
      details: `Memperbarui profil tim: ${updated.name}`,
    });
    refreshTeams();
    return updated;
  }, [user, refreshTeams]);

  const addMemberToTeam = useCallback(async (slug, member) => {
    const updated = await teamsService.addMemberToTeam(slug, member);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: 'team_member_added',
      target: 'team',
      targetId: slug,
      details: `Menambahkan anggota "${member.name}" ke ${updated.name}`,
    });
    refreshTeams();
    return updated;
  }, [user, refreshTeams]);

  const updateMemberInTeam = useCallback(async (slug, index, memberData) => {
    const updated = await teamsService.updateMemberInTeam(slug, index, memberData);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: 'team_member_updated',
      target: 'team',
      targetId: slug,
      details: `Memperbarui anggota ke-${index + 1} di ${updated.name}`,
    });
    refreshTeams();
    return updated;
  }, [user, refreshTeams]);

  const removeMemberFromTeam = useCallback(async (slug, index) => {
    const updated = await teamsService.removeMemberFromTeam(slug, index);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: 'team_member_removed',
      target: 'team',
      targetId: slug,
      details: `Menghapus anggota di ${updated.name}`,
    });
    refreshTeams();
    return updated;
  }, [user, refreshTeams]);

  const createTeam = useCallback(async (data) => {
    if (!isSuperAdmin()) throw new Error('Hanya Super Admin yang bisa menambah cabang.');
    const team = await teamsService.createTeam(data);
    logAction({ userId: user?.userId, userName: user?.userName, action: 'team_created', target: 'team', targetId: team.slug, details: `Membuat cabang baru: ${team.name} (${team.slug})` });
    refreshTeams();
    return team;
  }, [user, isSuperAdmin, refreshTeams]);

  const deleteTeam = useCallback(async (slug) => {
    if (!isSuperAdmin()) throw new Error('Hanya Super Admin yang bisa menghapus cabang.');
    const removed = await teamsService.deleteTeam(slug);
    logAction({ userId: user?.userId, userName: user?.userName, action: 'team_deleted', target: 'team', targetId: slug, details: `Menghapus cabang: ${removed.name}` });
    refreshTeams();
    return removed;
  }, [user, isSuperAdmin, refreshTeams]);

  // ─── Events (Dengan Asosiasi Tim) ────────────────────────

  const refreshEvents = useCallback(() => {
    setEvents(eventsService.getEvents());
  }, []);

  const createEvent = useCallback(async (data) => {
    // Pastikan teamId otomatis terpasang sesuai cabang akun yang login jika bukan Super Admin
    const assignedTeamId = !isSuperAdmin() ? (user?.userTeamId || TEAMS.PUSAT) : (data.teamId || TEAMS.PUSAT);

    const event = await eventsService.createNewEvent({
      ...data,
      teamId: assignedTeamId,
      createdBy: user?.userId || '',
    });

    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.EVENT_CREATED,
      target: 'event',
      targetId: event.id,
      details: `Membuat kegiatan [${TEAM_LABELS[assignedTeamId] || assignedTeamId}]: ${event.title}`,
    });
    refreshEvents();
    return event;
  }, [user, isSuperAdmin, refreshEvents]);

  const updateEvent = useCallback(async (id, updates) => {
    const event = await eventsService.updateEvent(id, updates);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.EVENT_UPDATED,
      target: 'event',
      targetId: id,
      details: `Mengubah kegiatan: ${event.title}`,
    });
    refreshEvents();
    return event;
  }, [user, refreshEvents]);

  const deleteEvent = useCallback(async (id) => {
    const event = eventsService.getEventById(id);
    await eventsService.deleteEvent(id);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.EVENT_DELETED,
      target: 'event',
      targetId: id,
      details: `Menghapus kegiatan: ${event?.title || id}`,
    });
    refreshEvents();
  }, [user, refreshEvents]);

  const changeEventStatus = useCallback(async (id, newStatus) => {
    const event = await eventsService.changeEventStatus(id, newStatus);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.EVENT_STATUS_CHANGED,
      target: 'event',
      targetId: id,
      details: `Status kegiatan "${event.title}" → ${newStatus}`,
    });
    refreshEvents();
    return event;
  }, [user, refreshEvents]);

  // ─── Articles (Dengan Asosiasi Tim) ──────────────────────

  const refreshArticles = useCallback(() => {
    setArticles(articlesService.getArticles());
  }, []);

  const createArticle = useCallback(async (data) => {
    const assignedTeamId = !isSuperAdmin() ? (user?.userTeamId || TEAMS.PUSAT) : (data.teamId || TEAMS.PUSAT);

    const article = await articlesService.createNewArticle({
      ...data,
      teamId: assignedTeamId,
      author: user?.userName || data.author || 'Admin',
    });

    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.ARTICLE_CREATED,
      target: 'article',
      targetId: article.id,
      details: `Membuat artikel [${TEAM_LABELS[assignedTeamId] || assignedTeamId}]: ${article.title}`,
    });
    refreshArticles();
    return article;
  }, [user, isSuperAdmin, refreshArticles]);

  const updateArticle = useCallback(async (id, updates) => {
    const article = await articlesService.updateArticle(id, updates);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.ARTICLE_UPDATED,
      target: 'article',
      targetId: id,
      details: `Mengubah artikel: ${article.title}`,
    });
    refreshArticles();
    return article;
  }, [user, refreshArticles]);

  const deleteArticle = useCallback(async (id) => {
    const article = articlesService.getArticleById(id);
    await articlesService.deleteArticle(id);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.ARTICLE_DELETED,
      target: 'article',
      targetId: id,
      details: `Menghapus artikel: ${article?.title || id}`,
    });
    refreshArticles();
  }, [user, refreshArticles]);

  // ─── Applicants (Pendaftar Relawan) ──────────────────────

  const getApplicantsByEvent = useCallback((eventId, filters) => {
    return applicantsService.getApplicantsByEvent(eventId, filters);
  }, []);

  const getAllApplicants = useCallback((filters = {}) => {
    // Jika bukan super admin, batasi query hanya untuk teamId cabang yang login
    const effectiveFilters = { ...filters };
    if (!isSuperAdmin()) {
      effectiveFilters.teamId = user?.userTeamId || TEAMS.PUSAT;
    } else if (selectedTeamFilter !== 'all') {
      effectiveFilters.teamId = selectedTeamFilter;
    }
    return applicantsService.getAllApplicants(effectiveFilters);
  }, [user, isSuperAdmin, selectedTeamFilter]);

  const verifyApplicant = useCallback((id, newStatus) => {
    const applicant = applicantsService.verifyApplicant(id, newStatus, user?.userId);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.APPLICANT_VERIFIED,
      target: 'applicant',
      targetId: id,
      details: `Status pendaftar "${applicant.fullName}" → ${newStatus}`,
    });
    refreshEvents(); // Refresh kuota event
    return applicant;
  }, [user, refreshEvents]);

  const deleteApplicant = useCallback(async (id) => {
    const deleted = await applicantsService.deleteApplicant(id);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.APPLICANT_DELETED,
      target: 'applicant',
      targetId: id,
      details: `Menghapus pendaftar "${deleted.fullName}" (${deleted.email}) — terindikasi spam/phising`,
    });
    refreshEvents();
    return deleted;
  }, [user, refreshEvents]);

  const bulkDeleteApplicants = useCallback(async (ids) => {
    const results = await applicantsService.bulkDeleteApplicants(ids);
    const successCount = results.filter(r => r.success).length;
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.APPLICANT_BULK_DELETED,
      target: 'applicant',
      targetId: ids.join(','),
      details: `Hapus massal ${successCount}/${ids.length} pendaftar (spam/phising)`,
    });
    refreshEvents();
    return results;
  }, [user, refreshEvents]);

  const exportApplicantsCSV = useCallback((eventId, eventTitle) => {
    applicantsService.exportApplicantsCSV(eventId, eventTitle);
  }, []);

  // ─── Users (Super Admin only) ────────────────────────────

  const refreshUsers = useCallback(() => {
    setUsers(usersService.getUsers());
  }, []);

  const createUser = useCallback(async (data) => {
    const result = await usersService.createNewUser(data);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.USER_CREATED,
      target: 'user',
      targetId: result.id,
      details: `Membuat akun: ${result.name} (${result.role})`,
    });
    refreshUsers();
    return result;
  }, [user, refreshUsers]);

  const updateUser = useCallback((id, updates) => {
    const updated = usersService.updateUser(id, updates);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.USER_UPDATED,
      target: 'user',
      targetId: id,
      details: `Mengubah akun: ${updated.name}`,
    });
    refreshUsers();
    return updated;
  }, [user, refreshUsers]);

  const suspendUser = useCallback((id) => {
    const targetUser = usersService.getUserById(id);
    usersService.suspendUser(id);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.USER_SUSPENDED,
      target: 'user',
      targetId: id,
      details: `Menonaktifkan akun: ${targetUser?.name || id}`,
    });
    refreshUsers();
  }, [user, refreshUsers]);

  const activateUser = useCallback((id) => {
    const targetUser = usersService.getUserById(id);
    usersService.activateUser(id);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.USER_ACTIVATED,
      target: 'user',
      targetId: id,
      details: `Mengaktifkan akun: ${targetUser?.name || id}`,
    });
    refreshUsers();
  }, [user, refreshUsers]);

  const deleteUser = useCallback((id) => {
    const targetUser = usersService.getUserById(id);
    usersService.deleteUser(id);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.USER_DELETED,
      target: 'user',
      targetId: id,
      details: `Menghapus akun: ${targetUser?.name || id}`,
    });
    refreshUsers();
  }, [user, refreshUsers]);

  const adminSetUserPassword = useCallback(async (targetUserId, newPassword) => {
    if (!isSuperAdmin()) throw new Error('Hanya Super Admin yang bisa mereset password pengguna lain.');
    const target = usersService.getUserById(targetUserId);
    if (!target) throw new Error('User tidak ditemukan.');
    await usersService.changePassword(targetUserId, newPassword);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.PASSWORD_CHANGED,
      target: 'user',
      targetId: targetUserId,
      details: `Super Admin mereset password akun: ${target.name} (${target.email})`,
    });
    refreshUsers();
  }, [user, isSuperAdmin, refreshUsers]);

  const changeOwnPassword = useCallback(async (currentPassword, newPassword) => {
    if (!user?.userId) throw new Error('Sesi tidak valid. Silakan login ulang.');
    // verify old password first (via auth service)
    const { verifyPassword } = await import('../services/auth.service.js');
    const { findByField } = await import('../lib/storage.js');
    const { LS_KEYS: LK } = await import('../lib/db.constants.js');
    const stored = findByField(LK.USERS, 'id', user.userId);
    if (!stored) throw new Error('Akun tidak ditemukan.');
    // default master password counts as valid old password for fallback accounts
    const isMaster = currentPassword === 'admin@iympack2026';
    let oldOk = isMaster;
    if (!oldOk && stored.passwordHash && stored.salt) {
      oldOk = await verifyPassword(currentPassword, stored.passwordHash, stored.salt);
    } else if (!stored.passwordHash && !isMaster) {
      throw new Error('Password lama salah.');
    }
    if (!oldOk) throw new Error('Password lama salah.');

    await usersService.changePassword(user.userId, newPassword);
    logAction({
      userId: user.userId,
      userName: user.userName,
      action: AUDIT_ACTIONS.PASSWORD_CHANGED,
      target: 'user',
      targetId: user.userId,
      details: `Mengganti password akun sendiri (${user.userName})`,
    });
    refreshUsers();
  }, [user, refreshUsers]);

  const updateOwnProfile = useCallback(async (updates) => {
    if (!user?.userId) throw new Error('Sesi tidak valid.');
    const allowed = {};
    if (updates.name) allowed.name = updates.name;
    if (updates.email) allowed.email = updates.email;
    const updated = usersService.updateUser(user.userId, allowed);
    logAction({
      userId: user.userId,
      userName: user.userName,
      action: AUDIT_ACTIONS.USER_UPDATED,
      target: 'user',
      targetId: user.userId,
      details: `Memperbarui profil akun sendiri`,
    });
    refreshUsers();
    // also refresh session display name if changed
    try {
      const { getObject: _getObj, setObject: _setObj } = await import('../lib/storage.js');
      const sess = _getObj(LS_KEYS.AUTH_SESSION);
      if (sess && updated) {
        sess.userName = updated.name;
        sess.userEmail = updated.email;
        await _setObj(LS_KEYS.AUTH_SESSION, sess, false);
      }
    } catch (_) {}
    return updated;
  }, [user, refreshUsers]);

  // ─── Site Settings (Super Admin only) ────────────────────

  const refreshSettings = useCallback(() => {
    setSiteSettings(settingsService.getSiteSettings());
  }, []);

  const updateSettings = useCallback((updates) => {
    const result = settingsService.updateSiteSettings(updates);
    logAction({
      userId: user?.userId,
      userName: user?.userName,
      action: AUDIT_ACTIONS.SETTINGS_UPDATED,
      target: 'settings',
      details: `Mengubah pengaturan situs / hero banner`,
    });
    refreshSettings();
    return result;
  }, [user, refreshSettings]);

  // ─── Audit Logs ──────────────────────────────────────────

  const getAuditLogs = useCallback((filters) => {
    return auditService.getAuditLogs(filters);
  }, []);

  // ─── Dashboard Stats (Scoping per Tim) ────────────────────

  const getDashboardStats = useCallback(() => {
    const targetTeamId = !isSuperAdmin() ? (user?.userTeamId || TEAMS.PUSAT) : (selectedTeamFilter === 'all' ? null : selectedTeamFilter);

    const filteredEvents = targetTeamId
      ? eventsService.getEvents({ teamId: targetTeamId })
      : eventsService.getEvents();

    const allAppls = applicantsService.getAllApplicants(targetTeamId ? { teamId: targetTeamId } : {});
    const recentApplicants = applicantsService.getRecentApplicants(5, targetTeamId);

    const filteredArticles = targetTeamId
      ? articlesService.getArticles({ teamId: targetTeamId })
      : articlesService.getArticles();

    return {
      events: {
        total: filteredEvents.length,
        published: filteredEvents.filter((e) => e.status === 'published').length,
        draft: filteredEvents.filter((e) => e.status === 'draft').length,
        closed: filteredEvents.filter((e) => e.status === 'closed').length,
      },
      pendingApplicants: 0,
      totalApplicants: allAppls.length,
      recentPending: recentApplicants,
      recentApplicants,
      articles: {
        total: filteredArticles.length,
        published: filteredArticles.filter((a) => a.status === 'published').length,
        draft: filteredArticles.filter((a) => a.status === 'draft').length,
      },
      currentTeamName,
    };
  }, [user, isSuperAdmin, selectedTeamFilter, currentTeamName]);

  // ─── Content Management (Testimonials, Gallery, FAQs) ──────
  const refreshTestimonials = useCallback(() => {
    setTestimonials(contentService.getTestimonials());
  }, []);

  const addTestimonial = useCallback((data) => {
    const created = contentService.addTestimonial(data, user);
    refreshTestimonials();
    return created;
  }, [user, refreshTestimonials]);

  const updateTestimonial = useCallback((id, updates) => {
    const updated = contentService.updateTestimonial(id, updates, user);
    refreshTestimonials();
    return updated;
  }, [user, refreshTestimonials]);

  const deleteTestimonial = useCallback((id) => {
    const result = contentService.deleteTestimonial(id, user);
    refreshTestimonials();
    return result;
  }, [user, refreshTestimonials]);

  const resetTestimonials = useCallback(() => {
    const res = contentService.resetTestimonials(user);
    refreshTestimonials();
    return res;
  }, [user, refreshTestimonials]);

  const refreshGallery = useCallback(() => {
    setGallery(contentService.getGalleryPhotos());
  }, []);

  const addGalleryPhoto = useCallback((data) => {
    const created = contentService.addGalleryPhoto(data, user);
    refreshGallery();
    return created;
  }, [user, refreshGallery]);

  const updateGalleryPhoto = useCallback((id, updates) => {
    const updated = contentService.updateGalleryPhoto(id, updates, user);
    refreshGallery();
    return updated;
  }, [user, refreshGallery]);

  const deleteGalleryPhoto = useCallback((id) => {
    const result = contentService.deleteGalleryPhoto(id, user);
    refreshGallery();
    return result;
  }, [user, refreshGallery]);

  const resetGalleryPhotos = useCallback(() => {
    const res = contentService.resetGalleryPhotos(user);
    refreshGallery();
    return res;
  }, [user, refreshGallery]);

  const refreshFaqs = useCallback(() => {
    setFaqs(contentService.getFaqs());
  }, []);

  const addFaq = useCallback((data) => {
    const created = contentService.addFaq(data, user);
    refreshFaqs();
    return created;
  }, [user, refreshFaqs]);

  const updateFaq = useCallback((id, updates) => {
    const updated = contentService.updateFaq(id, updates, user);
    refreshFaqs();
    return updated;
  }, [user, refreshFaqs]);

  const deleteFaq = useCallback((id) => {
    const result = contentService.deleteFaq(id, user);
    refreshFaqs();
    return result;
  }, [user, refreshFaqs]);

  const resetFaqs = useCallback(() => {
    const res = contentService.resetFaqs(user);
    refreshFaqs();
    return res;
  }, [user, refreshFaqs]);

  const value = {
    // Multi-Team Context
    currentTeamId,
    currentTeamName,
    selectedTeamFilter,
    setSelectedTeamFilter,
    teams,
    refreshTeams,
    updateTeam,
    createTeam,
    deleteTeam,
    addMemberToTeam,
    updateMemberInTeam,
    removeMemberFromTeam,
    getTeamBySlug: teamsService.getTeamBySlug,

    // Data
    events,
    articles,
    siteSettings,
    users,
    testimonials,
    gallery,
    faqs,
    isLoading,

    // Testimonials (Super Admin)
    refreshTestimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    resetTestimonials,

    // Gallery (Super Admin)
    refreshGallery,
    addGalleryPhoto,
    updateGalleryPhoto,
    deleteGalleryPhoto,
    resetGalleryPhotos,

    // FAQs (Super Admin)
    refreshFaqs,
    addFaq,
    updateFaq,
    deleteFaq,
    resetFaqs,

    // Events
    refreshEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    changeEventStatus,
    getEventBySlug: eventsService.getEventBySlug,
    getEventById: eventsService.getEventById,
    getEventCategories: eventsService.getEventCategories,

    // Articles
    refreshArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleBySlug: articlesService.getArticleBySlug,
    getArticleById: articlesService.getArticleById,
    getArticleCategories: articlesService.getArticleCategories,

    // Applicants
    getApplicantsByEvent,
    getAllApplicants,
    verifyApplicant,
    deleteApplicant,
    bulkDeleteApplicants,
    exportApplicantsCSV,
    getApplicantById: applicantsService.getApplicantById,
    countApplicantsByStatus: applicantsService.countApplicantsByStatus,
    submitApplication: applicantsService.submitApplication,

    // Users (Super Admin)
    refreshUsers,
    createUser,
    updateUser,
    suspendUser,
    activateUser,
    deleteUser,
    adminSetUserPassword,
    // Self-account (all admins)
    changeOwnPassword,
    updateOwnProfile,

    // Settings
    refreshSettings,
    updateSettings,

    // Page Sections (Super Admin)
    pageSections,
    refreshPageSections,
    updateSection,
    updatePageSections,
    resetSectionContent,
    resetAllSections,

    // Audit
    getAuditLogs,

    // Dashboard
    getDashboardStats,
    refreshAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
