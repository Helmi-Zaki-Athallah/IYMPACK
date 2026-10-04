/**
 * IYMPACK CMS — Database Constants & Enums
 * Sumber kebenaran tunggal untuk semua konstanta yang digunakan di seluruh data layer.
 */

// ─── User Roles ──────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
};

// ─── User Status ─────────────────────────────────────────────
export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

// ─── Event Status ────────────────────────────────────────────
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
};

export const EVENT_STATUS_LABELS = {
  [EVENT_STATUS.DRAFT]: 'Draft',
  [EVENT_STATUS.PUBLISHED]: 'Sedang Buka',
  [EVENT_STATUS.CLOSED]: 'Selesai',
};

// ─── Applicant Status ────────────────────────────────────────
export const APPLICANT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const APPLICANT_STATUS_LABELS = {
  [APPLICANT_STATUS.PENDING]: 'Menunggu',
  [APPLICANT_STATUS.APPROVED]: 'Disetujui',
  [APPLICANT_STATUS.REJECTED]: 'Ditolak',
};

// ─── Article Status ──────────────────────────────────────────
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

// ─── Voucher Discount Types ─────────────────────────────────
export const VOUCHER_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
};

export const VOUCHER_TYPE_LABELS = {
  [VOUCHER_TYPES.PERCENTAGE]: 'Persentase (%)',
  [VOUCHER_TYPES.FIXED]: 'Nominal (Rp)',
};

// ─── Audit Log Actions ──────────────────────────────────────
export const AUDIT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_SUSPENDED: 'user_suspended',
  USER_ACTIVATED: 'user_activated',
  USER_DELETED: 'user_deleted',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  EVENT_CREATED: 'event_created',
  EVENT_UPDATED: 'event_updated',
  EVENT_DELETED: 'event_deleted',
  EVENT_STATUS_CHANGED: 'event_status_changed',
  APPLICANT_SUBMITTED: 'applicant_submitted',
  APPLICANT_VERIFIED: 'applicant_verified',
  APPLICANT_DELETED: 'applicant_deleted',
  APPLICANT_BULK_DELETED: 'applicant_bulk_deleted',
  ARTICLE_CREATED: 'article_created',
  ARTICLE_UPDATED: 'article_updated',
  ARTICLE_DELETED: 'article_deleted',
  SETTINGS_UPDATED: 'settings_updated',
  TESTIMONIAL_CREATED: 'testimonial_created',
  TESTIMONIAL_UPDATED: 'testimonial_updated',
  TESTIMONIAL_DELETED: 'testimonial_deleted',
  GALLERY_CREATED: 'gallery_created',
  GALLERY_UPDATED: 'gallery_updated',
  GALLERY_DELETED: 'gallery_deleted',
  FAQ_UPDATED: 'faq_updated',
  VOUCHER_CREATED: 'voucher_created',
  VOUCHER_UPDATED: 'voucher_updated',
  VOUCHER_DELETED: 'voucher_deleted',
  PAGE_SECTIONS_UPDATED: 'page_sections_updated',
};

// ─── Teams / Regional Chapters ──────────────────────────────
export const TEAMS = {
  PUSAT: 'pusat',
  JAKARTA: 'jakarta',
  BOGOR: 'bogor',
  DEPOK: 'depok',
  TANGERANG: 'tangerang',
  BEKASI: 'bekasi',
  BANDUNG: 'bandung',
  MENGAJAR: 'mengajar',
};

export const TEAM_LABELS = {
  [TEAMS.PUSAT]: 'IYMPACK Pusat',
  [TEAMS.JAKARTA]: 'IYMPACK Jakarta',
  [TEAMS.BOGOR]: 'IYMPACK Bogor',
  [TEAMS.DEPOK]: 'IYMPACK Depok',
  [TEAMS.TANGERANG]: 'IYMPACK Tangerang',
  [TEAMS.BEKASI]: 'IYMPACK Bekasi',
  [TEAMS.BANDUNG]: 'IYMPACK Bandung',
  [TEAMS.MENGAJAR]: 'IYMPACK Mengajar',
};

// ─── LocalStorage Keys ──────────────────────────────────────
export const LS_KEYS = {
  USERS: 'iympack_users',
  EVENTS: 'iympack_events',
  APPLICANTS: 'iympack_applicants',
  ARTICLES: 'iympack_articles',
  TEAMS: 'iympack_teams',
  VOUCHERS: 'iympack_vouchers',
  SITE_SETTINGS: 'iympack_site_settings',
  TESTIMONIALS: 'iympack_testimonials',
  GALLERY: 'iympack_gallery',
  FAQS: 'iympack_faqs',
  AUDIT_LOGS: 'iympack_audit_logs',
  AUTH_SESSION: 'iympack_auth_session',
  PAGE_SECTIONS: 'iympack_page_sections',
  SEEDED: 'iympack_seeded',
};

// ─── Session Config ─────────────────────────────────────────
export const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 menit
