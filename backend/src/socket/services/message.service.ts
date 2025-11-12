import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Message } from 'domain/message.entity'
import { ClientManagerService } from '../client-manager.service'
import { AIService } from '../ai.service'
import { SendMessagePayload, FileAttachment } from '../socket.interface'
import { MessagesService } from 'controllers/messages/services/messages.service'

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly messagesService: MessagesService,
  ) {}

  async handleMessage(
    payload: SendMessagePayload,
    socket: Socket,
    clientManager: ClientManagerService,
    server,
    aiService: AIService,
  ) {
    const { roomId, message, attachments } = payload
    const userId = clientManager.getUserBySocketId(socket.id)
    const userTempId = socket.data.userTempId
    const dbUserId = socket.data.dbUserId

    if (!userId) return { success: false, error: 'User not identified' }
    if (!socket.rooms.has(roomId)) return { success: false, error: 'You must join the room first' }

    let processedContent = message

    if (attachments?.length) {
      for (const attachment of attachments) {
        let extractedText = ''

        switch (attachment.mimeType) {
          case 'application/pdf':
            extractedText = await this.processPdf(attachment)
            break
          case 'application/msword':
            extractedText = await this.processDoc(attachment)
            break
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            extractedText = await this.processDocx(attachment)
            break
        }

        if (extractedText) processedContent += `\n\n${extractedText}`
      }
    }

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
      const context = await this.loadContext(roomId)
      const aiResponse = await aiService.generateResponse(processedContent, context)

      server.to(roomId).emit('message', { userId: 'assistant', message: aiResponse.content })

      await this.messageRepository.save({
        text: aiResponse.content,
        roomId,
        userTempId,
        userId: dbUserId,
        isAi: true,
        messageType: 'assistant',
      })

      return { success: true }
    } catch (error) {
      server
        .to(roomId)
        .emit('message', { userId: 'system', message: `Ошибка AI API: ${error.message}` })
      return { success: false, error: error.message }
    }
  }

  private async loadContext(
    roomId: string,
    limit: number = 50,
  ): Promise<Array<{ role: string; content: string }>> {
    const result = await this.messagesService.getMessagesByRoomId({
      roomId,
      limit,
      offset: 0,
    })

    return result.data.reverse().map((msg) => ({
      role: msg.messageType === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }))
  }

  private async processPdf(attachment: FileAttachment): Promise<string> {
    console.log('[MessageService] processPdf')
    console.log('file:', attachment.filename)
    console.log('size:', attachment.size)
    console.log('type:', attachment.mimeType)
    console.log('base64 length:', attachment.data?.length)

    return `[Содержимое PDF файла: ${attachment.filename}]`
  }

  private async processDoc(attachment: FileAttachment): Promise<string> {
    console.log('[MessageService] processDoc')
    console.log('file:', attachment.filename)
    console.log('size:', attachment.size)
    console.log('type:', attachment.mimeType)
    console.log('base64 length:', attachment.data?.length)

    return `[Содержимое DOC файла: ${attachment.filename}]`
  }

  private async processDocx(attachment: FileAttachment): Promise<string> {
    console.log('[MessageService] processDocx')
    console.log('file:', attachment.filename)
    console.log('size:', attachment.size)
    console.log('type:', attachment.mimeType)
    console.log('base64 length:', attachment.data?.length)

    return `[Содержимое DOCX файла: ${attachment.filename}]`
  }
}
