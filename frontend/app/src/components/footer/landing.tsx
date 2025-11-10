import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store/store'
import {
  setActiveChat,
  setCreatingNew,
  deleteChat,
} from '../../store/features/chat/chatSlice'
import { useWebSocket } from '../../store/features/chat/useWebSocket'
import Sidebar from './Sidebar'
import MainViewport from './MainViewport'
import '../../styles/landing/landing.scss'

const ChatLanding: React.FC = () => {
  const dispatch = useDispatch()
  const { chats, activeChat } = useSelector((state: RootState) => state.chat)
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
    </div>
  )
}

export default ChatLanding
