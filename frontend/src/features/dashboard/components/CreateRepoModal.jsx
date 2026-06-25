import { useState, useEffect, useCallback } from 'react'

export function CreateRepoModal({ isOpen, onClose, onCreate }) {
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [nameError,   setNameError]   = useState('')
  const [isLoading,   setIsLoading]   = useState(false)
  const [formError,   setFormError]   = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setDescription('')
      setNameError('')
      setFormError('')
      setIsLoading(false)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Repository name is required.')
      return
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters.')
      return
    }
    if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
      setNameError('Name can only contain letters, numbers, spaces, hyphens, and underscores.')
      return
    }

    setNameError('')
    setFormError('')
    setIsLoading(true)

    try {
      await onCreate({ name: trimmed, description: description.trim() })
    } catch (err) {
      const message = err.response?.data?.message
      setFormError(message || 'Failed to create repository. Please try again.')
      setIsLoading(false)
    }
  }, [name, description, onCreate])

  if (!isOpen) return null

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '440px',
          backgroundColor: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '10px',
          padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ color: '#E6EDF3', fontWeight: '600', fontSize: '16px', margin: 0 }}>
            Create Repository
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#484F58', padding: '2px', display: 'flex',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#E6EDF3'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#484F58'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form error */}
        {formError && (
          <div style={{
            padding: '10px 14px', borderRadius: '6px',
            backgroundColor: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.3)',
            fontSize: '13px', color: '#F85149',
          }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#8B949E' }}>
              Repository name <span style={{ color: '#F85149' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError('') }}
              autoFocus
              disabled={isLoading}
              placeholder="my-awesome-project"
              style={{
                width: '100%', padding: '9px 14px', borderRadius: '6px',
                backgroundColor: '#21262D',
                border: `1px solid ${nameError ? '#F85149' : '#30363D'}`,
                color: '#E6EDF3', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit',
              }}
              onFocus={(e) => { if (!nameError) e.target.style.borderColor = '#7C5CFC' }}
              onBlur={(e)  => { if (!nameError) e.target.style.borderColor = '#30363D' }}
            />
            {nameError && (
              <p style={{ fontSize: '11px', color: '#F85149', margin: 0 }}>{nameError}</p>
            )}
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#8B949E' }}>
              Description <span style={{ color: '#484F58' }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              placeholder="What is this project about?"
              rows={3}
              style={{
                width: '100%', padding: '9px 14px', borderRadius: '6px',
                backgroundColor: '#21262D', border: '1px solid #30363D',
                color: '#E6EDF3', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit',
                resize: 'vertical', lineHeight: '1.5',
              }}
              onFocus={(e) => e.target.style.borderColor = '#7C5CFC'}
              onBlur={(e)  => e.target.style.borderColor = '#30363D'}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
                fontWeight: '500', border: '1px solid #30363D',
                backgroundColor: 'transparent', color: '#8B949E',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
                fontWeight: '500', border: 'none',
                backgroundColor: '#7C5CFC', color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1, fontFamily: 'inherit',
              }}
            >
              {isLoading ? 'Creating…' : 'Create Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
