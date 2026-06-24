/**
 * services/collaborator.service.js — Collaborator management API calls.
 * Called by @/features/workspace/hooks/ and @/features/dashboard/hooks/ (Stage 4+)
 */

import apiClient from '@/lib/axios'

/** Get all collaborators for a repository */
export const getCollaborators = async (repoId) => {
  const response = await apiClient.get(`/repositories/${repoId}/collaborators`)
  return response.data
}

/** Invite a collaborator by email address */
export const addCollaborator = async (repoId, { email, role = 'editor' }) => {
  const response = await apiClient.post(`/repositories/${repoId}/collaborators`, {
    email,
    role,
  })
  return response.data
}

/** Remove a collaborator from a repository */
export const removeCollaborator = async (repoId, collaboratorId) => {
  const response = await apiClient.delete(
    `/repositories/${repoId}/collaborators/${collaboratorId}`
  )
  return response.data
}