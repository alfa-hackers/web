import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store/store'
import {
  setActiveChat,
  setCreatingNew,
  deleteChat,
} from '../../store/features/chat/chatSlice'
import { useWebSocket } from '../../store/features/chat/useWebSocket'
import Sidebar from './Sidebar'
import MainViewport from './MainViewport'
import Modal from './Modal'
import '../../styles/landing/landing.scss'
import { loadChats } from '../../store/features/chat/loadChats'

const getCookie = (name: string): string | null => {
  const matches = document.cookie.match(
    new RegExp(
      '(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'
    )
  )
  return matches ? decodeURIComponent(matches[1]) : null
}

const getApiUrl = (): string => {
  return process.env.NODE_ENV === 'production'
    ? 'https://api.whirav.ru'
    : 'http://localhost:3000'
}

const ChatLanding: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { chats, activeChat } = useSelector((state: RootState) => state.chat)
  const [inputValue, setInputValue] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendMessage, isConnected } = useWebSocket()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/health`, {
          method: 'GET',
          credentials: 'include',
          mode: 'cors',
        })
        if (response.ok) {
          const userId = getCookie('user_temp_id')
          if (userId) {
            dispatch(loadChats(userId))
          } else {
            console.error('user_temp_id не найден в cookies')
          }
        }
      } catch (error) {
        console.error('Ошибка health check:', error)
      }
    }
    initializeApp()
  }, [dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, activeChat])
  
  const handleLoginClick = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleNewChat = () => {
    dispatch(setCreatingNew(true))
    setInputValue('')
    setSidebarOpen(false)
  }

  const handleSendMessage = () => {
    const currentChat = chats.find((chat) => chat.id === activeChat)
    const isWaitingForResponse = currentChat?.isWaitingForResponse || false
    if (!inputValue.trim() || !isConnected || isWaitingForResponse) return
    sendMessage(inputValue)
    setInputValue('')
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Удалить этот чат?')) {
      dispatch(deleteChat(chatId))
    }
  }

  const handleSelectChat = (chatId: string) => {
    dispatch(setActiveChat(chatId))
    setSidebarOpen(false)
  }

  const currentChat = chats.find((chat) => chat.id === activeChat)

  return (
    <div className="chat-landing">
      <div className="header-actions">
        <button 
          className="login-btn" 
          onClick={() => setModalOpen(!modalOpen)}
        >
          🔒
        </button>
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        chats={chats}
        activeChat={activeChat}
        sidebarOpen={sidebarOpen}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      <MainViewport
        currentChat={currentChat}
        isConnected={isConnected}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={handleSendMessage}
        messagesEndRef={messagesEndRef}
      />

      <Modal 
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default ChatLanding
