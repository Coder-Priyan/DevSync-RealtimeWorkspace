/**
 * utils/formatDate.js — Date formatting utilities.
 *
 * Pure functions. No React dependency. No imports.
 * Used across dashboard (repo creation date) and workspace (file modified date).
 */

/**
 * formatRelativeTime — Returns a human-readable relative time string.
 * e.g. "2 hours ago", "3 days ago", "just now"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  const now     = new Date()
  const target  = new Date(date)
  const seconds = Math.floor((now - target) / 1000)

  if (seconds < 60)                       return 'just now'
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  // Fall back to absolute date for older items
  return formatShortDate(date)
}

/**
 * formatShortDate — Returns a concise date string.
 * e.g. "Jun 21, 2025"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const formatShortDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })
}

/**
 * formatFullDateTime — Returns a full date and time string.
 * e.g. "Jun 21, 2025, 3:45 PM" — used in tooltips
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const formatFullDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    month:  'short',
    day:    'numeric',
    year:   'numeric',
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  })
}