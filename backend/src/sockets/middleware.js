// backend/src/sockets/middleware.js

const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token

    if (!token) {
      return next(new Error('Authentication required. No token provided.'))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id ?? decoded._id).select('-password')

    if (!user) {
      return next(new Error('Authentication failed. User not found.'))
    }

    socket.user = {
      _id:      user._id.toString(),
      username: user.username,
      email:    user.email,
    }

    next()

  } catch (error) {
    console.error('[Socket] Auth middleware error:', error.message)
    next(new Error('Authentication failed. Invalid or expired token.'))
  }
}

module.exports = { socketAuthMiddleware }