import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { login as loginService } from '@/services/auth.service'
import { ROUTES } from '@/constants/routes'

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

export function useLogin() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [fields,       setFields]       = useState({ email: '', password: '' })
  const [fieldErrors,  setFieldErrors]  = useState({})
  const [formError,    setFormError]    = useState('')
  const [isLoading,    setIsLoading]    = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
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
      const data = await loginService({
        email:    fields.email.trim().toLowerCase(),
        password: fields.password,
      })

      // login() does both: updates React state (isAuthenticated → true)
      // AND saves to localStorage. navigate() then works correctly.
      login(data.token, data.user)

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