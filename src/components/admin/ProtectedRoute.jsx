/**
 * IYMPACK CMS — Protected Route Wrapper
 *
 * Guards admin routes: redirects unauthenticated users to /admin/login.
 * Optionally restricts access to specific roles.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingScreen from '../LoadingScreen.jsx';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.requiredRole] - Optional role required (e.g. 'super_admin')
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Tampilkan loading state saat mengecek session
  if (isLoading) {
    return (
      <LoadingScreen
        message="Memverifikasi sesi admin portal..."
        dark={false}
        fullScreen
      />
    );
  }

  // Belum login → redirect ke login page (simpan intended URL)
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Cek role jika diperlukan
  if (requiredRole && user?.userRole !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 font-heading">Akses Ditolak</h2>
          <p className="text-sm text-gray-500 mt-2">
            Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi Super Admin untuk informasi lebih lanjut.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-5 px-5 py-2.5 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-forest-dark transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return children;
}
