// frontend/src/features/workspace/hooks/useSocket.js

import { useEffect, useState } from 'react'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import { EVENTS } from '@/constants/events'

export function useSocket(repoId, reloadTree) {
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [joinError,   setJoinError]   = useState(null)
  // Phase 4: expose socket instance so useEditor receives it as a param
  // instead of calling getSocket() at effect time (which returns null).
  const [socket,      setSocket]      = useState(null)

  useEffect(() => {
    if (!repoId) return

    const s = connectSocket()

    // Store in state — when this transitions null → instance, React re-renders
    // WorkspacePage, useEditor receives the real socket, and its effect
    // re-runs to register the EDITOR_UPDATE listener on the correct socket.
    setSocket(s)

    // ── Connection state ──────────────────────────────────────────────────
    const onConnect = () => {
      setIsConnected(true)
      s.emit(EVENTS.WORKSPACE_JOIN, { repositoryId: repoId })
    }

    const onDisconnect = () => {
      setIsConnected(false)
      setOnlineUsers([])
    }

    // ── Workspace joined ack ──────────────────────────────────────────────
    const onWorkspaceJoined = ({ repositoryId, users }) => {
      console.log("🔥 JOINED:", users)
      console.log(`[Socket] Workspace joined | repoId: ${repositoryId}`)
      if (Array.isArray(users)) {
        setOnlineUsers(users)
      }
    }

    // ── Live presence updates ─────────────────────────────────────────────
    const onPresenceUpdate = ({ users }) => {
      console.log("🔥 PRESENCE UPDATE:", users)
      if (Array.isArray(users)) {
        setOnlineUsers(users)
      }
    }

    // ── Realtime File System ──────────────────────────────────────────────
    const onFileCreated = (data) => {
      console.log("🟢 FILE_CREATED EVENT RECEIVED", data)
      reloadTree?.()
    }

    const onFileRenamed = (data) => {
      console.log("🟢 FILE_RENAMED EVENT RECEIVED", data)
      reloadTree?.()
    }

    const onFileDeleted = (data) => {
      console.log("🟢 FILE_DELETED EVENT RECEIVED", data)
      reloadTree?.()
    }

    const onFolderCreated = (data) => {
      console.log("🟢 FOLDER_CREATED EVENT RECEIVED", data)
      reloadTree?.()
    }

    const onFolderRenamed = (data) => {
      console.log("🟢 FOLDER_RENAMED EVENT RECEIVED", data)
      reloadTree?.()
    }

    const onFolderDeleted = (data) => {
      console.log("🟢 FOLDER_DELETED EVENT RECEIVED", data)
      reloadTree?.()
    }

    // ── Error ─────────────────────────────────────────────────────────────
    const onError = ({ message }) => {
      console.error('[Socket] Server error:', message)
      setJoinError(message)
    }

    // Register listeners
    s.on(EVENTS.CONNECT,          onConnect)
    s.on(EVENTS.DISCONNECT,       onDisconnect)
    s.on(EVENTS.WORKSPACE_JOINED, onWorkspaceJoined)
    s.on(EVENTS.PRESENCE_UPDATE,  onPresenceUpdate)
    s.on(EVENTS.ERROR,            onError)

    s.on(EVENTS.FILE_CREATED,   onFileCreated)
    s.on(EVENTS.FILE_RENAMED,   onFileRenamed)
    s.on(EVENTS.FILE_DELETED,   onFileDeleted)
    s.on(EVENTS.FOLDER_CREATED, onFolderCreated)
    s.on(EVENTS.FOLDER_RENAMED, onFolderRenamed)
    s.on(EVENTS.FOLDER_DELETED, onFolderDeleted)

    // Already connected (e.g. hot reload) — emit join immediately
    if (s.connected) {
      setIsConnected(true)
      s.emit(EVENTS.WORKSPACE_JOIN, { repositoryId: repoId })
    }

    // Cleanup
    return () => {
      s.off(EVENTS.CONNECT,          onConnect)
      s.off(EVENTS.DISCONNECT,       onDisconnect)
      s.off(EVENTS.WORKSPACE_JOINED, onWorkspaceJoined)
      s.off(EVENTS.PRESENCE_UPDATE,  onPresenceUpdate)
      s.off(EVENTS.ERROR,            onError)

      s.off(EVENTS.FILE_CREATED,   onFileCreated)
      s.off(EVENTS.FILE_RENAMED,   onFileRenamed)
      s.off(EVENTS.FILE_DELETED,   onFileDeleted)
      s.off(EVENTS.FOLDER_CREATED, onFolderCreated)
      s.off(EVENTS.FOLDER_RENAMED, onFolderRenamed)
      s.off(EVENTS.FOLDER_DELETED, onFolderDeleted)

      if (s.connected) {
        s.emit(EVENTS.WORKSPACE_LEAVE, { repositoryId: repoId })
      }

      disconnectSocket()
      setSocket(null)
    }
  }, [repoId])

  return {
    isConnected,
    onlineUsers,
    joinError,
    socket,
  }
}