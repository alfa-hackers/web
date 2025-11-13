import React, { useState } from 'react'
import { useAuth } from '@/store/features/auth/useAuth'
import '../../styles/landing/modal.scss'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { register, isLoading, error, clearError } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })

  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
  })

  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      password: '',
    }

    if (!formData.username.trim()) {
      errors.username = 'Username cannot be empty'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.password) {
      errors.password = 'Password cannot be empty'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setValidationErrors(errors)
    return !errors.username && !errors.email && !errors.password
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Очищаем ошибки при изменении поля
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const success = await register({
      username: formData.username,
      email: formData.email || undefined,
      password: formData.password,
    })

    if (success) {
      // Сброс формы
      setFormData({ username: '', email: '', password: '' })
      setValidationErrors({ username: '', email: '', password: '' })

      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    }
  }

  const handleClose = () => {
    setFormData({ username: '', email: '', password: '' })
    setValidationErrors({ username: '', email: '', password: '' })
    clearError()
    onClose()
  }

  const isFormFilled = () => {
    return (
      formData.username.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      formData.password.trim().length > 0
    )
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="btn-container">
       <button className="modal-btn-exit" onClick={handleClose}>
         ✕
       </button>
     </div>
     <div className="modal-content-wrapper">

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Регистрация</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите имя пользователя"
              className={validationErrors.username ? 'error' : ''}
              disabled={isLoading}
              required
            />
            {validationErrors.username && (
              <span className="error-message">{validationErrors.username}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите ваш email"
              className={validationErrors.email ? 'error' : ''}
              disabled={isLoading}
            />
            {validationErrors.email && (
              <span className="error-message">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите ваш пароль"
              className={validationErrors.password ? 'error' : ''}
              disabled={isLoading}
              required
            />
            {validationErrors.password && (
              <span className="error-message">{validationErrors.password}</span>
            )}
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className={`submit-btn ${isFormFilled() ? 'filled' : ''}`} disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
     </div>
    </div>
  )
}

export default RegisterModal
