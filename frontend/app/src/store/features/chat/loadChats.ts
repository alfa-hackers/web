import { createAsyncThunk } from '@reduxjs/toolkit'
import { Chat, FileAttachment } from './chatTypes'
import { ApiMessage, ApiRoom } from './apiTypes'
import {
  fetchFileAsBase64,
  getApiUrl,
  getMimeTypeFromUrl,
  getPresignedUrl,
} from './utils'

export const loadChats = createAsyncThunk('chat/loadChats', async () => {
  const apiUrl = getApiUrl()

  const roomsResponse = await fetch(`${apiUrl}/rooms/by-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({}),
  })

  if (!roomsResponse.ok) {
    const errorData = await roomsResponse.json()
    console.error('Load chats error:', errorData)
    throw new Error(`Failed to load chats: ${errorData.message}`)
  }

  const roomsResult = await roomsResponse.json()
  const rooms: ApiRoom[] = roomsResult.data

  const chatsWithMessages = await Promise.all(
    rooms.map(async (room) => {
      try {
        const messagesResponse = await fetch(`${apiUrl}/messages/by-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ roomId: room.id }),
        })

        if (!messagesResponse.ok) {
          return {
            id: room.id,
            title: room.name || 'Новый чат',
            roomId: room.id,
            messages: [],
            isWaitingForResponse: false,
          }
        }

        const messagesResult = await messagesResponse.json()
        const messages: ApiMessage[] = messagesResult.data || []

        const sortedMessages = messages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )

        const messagesWithAttachments = await Promise.all(
          sortedMessages.map(async (msg) => {
            const message: any = {
              id: msg.id,
              content: msg.text,
              sender: msg.messageType === 'user' ? 'user' : 'assistant',
              status: 'sent',
            }

            if (msg.file_address) {
              const presignedUrl = await getPresignedUrl(msg.file_address)
              if (presignedUrl) {
                const fileName =
                  msg.file_name || msg.file_address.split('/').pop() || 'file'
                const mimeType = getMimeTypeFromUrl(msg.file_address)
                const fileData = await fetchFileAsBase64(presignedUrl)

                message.attachments = [
                  {
                    filename: fileName,
                    mimeType,
                    data: fileData,
                    size: 0,
                  } as FileAttachment,
                ]
              }
            }

            return message
          })
        )

        return {
          id: room.id,
          title: room.name || 'Новый чат',
          roomId: room.id,
          messages: messagesWithAttachments,
          isWaitingForResponse: false,
        }
      } catch (error) {
        return {
          id: room.id,
          title: room.name || 'Новый чат',
          roomId: room.id,
          messages: [],
          isWaitingForResponse: false,
        }
      }
    })
  )

  return chatsWithMessages
})
