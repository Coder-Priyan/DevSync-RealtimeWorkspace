// backend/models/Invitation.js

const mongoose = require('mongoose')

const invitationSchema = new mongoose.Schema(
  {
    repository: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Repository',
      required: true,
    },

    invitedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    invitedUser: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    status: {
      type:    String,
      enum:    ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },

    // Optional expiry — e.g. 7 days after creation.
    // Controller sets this on create. Not required so invitations
    // can exist without an expiry if the product doesn't enforce one yet.
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────────

// 1. Compound index on (invitedUser, status)
//    Most frequent query: "fetch all pending invitations for a user."
//    This index covers that query without a full collection scan.
invitationSchema.index({ invitedUser: 1, status: 1 })

// 2. Compound index on (repository, invitedUser)
//    Used during invite creation to check for duplicate pending invitations:
//    "does a pending invite already exist for this user in this repo?"
//    Also covers "fetch all invitations sent for a repository" queries.
invitationSchema.index({ repository: 1, invitedUser: 1 })

// 3. TTL index on expiresAt
//    MongoDB automatically deletes documents once expiresAt is reached.
//    Documents where expiresAt is null or undefined are not affected.
//    Keeps the collection clean without a manual cleanup job.
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Invitation = mongoose.model('Invitation', invitationSchema)

module.exports = Invitation