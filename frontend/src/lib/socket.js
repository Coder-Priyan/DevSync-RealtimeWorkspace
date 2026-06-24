/**
 * lib/socket.js — Socket.IO client factory for DevSync.
 *
 * CRITICAL ARCHITECTURE RULES:
 *
 * 1. This file does NOT create a socket on import.
 *    The socket is created lazily when connect() is called.
 *    This prevents socket connections from opening during login, registration,
 *    or any other non-workspace screen.
 *
 * 2. The socket connects ONLY when a user enters a repository workspace.
 *    It disconnects when they leave.
 *    The useSocket hook (Stage 7) manages this lifecycle.
 *
 * 3. This module is a singleton — one socket instance at a time.
 *    Calling connect() when already connected returns the existing instance.
 *
 * Usage (in useSocket hook — Stage 7):
 *   import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
 *
 *   // On workspace mount:
 *   const socket = connectSocket(repoId)
 *
 *   // On workspace unmount:
 *   disconnectSocket()
 *
 *   // Anywhere inside workspace hooks:
 *   const socket = getSocket()
 *   socket.emit(EVENTS.CODE_CHANGE, payload)
 */

import { io } from 'socket.io-client'

// The single socket instance — null when disconnected
let socketInstance = null

/**
 * connectSocket — Creates and connects a Socket.IO client for a given repository.
 *
 * @param {string} repoId — The repository ID to join after connecting.
 * @returns {Socket} — The connected Socket.IO client instance.
 */
export const connectSocket = (repoId) => {
  // If already connected, return the existing instance
  if (socketInstance?.connected) {
    return socketInstance
  }

  const token = localStorage.getItem('devsync_token')

  socketInstance = io(
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    {
      // Send JWT with the handshake so the backend can authenticate the connection
      auth: { token },

      // Reconnection settings — Socket.IO will automatically try to reconnect
      // on network drops. The useSocket hook handles re-joining the room on reconnect.
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,

      // Transport — websocket first, fallback to polling
      transports: ['websocket', 'polling'],
    }
  )

  return socketInstance
}

/**
 * disconnectSocket — Disconnects and destroys the socket instance.
 * Called when the user leaves the workspace.
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

/**
 * getSocket — Returns the current socket instance.
 * Returns null if not connected — callers must handle this.
 *
 * @returns {Socket|null}
 */
export const getSocket = () => socketInstance