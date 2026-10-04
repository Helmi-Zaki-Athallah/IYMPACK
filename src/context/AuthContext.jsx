/**
 * IYMPACK CMS — Auth Context
 *
 * Provides authentication state and methods to the entire component tree.
 * - Manages login/logout
 * - Auto-checks session validity
 * - Inactivity timeout (60 minutes)
 * - Refreshes session on user interaction
 */

import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { AuthContext } from './AuthContextValue.js';
import {
  login as authLogin,
  logout as authLogout,
  getCurrentSession,
  isSessionValid,
  refreshSession,
  resetPasswordRequest,
} from '../services/auth.service.js';
import { logAction } from '../services/audit.service.js';
import { AUDIT_ACTIONS, SESSION_TIMEOUT_MS } from '../lib/db.constants.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // { userId, userName, userEmail, userRole }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef(null);

  /**
   * Check if there is a valid session in LocalStorage.
   */
  const checkSession = useCallback(() => {
    setIsLoading(true);
    try {
      if (isSessionValid()) {
        const session = getCurrentSession();
        setUser(session);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  /**
   * Logout (manual or auto-timeout).
   */
  const handleLogout = useCallback((isAutoLogout = false) => {
    const currentUser = getCurrentSession();

    if (currentUser) {
      logAction({
        userId: currentUser.userId,
        userName: currentUser.userName,
        action: AUDIT_ACTIONS.LOGOUT,
        target: 'session',
        details: isAutoLogout ? 'Sesi kedaluwarsa (timeout 60 menit)' : 'Logout manual',
      });
    }

    authLogout();
    setUser(null);
    setIsAuthenticated(false);
    clearTimeout(timeoutRef.current);
  }, []);

  /**
   * Login with email + password.
   */
  const handleLogin = useCallback(async (email, password) => {
    const session = await authLogin(email, password);
    setUser(session);
    setIsAuthenticated(true);

    // Audit log
    logAction({
      userId: session.userId,
      userName: session.userName,
      action: AUDIT_ACTIONS.LOGIN,
      target: 'session',
      details: `Login berhasil dari ${email}`,
    });

    return session;
  }, []);

  /**
   * Forgot password request.
   */
  const handleForgotPassword = useCallback((email) => {
    logAction({
      userName: email,
      action: AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
      target: 'user',
      details: `Permintaan reset password untuk ${email}`,
    });
    return resetPasswordRequest(email);
  }, []);

  /**
   * Check if the current user has a specific role.
   */
  const hasRole = useCallback(
    (role) => {
      return user?.userRole === role;
    },
    [user]
  );

  /**
   * Check if current user is Super Admin.
   */
  const isSuperAdmin = useCallback(() => {
    return user?.userRole === 'super_admin';
  }, [user]);

  // ─── Check existing session on mount ─────────────────────
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // ─── Inactivity timeout: reset timer on user interaction ──
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      refreshSession();
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        handleLogout(true); // auto-logout
      }, SESSION_TIMEOUT_MS);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // start timer

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(timeoutRef.current);
    };
  }, [isAuthenticated, handleLogout]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    checkSession,
    hasRole,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

