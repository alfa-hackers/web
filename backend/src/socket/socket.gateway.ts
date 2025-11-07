import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { SendMessagePayload, JoinRoomPayload } from './socket.interface'

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private clients = new Map<string, Set<string>>()
  private socketUserMap = new Map<string, string>()

  handleConnection(socket: Socket) {
    if (!this.socketUserMap.has(socket.id)) {
      const userId = `user-${uuidv4()}`
      this.socketUserMap.set(socket.id, userId)
      socket.emit('connected', { socketId: socket.id, userId })
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = this.socketUserMap.get(socket.id)
    if (userId) {
      this.removeClient(userId)
      this.socketUserMap.delete(socket.id)
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() payload: JoinRoomPayload, @ConnectedSocket() socket: Socket) {
    const { roomId } = payload
    const userId = this.socketUserMap.get(socket.id)
    if (!userId) return { success: false, error: 'User not identified' }

    socket.join(roomId)

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set())
    }
    this.clients.get(userId).add(roomId)

    this.server.to(roomId).emit('message', {
      userId: 'system',
      message: `${userId} joined room ${roomId}`,
    })

    return { success: true, roomId, userId, message: 'Joined successfully' }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() payload: JoinRoomPayload, @ConnectedSocket() socket: Socket) {
    const { roomId } = payload
    const userId = this.socketUserMap.get(socket.id)
    if (!userId) return { success: false, error: 'User not identified' }

    socket.leave(roomId)

    if (this.clients.has(userId)) {
      this.clients.get(userId).delete(roomId)
    }

    this.server.to(roomId).emit('message', {
      userId: 'system',
      message: `${userId} left room ${roomId}`,
    })

    return { success: true, roomId }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: SendMessagePayload,
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomId, message } = payload
    const userId = this.socketUserMap.get(socket.id)
    if (!userId) return { success: false, error: 'User not identified' }

    if (!socket.rooms.has(roomId)) {
      return { success: false, error: 'You must join the room first' }
    }

    this.server.to(roomId).emit('message', { userId, message })

    try {
      const apiUrl = process.env.OPENAI_API_URL || 'https://openrouter.ai/api/v1/chat/completions'
      const model = process.env.OPENAI_MODEL || 'openai/gpt-3.5-turbo'

      const response = await axios.post(
        apiUrl,
        {
          model,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: message },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'http://nestjs:3000',
            'X-Title': 'NestJS WebSocket Chat',
          },
          timeout: 30000,
        },
      )

      const aiReply = response.data.choices?.[0]?.message?.content || 'No response from AI.'

      this.server.to(roomId).emit('message', {
        userId: 'assistant',
        message: aiReply,
      })

      return {
        success: true,
        aiResponse: aiReply,
        model: response.data.model,
        usage: response.data.usage,
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message

      this.server.to(roomId).emit('message', {
        userId: 'system',
        message: `Ошибка AI API: ${errorMessage}`,
      })

      return { success: false, error: errorMessage, details: error.response?.data }
    }
  }

  private removeClient(userId: string) {
    const rooms = this.clients.get(userId)
    if (!rooms) return

    rooms.forEach((roomId) => {
      this.server.to(roomId).emit('message', {
        userId: 'system',
        message: `${userId} has disconnected`,
      })
    })

    this.clients.delete(userId)
  }
}
