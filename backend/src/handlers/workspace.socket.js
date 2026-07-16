// backend/src/handlers/workspace.socket.js
// Phase 4 change: registerEditorHandlers() is now called on each connection.

const { EVENTS }                   = require('../sockets/events')
const Repository                   = require('../models/Repository')
const { registerPresenceHandlers } = require('./presence.socket')
const { registerEditorHandlers }   = require('./editor.socket')

const repoRoom = (repositoryId) => `repo:${repositoryId}`

const handleConnection = (io, socket) => {
  const { _id, username } = socket.user

  console.log(`[Socket] Connected   | user: ${username} (${_id}) | socketId: ${socket.id}`)

  // Register sub-handlers — each owns its own event listeners
  registerPresenceHandlers(io, socket)

  console.log(
    `[CP3] Calling registerEditorHandlers | user: ${username} | socketId: ${socket.id}`
  )

  registerEditorHandlers(io, socket)   // ← Phase 4: wires editor:join + editor:change

  console.log(
    `[CP3] registerEditorHandlers completed | socketId: ${socket.id}`
  )

  // ── WORKSPACE_JOIN ────────────────────────────────────────────────────────
  socket.on(EVENTS.WORKSPACE_JOIN, async ({ repositoryId } = {}) => {
    try {
      if (!repositoryId) {
        return socket.emit(EVENTS.ERROR, { message: 'repositoryId is required.' })
      }

      const repository = await Repository.findById(repositoryId).lean()
      if (!repository) {
        return socket.emit(EVENTS.ERROR, { message: 'Repository not found.' })
      }

      const previousRoom = socket.data.currentRepository
      if (previousRoom && previousRoom !== repositoryId) {
        socket.leave(repoRoom(previousRoom))
        socket.presenceCallbacks?.onLeaveRoom(previousRoom)
        console.log(`[Socket] Left room   | user: ${username} | room: ${repoRoom(previousRoom)}`)
      }

      socket.join(repoRoom(repositoryId))
      socket.data.currentRepository = repositoryId

      console.log(`[Socket] Joined room | user: ${username} (${_id}) | room: ${repoRoom(repositoryId)}`)

      socket.presenceCallbacks?.onJoinRoom(repositoryId)

      const { getPresenceList } = require('./presence.socket')
      socket.emit(EVENTS.WORKSPACE_JOINED, {
        repositoryId,
        users: getPresenceList(repositoryId),
      })

    } catch (error) {
      console.error(`[Socket] WORKSPACE_JOIN error | user: ${username} |`, error.message)
      socket.emit(EVENTS.ERROR, { message: 'Failed to join workspace.' })
    }
  })

  // ── WORKSPACE_LEAVE ───────────────────────────────────────────────────────
  socket.on(EVENTS.WORKSPACE_LEAVE, ({ repositoryId } = {}) => {
    const roomToLeave = repositoryId || socket.data.currentRepository
    if (!roomToLeave) return

    socket.leave(repoRoom(roomToLeave))

    if (socket.data.currentRepository === roomToLeave) {
      socket.data.currentRepository = null
    }

    socket.presenceCallbacks?.onLeaveRoom(roomToLeave)

    console.log(`[Socket] Left room   | user: ${username} (${_id}) | room: ${repoRoom(roomToLeave)}`)
  })

  // ── DISCONNECT ────────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    const currentRoom = socket.data.currentRepository

    console.log(
      `[Socket] Disconnected | user: ${username} (${_id}) | reason: ${reason}` +
      (currentRoom ? ` | was in: ${repoRoom(currentRoom)}` : '')
    )

    if (currentRoom) {
      socket.presenceCallbacks?.onLeaveRoom(currentRoom)
    }

    socket.data.currentRepository = null
    socket.data.activeFile = null
  })
}

module.exports = { handleConnection, repoRoom }