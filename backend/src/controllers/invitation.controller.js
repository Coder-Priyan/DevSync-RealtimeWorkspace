// backend/controllers/invitation.controller.js

const mongoose   = require('mongoose')
const Invitation = require('../models/Invitation')
const Repository = require('../models/Repository')
const User       = require('../models/User')

// ─────────────────────────────────────────────────────────────────────────────
// sendInvitation
// POST /api/invitations
// Body: { repositoryId, email }
// Auth: JWT required — req.user is the authenticated owner
// ─────────────────────────────────────────────────────────────────────────────
const sendInvitation = async (req, res) => {
  try {
    const { repositoryId, email } = req.body

    // 1. Validate required fields
    if (!repositoryId || !email) {
      return res.status(400).json({
        success: false,
        message: 'repositoryId and email are required.',
      })
    }

    // 2. Validate repositoryId format before hitting the database
    if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid repository ID format.',
      })
    }

    // Normalize email once — used everywhere below
    const normalizedEmail = email.trim().toLowerCase()

    // 3. Find repository
    const repository = await Repository.findById(repositoryId)

    // 4. Repository not found
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found.',
      })
    }

    // 5. Verify the requesting user is the repository owner
    const isOwner = repository.owner.toString() === req.user._id.toString()

    // 6. Forbidden if not owner
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only the repository owner can send invitations.',
      })
    }

    // 7. Find the user to invite by email
    const invitedUser = await User.findOne({ email: normalizedEmail })

    // 8. Invited user not found
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email address.',
      })
    }

    // 9. Prevent owner from inviting themselves
    if (invitedUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot invite yourself.',
      })
    }

    // 10. Check if user is already a collaborator
    // ⚠️  Collaborator check — awaiting schema confirmation from you.
    // Currently assumes repository.collaborators is an array of ObjectIds.
    // Will update this block once you confirm how collaborators are stored.
    const isAlreadyCollaborator = repository.collaborators.some(
      (collaboratorId) => collaboratorId.toString() === invitedUser._id.toString()
    )

    if (isAlreadyCollaborator) {
      return res.status(400).json({
        success: false,
        message: 'This user is already a collaborator on this repository.',
      })
    }

    // 11. Check if a pending invitation already exists for this user + repository
    const existingInvitation = await Invitation.findOne({
      repository:  repositoryId,
      invitedUser: invitedUser._id,
      status:      'pending',
    })

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'A pending invitation already exists for this user.',
      })
    }

    // 12. Create invitation — expires in 7 days
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const invitation = await Invitation.create({
      repository:  repositoryId,
      invitedBy:   req.user._id,
      invitedUser: invitedUser._id,
      status:      'pending',
      expiresAt:   sevenDaysFromNow,
    })

    // Return the created document directly — no second query
    return res.status(201).json({
      success:    true,
      message:    'Invitation sent successfully.',
      invitation,
    })

  } catch (error) {
    console.error('Send invitation error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while sending invitation.',
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getReceivedInvitations
// GET /api/invitations/received
// Auth: JWT required — returns pending invitations for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
const getReceivedInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      invitedUser: req.user._id,
      status:      'pending',
    })
      .sort({ createdAt: -1 })
      .populate('repository', 'name description isPublic')
      .populate('invitedBy',  'username email profileImage')

    return res.status(200).json({
      success:     true,
      count:       invitations.length,
      invitations,
    })

  } catch (error) {
    console.error('Get received invitations error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching invitations.',
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// acceptInvitation
// PUT /api/invitations/:invitationId/accept
// Auth: JWT required — only the invitedUser can accept
// ─────────────────────────────────────────────────────────────────────────────
const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params

    // 1. Validate invitationId format
    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID format.',
      })
    }

    // 2. Find the invitation
    const invitation = await Invitation.findById(invitationId)

    // 3. Not found
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.',
      })
    }

    // 4. Logged-in user must be the invitedUser
    if (invitation.invitedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this invitation.',
      })
    }

    // 5. Invitation must be pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Invitation has already been ${invitation.status}.`,
      })
    }

    // 6. Check expiration
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired.',
      })
    }

    // 7. Find repository
    const repository = await Repository.findById(invitation.repository)

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository no longer exists.',
      })
    }

    // 8. Check if already a collaborator
    const isAlreadyCollaborator = repository.collaborators.some(
      (collaboratorId) => collaboratorId.toString() === invitation.invitedUser.toString()
    )

    if (isAlreadyCollaborator) {
      return res.status(400).json({
        success: false,
        message: 'You are already a collaborator on this repository.',
      })
    }

    // 9. Add invited user to repository collaborators
    repository.collaborators.push(invitation.invitedUser)

    // 10. Save repository
    await repository.save()

    // 11. Update invitation status
    invitation.status = 'accepted'

    // 12. Save invitation
    await invitation.save()

    // 13. Return success
    return res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully.',
    })

  } catch (error) {
    console.error('Accept invitation error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while accepting invitation.',
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// rejectInvitation
// PUT /api/invitations/:invitationId/reject
// Auth: JWT required — only the invitedUser can reject
// ─────────────────────────────────────────────────────────────────────────────
const rejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params

    // 2. Validate invitationId format
    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID format.',
      })
    }

    // 3. Find the invitation
    const invitation = await Invitation.findById(invitationId)

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.',
      })
    }

    // 4. Logged-in user must be the invitedUser
    if (invitation.invitedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this invitation.',
      })
    }

    // 5. Invitation must be pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Invitation has already been ${invitation.status}.`,
      })
    }

    // 6. Check expiration
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired.',
      })
    }

    // 7. Update status
    invitation.status = 'rejected'

    // 8. Save invitation
    await invitation.save()

    // 9. Return success
    return res.status(200).json({
      success: true,
      message: 'Invitation rejected successfully.',
    })

  } catch (error) {
    console.error('Reject invitation error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while rejecting invitation.',
    })
  }
}

module.exports = { sendInvitation, getReceivedInvitations, acceptInvitation, rejectInvitation }