import React from 'react'
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
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <div className={`input-area ${!hasMessages ? 'centered' : ''}`}>
      <div
        className={`status-panel 
          ${isConnected ? 'connected' : 'disconnected'} 
          ${!hasMessages ? 'centered' : ''}`}
      ></div>
      <div className="input-wrapper">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
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
        <button
          onClick={onSendMessage}
          disabled={!inputValue.trim() || !isConnected || isWaitingForResponse}
        >
          {isWaitingForResponse ? '⏳' : isConnected ? '↑' : '⌛'}
        </button>
      </div>
    </div>
  )
}

export default InputArea
