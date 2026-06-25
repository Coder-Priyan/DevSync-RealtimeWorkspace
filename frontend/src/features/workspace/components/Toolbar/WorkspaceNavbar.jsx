// features/workspace/components/Toolbar/WorkspaceNavbar.jsx

import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { getCollabColorHex, getUserInitials } from '@/utils/generateColor'

export function WorkspaceNavbar({ repoName, onlineUsers, syncStatus }) {
  const navigate = useNavigate()

  const syncDot = {
    saved:  { color: '#3FB950', label: 'Synced'       },
    saving: { color: '#E3B341', label: 'Saving…'      },
    error:  { color: '#F85149', label: 'Sync error'   },
  }[syncStatus] ?? { color: '#3FB950', label: 'Synced' }

  return (
    <header style={{
      height: '44px', flexShrink: 0,
      backgroundColor: '#161B22',
      borderBottom: '1px solid #30363D',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px', gap: '16px',
    }}>

      {/* Left — logo + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div
          onClick={() => navigate(ROUTES.DASHBOARD)}
          style={{
            width: '26px', height: '26px', borderRadius: '5px',
            backgroundColor: '#7C5CFC', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <span style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>D</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span
            onClick={() => navigate(ROUTES.DASHBOARD)}
            style={{ color: '#8B949E', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Dashboard
          </span>
          <span style={{ color: '#484F58', fontSize: '13px' }}>/</span>
          <span style={{
            color: '#E6EDF3', fontSize: '13px', fontWeight: '500',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {repoName ?? 'Repository'}
          </span>
        </div>
      </div>

      {/* Center — online avatars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {onlineUsers.map((u) => {
          const color    = u.color ?? getCollabColorHex(u.userId)
          const initials = getUserInitials(u.username)
          return (
            <div
              key={u.userId}
              title={`${u.username}${u.activeFile ? ` — ${u.activeFile}` : ' (idle)'}`}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: color + '25',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '600', color,
                cursor: 'default', flexShrink: 0,
              }}
            >
              {initials}
            </div>
          )
        })}
      </div>

      {/* Right — sync status + export */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: syncDot.color,
          }} />
          <span style={{ fontSize: '11px', color: '#8B949E' }}>{syncDot.label}</span>
        </div>

        <button
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 12px', borderRadius: '5px',
            backgroundColor: 'transparent',
            border: '1px solid #30363D',
            color: '#8B949E', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7C5CFC'
            e.currentTarget.style.color = '#E6EDF3'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#30363D'
            e.currentTarget.style.color = '#8B949E'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>
    </header>
  )
}
