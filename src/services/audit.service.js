/**
 * IYMPACK CMS — Audit Log Service
 *
 * Records and queries system activity logs for security monitoring.
 */

import { LS_KEYS } from '../lib/db.constants.js';
import { createAuditLog } from '../lib/db.schemas.js';
import { getCollection, setCollection, insertItem } from '../lib/storage.js';

/**
 * Log an action to the audit trail.
 * @param {Object} data - { userId, userName, action, target, targetId, details }
 */
export function logAction(data) {
  const entry = createAuditLog(data);
  insertItem(LS_KEYS.AUDIT_LOGS, entry);
  return entry;
}

/**
 * Get audit logs, optionally filtered and paginated.
 * @param {Object} [filters] - { action, userId, search, startDate, endDate, limit, offset }
 * @returns {Object} { logs: Object[], total: number }
 */
export function getAuditLogs(filters = {}) {
  let logs = getCollection(LS_KEYS.AUDIT_LOGS);

  // Filter by action type
  if (filters.action) {
    logs = logs.filter((l) => l.action === filters.action);
  }

  // Filter by user
  if (filters.userId) {
    logs = logs.filter((l) => l.userId === filters.userId);
  }

  // Search in userName, action, target, details
  if (filters.search) {
    const q = filters.search.toLowerCase();
    logs = logs.filter(
      (l) =>
        (l.userName || '').toLowerCase().includes(q) ||
        (l.action || '').toLowerCase().includes(q) ||
        (l.target || '').toLowerCase().includes(q) ||
        (l.details || '').toLowerCase().includes(q)
    );
  }

  // Filter by date range
  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() <= end);
  }

  // Sort by timestamp descending (newest first)
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = logs.length;

  // Pagination
  if (filters.offset !== undefined || filters.limit !== undefined) {
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    logs = logs.slice(offset, offset + limit);
  }

  return { logs, total };
}

/**
 * Clear audit logs older than N days.
 * @param {number} daysOld - Age threshold in days.
 * @returns {number} Number of logs removed.
 */
export function clearOldLogs(daysOld = 90) {
  const threshold = Date.now() - daysOld * 24 * 60 * 60 * 1000;
  const logs = getCollection(LS_KEYS.AUDIT_LOGS);
  const remaining = logs.filter((l) => new Date(l.timestamp).getTime() >= threshold);
  const removed = logs.length - remaining.length;

  setCollection(LS_KEYS.AUDIT_LOGS, remaining);
  return removed;
}

/**
 * Get unique audit action types for filter dropdowns.
 */
export function getAuditActionTypes() {
  const logs = getCollection(LS_KEYS.AUDIT_LOGS);
  return [...new Set(logs.map((l) => l.action).filter(Boolean))];
}
