/**
 * features/auth/components/LoginForm.jsx
 *
 * Pure UI component. Renders the login form using state and handlers
 * from the useLogin hook. Contains zero business logic.
 *
 * What this component owns:
 *   - Visual structure and layout of the form
 *   - Binding hook state to input elements
 *   - Rendering validation and server errors
 *   - Loading state appearance
 *
 * What this component does NOT own:
 *   - Validation logic
 *   - API calls
 *   - Navigation
 *   - Token storage
 */

import { Link } from 'react-router-dom'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { ROUTES } from '@/constants/routes'

// ─── Sub-components ───────────────────────────────────────────────────────────
// Defined in this file because they are only used here and are tightly coupled
// to the form's visual language. They will not be promoted to shared components
// unless another form needs them.

/**
 * FormField — Label + input + error message block.
 * Encapsulates the repeating pattern used for every form field.
 */
function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ds-text-muted tracking-wide">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-ds-danger leading-tight" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * EyeIcon / EyeOffIcon — SVG icons for the password visibility toggle.
 * Inline SVG so there is no icon library dependency at this stage.
 */
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

/**
 * SpinnerIcon — Animated loading indicator for the submit button.
 */
function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
    </svg>
  )
}

// ─── LoginForm ────────────────────────────────────────────────────────────────
export function LoginForm() {
  const {
    fields,
    fieldErrors,
    formError,
    isLoading,
    showPassword,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  } = useLogin()

  return (
    <form
      onSubmit={handleSubmit}
      noValidate  /* We handle validation ourselves */
      className="flex flex-col gap-5"
    >

      {/* ── Form-level error — server messages ─────────────────────────── */}
      {formError && (
        <div
          className="flex items-start gap-2.5 px-3.5 py-3 rounded bg-ds-danger/10 border border-ds-danger/30"
          role="alert"
          aria-live="polite"
        >
          {/* Error icon */}
          <svg
            className="shrink-0 mt-px text-ds-danger"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-sm text-ds-danger leading-tight">{formError}</p>
        </div>
      )}

      {/* ── Email field ────────────────────────────────────────────────── */}
      <FormField label="Email" error={fieldErrors.email}>
        <input
          type="email"
          name="email"
          value={fields.email}
          onChange={handleChange}
          autoComplete="email"
          autoFocus
          disabled={isLoading}
          placeholder="you@example.com"
          className={[
            'w-full px-3.5 py-2.5 rounded',
            'bg-ds-elevated border text-ds-text text-md',
            'placeholder:text-ds-text-faint',
            'transition-colors duration-100',
            'focus:outline-none focus:ring-2 focus:ring-ds-accent focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            fieldErrors.email
              ? 'border-ds-danger'
              : 'border-ds-border hover:border-ds-text-faint',
          ].join(' ')}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          aria-invalid={!!fieldErrors.email}
        />
      </FormField>

      {/* ── Password field ─────────────────────────────────────────────── */}
      <FormField label="Password" error={fieldErrors.password}>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={fields.password}
            onChange={handleChange}
            autoComplete="current-password"
            disabled={isLoading}
            placeholder="••••••••"
            className={[
              'w-full px-3.5 py-2.5 pr-11 rounded',
              'bg-ds-elevated border text-ds-text text-md',
              'placeholder:text-ds-text-faint',
              'transition-colors duration-100',
              'focus:outline-none focus:ring-2 focus:ring-ds-accent focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              fieldErrors.password
                ? 'border-ds-danger'
                : 'border-ds-border hover:border-ds-text-faint',
            ].join(' ')}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            aria-invalid={!!fieldErrors.password}
          />
          {/* Show/hide password toggle */}
          <button
            type="button"
            onClick={toggleShowPassword}
            disabled={isLoading}
            className={[
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-ds-text-faint hover:text-ds-text-muted',
              'transition-colors duration-100',
              'focus:outline-none focus-visible:text-ds-text',
              'disabled:pointer-events-none',
            ].join(' ')}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </FormField>

      {/* ── Submit button ───────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isLoading}
        className={[
          'w-full flex items-center justify-center gap-2',
          'px-4 py-2.5 rounded',
          'bg-ds-accent hover:bg-ds-accent-hover',
          'text-white text-md font-medium',
          'transition-colors duration-100',
          'focus:outline-none focus:ring-2 focus:ring-ds-accent focus:ring-offset-2 focus:ring-offset-ds-surface',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        {isLoading ? (
          <>
            <SpinnerIcon />
            <span>Signing in…</span>
          </>
        ) : (
          'Sign in'
        )}
      </button>

      {/* ── Register link ───────────────────────────────────────────────── */}
      <p className="text-center text-sm text-ds-text-muted">
        Don't have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="text-ds-accent hover:text-ds-accent-hover transition-colors duration-100 font-medium"
        >
          Create one
        </Link>
      </p>

    </form>
  )
}

export default LoginForm
