// frontend/src/services/invitation.service.js

import apiClient from '@/lib/axios'

/** Send a repository invitation to a user by email. Owner only. */
export const sendInvitation = async (repositoryId, email) => {
  const response = await apiClient.post('/invitations', { repositoryId, email })
  return response.data
}

/** Get all pending invitations received by the logged-in user. */
export const getReceivedInvitations = async () => {
  const response = await apiClient.get('/invitations/received')
  return response.data
}

/** Accept a pending invitation by ID. */
export const acceptInvitation = async (invitationId) => {
  const response = await apiClient.put(`/invitations/${invitationId}/accept`)
  return response.data
}

/** Reject a pending invitation by ID. */
export const rejectInvitation = async (invitationId) => {
  const response = await apiClient.put(`/invitations/${invitationId}/reject`)
  return response.data
}