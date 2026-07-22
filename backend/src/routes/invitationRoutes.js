// backend/routes/invitation.routes.js

const express     = require('express')
const router      = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { sendInvitation, getReceivedInvitations, acceptInvitation, rejectInvitation } = require('../controllers/invitation.controller')

// POST /api/invitations
router.post('/', protect, sendInvitation)

// GET /api/invitations/received
router.get('/received', protect, getReceivedInvitations)

// PUT /api/invitations/:invitationId/accept
router.put('/:invitationId/accept', protect, acceptInvitation)

// PUT /api/invitations/:invitationId/reject
router.put('/:invitationId/reject', protect, rejectInvitation)

module.exports = router