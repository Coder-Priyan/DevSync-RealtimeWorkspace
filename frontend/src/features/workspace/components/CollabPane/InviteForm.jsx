// features/workspace/components/CollabPane/InviteForm.jsx
// Stage 5 — UI only. API wiring in Stage 8.

import { useState } from 'react'

export function InviteForm() {
  const [email,     setEmail]     = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    // Stage 8: call collaborator.service.js addCollaborator()
    alert(`Invite for ${email} — wiring in Stage 8`)
    setEmail('')
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          disabled={isLoading}
          style={{
            width: '100%', padding: '7px 10px', borderRadius: '5px',
            backgroundColor: '#21262D', border: '1px solid #30363D',
            color: '#E6EDF3', fontSize: '11px', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
          onFocus={(e) => e.target.style.borderColor = '#7C5CFC'}
          onBlur={(e)  => e.target.style.borderColor = '#30363D'}
        />
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          style={{
            width: '100%', padding: '6px', borderRadius: '5px',
            backgroundColor: '#7C5CFC', border: 'none',
            color: 'white', fontSize: '11px', fontWeight: '500',
            cursor: email.trim() ? 'pointer' : 'not-allowed',
            opacity: email.trim() ? 1 : 0.5,
            fontFamily: 'inherit',
          }}
        >
          Send Invite
        </button>
      </form>
    </div>
  )
}
