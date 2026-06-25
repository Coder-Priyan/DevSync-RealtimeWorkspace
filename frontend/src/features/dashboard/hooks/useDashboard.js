 import { useState, useEffect, useCallback } from 'react'
import {
  getRepositories,
  createRepository,
  deleteRepository,
} from '@/services/repository.service'

export function useDashboard() {
  const [repos,     setRepos]     = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState('')

  // ── Modal state ────────────────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // ── Fetch repositories on mount ────────────────────────────────────────────
  const fetchRepos = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getRepositories()
      // Backend may return { repositories: [] } or [] directly — handle both
      setRepos(Array.isArray(data) ? data : (data.repositories ?? []))
    } catch (err) {
      setError('Failed to load repositories. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRepos()
  }, [fetchRepos])

  // ── Create repository ──────────────────────────────────────────────────────
  const handleCreateRepo = useCallback(async ({ name, description }) => {
    const data = await createRepository({ name, description })
    const newRepo = data.repository ?? data
    setRepos((prev) => [newRepo, ...prev])
    setIsCreateModalOpen(false)
  }, [])

  // ── Delete repository ──────────────────────────────────────────────────────
  const handleDeleteRepo = useCallback(async (repoId) => {
    await deleteRepository(repoId)
    setRepos((prev) => prev.filter((r) => r._id !== repoId))
  }, [])

  return {
    repos,
    isLoading,
    error,
    isCreateModalOpen,
    openCreateModal:  () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    handleCreateRepo,
    handleDeleteRepo,
  }
}