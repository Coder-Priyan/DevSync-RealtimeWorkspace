// frontend/src/features/workspace/hooks/useInvitations.js

import { useState, useEffect, useCallback } from 'react'
import { getReceivedInvitations } from '@/services/invitation.service'

export function useInvitations() {
  const [invitations, setInvitations] = useState([])
  const [isLoading,   setIsLoading]   = useState(true)
  const [error,       setError]       = useState('')

  const refreshInvitations = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getReceivedInvitations()
      setInvitations(data.invitations ?? [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invitations.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshInvitations()
  }, [refreshInvitations])

  return {
    invitations,
    isLoading,
    error,
    refreshInvitations,
  }
}