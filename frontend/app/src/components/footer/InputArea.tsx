import React, { useState } from 'react'
import '../../styles/landing/landing.scss'

interface InputAreaProps {
  inputValue: string
  setInputValue: (value: string) => void
  onSendMessage: () => void
  isConnected: boolean
  isWaitingForResponse: boolean
  hasMessages?: boolean
}

const InputArea: React.FC<InputAreaProps> = ({
  inputValue,
  setInputValue,
  onSendMessage,
  isConnected,
  isWaitingForResponse,
  hasMessages = false,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Логика обработки файла (например, отправка на сервер, показ предпросмотра и т.д.)
      // Например, здесь можно вызвать функцию для загрузки файла на сервер
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      // Логика обработки файла (например, отправка на сервер, показ предпросмотра и т.д.)
      // Например, здесь можно вызвать функцию для загрузки файла на сервер
    }
  }

  return (
    <div className={`input-area ${!hasMessages ? 'centered' : ''}`}>
      <div
        className={`status-panel 
          ${isConnected ? 'connected' : 'disconnected'} 
          ${!hasMessages ? 'centered' : ''}`}
      ></div>
      <div 
        className={`input-wrapper ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder={
            isWaitingForResponse
              ? 'Ожидание ответа...'
              : isConnected
                ? 'Задайте вопрос...'
                : 'Ожидание подключения...'
          }
          rows={1}
          disabled={!isConnected || isWaitingForResponse}
        />
        <div className="button-wrapper">
          <label htmlFor="file-upload" className="upload-btn">
            📎
            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              disabled={!isConnected || isWaitingForResponse}
            />
          </label>
          <button
            onClick={onSendMessage}
            disabled={!inputValue.trim() || !isConnected || isWaitingForResponse}
          >
            {isWaitingForResponse ? '⏳' : isConnected ? '↑' : '⌛'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InputArea
