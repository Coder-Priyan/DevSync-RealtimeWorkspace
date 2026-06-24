/**
 * routes/ProtectedRoute.jsx — Authentication guard for protected routes.
 *
 * HOW IT WORKS:
 *   1. While AuthContext is restoring the session from localStorage (isLoading),
 *      show a full-screen loading state. This prevents a flash where the user
 *      briefly sees the login page before their restored token is read.
 *
 *   2. If isAuthenticated is false (no token), redirect to /login.
 *      The 'replace' prop replaces the current history entry so the user
 *      cannot press Back to return to the protected page after being redirected.
 *
 *   3. If isAuthenticated is true, render the child route normally.
 *
 * Usage in AppRouter.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
 *     <Route path={ROUTES.WORKSPACE(':repoId')} element={<WorkspacePage />} />
 *   </Route>
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from '@/constants/routes'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  // ── Phase 1: Session is being restored from localStorage ─────────────────
  // Show a minimal dark-screen loader. This lasts <100ms in most cases.
  // Without this, there is a flash of the login page on every page refresh
  // for authenticated users — which looks broken.
  if (isLoading) {
    return <AppLoadingScreen />
  }

  // ── Phase 2: No valid session — redirect to login ─────────────────────────
  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace   // Don't add to browser history — back button won't loop
      />
    )
  }

  // ── Phase 3: Authenticated — render the matched child route ───────────────
  // <Outlet /> renders whichever Route is nested inside <ProtectedRoute> in
  // AppRouter.jsx. This is React Router v6's nested route pattern.
  return <Outlet />
}

// ─── App Loading Screen ───────────────────────────────────────────────────────
// Shown during the brief window when AuthContext is reading localStorage.
// Intentionally minimal — users see this for under 100ms, usually less.
function AppLoadingScreen() {
  return (
    <div
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        height:          '100vh',
        backgroundColor: '#0D1117', // ds-base — before Tailwind loads
        flexDirection:   'column',
        gap:             '16px',
      }}
    >
      {/* DevSync wordmark — minimal loading identity */}
      <div
        style={{
          fontSize:    '18px',
          fontWeight:  '600',
          color:       '#7C5CFC', // ds-accent
          fontFamily:  "'Inter', sans-serif",
          letterSpacing: '0.02em',
        }}
      >
        DevSync
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width:           '6px',
              height:          '6px',
              borderRadius:    '50%',
              backgroundColor: '#7C5CFC',
              opacity:         0.4,
              animation:       `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Inline keyframe for the dots — no CSS file dependency at this point */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}

export default ProtectedRoute
