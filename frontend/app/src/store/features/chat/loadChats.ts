import { createAsyncThunk } from '@reduxjs/toolkit'
import { Chat, FileAttachment } from './chatTypes'
import { ApiMessage, ApiRoom } from './apiTypes'
import { fetchFileAsBase64, getApiUrl } from './utils'
import { getMimeTypeFromUrl } from './utils'

export const loadChats = createAsyncThunk(
  'chat/loadChats',
  async (userId: string) => {
    const apiUrl = getApiUrl()

    const roomsResponse = await fetch(`${apiUrl}/rooms/by-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (!roomsResponse.ok) throw new Error('Failed to load chats')

    const roomsResult = await roomsResponse.json()
    const rooms: ApiRoom[] = roomsResult.data

    const chatsWithMessages = await Promise.all(
      rooms.map(async (room) => {
        try {
          const messagesResponse = await fetch(`${apiUrl}/messages/by-room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
                try {
                  // Запрос presigned URL для скачивания из MinIO
                  const presignedResponse = await fetch(
                    `${apiUrl}/presigned/download`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ fileUrl: msg.file_address }),
                    }
                  )

                  if (presignedResponse.ok) {
                    const { url } = await presignedResponse.json()

                    // Берем имя файла из БД, если оно есть, иначе fallback на URL
                    const fileName =
                      msg.file_name ||
                      msg.file_address.split('/').pop() ||
                      'file'
                    const mimeType = getMimeTypeFromUrl(msg.file_address)
                    const fileData = await fetchFileAsBase64(url)

                    message.attachments = [
                      {
                        filename: fileName,
                        mimeType,
                        data: fileData,
                        size: 0,
                      } as FileAttachment,
                    ]
                  }
                } catch (error) {
                  console.error('Error fetching attachment:', error)
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
  }
)

export const loadRoomMessages = createAsyncThunk(
  'chat/loadRoomMessages',
  async (roomId: string) => {
    const apiUrl = getApiUrl()

    const messagesResponse = await fetch(`${apiUrl}/messages/by-room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    })

    if (!messagesResponse.ok) throw new Error('Failed to load room messages')

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
          const fileName = msg.file_address.split('/').pop() || 'file'
          const mimeType = getMimeTypeFromUrl(msg.file_address)
          const fileData = await fetchFileAsBase64(msg.file_address)

          message.attachments = [
            {
              filename: fileName,
              mimeType,
              data: fileData,
              size: 0,
            } as FileAttachment,
          ]
        }

        return message
      })
    )

    return {
      roomId,
      messages: messagesWithAttachments,
    }
  }
)
