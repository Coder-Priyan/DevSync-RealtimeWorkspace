// backend/src/sockets/index.js

const { Server }               = require('socket.io')
const { socketAuthMiddleware } = require('./middleware')
const { handleConnection }     = require('../handlers/workspace.socket')

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL || '*',
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout:  60000,
    pingInterval: 25000,
  })

  io.use(socketAuthMiddleware)

  io.on('connection', (socket) => {
    handleConnection(io, socket)
  })

  console.log('[Socket] Socket.IO server initialized')
  return io
}

module.exports = { initSocket }