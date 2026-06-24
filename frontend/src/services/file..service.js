/**
 * services/file.service.js — File management API calls.
 * Called by @/features/workspace/hooks/useFileTree.js (Stage 6)
 */

import apiClient from '@/lib/axios'

/** Get all files for a repository */
export const getFiles = async (repoId) => {
  const response = await apiClient.get(`/repositories/${repoId}/files`)
  return response.data
}

/** Get a single file with its content */
export const getFileById = async (repoId, fileId) => {
  const response = await apiClient.get(`/repositories/${repoId}/files/${fileId}`)
  return response.data
}

/** Create a new file */
export const createFile = async (repoId, { name, folderId, content = '' }) => {
  const response = await apiClient.post(`/repositories/${repoId}/files`, {
    name,
    folderId,
    content,
  })
  return response.data
}

/**
 * updateFileContent — Updates the content of a file.
 * Called by the auto-save debounce in useEditor (Stage 6).
 * This is also the trigger for the Socket.IO broadcast on the backend.
 */
export const updateFileContent = async (repoId, fileId, content) => {
  const response = await apiClient.put(`/repositories/${repoId}/files/${fileId}`, {
    content,
  })
  return response.data
}

/** Rename a file */
export const renameFile = async (repoId, fileId, name) => {
  const response = await apiClient.put(`/repositories/${repoId}/files/${fileId}`, {
    name,
  })
  return response.data
}

/** Delete a file */
export const deleteFile = async (repoId, fileId) => {
  const response = await apiClient.delete(`/repositories/${repoId}/files/${fileId}`)
  return response.data
}