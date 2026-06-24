/**
 * ROUTES — Application route path constants.
 *
 * Rule: never write a raw path string like '/workspace/123' anywhere in
 * the codebase. Always use these constants so a path change here cascades
 * everywhere automatically.
 *
 * Usage:
 *   import { ROUTES } from '@/constants/routes'
 *   navigate(ROUTES.DASHBOARD)
 *   <Link to={ROUTES.LOGIN} />
 *   ROUTES.WORKSPACE(':repoId') // → '/workspace/:repoId'  (for Route definitions)
 *   ROUTES.WORKSPACE(repo._id)  // → '/workspace/abc123'   (for navigation)
 */

export const ROUTES = {
  // Public routes — accessible without authentication
  LOGIN:    '/login',
  REGISTER: '/register',

  // Protected routes — require valid JWT
  DASHBOARD: '/dashboard',

  /**
   * Workspace route.
   * Called as a function so it works both as a route pattern and as
   * a concrete URL for navigation.
   *
   * Route definition:  ROUTES.WORKSPACE(':repoId')
   * Navigation:        ROUTES.WORKSPACE(repo._id)
   */
  WORKSPACE: (repoId = ':repoId') => `/workspace/${repoId}`,

  // Default redirect target for authenticated users
  DEFAULT_AUTHENTICATED: '/dashboard',

  // Default redirect target for unauthenticated users
  DEFAULT_UNAUTHENTICATED: '/login',
}