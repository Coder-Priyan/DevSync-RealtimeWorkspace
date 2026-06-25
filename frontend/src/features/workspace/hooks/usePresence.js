// features/workspace/hooks/usePresence.js
// Stage 5 — mock presence data only. Real Socket.IO wiring in Stage 7.

import { useState } from 'react'

const MOCK_PRESENCE = [
  { userId: 'u1', username: 'Priiyan', activeFile: 'App.jsx',   color: '#58A6FF' },
  { userId: 'u2', username: 'Riya',    activeFile: 'main.jsx',  color: '#3FB950' },
  { userId: 'u3', username: 'Kunal',   activeFile: null,        color: '#E3B341' },
]

export function usePresence() {
  const [onlineUsers] = useState(MOCK_PRESENCE)
  return { onlineUsers }
}