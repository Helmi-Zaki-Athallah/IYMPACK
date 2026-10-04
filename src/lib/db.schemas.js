/**
 * IYMPACK CMS — Entity Schema Factories
 *
 * Factory functions untuk membuat objek entitas dengan shape yang konsisten.
 * Setiap factory menerima partial data dan mengisi defaults.
 */

import { generateId, generateSlug, now } from './utils.js';
import { ROLES, USER_STATUS, EVENT_STATUS, APPLICANT_STATUS, ARTICLE_STATUS, VOUCHER_TYPES } from './db.constants.js';

// ─── User ────────────────────────────────────────────────────
export function createUser(data = {}) {
  return {
    id: data.id || generateId(),
    name: data.name || '',
    email: data.email || '',
    passwordHash: data.passwordHash || '',
    salt: data.salt || '',
    role: data.role || ROLES.ADMIN,
    teamId: data.teamId || 'pusat',
    status: data.status || USER_STATUS.ACTIVE,
    createdAt: data.createdAt || now(),
    updatedAt: data.updatedAt || now(),
  };
}

// ─── Event ───────────────────────────────────────────────────
export function createEvent(data = {}) {
  const title = data.title || '';
  return {
    id: data.id || generateId(),
    slug: data.slug || generateSlug(title),
    title,
    description: data.description || '',
    bannerImage: data.bannerImage || '',
    teamId: data.teamId || 'pusat',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    registrationDeadline: data.registrationDeadline || '',
    location: data.location || '',
    maxQuota: data.maxQuota || 0,
    currentApplicants: data.currentApplicants || 0,
    status: data.status || EVENT_STATUS.DRAFT,
    category: data.category || '',
    speaker: data.speaker || '',
    time: data.time || '',
    day: data.day || '',
    month: data.month || '',
    fee: data.fee || '',
    mapsUrl: data.mapsUrl || '',
    mapsEmbedUrl: data.mapsEmbedUrl || '',
    paymentAccount: data.paymentAccount || '',
    bankName: data.bankName || '',
    accountNumber: data.accountNumber || '',
    accountHolder: data.accountHolder || '',
    contactPhone: data.contactPhone || '',
    customFields: data.customFields || [],
    requireFollowProof: data.requireFollowProof !== false,
    instagramAccount: data.instagramAccount || 'iympack',
    requireTiktokProof: Boolean(data.requireTiktokProof),
    tiktokAccount: data.tiktokAccount || '',
    requireReason: data.requireReason !== false,
    createdBy: data.createdBy || '',
    createdAt: data.createdAt || now(),
    updatedAt: data.updatedAt || now(),
  };
}

// ─── Applicant (Pendaftar Relawan) ───────────────────────────
export function createApplicant(data = {}) {
  return {
    id: data.id || generateId(),
    eventId: data.eventId || '',
    teamId: data.teamId || 'pusat',
    fullName: data.fullName || '',
    whatsapp: data.whatsapp || '',
    email: data.email || '',
    city: data.city || '',
    reason: data.reason || '',
    followProof: data.followProof || '',
    tiktokProof: data.tiktokProof || '',
    paymentProof: data.paymentProof || '',
    fee: data.fee || '',
    voucherCode: data.voucherCode || '',
    discountAmount: data.discountAmount || 0,
    finalFee: data.finalFee || '',
    customAnswers: data.customAnswers || {},
    status: data.status || APPLICANT_STATUS.APPROVED,
    submittedAt: data.submittedAt || now(),
    verifiedBy: data.verifiedBy || null,
    verifiedAt: data.verifiedAt || null,
  };
}

// ─── Article ─────────────────────────────────────────────────
export function createArticle(data = {}) {
  const title = data.title || '';
  return {
    id: data.id || generateId(),
    slug: data.slug || generateSlug(title),
    title,
    coverImage: data.coverImage || '',
    category: data.category || '',
    bodyContent: data.bodyContent || '',
    excerpt: data.excerpt || '',
    author: data.author || '',
    teamId: data.teamId || 'pusat',
    status: data.status || ARTICLE_STATUS.DRAFT,
    createdAt: data.createdAt || now(),
    updatedAt: data.updatedAt || now(),
  };
}

// ─── Site Settings ───────────────────────────────────────────
export function createSiteSettings(data = {}) {
  return {
    orgName: data.orgName || 'IYMPACK',
    orgFullName: data.orgFullName || 'Indonesia Yuwana Muda Peduli Aksi Cinta Kasih',
    slogan: data.slogan || 'BERBAGI UNTUK BERSAMA',
    heroBannerUrl: data.heroBannerUrl || '/hero-hands.webp',
    contactPhone: data.contactPhone || '',
    whatsapp: data.whatsapp || '',
    address: data.address || '',
    email: data.email || '',
    instagram: data.instagram || '',
    linkedin: data.linkedin || '',
    tiktok: data.tiktok || '',
    whatsappCommunity: data.whatsappCommunity || '',
    youtube: data.youtube || '',
    mapsEmbedUrl: data.mapsEmbedUrl || '',
    logoUrl: data.logoUrl || '/iympack-logo.webp',
    footerText: data.footerText || '',
  };
}

// ─── Team Profile Factory ────────────────────────────────────
export function createTeamProfile(data = {}) {
  return {
    id: data.id || '',
    slug: data.slug || '',
    name: data.name || '',
    displayName: data.displayName || data.name || '',
    tagline: data.tagline || '',
    ig: data.ig || '',
    igUrl: data.igUrl || '',
    tiktok: data.tiktok || null,
    tiktokUrl: data.tiktokUrl || null,
    coverImage: data.coverImage || '',
    membersCount: (data.members || []).length,
    members: data.members || [],
    gallery: data.gallery || [],
    prevTeam: data.prevTeam || '',
    nextTeam: data.nextTeam || '',
    updatedAt: data.updatedAt || now(),
  };
}

// ─── Audit Log Entry ─────────────────────────────────────────
export function createAuditLog(data = {}) {
  return {
    id: data.id || generateId(),
    userId: data.userId || null,
    userName: data.userName || 'System',
    action: data.action || '',
    target: data.target || '',     // e.g. 'event', 'user', 'article'
    targetId: data.targetId || null,
    details: data.details || '',
    timestamp: data.timestamp || now(),
  };
}

// ─── Testimonial Factory ─────────────────────────────────────
export function createTestimonial(data = {}) {
  return {
    id: data.id || generateId(),
    author: data.author || data.name || '',
    role: data.role || 'Relawan IYMPACK',
    quote: data.quote || '',
    avatar: data.avatar || '',
    createdAt: data.createdAt || now(),
    updatedAt: data.updatedAt || now(),
  };
}

// ─── Gallery Photo Factory ───────────────────────────────────
export function createGalleryPhoto(data = {}) {
  return {
    id: data.id || generateId(),
    title: data.title || data.caption || '',
    category: data.category || 'Kerelawanan',
    url: data.url || data.image || '',
    image: data.image || data.url || '',
    location: data.location || 'Indonesia',
    caption: data.caption || data.title || '',
    createdAt: data.createdAt || now(),
    updatedAt: data.updatedAt || now(),
  };
}

// ─── Voucher / Kupon Diskon Factory ─────────────────────────
export function createVoucher(data = {}) {
  return {
    id: data.id || generateId(),
    code: (data.code || '').toUpperCase().trim(),
    type: data.type || VOUCHER_TYPES.PERCENTAGE,
    value: data.value || 0,
    maxUsage: data.maxUsage || 1,
    usedCount: data.usedCount || 0,
    usedBy: data.usedBy || [],
    eventIds: data.eventIds || [],
    expiresAt: data.expiresAt || null,
    isActive: data.isActive !== false,
    createdBy: data.createdBy || '',
    createdAt: data.createdAt || now(),
    updatedAt: data.updatedAt || now(),
  };
}

// ─── FAQ Item Factory ────────────────────────────────────────
export function createFaqItem(data = {}) {
  return {
    id: data.id || generateId(),
    q: data.q || data.question || '',
    a: data.a || data.answer || '',
    createdAt: data.createdAt || now(),
    updatedAt: data.updatedAt || now(),
  };
}

