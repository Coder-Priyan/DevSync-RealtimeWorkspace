import { useAuth } from '@/context/AuthContext'
import { getUserInitials, getCollabColorHex } from '@/utils/generateColor'

export function DashboardHeader({ onCreateRepo }) {
  const { user, logout } = useAuth()

  const initials = getUserInitials(user?.username ?? '')
  const color    = getCollabColorHex(user?._id ?? '')

  return (
    <header style={{
      height: '56px',
      backgroundColor: '#161B22',
      borderBottom: '1px solid #30363D',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      {/* Left — wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '6px',
          backgroundColor: '#7C5CFC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '14px', lineHeight: 1 }}>D</span>
        </div>
        <span style={{ color: '#E6EDF3', fontWeight: '600', fontSize: '16px', letterSpacing: '-0.01em' }}>
          DevSync
        </span>
      </div>

      {/* Right — create button + user avatar + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onCreateRepo}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '6px',
            backgroundColor: '#7C5CFC', border: 'none',
            color: 'white', fontSize: '13px', fontWeight: '500',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6B4EE6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C5CFC'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Repository
        </button>

        {/* Avatar */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: color + '33',
          border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '600', color: color,
          flexShrink: 0,
        }}>
          {initials}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            background: 'none', border: 'none',
            color: '#8B949E', fontSize: '13px',
            cursor: 'pointer', padding: '4px',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#F85149'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#8B949E'}
          title="Sign out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
