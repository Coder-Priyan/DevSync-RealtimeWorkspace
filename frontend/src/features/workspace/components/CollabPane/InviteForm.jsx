// features/workspace/components/CollabPane/InviteForm.jsx

import { useState } from 'react'
import { sendInvitation } from '@/services/invitation.service'

export function InviteForm({ repoId }) {
  const [email,     setEmail]     = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) return

    setIsLoading(true)
    setError('')

    try {
      await sendInvitation(repoId, email.trim())
      // Success — clear the input
      setEmail('')
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send invitation.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '10px 12px' }}>
      {/* Section header */}
      <div style={{
        fontSize: '10px', fontWeight: '600',
        color: '#484F58', letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: '8px',
      }}>
        Invite
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          placeholder="Email address"
          disabled={isLoading}
          style={{
            width: '100%', padding: '7px 10px', borderRadius: '5px',
            backgroundColor: '#21262D', border: `1px solid ${error ? '#F85149' : '#30363D'}`,
            color: '#E6EDF3', fontSize: '11px', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
          onFocus={(e) => e.target.style.borderColor = error ? '#F85149' : '#7C5CFC'}
          onBlur={(e)  => e.target.style.borderColor = error ? '#F85149' : '#30363D'}
        />

        {/* Inline error — only visible when a server error is returned */}
        {error && (
          <p style={{
            fontSize: '10px', color: '#F85149',
            margin: 0, lineHeight: '1.4',
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          style={{
            width: '100%', padding: '6px', borderRadius: '5px',
            backgroundColor: '#7C5CFC', border: 'none',
            color: 'white', fontSize: '11px', fontWeight: '500',
            cursor: isLoading || !email.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !email.trim() ? 0.5 : 1,
            fontFamily: 'inherit',
          }}
        >
          {isLoading ? 'Sending…' : 'Send Invite'}
        </button>
      </form>
    </div>
  )
}
