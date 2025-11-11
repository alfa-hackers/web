import { createAsyncThunk } from '@reduxjs/toolkit'
import { Chat, FileAttachment } from './chatTypes'

const getApiUrl = (): string => {
  return process.env.NODE_ENV === 'production'
    ? 'https://api.whirav.ru'
    : 'http://localhost:3000'
}

interface ApiMessage {
  id: string
  text: string
  messageType: 'user' | 'assistant'
  isAi: boolean
  roomId: string
  file_address?: string // ИСПРАВЛЕНО: было fileUrl
  createdAt: string
}

interface ApiRoom {
  id: string
  name: string
  description: string | null
}

const fetchFileAsBase64 = async (fileUrl: string): Promise<string> => {
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch file')
    }
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        resolve(base64.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error fetching file:', error)
    return ''
  }
}

const getMimeTypeFromUrl = (url: string): FileAttachment['mimeType'] => {
  const extension = url.split('.').pop()?.toLowerCase()

  if (extension === 'pdf') {
    return 'application/pdf'
  } else if (extension === 'doc') {
    return 'application/msword'
  } else if (extension === 'docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }

  return 'application/pdf'
}

export const loadChats = createAsyncThunk(
  'chat/loadChats',
  async (userId: string) => {
    console.log(`[loadChats] Start loading chats for user: ${userId}`)
    const apiUrl = getApiUrl()

    const roomsResponse = await fetch(`${apiUrl}/rooms/by-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (!roomsResponse.ok) {
      throw new Error('Failed to load chats')
    }

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
            console.log(`Failed to load messages for room ${room.id}`)
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
                const presignedResponse = await fetch(
                  `${apiUrl}/presigned/download`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileUrl: msg.file_address }),
                  }
                )

                if (!presignedResponse.ok) {
                  console.log(
                    `Failed to get presigned URL for file: ${msg.file_address}`
                  )
                } else {
                  const { url } = await presignedResponse.json()
                  const fileName =
                    msg.file_address.split('/').pop() || 'file.pdf'
                  const mimeType = getMimeTypeFromUrl(msg.file_address)
                  const fileData = await fetchFileAsBase64(url)

                  if (mimeType === 'application/pdf') {
                    console.log(`PDF loaded: ${fileName}`)
                  }

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
          console.log(`Error loading messages for room ${room.id}:`, error)
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId }),
    })

    if (!messagesResponse.ok) {
      throw new Error('Failed to load room messages')
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

        // ИСПРАВЛЕНО: используем file_address вместо fileUrl
        if (msg.file_address) {
          const fileName = msg.file_address.split('/').pop() || 'file.pdf'
          const mimeType = getMimeTypeFromUrl(msg.file_address)
          const fileData = await fetchFileAsBase64(msg.file_address)

          message.attachments = [
            {
              filename: fileName,
              mimeType: mimeType,
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
