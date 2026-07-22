// frontend/src/features/workspace/components/CollabPane/ReceivedInvitations.jsx

import { useState } from 'react'
import { useInvitations } from '@/features/workspace/hooks/useInvitations'
import { acceptInvitation, rejectInvitation } from '@/services/invitation.service'

// ── InvitationCard ────────────────────────────────────────────────────────────
// Isolated per-card state so one card's loading/error does not affect others.
function InvitationCard({ invitation, onActionComplete }) {
  const [isActing,  setIsActing]  = useState(false)
  const [cardError, setCardError] = useState('')

  const handleAccept = async () => {
    setIsActing(true)
    setCardError('')
    try {
      await acceptInvitation(invitation._id)
      await onActionComplete()
    } catch (err) {
      setCardError(err.response?.data?.message || 'Failed to accept invitation.')
      setIsActing(false)
    }
  }

  const handleReject = async () => {
    setIsActing(true)
    setCardError('')
    try {
      await rejectInvitation(invitation._id)
      await onActionComplete()
    } catch (err) {
      setCardError(err.response?.data?.message || 'Failed to reject invitation.')
      setIsActing(false)
    }
  }

  return (
    <div style={{
      margin: '4px 8px',
      padding: '8px 10px',
      borderRadius: '6px',
      backgroundColor: '#21262D',
      border: '1px solid #30363D',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      {/* Repository name */}
      <div style={{
        fontSize: '12px', fontWeight: '600',
        color: '#E6EDF3',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {invitation.repository?.name ?? 'Unknown Repository'}
      </div>

      {/* Repository description */}
      {invitation.repository?.description && (
        <div style={{
          fontSize: '10px', color: '#8B949E',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {invitation.repository.description}
        </div>
      )}

      {/* Invited by */}
      <div style={{
        fontSize: '10px', color: '#484F58',
        marginTop: '2px',
      }}>
        From{' '}
        <span style={{ color: '#8B949E' }}>
          {invitation.invitedBy?.username ?? 'Unknown'}
        </span>
        {' · '}
        <span>{invitation.invitedBy?.email ?? ''}</span>
      </div>

      {/* Inline error — scoped to this card only */}
      {cardError && (
        <div style={{
          fontSize: '10px', color: '#F85149',
          marginTop: '2px', lineHeight: '1.4',
        }}>
          {cardError}
        </div>
      )}

      {/* Accept / Reject buttons */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
        <button
          onClick={handleAccept}
          disabled={isActing}
          style={{
            flex: 1, padding: '5px 0', borderRadius: '4px',
            backgroundColor: '#238636', border: 'none',
            color: 'white', fontSize: '10px', fontWeight: '500',
            cursor: isActing ? 'not-allowed' : 'pointer',
            opacity: isActing ? 0.6 : 1,
            fontFamily: 'inherit',
          }}
        >
          {isActing ? '…' : 'Accept'}
        </button>

        <button
          onClick={handleReject}
          disabled={isActing}
          style={{
            flex: 1, padding: '5px 0', borderRadius: '4px',
            backgroundColor: 'transparent',
            border: '1px solid #F85149',
            color: '#F85149', fontSize: '10px', fontWeight: '500',
            cursor: isActing ? 'not-allowed' : 'pointer',
            opacity: isActing ? 0.6 : 1,
            fontFamily: 'inherit',
          }}
        >
          {isActing ? '…' : 'Reject'}
        </button>
      </div>
    </div>
  )
}

// ── ReceivedInvitations ───────────────────────────────────────────────────────
export function ReceivedInvitations() {
  const { invitations, isLoading, error, refreshInvitations } = useInvitations()

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Section header */}
      <div style={{
        padding: '10px 12px 6px',
        fontSize: '10px', fontWeight: '600',
        color: '#484F58', letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Invitations
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ padding: '6px 12px', fontSize: '11px', color: '#484F58' }}>
          Loading invitations...
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div style={{ padding: '6px 12px', fontSize: '11px', color: '#F85149' }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && invitations.length === 0 && (
        <div style={{ padding: '6px 12px', fontSize: '11px', color: '#484F58' }}>
          No pending invitations.
        </div>
      )}

      {/* Invitation cards */}
      {!isLoading && !error && invitations.map((invitation) => (
        <InvitationCard
          key={invitation._id}
          invitation={invitation}
          onActionComplete={refreshInvitations}
        />
      ))}

    </div>
  )
}
