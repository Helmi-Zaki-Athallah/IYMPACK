/**
 * IYMPACK CMS — Content Management Service (Super Admin)
 *
 * Mengelola seluruh konten website IYMPACK:
 * - Testimonials (Kata Relawan & Mitra)
 * - Galeri Foto Aktivitas & Showcase
 * - FAQ Resmi (Tanya Jawab)
 */

import { LS_KEYS, AUDIT_ACTIONS } from '../lib/db.constants.js';
import { createTestimonial, createGalleryPhoto, createFaqItem } from '../lib/db.schemas.js';
import { getCollection, setCollection, insertItem, updateItem, deleteItem, findById } from '../lib/storage.js';
import { logAction } from './audit.service.js';
import { testimonialsData, galleryPhotos, homeGalleryData, faqList } from '../data/iympackData.js';

// ─── 1. Testimonials Management ──────────────────────────────

export function getTestimonials() {
  return getCollection(LS_KEYS.TESTIMONIALS);
}

export function initTestimonials() {
  const initial = testimonialsData.map((t, idx) =>
    createTestimonial({
      id: `testi-${idx + 1}`,
      author: t.author,
      role: t.role,
      quote: t.quote,
      avatar: t.avatar,
    })
  );
  setCollection(LS_KEYS.TESTIMONIALS, initial);
  return initial;
}

export function addTestimonial(data, user = null) {
  const newItem = createTestimonial(data);
  insertItem(LS_KEYS.TESTIMONIALS, newItem);

  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.TESTIMONIAL_CREATED,
    target: 'testimonial',
    targetId: newItem.id,
    details: `Menambahkan testimoni dari "${newItem.author}".`,
  });

  return newItem;
}

export function updateTestimonial(id, updates, user = null) {
  const merged = updateItem(LS_KEYS.TESTIMONIALS, id, updates);
  if (!merged) throw new Error('Testimoni tidak ditemukan.');

  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.TESTIMONIAL_UPDATED,
    target: 'testimonial',
    targetId: id,
    details: `Memperbarui testimoni dari "${merged.author}".`,
  });

  return merged;
}

export function deleteTestimonial(id, user = null) {
  const target = findById(LS_KEYS.TESTIMONIALS, id);
  deleteItem(LS_KEYS.TESTIMONIALS, id);

  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.TESTIMONIAL_DELETED,
    target: 'testimonial',
    targetId: id,
    details: `Menghapus testimoni dari "${target?.author || id}".`,
  });

  return true;
}

export function resetTestimonials(user = null) {
  const initial = initTestimonials();
  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    target: 'testimonial',
    details: 'Mereset data testimoni ke default.',
  });
  return initial;
}


// ─── 2. Gallery Management ───────────────────────────────────

export function getGalleryPhotos() {
  return getCollection(LS_KEYS.GALLERY);
}

export function initGalleryPhotos() {
  // Gabungkan foto dari homeGalleryData dan galleryPhotos tanpa duplikat
  const combined = [];
  const seenUrls = new Set();

  homeGalleryData.forEach((item, idx) => {
    const url = item.image || item.url;
    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      combined.push(
        createGalleryPhoto({
          id: `gallery-home-${idx + 1}`,
          title: item.title,
          category: item.category,
          url,
          image: url,
          location: item.location || 'Indonesia',
        })
      );
    }
  });

  galleryPhotos.forEach((item, idx) => {
    const url = item.url || item.image;
    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      combined.push(
        createGalleryPhoto({
          id: `gallery-page-${idx + 1}`,
          title: item.title || item.caption,
          category: item.category,
          url,
          image: url,
          location: 'Indonesia',
        })
      );
    }
  });

  setCollection(LS_KEYS.GALLERY, combined);
  return combined;
}

export function addGalleryPhoto(data, user = null) {
  const newItem = createGalleryPhoto(data);
  insertItem(LS_KEYS.GALLERY, newItem);

  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.GALLERY_CREATED,
    target: 'gallery',
    targetId: newItem.id,
    details: `Menambahkan foto galeri "${newItem.title}".`,
  });

  return newItem;
}

export function updateGalleryPhoto(id, updates, user = null) {
  const merged = updateItem(LS_KEYS.GALLERY, id, updates);
  if (!merged) throw new Error('Foto galeri tidak ditemukan.');

  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.GALLERY_UPDATED,
    target: 'gallery',
    targetId: id,
    details: `Memperbarui foto galeri "${merged.title}".`,
  });

  return merged;
}

export function deleteGalleryPhoto(id, user = null) {
  const target = findById(LS_KEYS.GALLERY, id);
  deleteItem(LS_KEYS.GALLERY, id);

  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.GALLERY_DELETED,
    target: 'gallery',
    targetId: id,
    details: `Menghapus foto galeri "${target?.title || id}".`,
  });

  return true;
}

export function resetGalleryPhotos(user = null) {
  const initial = initGalleryPhotos();
  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    target: 'gallery',
    details: 'Mereset data galeri ke default.',
  });
  return initial;
}


// ─── 3. FAQ Management ───────────────────────────────────────

export function getFaqs() {
  const items = getCollection(LS_KEYS.FAQS);
  if (items && items.length > 0) return items;
  return initFaqs();
}

export function initFaqs() {
  const initial = faqList.map((f, idx) =>
    createFaqItem({
      id: `faq-${idx + 1}`,
      q: f.q,
      a: f.a,
    })
  );
  setCollection(LS_KEYS.FAQS, initial);
  return initial;
}

export function addFaq(data, user = null) {
  const newItem = createFaqItem(data);
  insertItem(LS_KEYS.FAQS, newItem);

  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.FAQ_UPDATED,
    target: 'faq',
    targetId: newItem.id,
    details: `Menambahkan FAQ: "${newItem.q.substring(0, 30)}..."`,
  });

  return newItem;
}

export function updateFaq(id, updates, user = null) {
  const merged = updateItem(LS_KEYS.FAQS, id, updates);
  if (!merged) throw new Error('FAQ tidak ditemukan.');

  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.FAQ_UPDATED,
    target: 'faq',
    targetId: id,
    details: `Memperbarui FAQ: "${merged.q.substring(0, 30)}..."`,
  });

  return merged;
}

export function deleteFaq(id, user = null) {
  const target = findById(LS_KEYS.FAQS, id);
  deleteItem(LS_KEYS.FAQS, id);

  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.FAQ_UPDATED,
    target: 'faq',
    targetId: id,
    details: `Menghapus FAQ: "${target?.q?.substring(0, 30) || id}..."`,
  });

  return true;
}

export function resetFaqs(user = null) {
  const initial = initFaqs();
  logAction({
    userId: user?.userId,
    userName: user?.userName,
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    target: 'faq',
    details: 'Mereset data FAQ ke default.',
  });
  return initial;
}
