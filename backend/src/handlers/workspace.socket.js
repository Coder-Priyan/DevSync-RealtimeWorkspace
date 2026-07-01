// backend/src/handlers/workspace.socket.js

const { EVENTS }     = require('../sockets/events')
const Repository     = require('../models/Repository')

// ── Room name helper ──────────────────────────────────────────────────────────
// Keeps the room naming convention in one place.
// Every reference to a repo room goes through this function.
const repoRoom = (repositoryId) => `repo:${repositoryId}`

// ── handleConnection ──────────────────────────────────────────────────────────
const handleConnection = (io, socket) => {
  const { _id, username } = socket.user

  console.log(`[Socket] Connected   | user: ${username} (${_id}) | socketId: ${socket.id}`)

  // ── WORKSPACE_JOIN ──────────────────────────────────────────────────────────
  socket.on(EVENTS.WORKSPACE_JOIN, async ({ repositoryId } = {}) => {
    try {
      // 1. Validate payload
      if (!repositoryId) {
        return socket.emit(EVENTS.ERROR, { message: 'repositoryId is required.' })
      }

      // 2. Validate repository exists in DB
      const repository = await Repository.findById(repositoryId).lean()
      if (!repository) {
        return socket.emit(EVENTS.ERROR, { message: 'Repository not found.' })
      }

      // 3. Leave previous room if the user is already in one.
      //    A user should only be in one repository room at a time.
      const previousRoom = socket.data.currentRepository
      if (previousRoom && previousRoom !== repositoryId) {
        socket.leave(repoRoom(previousRoom))
        console.log(
          `[Socket] Left room   | user: ${username} | room: ${repoRoom(previousRoom)}`
        )
      }

      // 4. Join the new repository room
      socket.join(repoRoom(repositoryId))

      // 5. Persist current room on socket.data so disconnect handler
      //    and future handlers can read it without re-querying.
      socket.data.currentRepository = repositoryId

      console.log(
        `[Socket] Joined room | user: ${username} (${_id}) | room: ${repoRoom(repositoryId)}`
      )

      // 6. Acknowledge back to the client so it knows the join succeeded.
      //    Payload will grow in Phase 2 (presence list, etc.)
      socket.emit(EVENTS.WORKSPACE_JOINED, {
        repositoryId,
        message: `Joined workspace ${repositoryId}`,
      })

    } catch (error) {
      console.error(`[Socket] WORKSPACE_JOIN error | user: ${username} |`, error.message)
      socket.emit(EVENTS.ERROR, { message: 'Failed to join workspace.' })
    }
  })

  // ── WORKSPACE_LEAVE ─────────────────────────────────────────────────────────
  socket.on(EVENTS.WORKSPACE_LEAVE, ({ repositoryId } = {}) => {
    const roomToLeave = repositoryId || socket.data.currentRepository

    if (!roomToLeave) return

    socket.leave(repoRoom(roomToLeave))

    // Clear stored room if it matches the one being left
    if (socket.data.currentRepository === roomToLeave) {
      socket.data.currentRepository = null
    }

    console.log(
      `[Socket] Left room   | user: ${username} (${_id}) | room: ${repoRoom(roomToLeave)}`
    )

    // Phase 2: broadcast presence:update to room here
  })

  // ── DISCONNECT ──────────────────────────────────────────────────────────────
  // Socket.IO automatically removes the socket from all rooms on disconnect,
  // so no manual socket.leave() is needed here.
  // We log it and clear socket.data for clarity.
  socket.on('disconnect', (reason) => {
    const currentRoom = socket.data.currentRepository

    console.log(
      `[Socket] Disconnected | user: ${username} (${_id}) | reason: ${reason}` +
      (currentRoom ? ` | was in: ${repoRoom(currentRoom)}` : '')
    )

    socket.data.currentRepository = null

    // Phase 2: remove from presence map, broadcast presence:update
  })

  // ── Future handler registrations ─────────────────────────────────────────
  // Phase 2:  registerPresenceHandlers(io, socket)
  // Phase 3:  registerFileHandlers(io, socket)
  //           registerFolderHandlers(io, socket)
  // Phase 4:  registerEditorHandlers(io, socket)
}

module.exports = { handleConnection, repoRoom }