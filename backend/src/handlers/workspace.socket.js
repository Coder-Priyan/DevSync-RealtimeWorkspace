// backend/src/handlers/workspace.socket.js

const handleConnection = (io, socket) => {
  const { _id, username } = socket.user

  console.log(`[Socket] Connected   | user: ${username} (${_id}) | socketId: ${socket.id}`)

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Disconnected | user: ${username} (${_id}) | reason: ${reason}`)

    // Phase 1: remove from room
    // Phase 2: remove from presence map, broadcast presence:update
  })

  // Phase 1:  registerWorkspaceHandlers(io, socket)
  // Phase 2:  registerPresenceHandlers(io, socket)
  // Phase 3:  registerFileHandlers(io, socket)
  //           registerFolderHandlers(io, socket)
  // Phase 4:  registerEditorHandlers(io, socket)
}

module.exports = { handleConnection }