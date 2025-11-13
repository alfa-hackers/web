import React, { useState } from 'react'
import { useAuth } from '@/store/features/auth/useAuth'
import '../../styles/landing/modal.scss'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  onOpenRegister?: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenRegister,
}) => {
  const { login, isLoading, error, clearError } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
  })

  const validateForm = () => {
    const errors = { email: '', password: '' }

    if (!formData.email.trim()) {
      errors.email = 'Введите email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Неверный формат email'
    }

    if (!formData.password) {
      errors.password = 'Пароль не может быть пустым'
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен быть не меньше 6 символов'
    }

    setValidationErrors(errors)
    return !errors.email && !errors.password
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    const success = await login({
      email: formData.email,
      password: formData.password,
    })

    if (success) {
      setFormData({ email: '', password: '' })
      setValidationErrors({ email: '', password: '' })
      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    }
  }

  const handleClose = () => {
    setFormData({ email: '', password: '' })
    setValidationErrors({ email: '', password: '' })
    clearError()
    onClose()
  }

  const isFormFilled = () =>
    formData.email.trim().length > 0 && formData.password.trim().length > 0

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="btn-container">
        <button className="modal-btn-exit" onClick={handleClose}>
          ✕
        </button>
      </div>
      <div
        className="modal-content-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2>Вход</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={validationErrors.email ? 'error' : ''}
                disabled={isLoading}
                autoComplete="email"
              />
              {validationErrors.email && (
                <span className="error-message">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Пароль"
                className={validationErrors.password ? 'error' : ''}
                disabled={isLoading}
                autoComplete="current-password"
              />
              {validationErrors.password && (
                <span className="error-message">
                  {validationErrors.password}
                </span>
              )}
            </div>

            {error && <div className="error-banner">{error}</div>}

            <button
              type="submit"
              className={`submit-btn ${isFormFilled() ? 'filled' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="modal-footer">
            <p>
              Нет аккаунта?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  handleClose()
                  if (onOpenRegister) onOpenRegister()
                }}
              >
                <u>Зарегистрироваться</u>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
