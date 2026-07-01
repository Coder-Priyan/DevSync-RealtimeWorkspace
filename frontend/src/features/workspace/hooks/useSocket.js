// frontend/src/features/workspace/hooks/useSocket.js
//
// Manages the socket lifecycle for the workspace.
//
// On mount:  connectSocket() → emit WORKSPACE_JOIN
// On unmount: emit WORKSPACE_LEAVE → disconnectSocket()
//
// Returns isConnected so WorkspacePage can show the sync indicator.
// Phase 2 will extend this hook with presence state.

import { useEffect, useState } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { EVENTS } from '@/constants/events'

export function useSocket(repoId) {
  const [isConnected, setIsConnected] = useState(false)
  const [joinError,   setJoinError]   = useState(null)

  useEffect(() => {
    // Guard — do not connect if no repoId yet
    if (!repoId) return

    // 1. Connect the socket (no-op if already connected)
    const socket = connectSocket()

    // 2. Track connection state for the sync indicator in the navbar
    const onConnect = () => {
      setIsConnected(true)

      // 3. Join the workspace room immediately after connecting.
      //    If socket was already connected before this effect ran,
      //    we emit join right away (the 'connect' event won't fire again).
      socket.emit(EVENTS.WORKSPACE_JOIN, { repositoryId: repoId })
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    // 4. Handle server ack — confirms the room was joined successfully
    const onWorkspaceJoined = ({ repositoryId }) => {
      console.log(`[Socket] Workspace joined | repoId: ${repositoryId}`)
      // Phase 2: set initial presence list from server response
    }

    // 5. Handle server-side errors
    const onError = ({ message }) => {
      console.error('[Socket] Server error:', message)
      setJoinError(message)
    }

    // Register listeners
    socket.on(EVENTS.CONNECT,          onConnect)
    socket.on(EVENTS.DISCONNECT,       onDisconnect)
    socket.on(EVENTS.WORKSPACE_JOINED, onWorkspaceJoined)
    socket.on(EVENTS.ERROR,            onError)

    // If already connected when this effect runs (e.g. hot reload),
    // emit join immediately since 'connect' won't fire again.
    if (socket.connected) {
      setIsConnected(true)
      socket.emit(EVENTS.WORKSPACE_JOIN, { repositoryId: repoId })
    }

    // 6. Cleanup — leave room and disconnect when workspace unmounts
    return () => {
      socket.off(EVENTS.CONNECT,          onConnect)
      socket.off(EVENTS.DISCONNECT,       onDisconnect)
      socket.off(EVENTS.WORKSPACE_JOINED, onWorkspaceJoined)
      socket.off(EVENTS.ERROR,            onError)

      // Emit leave before disconnecting so server logs the intentional leave
      if (socket.connected) {
        socket.emit(EVENTS.WORKSPACE_LEAVE, { repositoryId: repoId })
      }

      disconnectSocket()
    }
  }, [repoId]) // re-run if repoId changes (user navigates to a different repo)

  return {
    isConnected,
    joinError,
    // Phase 2: onlineUsers will be returned here
  }
}