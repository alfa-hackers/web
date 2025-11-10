import { createAsyncThunk } from '@reduxjs/toolkit'

export const loadChats = createAsyncThunk(
  'chat/loadChats',
  async (userId: string) => {
    const roomsResponse = await fetch('https://api.whirav.ru/messages/rooms', {
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
    const rooms = roomsResult.data

    const chatsWithMessages = await Promise.all(
      rooms.map(async (room: any) => {
        try {
          const messagesResponse = await fetch(
            'https://api.whirav.ru/messages/history',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ roomId: room.id }),
            }
          )

          if (!messagesResponse.ok) {
            return {
              id: room.id,
              title: room.name || 'Чат',
              roomId: room.id,
              messages: [],
              isWaitingForResponse: false,
            }
          }

          const messagesResult = await messagesResponse.json()
          const messages = messagesResult.data || []

          return {
            id: room.id,
            title: room.name || 'Чат',
            roomId: room.id,
            messages: messages.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              sender: msg.sender,
              status: 'sent',
            })),
            isWaitingForResponse: false,
          }
        } catch (error) {
          return {
            id: room.id,
            title: room.name || 'Чат',
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
