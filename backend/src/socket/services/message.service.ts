import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Message } from 'src/domain/message.entity'
import { ClientManagerService } from '../client-manager.service'
import { AIService } from '../ai.service'
import { SendMessagePayload } from '../socket.interface'

@Injectable()
export class MessageService {
  constructor(@InjectRepository(Message) private readonly messageRepository: Repository<Message>) {}

  async handleMessage(
    payload: SendMessagePayload,
    socket: Socket,
    clientManager: ClientManagerService,
    server,
    aiService: AIService,
  ) {
    const { roomId, message } = payload
    const userId = clientManager.getUserBySocketId(socket.id)
    const userTempId = socket.data.userTempId
    const dbUserId = socket.data.dbUserId

    if (!userId) return { success: false, error: 'User not identified' }
    if (!socket.rooms.has(roomId)) return { success: false, error: 'You must join the room first' }

    server.to(roomId).emit('message', { userId, message })

    await this.messageRepository.save({
      text: message,
      roomId,
      userTempId,
      userId: dbUserId,
      isAi: false,
      messageType: 'user',
    })

    try {
      const aiResponse = await aiService.generateResponse(message)

      server.to(roomId).emit('message', { userId: 'assistant', message: aiResponse.content })

      await this.messageRepository.save({
        text: aiResponse.content,
        roomId,
        userTempId,
        userId: dbUserId,
        isAi: true,
        messageType: 'assistant',
      })

      return {
        success: true,
        aiResponse: aiResponse.content,
        model: aiResponse.model,
        usage: aiResponse.usage,
      }
    } catch (error) {
      server
        .to(roomId)
        .emit('message', { userId: 'system', message: `Ошибка AI API: ${error.message}` })
      return { success: false, error: error.message }
    }
  }
}
