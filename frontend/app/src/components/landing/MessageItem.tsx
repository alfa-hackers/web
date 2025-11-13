import React from 'react'
import { Message } from '../../store/features/chat/chatTypes'
import '../../styles/landing/landing.scss'

interface MessageItemProps {
  message: Message
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const getDownloadUrl = (attachment: any) => {
    try {
      const byteString = atob(attachment.data.split(',')[1] || attachment.data)
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i)
      const blob = new Blob([ab], { type: attachment.mimeType })
      return URL.createObjectURL(blob)
    } catch {
      return ''
    }
  }

  return (
    <div className={`message ${message.sender}`}>
      {message.sender === 'user' && <div className="message-avatar">👤</div>}
      <div className="message-bubble">
        <div className="message-content">{message.content}</div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map((attachment, index) => {
              const downloadUrl = getDownloadUrl(attachment)
              return (
                <a
                  key={index}
                  href={downloadUrl}
                  download={attachment.filename}
                  className="attachment-badge"
                >
                  📄 {attachment.filename}
                </a>
              )
            })}
          </div>
        )}

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
