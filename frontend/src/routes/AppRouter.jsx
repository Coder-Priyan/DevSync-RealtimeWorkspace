/**
 * routes/AppRouter.jsx — All route definitions for DevSync.
 *
 * STRUCTURE:
 *
 *   /                      → Redirects to /dashboard (if auth) or /login (if not)
 *   /login                 → LoginPage         (public — redirect to /dashboard if already authed)
 *   /register              → RegisterPage      (public — redirect to /dashboard if already authed)
 *   /dashboard             → DashboardPage     (protected)
 *   /workspace/:repoId     → WorkspacePage     (protected)
 *   *                      → NotFoundPage      (catch-all)
 *
 * RULE: This is the only file in the codebase that defines <Route> elements.
 * If you add a new page, add it here. Nothing else changes.
 *
 * PATTERN: Uses React Router v6 nested routes.
 *   - <ProtectedRoute> wraps all authenticated routes as a parent Route element.
 *   - <PublicOnlyRoute> wraps login/register to redirect authed users away.
 *   - Page components are lazy-loaded to keep the initial bundle small.
 */

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { ROUTES } from '../constants/routes';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// ─── Lazy-loaded page components ──────────────────────────────────────────────
// Pages are code-split automatically by Vite when imported with React.lazy().
// This means the login bundle does NOT include the workspace, dashboard, etc.
// Each page only loads when its route is first visited.
//
// Fallback: a minimal dark-screen loader (same AppLoadingScreen from ProtectedRoute)
// is shown while the page chunk loads. Usually instant, but handles slow networks.
const LoginPage     = lazy(() => import('@/pages/LoginPage'))
const RegisterPage  = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const WorkspacePage = lazy(() => import('@/pages/WorkspacePage'))

// ─── Page Suspense Wrapper ────────────────────────────────────────────────────
// Wraps lazy pages in a Suspense boundary with a consistent fallback.
// The fallback is a bare div — the actual skeleton/loading state is built
// into each page component for more contextual loading experiences (Stage 5+).
function PageLoader() {
  return (
    <div
      style={{
        height:          '100vh',
        backgroundColor: '#0D1117',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        color:           '#484F58',
        fontFamily:      "'Inter', sans-serif",
        fontSize:        '12px',
      }}
    >
      Loading...
    </div>
  )
}

// ─── PublicOnlyRoute ──────────────────────────────────────────────────────────
// Wraps login and register routes.
// If the user is already authenticated, redirect them away from the auth pages.
// There is no reason an authenticated user should ever see the login screen.
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  // Still restoring session — wait before making a redirect decision
  if (isLoading) return null

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DEFAULT_AUTHENTICATED} replace />
  }

  return children
}

// ─── RootRedirect ─────────────────────────────────────────────────────────────
// The '/' route — sends users to the right place based on auth status.
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  return (
    <Navigate
      to={isAuthenticated ? ROUTES.DEFAULT_AUTHENTICATED : ROUTES.DEFAULT_UNAUTHENTICATED}
      replace
    />
  )
}

// ─── NotFoundPage ─────────────────────────────────────────────────────────────
// Minimal 404 — built inline here, no separate file needed at this stage.
function NotFoundPage() {
  return (
    <div
      style={{
        height:          '100vh',
        backgroundColor: '#0D1117',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             '16px',
        fontFamily:      "'Inter', sans-serif",
      }}
    >
      <div style={{ fontSize: '48px', fontWeight: '700', color: '#30363D' }}>
        404
      </div>
      <div style={{ fontSize: '14px', color: '#8B949E' }}>
        This page does not exist.
      </div>
      <a
        href={ROUTES.DASHBOARD}
        style={{
          marginTop:      '8px',
          color:          '#7C5CFC',
          fontSize:       '13px',
          textDecoration: 'underline',
        }}
      >
        Go to Dashboard
      </a>
    </div>
  )
}

// ─── AppRouter ────────────────────────────────────────────────────────────────
function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Root redirect ─────────────────────────────────────────────── */}
          <Route path="/" element={<RootRedirect />} />

          {/* ── Public routes — redirect away if already authenticated ───── */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* ── Protected routes — redirect to /login if not authenticated ─ */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.DASHBOARD}            element={<DashboardPage />} />
            <Route path={ROUTES.WORKSPACE(':repoId')} element={<WorkspacePage />} />
          </Route>

          {/* ── 404 catch-all ─────────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
