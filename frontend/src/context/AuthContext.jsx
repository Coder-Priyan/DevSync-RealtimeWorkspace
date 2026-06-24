/**
 * store/AuthContext.jsx — Global authentication state for DevSync.
 *
 * WHAT THIS CONTEXT HOLDS (and nothing else):
 *   - user        : The authenticated user object from the backend
 *   - token       : The JWT string
 *   - isLoading   : True while checking localStorage on app mount
 *   - login()     : Stores token + user after a successful auth API response
 *   - logout()    : Clears token + user + redirects to login
 *   - isAuthenticated : Derived boolean — true when token exists
 *
 * WHAT THIS CONTEXT DOES NOT HOLD:
 *   - Repositories  → useDashboard hook
 *   - Workspace state → workspace hooks
 *   - Socket        → useSocket hook (workspace only)
 *   - File tree     → useFileTree hook (workspace only)
 *
 * Keeping this context minimal prevents the most common React performance
 * problem: every component that consumes AuthContext re-renders when ANY
 * piece of state changes. A lean context means fewer re-renders.
 *
 * Usage:
 *   import { useAuth } from '@/context/AuthContext'
 *   const { user, login, logout, isAuthenticated } = useAuth()
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─── Storage Keys ─────────────────────────────────────────────────────────────
// Centralized so we never typo a key in two different places
const STORAGE_KEYS = {
  TOKEN: 'devsync_token',
  USER:  'devsync_user',
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [token, setToken]       = useState(null)
  const [isLoading, setIsLoading] = useState(true) // true until localStorage check completes

  // ── On mount: restore session from localStorage ──────────────────────────
  // This runs once when the app loads. If a token and user exist in localStorage
  // (from a previous session), we restore them so the user stays logged in
  // across page refreshes without hitting the login screen again.
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      const storedUser  = localStorage.getItem(STORAGE_KEYS.USER)

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      // Corrupted localStorage data — clear it and start fresh
      console.warn('[DevSync] Failed to restore session, clearing storage:', error)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
    } finally {
      // Always stop the loading state, even if restoration failed.
      // ProtectedRoute reads isLoading — it must become false for routes to render.
      setIsLoading(false)
    }
  }, [])

  // ── login() ───────────────────────────────────────────────────────────────
  // Called by the auth feature's useAuth hook after a successful API response.
  // Receives the token and user object from the backend and persists them.
  const login = useCallback((newToken, newUser) => {
    // Persist to localStorage for session continuity across page refreshes
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))

    // Update React state so all consuming components re-render
    setToken(newToken)
    setUser(newUser)
  }, [])

  // ── logout() ──────────────────────────────────────────────────────────────
  // Clears all auth state and storage. The Axios interceptor also calls
  // the storage clearing logic on 401 — these two paths work together.
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)

    setToken(null)
    setUser(null)

    // Hard redirect to login — outside React Router context so always reliable
    window.location.href = '/login'
  }, [])

  // ── updateUser() ──────────────────────────────────────────────────────────
  // Used by a future profile settings page to update the user object
  // (e.g. after changing display name or avatar) without requiring re-login.
  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(merged))
    setUser(merged)
  }, [user])

  // ─── Context value ────────────────────────────────────────────────────────
  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,  // Derived — no separate state needed
    login,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── useAuth Hook ─────────────────────────────────────────────────────────────
// The only way components should access auth state.
// Throws a helpful error if used outside AuthProvider — catches mistakes early.
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error(
      '[DevSync] useAuth() must be used inside <AuthProvider>.\n' +
      'Make sure AuthProvider wraps your component tree in App.jsx.'
    )
  }

  return context
}

export default AuthContext
