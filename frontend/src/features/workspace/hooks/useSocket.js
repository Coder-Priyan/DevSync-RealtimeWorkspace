// frontend/src/features/workspace/hooks/useSocket.js
// Milestone 3 change: listens for PRESENCE_UPDATE, returns onlineUsers.

import { useEffect, useState } from 'react'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import { EVENTS } from '@/constants/events'

export function useSocket(repoId) {
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [joinError,   setJoinError]   = useState(null)

  useEffect(() => {
    if (!repoId) return

    const socket = connectSocket()

    // ── Connection state ────────────────────────────────────────────────────
    const onConnect = () => {
      setIsConnected(true)
      socket.emit(EVENTS.WORKSPACE_JOIN, { repositoryId: repoId })
    }

    const onDisconnect = () => {
      setIsConnected(false)
      // Clear presence on disconnect — stale list is worse than empty list
      setOnlineUsers([])
    }

    // ── Workspace joined ack — server sends initial presence list ───────────
    const onWorkspaceJoined = ({ repositoryId, users }) => {
      console.log("🔥 JOINED:", users)
      console.log(`[Socket] Workspace joined | repoId: ${repositoryId}`)
      if (Array.isArray(users)) {
        setOnlineUsers(users)
      }
    }

    // ── Live presence updates ───────────────────────────────────────────────
    // Fires every time someone joins or leaves this repository room.
    // Replace the entire list — don't try to patch it incrementally.
    const onPresenceUpdate = ({ users }) => {
      console.log("🔥 PRESENCE UPDATE:", users)
      
      if (Array.isArray(users)) {
        setOnlineUsers(users)
      }
    }

    // ── Error ───────────────────────────────────────────────────────────────
    const onError = ({ message }) => {
      console.error('[Socket] Server error:', message)
      setJoinError(message)
    }

    // Register listeners
    socket.on(EVENTS.CONNECT,          onConnect)
    socket.on(EVENTS.DISCONNECT,       onDisconnect)
    socket.on(EVENTS.WORKSPACE_JOINED, onWorkspaceJoined)
    socket.on(EVENTS.PRESENCE_UPDATE,  onPresenceUpdate)
    socket.on(EVENTS.ERROR,            onError)

    // Already connected (e.g. hot reload) — emit join immediately
    if (socket.connected) {
      setIsConnected(true)
      socket.emit(EVENTS.WORKSPACE_JOIN, { repositoryId: repoId })
    }

    // Cleanup
    return () => {
      socket.off(EVENTS.CONNECT,          onConnect)
      socket.off(EVENTS.DISCONNECT,       onDisconnect)
      socket.off(EVENTS.WORKSPACE_JOINED, onWorkspaceJoined)
      socket.off(EVENTS.PRESENCE_UPDATE,  onPresenceUpdate)
      socket.off(EVENTS.ERROR,            onError)

      if (socket.connected) {
        socket.emit(EVENTS.WORKSPACE_LEAVE, { repositoryId: repoId })
      }

      disconnectSocket()
    }
  }, [repoId])

  return {
    isConnected,
    onlineUsers,  // replaces the mock MOCK_PRESENCE array
    joinError,
  }
}