import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import { formatRelativeTime } from '@/utils/formatDate'

export function RepoCard({ repo, onDelete }) {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isDeleting,       setIsDeleting]       = useState(false)

  const currentUserId = user?._id || user?.id

const ownerId =
  typeof repo.owner === "string"
    ? repo.owner
    : repo.owner?._id || repo.owner?.id

const isOwner = ownerId === currentUserId

// ===== DEBUG LOGS =====
console.log("========== RepoCard ==========")
console.log("Repository:", repo.name)
console.log("Repo Owner:", repo.owner)
console.log("Current User:", user)
console.log("Repo Owner _id:", repo.owner?._id)
console.log("Current User _id:", user?._id)
console.log("isOwner:", isOwner)

  const handleOpen = () => {
    navigate(ROUTES.WORKSPACE(repo._id))
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setConfirmingDelete(true)
  }

  const handleConfirmDelete = async (e) => {
    e.stopPropagation()
    setIsDeleting(true)
    try {
      await onDelete(repo._id)
    } catch {
      setIsDeleting(false)
      setConfirmingDelete(false)
    }
  }

  const handleCancelDelete = (e) => {
    e.stopPropagation()
    setConfirmingDelete(false)
  }

  return (
    <div
      onClick={handleOpen}
      style={{
        backgroundColor: '#161B22',
        border: '1px solid #30363D',
        borderRadius: '8px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'border-color 120ms ease, background-color 120ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#7C5CFC'
        e.currentTarget.style.backgroundColor = '#1C1B2E'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#30363D'
        e.currentTarget.style.backgroundColor = '#161B22'
      }}
    >
      {/* Top row — name + delete */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {/* Repo icon */}
          <svg style={{ flexShrink: 0, color: '#8B949E' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 0 0 6.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
          </svg>
          <span style={{
            color: '#E6EDF3', fontWeight: '500', fontSize: '14px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {repo.name}
          </span>
          {/* Owner badge */}
          {isOwner && (
            <span style={{
              fontSize: '10px', fontWeight: '500',
              padding: '2px 7px', borderRadius: '999px',
              backgroundColor: 'rgba(124,92,252,0.15)',
              border: '1px solid rgba(124,92,252,0.3)',
              color: '#7C5CFC', flexShrink: 0,
            }}>
              owner
            </span>
          )}
        </div>

        {/* Delete — owner only */}
        {isOwner && !confirmingDelete && (
          <button
            onClick={handleDeleteClick}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#484F58', padding: '2px', flexShrink: 0,
              display: 'flex', borderRadius: '4px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#F85149'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#484F58'}
            title="Delete repository"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}

        {/* Confirm delete inline */}
        {confirmingDelete && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '11px', color: '#8B949E' }}>Delete?</span>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              style={{
                padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                fontWeight: '500', border: 'none', cursor: 'pointer',
                backgroundColor: '#F85149', color: 'white', fontFamily: 'inherit',
              }}
            >
              {isDeleting ? '…' : 'Yes'}
            </button>
            <button
              onClick={handleCancelDelete}
              style={{
                padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                fontWeight: '500', border: '1px solid #30363D',
                cursor: 'pointer', backgroundColor: 'transparent',
                color: '#8B949E', fontFamily: 'inherit',
              }}
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {repo.description && (
        <p style={{
          color: '#8B949E', fontSize: '12px', margin: 0,
          lineHeight: '1.5',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {repo.description}
        </p>
      )}

      {/* Bottom row — meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Collaborator count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#484F58', fontSize: '11px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {repo.collaborators?.length ?? 0}
        </div>

        {/* Created date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#484F58', fontSize: '11px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {formatRelativeTime(repo.createdAt)}
        </div>
      </div>
    </div>
  )
}
