// backend/src/handlers/presence.socket.js
//
// Presence manager for DevSync.
//
// Owns:
//   - In-memory presence map (repositoryId → Map of userId → userInfo)
//   - addToPresence()
//   - removeFromPresence()
//   - getPresenceList()
//   - broadcastPresence()
//   - registerPresenceHandlers() — called by workspace.socket.js on each connection
//
// Does NOT own:
//   - Room join/leave logic (that stays in workspace.socket.js)
//   - Socket authentication (that stays in middleware.js)
//
// Presence state is in-memory intentionally.
// It resets on server restart — correct behaviour since all sockets
// disconnect on restart anyway.
//
// Multi-tab handling: tracked by socketId within each user entry so
// closing one tab doesn't remove a user who still has another tab open.

const { EVENTS } = require('../sockets/events')

// ── Presence store ────────────────────────────────────────────────────────────
// Structure:
// {
//   [repositoryId]: Map {
//     [socketId]: { userId, username, socketId, joinedAt }
//   }
// }
//
// Keyed by socketId (not userId) so one user with two tabs appears once
// per tab — we deduplicate by userId when broadcasting.
const presenceStore = {}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * addToPresence — Adds a socket to a repository's presence map.
 */
const addToPresence = (repositoryId, socket) => {
  if (!presenceStore[repositoryId]) {
    presenceStore[repositoryId] = new Map()
  }

  presenceStore[repositoryId].set(socket.id, {
    userId:    socket.user._id,
    username:  socket.user.username,
    socketId:  socket.id,
    joinedAt:  new Date().toISOString(),
    // Phase 4: activeFile will be added here
  })
}

/**
 * removeFromPresence — Removes a socket from a repository's presence map.
 * If the repository has no remaining connections, cleans up the entry.
 */
const removeFromPresence = (repositoryId, socketId) => {
  if (!presenceStore[repositoryId]) return

  presenceStore[repositoryId].delete(socketId)

  if (presenceStore[repositoryId].size === 0) {
    delete presenceStore[repositoryId]
  }
}

/**
 * getPresenceList — Returns a deduplicated array of online users for a room.
 *
 * If a user has multiple tabs open (multiple socketIds), they appear only once
 * in the list — we keep the most recently joined entry.
 *
 * @returns {Array<{ userId, username, socketId, joinedAt }>}
 */
const getPresenceList = (repositoryId) => {
  if (!presenceStore[repositoryId]) return []

  // Deduplicate by userId — last-write-wins (Map preserves insertion order)
  const byUserId = new Map()

  for (const entry of presenceStore[repositoryId].values()) {
    byUserId.set(entry.userId, entry)
  }

  return Array.from(byUserId.values())
}

/**
 * broadcastPresence — Emits PRESENCE_UPDATE to everyone in the room.
 * Called after every join and leave.
 */
const broadcastPresence = (io, repositoryId) => {
  const users = getPresenceList(repositoryId)

  io.to(`repo:${repositoryId}`).emit(EVENTS.PRESENCE_UPDATE, {
    repositoryId,
    users,
    count: users.length,
  })

  console.log(
    `[Presence] Broadcast | room: repo:${repositoryId} | online: ${users.length}`
  )
}

// ── Register handlers ─────────────────────────────────────────────────────────
/**
 * registerPresenceHandlers — Called by workspace.socket.js after a socket
 * joins a room. Wires presence add/remove to workspace join/leave/disconnect.
 *
 * workspace.socket.js is responsible for room membership.
 * presence.socket.js is responsible for presence state.
 * They communicate via these callbacks.
 */
const registerPresenceHandlers = (io, socket) => {
  // onJoinRoom is called by workspace.socket.js after socket.join() succeeds
  const onJoinRoom = (repositoryId) => {
    addToPresence(repositoryId, socket)
    broadcastPresence(io, repositoryId)

    console.log(
      `[Presence] Added     | user: ${socket.user.username} | room: repo:${repositoryId}`
    )
  }

  // onLeaveRoom is called by workspace.socket.js before/after socket.leave()
  const onLeaveRoom = (repositoryId) => {
    removeFromPresence(repositoryId, socket.id)
    broadcastPresence(io, repositoryId)

    console.log(
      `[Presence] Removed   | user: ${socket.user.username} | room: repo:${repositoryId}`
    )
  }

  // Attach callbacks to the socket so workspace.socket.js can call them
  socket.presenceCallbacks = { onJoinRoom, onLeaveRoom }
}

module.exports = {
  registerPresenceHandlers,
  addToPresence,
  removeFromPresence,
  getPresenceList,
  broadcastPresence,
}