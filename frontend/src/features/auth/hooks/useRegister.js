import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { register as registerService } from '@/services/auth.service'
import { ROUTES } from '@/constants/routes'

const validate = ({ username, email, password, confirmPassword }) => {
  const errors = {}

  if (!username.trim()) {
    errors.username = 'Username is required.'
  } else if (username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters.'
  } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    errors.username = 'Username can only contain letters, numbers, and underscores.'
  }

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

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export function useRegister() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [fields, setFields] = useState({
    username:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError,   setFormError]   = useState('')
  const [isLoading,   setIsLoading]   = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    // Clear confirmPassword error when password field changes
    if (name === 'password' && fieldErrors.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }))
    }
    if (formError) setFormError('')
  }, [fieldErrors, formError])

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
      const data = await registerService({
        username: fields.username.trim(),
        email:    fields.email.trim().toLowerCase(),
        password: fields.password,
      })

      // Auto-login after successful registration
      login(data.token, data.user)

      navigate(ROUTES.DEFAULT_AUTHENTICATED, { replace: true })

    } catch (error) {
      const status  = error.response?.status
      const message = error.response?.data?.message

      if (status === 409 || status === 400) {
        // Conflict — email or username already taken
        setFormError(message || 'An account with this email already exists.')
      } else if (!error.response) {
        setFormError('Cannot reach the server. Check your connection and try again.')
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [fields, login, navigate])

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