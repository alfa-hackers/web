import React from 'react'
import { Chat } from '../../store/features/chat/chatTypes'
import '../../styles/landing/landing.scss'

interface SidebarProps {
  chats: Chat[]
  activeChat: string | null
  sidebarOpen: boolean
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChat,
  sidebarOpen,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}) => {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <span className="plus-icon">+</span>
          Новый чат
        </button>
      </div>

      <div className="chat-history">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <span className="chat-icon">💬</span>
            <span className="chat-title">{chat.title}</span>
            <button
              className="delete-chat-btn"
              onClick={(e) => onDeleteChat(chat.id, e)}
              title="Удалить чат"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar