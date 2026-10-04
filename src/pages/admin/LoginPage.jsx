/**
 * IYMPACK CMS — Login Page
 *
 * Split-screen admin login page at /admin/login.
 * Left: hero image. Right: glassmorphism login form over blurred hero.
 */

import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { sanitizeText } from '../../lib/security.js';

export default function LoginPage() {
  const { login, forgotPassword, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Jika sudah login, redirect ke dashboard
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = sanitizeText(email, 120);
    if (!cleanEmail) {
      setError('Masukkan alamat email.');
      setLoading(false);
      return;
    }

    try {
      await login(cleanEmail, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');

    const cleanForgotEmail = sanitizeText(forgotEmail, 120);
    if (!cleanForgotEmail) {
      setForgotMessage('Masukkan alamat email valid.');
      setForgotLoading(false);
      return;
    }

    try {
      const result = forgotPassword(cleanForgotEmail);
      setForgotMessage(result.message);
    } catch {
      setForgotMessage('Terjadi kesalahan. Coba lagi nanti.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* ─── Left: Hero Image ─────────────────────────────── */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/hero-hands.webp"
          alt="IYMPACK"
          loading="eager"
          decoding="async"
          onError={(e) => {
            e.target.src = '/hero-hands.png';
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* ─── Right: Glassmorphism Login Form ──────────────── */}
      <div className="flex-1 lg:w-1/2 relative flex items-center justify-center px-6 py-12 sm:px-12 overflow-hidden h-screen lg:h-auto">
        {/* Blurred hero background behind the right panel */}
        <img
          src="/hero-hands.webp"
          alt=""
          loading="eager"
          decoding="async"
          onError={(e) => {
            e.target.src = '/hero-hands.png';
          }}
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm"
          aria-hidden="true"
        />
        {/* Dark overlay on the blurred background */}
        <div className="absolute inset-0 bg-[#1c241e]/70" />

        {/* ─── Glass Card ─────────────────────────── */}
        <div className="w-full max-w-md relative z-10 bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] rounded-3xl shadow-2xl shadow-black/30 p-8 sm:p-10">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/assets/logo/logo-iympack.png"
              alt="IYMPACK Logo"
              className="h-16 w-auto drop-shadow-lg"
            />
          </div>

          {!showForgot ? (
            /* ─── Login Form ───────────────────────── */
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Title */}
              <div className="text-center mb-1">
                <h1 className="text-3xl font-bold text-white italic font-heading tracking-tight">
                  Log In
                </h1>
                <p className="text-sm text-white/50 mt-1.5">
                  Masukkan detail akun admin Anda.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="px-4 py-3 bg-red-500/15 backdrop-blur-sm border border-red-400/20 rounded-xl text-sm text-red-300 font-medium flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan e-mail Anda"
                  required
                  className="w-full px-4 py-3 bg-white/[0.07] backdrop-blur-sm border border-white/[0.12] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#faeed4]/30 focus:border-[#faeed4]/40 transition-all placeholder:text-white/30"
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-11 bg-white/[0.07] backdrop-blur-sm border border-white/[0.12] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#faeed4]/30 focus:border-[#faeed4]/40 transition-all placeholder:text-white/30"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#faeed4] focus:ring-[#faeed4]/30 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setError(''); }}
                  className="text-sm text-white/50 hover:text-[#faeed4] transition-colors font-medium"
                >
                  Lupa password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#0d0d0d]/70 hover:bg-[#0d0d0d]/90 backdrop-blur-sm border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-black/20"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </button>


              {/* Back to Website */}
              <div className="text-center pt-1">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-[#faeed4] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali ke Website
                </Link>
              </div>
            </form>
          ) : (
            /* ─── Forgot Password Form ─────────────── */
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <button
                type="button"
                onClick={() => { setShowForgot(false); setForgotMessage(''); }}
                className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-[#faeed4] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke login
              </button>

              <div className="text-center">
                <h1 className="text-3xl font-bold text-white italic font-heading tracking-tight">
                  Lupa Password
                </h1>
                <p className="text-sm text-white/50 mt-1.5">
                  Masukkan email Anda dan kami akan mengirim tautan untuk reset password.
                </p>
              </div>

              {forgotMessage && (
                <div className="px-4 py-3 bg-emerald-500/15 backdrop-blur-sm border border-emerald-400/20 rounded-xl text-sm text-emerald-300 font-medium">
                  {forgotMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@iympack.id"
                  required
                  className="w-full px-4 py-3 bg-white/[0.07] backdrop-blur-sm border border-white/[0.12] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#faeed4]/30 focus:border-[#faeed4]/40 transition-all placeholder:text-white/30"
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3.5 rounded-xl bg-[#0d0d0d]/70 hover:bg-[#0d0d0d]/90 backdrop-blur-sm border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {forgotLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Tautan Reset</span>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-white/25 mt-6">
            © {new Date().getFullYear()} IYMPACK — Indonesia Yuwana Muda Peduli Aksi Cinta Kasih
          </p>
        </div>
      </div>
    </div>
  );
}
