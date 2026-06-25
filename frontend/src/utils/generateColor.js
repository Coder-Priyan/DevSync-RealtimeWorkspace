/**
 * utils/generateColor.js — Deterministic collaborator color assignment.
 *
 * Assigns a consistent color to each user based on their user ID.
 * "Consistent" means the same user always gets the same color in every
 * session, on every client — no coordination needed.
 *
 * Colors map to the Tailwind collab-N tokens defined in tailwind.config.js.
 * Used for: avatar rings, collaborator cursor labels, file tree presence dots.
 */

// The 8 collaborator colors from the design system
// These match the collab-1 through collab-8 tokens in tailwind.config.js
const COLLAB_COLORS = [
  { name: 'collab-1', hex: '#FF7B72', bg: 'rgba(255,123,114,0.15)' }, // Red
  { name: 'collab-2', hex: '#FFA657', bg: 'rgba(255,166,87,0.15)'  }, // Orange
  { name: 'collab-3', hex: '#E3B341', bg: 'rgba(227,179,65,0.15)'  }, // Yellow
  { name: 'collab-4', hex: '#3FB950', bg: 'rgba(63,185,80,0.15)'   }, // Green
  { name: 'collab-5', hex: '#58A6FF', bg: 'rgba(88,166,255,0.15)'  }, // Blue
  { name: 'collab-6', hex: '#BC8CFF', bg: 'rgba(188,140,255,0.15)' }, // Purple
  { name: 'collab-7', hex: '#FF79C6', bg: 'rgba(255,121,198,0.15)' }, // Pink
  { name: 'collab-8', hex: '#56D4DD', bg: 'rgba(86,212,221,0.15)'  }, // Cyan
]

/**
 * hashUserId — Converts a user ID string to a stable integer.
 * Simple but sufficient — user IDs from MongoDB are long enough to distribute evenly.
 *
 * @param {string} userId
 * @returns {number}
 */
const hashUserId = (userId = '') => {
  return userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
}

/**
 * getCollabColor — Returns the full color object for a given user ID.
 *
 * @param {string} userId — MongoDB ObjectId string
 * @returns {{ name: string, hex: string, bg: string }}
 *
 * Usage:
 *   const color = getCollabColor(user._id)
 *   <div style={{ borderColor: color.hex, backgroundColor: color.bg }}>
 *     {user.username}
 *   </div>
 */
export const getCollabColor = (userId) => {
  const index = hashUserId(userId) % COLLAB_COLORS.length
  return COLLAB_COLORS[index]
}

/**
 * getCollabColorHex — Returns just the hex value.
 * Convenience wrapper for cases where only the color string is needed.
 *
 * @param {string} userId
 * @returns {string} — e.g. '#58A6FF'
 */
export const getCollabColorHex = (userId) => {
  return getCollabColor(userId).hex
}

/**
 * getUserInitials — Returns 1-2 character initials from a username.
 * Used inside AvatarBadge components.
 *
 * @param {string} username
 * @returns {string} — e.g. 'PR' for 'Priiyan'
 */
export const getUserInitials = (username = '') => {
  const parts = username.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}