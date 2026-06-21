// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as needed

/**
 * Middleware to protect routes with JWT authentication.
 * Expects Authorization header: Bearer <token>
 * Attaches user object (without password) to req.user on success.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user by decoded id, exclude password field
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Token invalid or other verification errors
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };