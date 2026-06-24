/**
 * services/auth.service.js — Authentication API calls.
 *
 * RULES:
 *   - Import apiClient from @/lib/axios — never from 'axios' directly
 *   - Export plain async functions — no hooks, no React, no state
 *   - Each function returns the response data directly (not the whole response)
 *   - Let errors propagate — the calling hook handles them with try/catch
 *
 * These functions are called by:
 *   - @/features/auth/hooks/useAuth.js  (Stage 3)
 *
 * Adjust endpoint paths to match your actual backend routes.
 */

import apiClient from '@/lib/axios'

/**
 * register — Creates a new user account.
 *
 * @param {{ username: string, email: string, password: string }} data
 * @returns {{ token: string, user: object }}
 */
export const register = async ({ username, email, password }) => {
  const response = await apiClient.post('/auth/register', {
    username,
    email,
    password,
  })
  return response.data
}

/**
 * login — Authenticates an existing user.
 *
 * @param {{ email: string, password: string }} data
 * @returns {{ token: string, user: object }}
 */
export const login = async ({ email, password }) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  })
  return response.data
}

/**
 * getProfile — Fetches the authenticated user's profile.
 * Used to refresh the user object without requiring re-login.
 * JWT is attached automatically by the Axios request interceptor.
 *
 * @returns {{ user: object }}
 */
export const getProfile = async () => {
  const response = await apiClient.get('/auth/profile')
  return response.data
}