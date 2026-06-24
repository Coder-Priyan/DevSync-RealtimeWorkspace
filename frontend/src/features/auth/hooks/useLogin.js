/**
 * features/auth/hooks/useLogin.js
 *
 * Fix: removed the @/store/AuthContext import that was breaking the module.
 * The project's AuthContext lives at src/context/AuthContext.jsx with an
 * unknown export shape, so this hook manages token storage directly and
 * reads the context path from wherever the project actually has it.
 *
 * If your AuthContext exports { useAuth } with a login(token, user) method,
 * swap the STORAGE block below for:
 *   import { useAuth } from '@/context/AuthContext'
 *   const { login } = useAuth()
 * and replace the manual localStorage calls with login(data.token, data.user).
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginService } from '@/services/auth.service'
import { ROUTES } from '@/constants/routes'

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = ({ email, password }) => {
  const errors = {}

  if (!email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLogin() {
  const navigate = useNavigate()

  const [fields, setFields] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // ── handleChange ──────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    if (formError) setFormError('')
  }, [fieldErrors, formError])

  // ── handleSubmit ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    const errors = validate(fields)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setFormError('')
    setIsLoading(true)

    try {
      const data = await loginService({
        email:    fields.email.trim().toLowerCase(),
        password: fields.password,
      })

      // Store token and user directly — no AuthContext dependency.
      // When you wire up your AuthContext, replace these two lines with
      // whichever method your context exposes, e.g. login(data.token, data.user).
      localStorage.setItem('devsync_token', data.token)
      localStorage.setItem('devsync_user', JSON.stringify(data.user))

      navigate(ROUTES.DEFAULT_AUTHENTICATED, { replace: true })

    } catch (error) {
      const status  = error.response?.status
      const message = error.response?.data?.message

      if (status === 401 || status === 400) {
        setFormError(message || 'Incorrect email or password.')
      } else if (status === 429) {
        setFormError('Too many attempts. Please wait a moment and try again.')
      } else if (!error.response) {
        setFormError('Cannot reach the server. Check your connection and try again.')
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [fields, navigate])

  // ── toggleShowPassword ────────────────────────────────────────────────────
  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  return {
    fields,
    fieldErrors,
    formError,
    isLoading,
    showPassword,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  }
}