import { Link } from 'react-router-dom'
import { useRegister } from '@/features/auth/hooks/useRegister'
import { ROUTES } from '@/constants/routes'

function FormField({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: '500', color: '#8B949E', letterSpacing: '0.03em' }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: '11px', color: '#F85149', lineHeight: '1.4', margin: 0 }} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      style={{ animation: 'spin 1s linear infinite' }}
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '10px 14px',
  borderRadius: '6px',
  backgroundColor: '#21262D',
  border: `1px solid ${hasError ? '#F85149' : '#30363D'}`,
  color: '#E6EDF3',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 120ms ease',
})

export function RegisterForm() {
  const {
    fields,
    fieldErrors,
    formError,
    isLoading,
    showPassword,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  } = useRegister()

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Form-level error */}
      {formError && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '12px 14px', borderRadius: '6px',
          backgroundColor: 'rgba(248,81,73,0.1)',
          border: '1px solid rgba(248,81,73,0.3)',
        }} role="alert">
          <svg style={{ flexShrink: 0, color: '#F85149', marginTop: '1px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: '13px', color: '#F85149', margin: 0, lineHeight: '1.4' }}>{formError}</p>
        </div>
      )}

      {/* Username */}
      <FormField label="Username" error={fieldErrors.username}>
        <input
          type="text"
          name="username"
          value={fields.username}
          onChange={handleChange}
          autoComplete="username"
          autoFocus
          disabled={isLoading}
          placeholder="yourname"
          style={inputStyle(!!fieldErrors.username)}
          onFocus={(e) => { if (!fieldErrors.username) e.target.style.borderColor = '#7C5CFC' }}
          onBlur={(e)  => { if (!fieldErrors.username) e.target.style.borderColor = '#30363D' }}
        />
      </FormField>

      {/* Email */}
      <FormField label="Email" error={fieldErrors.email}>
        <input
          type="email"
          name="email"
          value={fields.email}
          onChange={handleChange}
          autoComplete="email"
          disabled={isLoading}
          placeholder="you@example.com"
          style={inputStyle(!!fieldErrors.email)}
          onFocus={(e) => { if (!fieldErrors.email) e.target.style.borderColor = '#7C5CFC' }}
          onBlur={(e)  => { if (!fieldErrors.email)  e.target.style.borderColor = '#30363D' }}
        />
      </FormField>

      {/* Password */}
      <FormField label="Password" error={fieldErrors.password}>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={fields.password}
            onChange={handleChange}
            autoComplete="new-password"
            disabled={isLoading}
            placeholder="••••••••"
            style={{ ...inputStyle(!!fieldErrors.password), paddingRight: '44px' }}
            onFocus={(e) => { if (!fieldErrors.password) e.target.style.borderColor = '#7C5CFC' }}
            onBlur={(e)  => { if (!fieldErrors.password) e.target.style.borderColor = '#30363D' }}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            disabled={isLoading}
            style={{
              position: 'absolute', right: '12px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#484F58', padding: '0', display: 'flex',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </FormField>

      {/* Confirm Password */}
      <FormField label="Confirm Password" error={fieldErrors.confirmPassword}>
        <input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={fields.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          disabled={isLoading}
          placeholder="••••••••"
          style={inputStyle(!!fieldErrors.confirmPassword)}
          onFocus={(e) => { if (!fieldErrors.confirmPassword) e.target.style.borderColor = '#7C5CFC' }}
          onBlur={(e)  => { if (!fieldErrors.confirmPassword) e.target.style.borderColor = '#30363D' }}
        />
      </FormField>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '8px',
          padding: '10px 16px', borderRadius: '6px',
          backgroundColor: isLoading ? '#6B4EE6' : '#7C5CFC',
          color: 'white', fontSize: '13px', fontWeight: '500',
          border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          transition: 'background-color 120ms ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => { if (!isLoading) e.target.style.backgroundColor = '#6B4EE6' }}
        onMouseLeave={(e) => { if (!isLoading) e.target.style.backgroundColor = '#7C5CFC' }}
      >
        {isLoading ? (
          <>
            <SpinnerIcon />
            <span>Creating account…</span>
          </>
        ) : (
          'Create account'
        )}
      </button>

      {/* Login link */}
      <p style={{ textAlign: 'center', fontSize: '13px', color: '#8B949E', margin: 0 }}>
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          style={{ color: '#7C5CFC', textDecoration: 'none', fontWeight: '500' }}
        >
          Sign in
        </Link>
      </p>

    </form>
  )
}

export default RegisterForm
