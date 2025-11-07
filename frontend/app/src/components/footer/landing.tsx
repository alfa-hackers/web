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

  // Инициализация WebSocket
  const { sendMessage, isConnected } = useWebSocket()

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, activeChat])

  const handleNewChat = () => {
    dispatch(setCreatingNew(true))
    setInputValue('')
    setSidebarOpen(false)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return

    // Отправка через WebSocket
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

  const currentChat = chats.find((chat) => chat.id === activeChat)

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

          {/* Индикатор подключения */}
          <div
            className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}
          >
            <span className="status-dot" />
            {isConnected ? 'Подключено' : 'Отключено'}
          </div>
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

      <main className="viewport">
        {!currentChat && !isCreatingNew ? (
          <>
            <div className="welcome">
              <h1>Добро пожаловать</h1>
              <p>Начните новый чат прямо сейчас</p>

              {!isConnected && (
                <div className="connection-warning">
                  ⚠️ Нет подключения к серверу
                </div>
              )}
            </div>

            <div className="input-area">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isConnected
                    ? 'Введите сообщение...'
                    : 'Ожидание подключения...'
                }
                rows={1}
                disabled={!isConnected}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !isConnected}
              >
                {isConnected ? 'Отправить' : 'Подключение...'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="messages">
              {currentChat?.messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-avatar">
                    {message.sender === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="message-bubble">
                    <div className="message-content">{message.content}</div>

                    {/* Статус сообщения */}
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

              {/* Индикатор печатания AI (опционально) */}
              {currentChat?.messages &&
                currentChat.messages.length > 0 &&
                currentChat.messages[currentChat.messages.length - 1].sender ===
                  'user' &&
                currentChat.messages[currentChat.messages.length - 1].status ===
                  'sent' && (
                  <div className="message assistant typing">
                    <div className="message-avatar">🤖</div>
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

            <div className="input-area">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isConnected
                    ? 'Введите сообщение...'
                    : 'Ожидание подключения...'
                }
                rows={1}
                disabled={!isConnected}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !isConnected}
              >
                {isConnected ? '↑' : '⌛'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default ChatLanding
