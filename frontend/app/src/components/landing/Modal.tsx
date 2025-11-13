import React, { useState } from 'react'
import '../../styles/landing/modal.scss'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsLoading(true)
    
    // Тут прописать вызов к Апишке
    // И потом закрывать или ошибку

    setTimeout(() => {
      setIsLoading(false)
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
  <div className="modal-overlay">
    <div className="btn-container">
      <button className="modal-btn-exit" onClick={onClose}>
        ✕
      </button>
    </div>
    <div className="modal-content-wrapper">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Вход</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" id="username" placeholder="Введите вашего пользователя" required />
          </div>
          <div className="form-group">
            <input type="password" id="password" placeholder="Введите ваш пароль" required />
          </div>
          <button type="submit" className="submit-btn">
            Войти
          </button>
        </form>
      </div>
    </div>
  </div>
)
}

export default Modal
