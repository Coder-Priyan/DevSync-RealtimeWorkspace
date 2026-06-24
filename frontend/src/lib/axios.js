/**
 * lib/axios.js — Configured Axios instance for DevSync.
 *
 * This is the ONLY place in the entire codebase where Axios is configured.
 * Every service file imports from here — never from 'axios' directly.
 *
 * What this handles automatically for every request:
 *   1. Base URL — all requests go to the backend API
 *   2. Content-Type header — always JSON
 *   3. JWT attachment — reads token from localStorage, injects as Bearer header
 *   4. 401 handling — clears stale token and redirects to login
 *   5. Timeout — prevents hanging requests
 */

import axios from 'axios'
import { ROUTES } from '@/constants/routes'

// ─── Instance ─────────────────────────────────────────────────────────────────
const apiClient = axios.create({
  /**
   * Base URL for all API requests.
   *
   * In development: Vite's proxy rewrites /api → http://localhost:5000/api
   * In production:  Set VITE_API_BASE_URL in your .env file
   *
   * This means every service call uses relative paths like '/api/auth/login'
   * — no hardcoded localhost URLs anywhere in service files.
   */
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',

  // Request timeout — 15 seconds. Prevents the UI from hanging on dead requests.
  timeout: 15000,

  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Runs before every outgoing request.
// Reads the JWT from localStorage and attaches it as a Bearer token.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devsync_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    // Request setup failed (network error before sending) — reject immediately
    return Promise.reject(error)
  }
)

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Runs after every response (success or error).
apiClient.interceptors.response.use(
  // Success path — pass the response through unchanged
  (response) => response,

  // Error path — handle common HTTP error cases centrally
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      /**
       * 401 Unauthorized — token is missing, expired, or invalid.
       *
       * Clear the stale token from storage and redirect to login.
       * This handles the case where a user's session expires mid-session
       * without them needing to manually log out.
       *
       * We use window.location.href instead of React Router navigate()
       * because this interceptor lives outside the React component tree.
       */
      localStorage.removeItem('devsync_token')
      localStorage.removeItem('devsync_user')

      // Only redirect if not already on the login page — prevents redirect loops
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.href = ROUTES.LOGIN
      }
    }

    if (status === 403) {
      // Forbidden — user is authenticated but does not have permission.
      // Do not redirect. Let the calling service/hook handle this and
      // show an appropriate error message in the UI.
      console.warn('[DevSync] 403 Forbidden:', error.response?.data?.message)
    }

    if (status >= 500) {
      // Server error — log it for debugging.
      // Individual service calls will surface this to the UI via their error state.
      console.error('[DevSync] Server error:', status, error.response?.data)
    }

    // Always re-reject so the calling service's catch block still runs.
    return Promise.reject(error)
  }
)

export default apiClient