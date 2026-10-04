/**
 * IYMPACK CMS — Articles Service
 *
 * CRUD operations for news articles and documentation.
 */

import { LS_KEYS, ARTICLE_STATUS } from '../lib/db.constants.js';
import { createArticle as createArticleSchema } from '../lib/db.schemas.js';
import {
  getCollection,
  findById,
  findByField,
  insertItem,
  updateItem,
  deleteItem,
} from '../lib/storage.js';
import { generateSlug, now } from '../lib/utils.js';

/**
 * Get all articles, optionally filtered.
 * @param {Object} [filters] - { status, category, search }
 */
export function getArticles(filters = {}) {
  let articles = getCollection(LS_KEYS.ARTICLES);

  if (filters.status) {
    articles = articles.filter((a) => a.status === filters.status);
  }
  if (filters.category) {
    articles = articles.filter((a) => a.category === filters.category);
  }
  if (filters.teamId && filters.teamId !== 'all') {
    articles = articles.filter((a) => a.teamId === filters.teamId);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.bodyContent.toLowerCase().includes(q)
    );
  }

  // Sort by createdAt descending
  articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return articles;
}

/**
 * Get published articles only (for public frontend).
 */
export function getPublishedArticles() {
  return getArticles({ status: ARTICLE_STATUS.PUBLISHED });
}

/**
 * Get a single article by slug.
 */
export function getArticleBySlug(slug) {
  return findByField(LS_KEYS.ARTICLES, 'slug', slug);
}

/**
 * Get a single article by ID.
 */
export function getArticleById(id) {
  return findById(LS_KEYS.ARTICLES, id);
}

/**
 * Create a new article.
 */
export async function createNewArticle(data) {
  const rawSlug = data.slug ? data.slug.trim() : '';
  let slug = rawSlug ? generateSlug(rawSlug) : generateSlug(data.title);
  if (!slug) slug = `artikel-${Date.now().toString(36)}`;

  const existing = findByField(LS_KEYS.ARTICLES, 'slug', slug);
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const article = createArticleSchema({
    ...data,
    slug,
  });

  await insertItem(LS_KEYS.ARTICLES, article);
  return article;
}

/**
 * Update an existing article.
 */
export async function updateArticle(id, updates) {
  if (updates.slug !== undefined && updates.slug.trim() !== '') {
    let slug = generateSlug(updates.slug);
    const existing = findByField(LS_KEYS.ARTICLES, 'slug', slug);
    if (existing && existing.id !== id) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    updates.slug = slug;
  } else if (updates.title && updates.slug === undefined) {
    let slug = generateSlug(updates.title);
    const existing = findByField(LS_KEYS.ARTICLES, 'slug', slug);
    if (existing && existing.id !== id) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    updates.slug = slug;
  }

  updates.updatedAt = now();
  const updated = await updateItem(LS_KEYS.ARTICLES, id, updates);
  if (!updated) throw new Error('Artikel tidak ditemukan.');
  return updated;
}

/**
 * Delete an article.
 */
export async function deleteArticle(id) {
  const deleted = await deleteItem(LS_KEYS.ARTICLES, id);
  if (!deleted) throw new Error('Artikel tidak ditemukan.');
  return true;
}

/**
 * Get unique article categories.
 */
export function getArticleCategories() {
  const articles = getCollection(LS_KEYS.ARTICLES);
  return [...new Set(articles.map((a) => a.category).filter(Boolean))];
}

/**
 * Count articles.
 */
export function countArticles() {
  const articles = getCollection(LS_KEYS.ARTICLES);
  return {
    total: articles.length,
    draft: articles.filter((a) => a.status === ARTICLE_STATUS.DRAFT).length,
    published: articles.filter((a) => a.status === ARTICLE_STATUS.PUBLISHED).length,
  };
}
