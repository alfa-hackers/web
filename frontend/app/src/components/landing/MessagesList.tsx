import React from 'react'
import { Message } from '../../store/features/chat/chatTypes'
import MessageItem from './MessageItem'
import '../../styles/landing/landing.scss'

interface MessagesListProps {
  messages: Message[]
  isWaitingForResponse: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  isWaitingForResponse,
  messagesEndRef,
}) => {
  return (
    <div className="messages">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {isWaitingForResponse && (
        <div className="message assistant typing">
          <div className="message-bubble">
            <div className="typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessagesList
