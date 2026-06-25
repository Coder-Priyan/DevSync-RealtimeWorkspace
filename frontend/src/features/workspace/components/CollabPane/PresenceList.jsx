// features/workspace/components/CollabPane/PresenceList.jsx

import { UserPresenceRow } from './UserPresenceRow'

export function PresenceList({ onlineUsers }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Section header */}
      <div style={{
        padding: '10px 12px 6px',
        fontSize: '10px', fontWeight: '600',
        color: '#484F58', letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Live — {onlineUsers.length}
      </div>

      {/* Users */}
      {onlineUsers.map((u) => (
        <UserPresenceRow key={u.userId} user={u} />
      ))}
    </div>
  )
}
