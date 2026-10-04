import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';
import { Modals } from './components/Modals';
import TopLoadingBar from './components/TopLoadingBar';
import LoadingScreen from './components/LoadingScreen';

// ─── Public Pages (HomePage eager for fast LCP; others lazy-loaded) ───────────
import HomePage from './pages/HomePage';
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EventRegistrationPage = lazy(() => import('./pages/EventRegistrationPage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const VolunteerPage = lazy(() => import('./pages/VolunteerPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TeamDetailPage = lazy(() => import('./pages/TeamDetailPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ─── Admin Pages (Code-split to keep initial bundle ultra-light) ───────────────
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const EventsManagePage = lazy(() => import('./pages/admin/EventsManagePage'));
const EventEditorPage = lazy(() => import('./pages/admin/EventEditorPage'));
const EventDetailAdminPage = lazy(() => import('./pages/admin/EventDetailAdminPage'));
const ArticlesManagePage = lazy(() => import('./pages/admin/ArticlesManagePage'));
const ArticleEditorPage = lazy(() => import('./pages/admin/ArticleEditorPage'));
const ApplicantsManagePage = lazy(() => import('./pages/admin/ApplicantsManagePage'));
const ApplicantDetailPageAdmin = lazy(() => import('./pages/admin/ApplicantDetailPageAdmin'));
const UsersManagePage = lazy(() => import('./pages/admin/UsersManagePage'));
const UserFormPage = lazy(() => import('./pages/admin/UserFormPage'));
const SiteSettingsPage = lazy(() => import('./pages/admin/SiteSettingsPage'));
const AuditLogPage = lazy(() => import('./pages/admin/AuditLogPage'));
const TeamProfilePage = lazy(() => import('./pages/admin/TeamProfilePage'));
const GalleryManagePage = lazy(() => import('./pages/admin/GalleryManagePage'));
const TestimonialsManagePage = lazy(() => import('./pages/admin/TestimonialsManagePage'));
const FaqManagePage = lazy(() => import('./pages/admin/FaqManagePage'));
const VouchersManagePage = lazy(() => import('./pages/admin/VouchersManagePage'));
const PageContentManagePage = lazy(() => import('./pages/admin/PageContentManagePage'));
const AccountSettingsPage = lazy(() => import('./pages/admin/AccountSettingsPage'));

// ─── Admin Components (Lazy loaded so admin code & animation libraries don't bloat public bundle)
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

/**
 * Wrapper component that conditionally shows public Navbar/Footer
 * only when NOT on admin routes.
 */
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* ─── Accessibility: Skip to Content Link ─── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-3 focus:bg-[#faeed4] focus:text-[#1c241e] focus:font-bold focus:text-xs focus:rounded-full focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#819b8e] transition-all"
      >
        Lewati ke Konten Utama
      </a>

      <TopLoadingBar />

      {!isAdminRoute && (
        <div className="min-h-screen flex flex-col bg-[#1c241e] text-stone-100 relative selection:bg-[#faeed4] selection:text-[#1c241e]">
          <Navbar />
          <main id="main-content" tabIndex="-1" role="main" className="flex-grow overflow-x-hidden min-w-0 focus:outline-none">
            <Suspense fallback={<LoadingScreen message="Memuat halaman IYMPACK..." dark={true} fullScreen={true} />}>
              <div key={location.pathname} className="animate-fade-in-quick min-w-0">
                <Routes location={location}>
                    {/* 1. Beranda */}
                    <Route path="/" element={<HomePage />} />

                    {/* 2. Event */}
                    <Route path="/event" element={<EventsPage />} />
                    <Route path="/event/:slug" element={<EventDetailPage />} />
                    <Route path="/event/:slug/daftar" element={<EventRegistrationPage />} />
                    <Route path="/kegiatan" element={<Navigate to="/event" replace />} />
                    <Route path="/kegiatan/:slug" element={<EventDetailPage />} />
                    <Route path="/kegiatan/:slug/daftar" element={<EventRegistrationPage />} />

                    {/* 3. Berita (Artikel diganti jadi Berita) */}
                    <Route path="/berita" element={<ArticlesPage />} />
                    <Route path="/berita/:slug" element={<ArticleDetailPage />} />
                    <Route path="/artikel" element={<Navigate to="/berita" replace />} />
                    <Route path="/artikel/:slug" element={<ArticleDetailPage />} />

                    {/* 4. Portal Relawan */}
                    <Route path="/relawan" element={<VolunteerPage />} />

                    {/* 5. Tentang Kami & Tim Chapter */}
                    <Route path="/tentang-kami" element={<AboutPage />} />
                    <Route path="/tim/:slug" element={<TeamDetailPage />} />
                    <Route path="/tim" element={<Navigate to="/tentang-kami" replace />} />
                    <Route path="/iympack-:slug-2" element={<TeamDetailPage />} />

                    {/* 6. Cara Kerja (Sub Menu) */}
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/syarat-dan-ketentuan" element={<TermsPage />} />
                    <Route path="/kebijakan-privasi" element={<PrivacyPage />} />
                    <Route path="/privacy-policy" element={<Navigate to="/kebijakan-privasi" replace />} />

                    {/* 7. Kontak */}
                    <Route path="/kontak" element={<ContactPage />} />

                    {/* 8. Galeri Kegiatan */}
                    <Route path="/galeri" element={<GalleryPage />} />
                    <Route path="/gallery" element={<Navigate to="/galeri" replace />} />

                    {/* Skip admin routes here — they're handled below */}
                    <Route path="/admin/*" element={null} />

                    {/* 404 Page & Wildcard Fallback */}
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </div>
            </Suspense>
          </main>
          <Footer />
          <BackToTop />
          <Modals />
        </div>
      )}

      {isAdminRoute && (
        <Suspense fallback={<LoadingScreen message="Menyiapkan portal admin..." dark={false} fullScreen={true} />}>
          <Routes>
            {/* Admin Login — standalone, no layout */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Admin Panel — protected with layout */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="kegiatan" element={<EventsManagePage />} />
              <Route path="kegiatan/tambah" element={<EventEditorPage />} />
              <Route path="kegiatan/edit/:id" element={<EventEditorPage />} />
              <Route path="kegiatan/detail/:id" element={<EventDetailAdminPage />} />

              <Route path="artikel" element={<ArticlesManagePage />} />
              <Route path="artikel/tambah" element={<ArticleEditorPage />} />
              <Route path="artikel/edit/:id" element={<ArticleEditorPage />} />

              <Route path="pendaftar" element={<ApplicantsManagePage />} />
              <Route path="pendaftar/:id" element={<ApplicantDetailPageAdmin />} />

              <Route path="tim" element={<TeamProfilePage />} />

              {/* Super Admin Routes (RBAC Guarded) */}
              <Route
                path="akun"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <AccountSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="konten"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <PageContentManagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="galeri"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <GalleryManagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="testimoni"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <TestimonialsManagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="faq"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <FaqManagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <UsersManagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/tambah"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <UserFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pengaturan"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SiteSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit-log"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <AuditLogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="voucher"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <VouchersManagePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin wildcard */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
        </Suspense>
      )}
    </>
  );
}

function App() {
  return (
    <ModalProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </ModalProvider>
  );
}

export default App;
