/**
 * IYMPACK CMS — Admin Breadcrumbs Component
 *
 * Dynamically computes hierarchical navigation trail based on current URL path.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminBreadcrumbs() {
  const location = useLocation();
  const path = location.pathname;

  // Build crumbs array based on route pattern
  const crumbs = [{ label: 'Dashboard', to: '/admin' }];

  if (path === '/admin' || path === '/admin/') {
    // Only Dashboard
    return null; // On the root dashboard itself, we can hide breadcrumbs to keep top clean
  }

  // Kegiatan
  if (path.startsWith('/admin/kegiatan')) {
    crumbs.push({ label: 'Kegiatan', to: '/admin/kegiatan' });
    if (path.includes('/tambah')) {
      crumbs.push({ label: 'Tambah Kegiatan Baru' });
    } else if (path.includes('/edit')) {
      crumbs.push({ label: 'Edit Kegiatan' });
    } else if (path.includes('/detail')) {
      crumbs.push({ label: 'Detail Kegiatan' });
    }
  }
  // Artikel
  else if (path.startsWith('/admin/artikel')) {
    crumbs.push({ label: 'Artikel & Berita', to: '/admin/artikel' });
    if (path.includes('/tambah')) {
      crumbs.push({ label: 'Tulis Artikel Baru' });
    } else if (path.includes('/edit')) {
      crumbs.push({ label: 'Edit Artikel' });
    }
  }
  // Pendaftar
  else if (path.startsWith('/admin/pendaftar')) {
    crumbs.push({ label: 'Pendaftar Relawan', to: '/admin/pendaftar' });
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 2) {
      crumbs.push({ label: 'Detail Pendaftar' });
    }
  }
  // Kelola Akun
  else if (path.startsWith('/admin/users')) {
    crumbs.push({ label: 'Kelola Akun', to: '/admin/users' });
    if (path.includes('/tambah')) {
      crumbs.push({ label: 'Tambah User' });
    }
  }
  // Pengaturan Situs
  else if (path.startsWith('/admin/pengaturan')) {
    crumbs.push({ label: 'Pengaturan Situs' });
  }
  // Audit Log
  else if (path.startsWith('/admin/audit-log')) {
    crumbs.push({ label: 'Audit Log' });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-3.5 sm:mb-5 flex items-center text-xs text-gray-500 font-medium overflow-x-auto [scrollbar-width:none]">
      <ol className="flex items-center flex-wrap gap-1 sm:gap-1.5">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-gray-300 select-none">/</span>}
              {isLast || !crumb.to ? (
                <span className="text-gray-900 font-semibold truncate max-w-[240px]" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="hover:text-blue-600 hover:underline transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
