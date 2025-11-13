import { io, Socket } from 'socket.io-client'
import { AppDispatch } from '../../store'
import { updateMessageStatus, setWaitingForResponse } from './chatSlice'
import { FileAttachment, MessageFlag } from './chatTypes'
import { processAssistantMessageWithFile } from './apiAiWithFileProcess'

class SocketApi {
  private socket: Socket | null = null
  private dispatch: AppDispatch | null = null
  private joinedRooms: Set<string> = new Set()

  async initialize(dispatch: AppDispatch) {
    if (this.socket?.connected) return
    this.dispatch = dispatch

    const isDev = process.env.NODE_ENV === 'development'
    const getSocketUrl = () =>
      isDev ? 'http://localhost:3000' : 'wss://api.whirav.ru'

    try {
      const res = await fetch(
        `${isDev ? 'http://localhost:3000' : 'https://api.whirav.ru'}/user-temp`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!res.ok) {
        throw new Error(`Failed to fetch user temp id: ${res.status}`)
      }

      const data = await res.json()
      const userTempId = data.userTempId

      if (!userTempId) {
        throw new Error('userTempId not received from server')
      }

      console.log('Connecting socket with userTempId:', userTempId)

      this.socket = io(getSocketUrl(), {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
        secure: !isDev,
        auth: { user_temp_id: userTempId },
        withCredentials: true,
      })

      this.socket.on('connect', () => {
        console.log('Socket connected with id:', this.socket?.id)
        console.log('Auth:', this.socket?.auth)
      })

      this.socket.on(
        'message',
        (data: {
          userId: string
          message: string
          chatId?: string
          fileUrl?: string
          responseType?: string
        }) => {
          if (data.userId === 'assistant' && this.dispatch) {
            this.dispatch(
              processAssistantMessageWithFile(data.message, data.fileUrl) as any
            )
            if (data.chatId) {
              this.dispatch(
                setWaitingForResponse({ chatId: data.chatId, isWaiting: false })
              )
            }
          }
        }
      )

      this.socket.on(
        'message_sent',
        (data: { messageId: string; success: boolean }) => {
          if (this.dispatch) {
            this.dispatch(
              updateMessageStatus({
                messageId: data.messageId,
                status: data.success ? 'sent' : 'error',
              })
            )
          }
        }
      )

      this.socket.on(
        'message_error',
        (data: { messageId: string; error: string; chatId?: string }) => {
          if (this.dispatch) {
            this.dispatch(
              updateMessageStatus({
                messageId: data.messageId,
                status: 'error',
              })
            )
            if (data.chatId) {
              this.dispatch(
                setWaitingForResponse({ chatId: data.chatId, isWaiting: false })
              )
            }
          }
        }
      )

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message)
      })
    } catch (error) {
      console.error('Error initializing socket:', error)
      throw error
    }
  }

  joinRoom(roomId: string, roomName?: string) {
    if (this.socket?.connected && !this.joinedRooms.has(roomId)) {
      this.socket.emit('joinRoom', { roomId, roomName })
      this.joinedRooms.add(roomId)
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket?.connected && this.joinedRooms.has(roomId)) {
      this.socket.emit('leaveRoom', { roomId })
      this.joinedRooms.delete(roomId)
    }
  }

  sendMessage(
    roomId: string,
    message: string,
    messageId: string,
    chatId: string,
    messageFlag: MessageFlag,
    attachments?: FileAttachment[]
  ) {
    if (!this.socket?.connected) {
      if (this.dispatch) {
        this.dispatch(updateMessageStatus({ messageId, status: 'error' }))
        this.dispatch(setWaitingForResponse({ chatId, isWaiting: false }))
      }
      return
    }

    this.socket.emit(
      'sendMessage',
      { roomId, message, messageId, chatId, messageFlag, attachments },
      (response: any) => {
        if (this.dispatch) {
          this.dispatch(
            updateMessageStatus({
              messageId,
              status: response?.success ? 'sent' : 'error',
            })
          )
          if (!response?.success) {
            this.dispatch(setWaitingForResponse({ chatId, isWaiting: false }))
          }
        }
      }
    )
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.joinedRooms.clear()
    }
  }

  isConnected() {
    return this.socket?.connected || false
  }
}

export const socketApi = new SocketApi()
