import { io, Socket } from 'socket.io-client'
import { AppDispatch } from '../../store'
import { addAssistantMessage, updateMessageStatus } from './chatSlice'

class SocketApi {
  private socket: Socket | null = null
  private dispatch: AppDispatch | null = null

  initialize(dispatch: AppDispatch) {
    if (this.socket?.connected) return
    this.dispatch = dispatch

    const isDev = process.env.NODE_ENV === 'development'
    const getSocketUrl = () => (isDev ? 'http://localhost:3000' : 'wss://api.whirav.ru')

    this.socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      secure: !isDev,
    })

    this.socket.on('message', (data: { userId: string; message: string }) => {
      if (data.userId === 'assistant' && this.dispatch) {
        this.dispatch(addAssistantMessage({ content: data.message }))
      }
    })
  }

  joinRoom(roomId: string) {
    this.socket?.emit('joinRoom', { roomId })
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leaveRoom', { roomId })
  }

  sendMessage(roomId: string, message: string, messageId: string) {
    if (!this.socket?.connected && this.dispatch) {
      this.dispatch(updateMessageStatus({ messageId, status: 'error' }))
      return
    }
    this.socket?.emit('sendMessage', { roomId, message }, (response: any) => {
      if (this.dispatch) {
        this.dispatch(
          updateMessageStatus({
            messageId,
            status: response.success ? 'sent' : 'error',
          })
        )
      }
    })
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  isConnected() {
    return this.socket?.connected || false
  }
}

export const socketApi = new SocketApi()
