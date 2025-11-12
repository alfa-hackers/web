import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatState, Chat, FileAttachment, MessageFlag } from './chatTypes'
import { loadChats } from './loadChats'
import { fetchFileAsBase64, getMimeTypeFromUrl, getApiUrl } from './utils'

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  isCreatingNew: false,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    createChat: (
      state,
      action: PayloadAction<{
        content: string
        roomId: string
        attachments?: FileAttachment[]
        messageFlag?: MessageFlag
      }>
    ) => {
      const messageId = `msg_${Date.now()}`
      const newChat: Chat = {
        id: action.payload.roomId,
        title: action.payload.content.slice(0, 30) || 'Новый чат',
        roomId: action.payload.roomId,
        isWaitingForResponse: true,
        messages: [
          {
            id: messageId,
            content: action.payload.content,
            sender: 'user',
            status: 'sending',
            attachments: action.payload.attachments,
            messageFlag: action.payload.messageFlag,
          },
        ],
      }
      state.chats.unshift(newChat)
      state.activeChat = newChat.id
      state.isCreatingNew = false
    },

    addMessage: (
      state,
      action: PayloadAction<{
        chatId: string
        content: string
        attachments?: FileAttachment[]
        messageFlag?: MessageFlag
      }>
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
          attachments: action.payload.attachments,
          messageFlag: action.payload.messageFlag,
        })
      }
    },

    addAssistantMessage: (
      state,
      action: PayloadAction<{ content: string; fileUrl?: string }>
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
            fileUrl: action.payload.fileUrl,
          })
        }
      }
    },

    addAttachmentToMessage: (
      state,
      action: PayloadAction<{
        messageId: string
        attachment: FileAttachment
      }>
    ) => {
      for (const chat of state.chats) {
        const message = chat.messages.find(
          (m) => m.id === action.payload.messageId
        )
        if (message) {
          if (!message.attachments) {
            message.attachments = []
          }
          message.attachments.push(action.payload.attachment)
          break
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
      for (const chat of state.chats) {
        const message = chat.messages.find(
          (m) => m.id === action.payload.messageId
        )
        if (message) {
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
      if (chat) chat.isWaitingForResponse = action.payload.isWaiting
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
  addAttachmentToMessage,
  updateMessageStatus,
  setWaitingForResponse,
  setActiveChat,
  setCreatingNew,
  deleteChat,
} = chatSlice.actions

const getPresignedUrl = async (fileUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(`${getApiUrl()}/presigned/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl }),
    })
    if (!response.ok) throw new Error('Failed to get presigned URL')
    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('Error getting presigned URL:', error)
    return null
  }
}

export const processAssistantMessageWithFile =
  (content: string, fileUrl?: string) =>
  async (dispatch: any, getState: any) => {
    dispatch(addAssistantMessage({ content, fileUrl }))

    if (fileUrl) {
      try {
        const presignedUrl = await getPresignedUrl(fileUrl)
        if (!presignedUrl) throw new Error('Could not get presigned URL')

        const base64Data = await fetchFileAsBase64(presignedUrl)
        if (!base64Data) throw new Error('Could not fetch file')

        const mimeType = getMimeTypeFromUrl(fileUrl)
        const filename = fileUrl.split('/').pop() || 'file'
        const size = Math.ceil((base64Data.length * 3) / 4)

        const allowedMimeTypes: FileAttachment['mimeType'][] = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.oasis.opendocument.spreadsheet',
        ]

        if (allowedMimeTypes.includes(mimeType as FileAttachment['mimeType'])) {
          const attachment: FileAttachment = {
            filename,
            mimeType: mimeType as FileAttachment['mimeType'],
            data: base64Data,
            size,
          }

          const state = getState()
          const activeChat = state.chat.chats.find(
            (c: Chat) => c.id === state.chat.activeChat
          )

          if (activeChat && activeChat.messages.length > 0) {
            const lastMessage =
              activeChat.messages[activeChat.messages.length - 1]
            dispatch(
              addAttachmentToMessage({
                messageId: lastMessage.id,
                attachment,
              })
            )
          }
        }
      } catch (error) {
        console.error('Error processing assistant file:', error)
      }
    }
  }

export default chatSlice.reducer
