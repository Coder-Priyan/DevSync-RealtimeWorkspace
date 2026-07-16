// backend/src/handlers/editor.socket.js

const { EVENTS } = require('../sockets/events')

const registerEditorHandlers = (io, socket) => {
  const { username } = socket.user

  console.log(
    "[CP2-BE] registerEditorHandlers registered for socket:",
    socket.id
  )

  console.log(
    "[CP2-BE] Listening for event:",
    EVENTS.EDITOR_CHANGE
  )

  // ─────────────────────────────────────────────────────────────
  // EDITOR_JOIN
  // ─────────────────────────────────────────────────────────────
  socket.on(EVENTS.EDITOR_JOIN, ({ repositoryId, fileId } = {}) => {

    console.log("[Editor] EDITOR_JOIN received", {
      socketId: socket.id,
      repositoryId,
      fileId,
    })

    if (!repositoryId || !fileId) return

    const currentRepo = socket.data.currentRepository

    if (currentRepo !== repositoryId) {
      console.warn(
        `[Editor] EDITOR_JOIN rejected | user: ${username} | not in room repo:${repositoryId}`
      )
      return
    }

    socket.data.activeFile = fileId

    console.log(
      `[Editor] File joined | user: ${username} | file: ${fileId} | repo: ${repositoryId}`
    )
  })

  // ─────────────────────────────────────────────────────────────
  // EDITOR_CHANGE
  // ─────────────────────────────────────────────────────────────
  socket.on(EVENTS.EDITOR_CHANGE, ({ repositoryId, fileId, content } = {}) => {

    console.log("[CP2-BE] EDITOR_CHANGE RECEIVED", {
      socketId: socket.id,
      repositoryId,
      fileId,
      bytes: content?.length,
    })

    if (!repositoryId || !fileId || content === undefined) {
      console.log("[Editor] Invalid payload")
      return
    }

    const currentRepo = socket.data.currentRepository

    if (currentRepo !== repositoryId) {
      console.warn(
        `[Editor] EDITOR_CHANGE rejected | user: ${username} | not in room repo:${repositoryId}`
      )
      return
    }

    console.log(
      `[Editor] Change broadcast | user: ${username} | file: ${fileId} | bytes: ${content.length}`
    )

    const roomName = `repo:${repositoryId}`

    const room = io.sockets.adapter.rooms.get(roomName)

    console.log("[Editor] Broadcasting EDITOR_UPDATE", {
      room: roomName,
      sender: socket.id,
      event: EVENTS.EDITOR_UPDATE,
    })

    console.log(
      "[Editor] Room members:",
      room ? [...room] : []
    )

    socket.broadcast.to(roomName).emit(EVENTS.EDITOR_UPDATE, {
      fileId,
      content,
    })

    console.log("[Editor] EDITOR_UPDATE emitted")
  })
}

module.exports = { registerEditorHandlers }