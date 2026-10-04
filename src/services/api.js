/**
 * IYMPACK — API Service
 *
 * Unified API layer: uses LocalStorage services when no backend URL is configured,
 * falls back to axios HTTP calls when VITE_API_URL is set.
 */

import axios from 'axios';
import * as eventsService from './events.service.js';
import * as articlesService from './articles.service.js';
import * as applicantsService from './applicants.service.js';
import * as settingsService from './settings.service.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// If no API URL is configured, use local services (LocalStorage)
const useLocalStorage = !API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ─── Public API calls ───────────────────────────────────────

export const getActivities = async (category = null) => {
  if (useLocalStorage) {
    const filters = category ? { category } : {};
    return { data: eventsService.getPublishedEvents(filters) };
  }
  const params = category ? { category } : {};
  const response = await api.get('/activities', { params });
  return response.data;
};

export const getActivityBySlug = async (slug) => {
  if (useLocalStorage) {
    const event = eventsService.getEventBySlug(slug);
    if (!event) throw new Error('Event not found');
    return { data: event };
  }
  const response = await api.get(`/activities/${slug}`);
  return response.data;
};

export const getArticles = async () => {
  if (useLocalStorage) {
    return { data: articlesService.getPublishedArticles() };
  }
  const response = await api.get('/articles');
  return response.data;
};

export const getArticleBySlug = async (slug) => {
  if (useLocalStorage) {
    const article = articlesService.getArticleBySlug(slug);
    if (!article) throw new Error('Article not found');
    return { data: article };
  }
  const response = await api.get(`/articles/${slug}`);
  return response.data;
};

export const submitVolunteerForm = async (eventId, data) => {
  if (useLocalStorage) {
    const applicant = applicantsService.submitApplication(eventId, data);
    return { data: applicant };
  }
  const response = await api.post(`/activities/${eventId}/register`, data);
  return response.data;
};

export const sendContactMessage = async (data) => {
  if (useLocalStorage) {
    console.log('[api] 📧 Contact message received (mock):', data);
    return { data: { success: true, message: 'Pesan berhasil dikirim!' } };
  }
  const response = await api.post('/contact', data);
  return response.data;
};

export const getSiteSettings = async () => {
  if (useLocalStorage) {
    return { data: settingsService.getSiteSettings() };
  }
  const response = await api.get('/settings');
  return response.data;
};

export default api;
