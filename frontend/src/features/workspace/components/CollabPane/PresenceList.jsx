// frontend/src/features/workspace/components/CollabPane/PresenceList.jsx
// Milestone 3: receives live onlineUsers from socket — mock removed.
// Shape of each user: { userId, username, socketId, joinedAt }

import { UserPresenceRow } from './UserPresenceRow'
import { getCollabColorHex } from '@/utils/generateColor'

export function PresenceList({ onlineUsers = [] }) {
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

      {/* Empty state */}
      {onlineUsers.length === 0 && (
        <div style={{
          padding: '8px 12px',
          fontSize: '11px',
          color: '#484F58',
        }}>
          No one else is here yet.
        </div>
      )}

      {/* Online users */}
      {onlineUsers.map((user) => (
        <UserPresenceRow
          key={user.socketId}
          user={{
            userId:     user.userId,
            username:   user.username,
            activeFile: user.activeFile ?? null, // Phase 4 populates this
            color:      getCollabColorHex(user.userId),
          }}
        />
      ))}

    </div>
  )
}
