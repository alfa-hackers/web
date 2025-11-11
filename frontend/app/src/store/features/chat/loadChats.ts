import { createAsyncThunk } from '@reduxjs/toolkit'

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
  createdAt: string
}

interface ApiRoom {
  id: string
  name: string
  description: string | null
}

export const loadChats = createAsyncThunk(
  'chat/loadChats',
  async (userId: string) => {
    const apiUrl = getApiUrl()

    const roomsResponse = await fetch(`${apiUrl}/rooms/by-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomId: room.id }),
          })

          if (!messagesResponse.ok) {
            console.error(`Failed to load messages for room ${room.id}`)
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

          return {
            id: room.id,
            title: room.name || 'Новый чат',
            roomId: room.id,
            messages: sortedMessages.map((msg) => ({
              id: msg.id,
              content: msg.text,
              sender:
                msg.messageType === 'user'
                  ? ('user' as const)
                  : ('assistant' as const),
              status: 'sent' as const,
            })),
            isWaitingForResponse: false,
          }
        } catch (error) {
          console.error(`Error loading messages for room ${room.id}:`, error)
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

    return {
      roomId,
      messages: sortedMessages.map((msg) => ({
        id: msg.id,
        content: msg.text,
        sender:
          msg.messageType === 'user'
            ? ('user' as const)
            : ('assistant' as const),
        status: 'sent' as const,
      })),
    }
  }
)
