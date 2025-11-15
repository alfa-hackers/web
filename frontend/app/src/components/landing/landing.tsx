import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store/store'
import { useAuth } from '@/store/features/auth/useAuth'
import {
  setActiveChat,
  setCreatingNew,
  deleteChat,
  resetChats,
} from '../../store/features/chat/chatSlice'
import { useWebSocket } from '../../store/features/chat/useWebSocket'
import {
  FileAttachment,
  MessageFlag,
} from '../../store/features/chat/chatTypes'
import Sidebar from './Sidebar'
import MainViewport from './MainViewport'
import RegisterModal from './RegisterModal'
import LoginModal from './LoginModal'
import '@/styles/landing/landing.scss'
import '@/styles/Media/mobile.scss'
import { loadChats } from '../../store/features/chat/loadChats'
import { initializeAuth } from '../../store/features/auth/authSlice'

const ChatLanding: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { chats, activeChat } = useSelector((state: RootState) => state.chat)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [inputValue, setInputValue] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendMessage, isConnected } = useWebSocket()
  const { logout } = useAuth()

  useEffect(() => {
    dispatch(initializeAuth())
    const initializeApp = async () => {
      try {
        await fetch(
          `${process.env.NODE_ENV === 'production' ? 'https://api.whirav.ru' : 'http://localhost:3000'}/health`,
          {
            method: 'GET',
            credentials: 'include',
          }
        )
        dispatch(loadChats())
      } catch {}
    }
    initializeApp()
  }, [dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, activeChat])

  const handleNewChat = () => {
    dispatch(setCreatingNew(true))
    setInputValue('')
    setAttachments([])
    setSidebarOpen(false)
  }

  const handleSendMessage = (messageFlag: MessageFlag) => {
    const currentChat = chats.find((chat) => chat.id === activeChat)
    if (!inputValue.trim() || !isConnected || currentChat?.isWaitingForResponse)
      return
    sendMessage(
      inputValue,
      messageFlag,
      attachments.length > 0 ? attachments : undefined
    )
    setInputValue('')
    setAttachments([])
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

  const handleLoginSuccess = () => {
    dispatch(resetChats())
    dispatch(loadChats())
    setLoginModalOpen(false)
  }

  const openRegisterModal = () => {
    setRegisterModalOpen(true)
  }

  const handleRegisterSuccess = () => {
    dispatch(resetChats())
    dispatch(loadChats())
    setRegisterModalOpen(false)
  }

  const currentChat = chats.find((chat) => chat.id === activeChat)

  return (
    <div className="chat-landing">
      <div className="header-actions">
        {!isAuthenticated && (
          <button
            className="login-btn"
            onClick={() => setLoginModalOpen(!loginModalOpen)}
          >
            🔒
          </button>
        )}
        {isAuthenticated && (
          <button
            className="logout-btn"
            onClick={async () => {
              await logout();
            }}
          >
            🚪 Выйти
          </button>
        )}
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
        attachments={attachments}
        onAttachmentsChange={setAttachments}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        onOpenRegister={openRegisterModal}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />
    </div>
  )
}

export default ChatLanding
