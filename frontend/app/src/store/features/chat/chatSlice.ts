import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatState, Chat } from './chatTypes'
import { loadChats } from './loadChats'
import { v4 as uuidv4 } from 'uuid'

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  isCreatingNew: false,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    createChat: (state, action: PayloadAction<{ content: string }>) => {
      const roomId = uuidv4()
      const messageId = `msg_${Date.now()}`
      const newChat: Chat = {
        id: roomId.toString(),
        title: action.payload.content.slice(0, 30) || 'Новый чат',
        roomId,
        isWaitingForResponse: true,
        messages: [
          {
            id: messageId,
            content: action.payload.content,
            sender: 'user',
            status: 'sending',
          },
        ],
      }
      state.chats.unshift(newChat)
      state.activeChat = newChat.id
      state.isCreatingNew = false
    },

    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; content: string }>
    ) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId)
      if (chat) {
        chat.isWaitingForResponse = true
        const messageId = `msg_${Date.now()}`
        chat.messages.push({
          id: messageId,
          content: action.payload.content,
          sender: 'user',
          status: 'sending',
        })
      }
    },

    addAssistantMessage: (
      state,
      action: PayloadAction<{ content: string }>
    ) => {
      if (state.activeChat) {
        const chat = state.chats.find((c) => c.id === state.activeChat)
        if (chat) {
          chat.isWaitingForResponse = false
          chat.messages.push({
            id: `msg_${Date.now()}`,
            content: action.payload.content,
            sender: 'assistant',
            status: 'sent',
          })
        }
      }
    },

    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageId: string
        status: 'sending' | 'sent' | 'error'
      }>
    ) => {
      console.log('updateMessageStatus called:', action.payload)
      for (const chat of state.chats) {
        const message = chat.messages.find(
          (m) => m.id === action.payload.messageId
        )
        if (message) {
          console.log('Found message, updating status:', message.id, action.payload.status)
          message.status = action.payload.status
          break
        }
      }
    },

    setWaitingForResponse: (
      state,
      action: PayloadAction<{ chatId: string; isWaiting: boolean }>
    ) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId)
      if (chat) {
        chat.isWaitingForResponse = action.payload.isWaiting
      }
    },

    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChat = action.payload
      state.isCreatingNew = false
    },

    setCreatingNew: (state, action: PayloadAction<boolean>) => {
      state.isCreatingNew = action.payload
      if (action.payload) state.activeChat = null
    },

    deleteChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload)
      if (state.activeChat === action.payload) state.activeChat = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadChats.fulfilled, (state, action) => {
      state.chats = action.payload
    })
  },
})

export const {
  createChat,
  addMessage,
  addAssistantMessage,
  updateMessageStatus,
  setWaitingForResponse,
  setActiveChat,
  setCreatingNew,
  deleteChat,
} = chatSlice.actions

export default chatSlice.reducer
