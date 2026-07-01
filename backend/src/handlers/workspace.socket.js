// backend/src/handlers/workspace.socket.js
// Milestone 3 change: calls presence callbacks after join/leave/disconnect.
// Room logic is unchanged. Presence logic stays in presence.socket.js.

const { EVENTS }                  = require('../sockets/events')
const Repository                  = require('../models/Repository')
const { registerPresenceHandlers } = require('./presence.socket')

const repoRoom = (repositoryId) => `repo:${repositoryId}`

const handleConnection = (io, socket) => {
  const { _id, username } = socket.user

  console.log(`[Socket] Connected   | user: ${username} (${_id}) | socketId: ${socket.id}`)

  // ── Register presence handler — attaches socket.presenceCallbacks ─────────
  registerPresenceHandlers(io, socket)

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

      // Leave previous room if switching repositories
      const previousRoom = socket.data.currentRepository
      if (previousRoom && previousRoom !== repositoryId) {
        socket.leave(repoRoom(previousRoom))
        // Notify presence manager about the leave
        socket.presenceCallbacks?.onLeaveRoom(previousRoom)
        console.log(`[Socket] Left room   | user: ${username} | room: ${repoRoom(previousRoom)}`)
      }

      // Join new room
      socket.join(repoRoom(repositoryId))
      socket.data.currentRepository = repositoryId

      console.log(`[Socket] Joined room | user: ${username} (${_id}) | room: ${repoRoom(repositoryId)}`)

      // Notify presence manager — triggers broadcast to room
      socket.presenceCallbacks?.onJoinRoom(repositoryId)

      // Ack to the joining client
      // Milestone 3: include current presence list in the ack so the
      // joining user immediately sees who is already online
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

    // Notify presence manager — triggers broadcast to room
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

    // Socket.IO removes the socket from all rooms automatically on disconnect.
    // We still need to clean up the presence store manually.
    if (currentRoom) {
      socket.presenceCallbacks?.onLeaveRoom(currentRoom)
    }

    socket.data.currentRepository = null

    // Phase 4: clear activeFile from presence entry here
  })

  // Phase 3:  registerFileHandlers(io, socket)
  //           registerFolderHandlers(io, socket)
  // Phase 4:  registerEditorHandlers(io, socket)
}

module.exports = { handleConnection, repoRoom }