import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store/store'
import {
  setActiveChat,
  setCreatingNew,
  deleteChat,
} from '../../store/features/chat/chatSlice'
import { useWebSocket } from '../../store/features/chat/useWebSocket'
import '../../styles/landing/landing.scss'

const ChatLanding: React.FC = () => {
  const dispatch = useDispatch()
  const { chats, activeChat, isCreatingNew } = useSelector(
    (state: RootState) => state.chat
  )
  const [inputValue, setInputValue] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { sendMessage, isConnected } = useWebSocket()

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('https://api.whirav.ru/health', {
          method: 'GET',
          credentials: 'include',
          mode: 'cors',
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Health check успешен', data)
        }
      } catch (error) {
        console.error('Ошибка health check:', error)
      }
    }

    checkHealth()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, activeChat])

  const handleNewChat = () => {
    dispatch(setCreatingNew(true))
    setInputValue('')
    setSidebarOpen(false)
  }

  const currentChat = chats.find((chat) => chat.id === activeChat)
  const isWaitingForResponse = currentChat?.isWaitingForResponse || false

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected || isWaitingForResponse) return
    sendMessage(inputValue)
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Удалить этот чат?')) {
      dispatch(deleteChat(chatId))
    }
  }

  const hasMessages = currentChat?.messages && currentChat.messages.length > 0

  return (
    <div className="chat-landing">
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            <span className="plus-icon">+</span>
            Новый чат
          </button>
        </div>

        <div className="chat-history">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
              onClick={() => {
                dispatch(setActiveChat(chat.id))
                setSidebarOpen(false)
              }}
            >
              <span className="chat-icon">💬</span>
              <span className="chat-title">{chat.title}</span>
              <button
                className="delete-chat-btn"
                onClick={(e) => handleDeleteChat(chat.id, e)}
                title="Удалить чат"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className={`viewport ${hasMessages ? 'has-messages' : ''}`}>
        {!hasMessages && (
          <div className="welcome">
            <h1>Добро пожаловать</h1>
            <p>Чем я могу вам помочь?</p>

            {!isConnected && (
              <div className="connection-warning">
                ⚠️ Нет подключения к серверу
              </div>
            )}
          </div>
        )}

        {hasMessages && (
          <div className="messages">
            {currentChat?.messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
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
        )}

        <div className={`input-area ${!hasMessages ? 'centered' : ''}`}>
          <div
            className={`status-panel 
              ${isConnected ? 'connected' : 'disconnected'} 
              ${!hasMessages ? 'centered' : ''}`}
          >
          </div>
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
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !isConnected || isWaitingForResponse}
            >
              {isWaitingForResponse ? '⏳' : isConnected ? '↑' : '⌛'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChatLanding
