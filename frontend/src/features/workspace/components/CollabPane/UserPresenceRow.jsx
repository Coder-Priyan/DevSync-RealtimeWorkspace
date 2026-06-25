// features/workspace/components/CollabPane/UserPresenceRow.jsx

import { getUserInitials } from '@/utils/generateColor'

export function UserPresenceRow({ user }) {
  const initials = getUserInitials(user.username)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 12px',
    }}>
      {/* Avatar */}
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
        backgroundColor: user.color + '25',
        border: `2px solid ${user.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: '600', color: user.color,
        position: 'relative',
      }}>
        {initials}
        {/* Online dot */}
        <div style={{
          position: 'absolute', bottom: '-1px', right: '-1px',
          width: '7px', height: '7px', borderRadius: '50%',
          backgroundColor: user.activeFile ? '#3FB950' : '#484F58',
          border: '1.5px solid #161B22',
        }} />
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: '#C9D1D9', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.username}
        </div>
        <div style={{ fontSize: '10px', color: '#484F58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.activeFile ?? 'Idle'}
        </div>
      </div>
    </div>
  )
}
