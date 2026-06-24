/**
 * services/folder.service.js — Folder management API calls.
 * Called by @/features/workspace/hooks/useFileTree.js (Stage 6)
 */

import apiClient from '@/lib/axios'

/** Get all folders for a repository */
export const getFolders = async (repoId) => {
  const response = await apiClient.get(`/repositories/${repoId}/folders`)
  return response.data
}

/** Create a new folder */
export const createFolder = async (repoId, { name, parentFolderId }) => {
  const response = await apiClient.post(`/repositories/${repoId}/folders`, {
    name,
    parentFolderId,
  })
  return response.data
}

/** Rename a folder */
export const renameFolder = async (repoId, folderId, name) => {
  const response = await apiClient.put(`/repositories/${repoId}/folders/${folderId}`, {
    name,
  })
  return response.data
}

/** Delete a folder — backend should cascade-delete all nested files/folders */
export const deleteFolder = async (repoId, folderId) => {
  const response = await apiClient.delete(`/repositories/${repoId}/folders/${folderId}`)
  return response.data
}