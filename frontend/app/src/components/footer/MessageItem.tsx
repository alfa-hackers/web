import React from 'react'
import { Message } from '../../store/features/chat/chatTypes'
import '../../styles/landing/landing.scss'

interface MessageItemProps {
  message: Message
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  return (
    <div className={`message ${message.sender}`}>
      {message.sender === 'user' && (
        <div className="message-avatar">👤</div>
      )}
      <div className="message-bubble">
        <div className="message-content">{message.content}</div>

        {message.status && message.sender === 'user' && (
          <div className="message-status">
            {message.status === 'sending' && (
              <span className="status-sending">⏳ Отправка...</span>
            )}
            {message.status === 'sent' && (
              <span className="status-sent">✓</span>
            )}
            {message.status === 'error' && (
              <span className="status-error">❌ Ошибка</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageItem
