/**
 * IYMPACK CMS — Events Service
 *
 * CRUD + status management for events/kegiatan.
 */

import { LS_KEYS, EVENT_STATUS } from '../lib/db.constants.js';
import { createEvent as createEventSchema } from '../lib/db.schemas.js';
import {
  getCollection,
  setCollection,
  findById,
  findByField,
  insertItem,
  updateItem,
  deleteItem,
} from '../lib/storage.js';
import { generateSlug, now, getEventDateTimestamp } from '../lib/utils.js';

/**
 * Get all events, optionally filtered.
 * @param {Object} [filters] - { status, category, search }
 * @returns {Object[]}
 */
export function getEvents(filters = {}) {
  let events = getCollection(LS_KEYS.EVENTS);

  if (filters.status) {
    events = events.filter((e) => e.status === filters.status);
  }
  if (filters.category) {
    events = events.filter((e) => e.category === filters.category);
  }
  if (filters.teamId && filters.teamId !== 'all') {
    events = events.filter((e) => e.teamId === filters.teamId);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    );
  }

  // Sort by createdAt descending (newest first)
  events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return events;
}

/**
 * Get published events only (for public frontend), sorted by closest date first.
 */
export function getPublishedEvents() {
  const events = getEvents({ status: EVENT_STATUS.PUBLISHED });
  return events.sort((a, b) => getEventDateTimestamp(a) - getEventDateTimestamp(b));
}

/**
 * Get a single event by slug.
 */
export function getEventBySlug(slug) {
  return findByField(LS_KEYS.EVENTS, 'slug', slug);
}

/**
 * Get a single event by ID.
 */
export function getEventById(id) {
  return findById(LS_KEYS.EVENTS, id);
}

/**
 * Check real-time quota status for an event.
 * @param {string} eventId
 * @returns {{ isAvailable: boolean, maxQuota: number, currentApplicants: number, remainingSlots: number, isClosed?: boolean, notFound?: boolean, message: string }}
 */
export function checkEventQuota(eventId) {
  const events = getCollection(LS_KEYS.EVENTS);
  const event = events.find((e) => e.id === eventId || e.slug === eventId);
  if (!event) {
    return { isAvailable: false, notFound: true, message: 'Kegiatan tidak ditemukan.' };
  }
  if (event.status === 'closed') {
    return { isAvailable: false, isClosed: true, message: 'Pendaftaran untuk kegiatan ini sudah ditutup.' };
  }
  const max = Number(event.maxQuota) || 0;
  
  // Hitung jumlah riil pendaftar yang sudah tercatat
  const applicants = getCollection(LS_KEYS.APPLICANTS);
  const realCount = applicants.filter(
    (a) => a.eventId === event.id || (event.slug && a.eventId === event.slug)
  ).length;

  const current = Math.max(Number(event.currentApplicants) || 0, realCount);
  const remainingSlots = max > 0 ? Math.max(0, max - current) : 999;
  const isAvailable = max === 0 || current < max;

  return {
    isAvailable,
    maxQuota: max,
    currentApplicants: current,
    remainingSlots,
    message: isAvailable
      ? (max > 0 ? `Tersisa ${remainingSlots} slot relawan.` : 'Kuota bebas.')
      : 'Kuota pendaftaran untuk kegiatan ini sudah terisi penuh.',
  };
}

/**
 * Create a new event.
 * @param {Object} data - Event form data.
 * @returns {Object} The created event.
 */
export async function createNewEvent(data) {
  // Gunakan slug custom jika disediakan, atau buat otomatis dari judul
  const rawSlug = data.slug ? data.slug.trim() : '';
  let slug = rawSlug ? generateSlug(rawSlug) : generateSlug(data.title);
  if (!slug) slug = `event-${Date.now().toString(36)}`;

  const existing = findByField(LS_KEYS.EVENTS, 'slug', slug);
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const event = createEventSchema({
    ...data,
    slug,
    maxQuota: Number(data.maxQuota) || 0,
  });

  await insertItem(LS_KEYS.EVENTS, event);
  return event;
}

/**
 * Update an existing event.
 */
export async function updateEvent(id, updates) {
  // Jika slug disediakan khusus atau judul berubah
  if (updates.slug !== undefined && updates.slug.trim() !== '') {
    let slug = generateSlug(updates.slug);
    const existing = findByField(LS_KEYS.EVENTS, 'slug', slug);
    if (existing && existing.id !== id) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    updates.slug = slug;
  } else if (updates.title && updates.slug === undefined) {
    let slug = generateSlug(updates.title);
    const existing = findByField(LS_KEYS.EVENTS, 'slug', slug);
    if (existing && existing.id !== id) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    updates.slug = slug;
  }

  if (updates.maxQuota !== undefined) {
    updates.maxQuota = Number(updates.maxQuota);
  }

  updates.updatedAt = now();
  const updated = await updateItem(LS_KEYS.EVENTS, id, updates);
  if (!updated) throw new Error('Event tidak ditemukan.');
  return updated;
}

/**
 * Delete an event (and all its applicants).
 */
export async function deleteEvent(id) {
  const event = findById(LS_KEYS.EVENTS, id);
  if (!event) throw new Error('Event tidak ditemukan.');

  // Hapus semua pendaftar terkait
  const applicants = getCollection(LS_KEYS.APPLICANTS);
  const remaining = applicants.filter((a) => a.eventId !== id);
  await setCollection(LS_KEYS.APPLICANTS, remaining, true);

  await deleteItem(LS_KEYS.EVENTS, id);
  return true;
}

/**
 * Change event status (Draft → Published → Closed).
 */
export async function changeEventStatus(id, newStatus) {
  if (!Object.values(EVENT_STATUS).includes(newStatus)) {
    throw new Error(`Status tidak valid: ${newStatus}`);
  }

  const updated = await updateItem(LS_KEYS.EVENTS, id, {
    status: newStatus,
    updatedAt: now(),
  });
  if (!updated) throw new Error('Event tidak ditemukan.');
  return updated;
}

/**
 * Get unique event categories.
 */
export function getEventCategories() {
  const events = getCollection(LS_KEYS.EVENTS);
  return [...new Set(events.map((e) => e.category).filter(Boolean))];
}

/**
 * Count events by status.
 */
export function countEventsByStatus() {
  const events = getCollection(LS_KEYS.EVENTS);
  return {
    total: events.length,
    draft: events.filter((e) => e.status === EVENT_STATUS.DRAFT).length,
    published: events.filter((e) => e.status === EVENT_STATUS.PUBLISHED).length,
    closed: events.filter((e) => e.status === EVENT_STATUS.CLOSED).length,
  };
}
