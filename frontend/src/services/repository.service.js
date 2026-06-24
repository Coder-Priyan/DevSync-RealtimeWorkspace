/**
 * services/repository.service.js — Repository management API calls.
 * Called by @/features/dashboard/hooks/useDashboard.js (Stage 4)
 */

import apiClient from '@/lib/axios'

/** Fetch all repositories accessible to the current user (owned + shared) */
export const getRepositories = async () => {
  const response = await apiClient.get('/repositories')
  return response.data
}

/** Fetch a single repository by ID */
export const getRepositoryById = async (repoId) => {
  const response = await apiClient.get(`/repositories/${repoId}`)
  return response.data
}

/** Create a new repository */
export const createRepository = async ({ name, description }) => {
  const response = await apiClient.post('/repositories', { name, description })
  return response.data
}

/** Update repository metadata (name, description, visibility) */
export const updateRepository = async (repoId, updates) => {
  const response = await apiClient.put(`/repositories/${repoId}`, updates)
  return response.data
}

/** Delete a repository — owner only */
export const deleteRepository = async (repoId) => {
  const response = await apiClient.delete(`/repositories/${repoId}`)
  return response.data
}

/** Export repository as ZIP — returns a blob for file download */
export const exportRepository = async (repoId) => {
  const response = await apiClient.get(`/repositories/${repoId}/export`, {
    responseType: 'blob', // Tell Axios to return raw binary data, not JSON
  })
  return response.data
}